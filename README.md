# sovialis.com — sitio público

Sitio de Sovialis (cuidado del adulto mayor en casa, norte de Bogotá) sobre **EmDash 1.1** + **Astro 7**
en **Cloudflare Workers** (D1, R2, KV, Email Routing, Access). Todo el contenido, el diseño, el botón de
WhatsApp, la analítica, el SEO y los leads se editan desde el panel: `https://sovialis.com/_emdash/admin`.

## Stack

| Capa | Tecnología |
| --- | --- |
| CMS | EmDash 1.1 (`emdash`, `@emdash-cms/cloudflare`) con autenticación por Cloudflare Access |
| Front | Astro 7 (SSR), Tailwind CSS v4 con tokens `--sv-*`, componentes `.astro` sin framework en cliente |
| Datos | D1 `sovialis-web`, R2 `sovialis-web-media`, KV `SESSION` y `CACHE` |
| Correo | Binding `send_email` (Email Routing) → equipo.sovialis@gmail.com |
| Caché | Cache API en `src/worker.ts`: medios 1 año, HTML 120 s, XML/TXT 1 h |

## Estructura

```
content/        Markdown con frontmatter: pages, services, zones, posts, site.md, media/
docs/           CONTENT-GUIDE.md (cómo escribir contenido) y research/ (SEO, diseño, EmDash)
plugins/        Plugins nativos de EmDash, uno por responsabilidad
scripts/        build-seed, sync-content, validate-content, deploy
seed/           seed.json generado (esquema de colecciones, bloques y taxonomías)
src/            Tema: layouts, componentes, bloques, páginas, rutas y worker
```

### Plugins (`plugins/`)

| Plugin | Panel | Qué hace |
| --- | --- | --- |
| `sovialis-design` | Diseño | Paleta, tipografías, radios, sombras y movimiento → variables CSS, con chequeo de contraste WCAG |
| `sovialis-whatsapp` | WhatsApp | Botón flotante, número, mensajes por servicio/zona/ruta, horario y CTA `a[data-wa]` |
| `sovialis-leads` | Leads | Formularios → almacenamiento, aviso por correo, estados, exportar CSV, Turnstile opcional |
| `sovialis-seo` | SEO | Grafo JSON-LD, sitemaps con imágenes, robots.txt, llms.txt, IndexNow y registro de 404 |
| `sovialis-analytics` | Ajustes | GTM, GA4, Clarity, Meta Pixel con Consent Mode v2 y aviso de cookies |
| `sovialis-ratings` | — | Estrellas visibles en servicios, zonas y guías; solo los servicios alimentan `Product.aggregateRating` |
| `sovialis-email` | Ajustes | Proveedor de correo de EmDash sobre `send_email` |

Los comentarios del blog son los nativos de EmDash (`/_emdash/api/comments/...`).

## Desarrollo local

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

En local el panel entra con el acceso de desarrollo (`/_emdash/api/setup/dev-bypass/?redirect=/`). Si
Vite se queja de dependencias obsoletas: detener el servidor, `rm -rf node_modules/.vite` y reiniciar.

## Contenido

El contenido vive en `content/` y se carga al CMS con un script idempotente (crea o actualiza por slug,
sube imágenes y publica). Las reglas de redacción, SEO on-page y vocabulario legal están en
[`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md).

```bash
npm run content:validate
```

```bash
SYNC_URL=https://sovialis.com npm run content:sync
```

Para una sola colección o entrada: `npm run content:sync -- services cuidado-nocturno`. En producción el
script usa `SOVIALIS_AUTOMATION_TOKEN` de `~/.config/sovialis/web-secrets.env` (fuera del repo).

> Después de la primera carga, el panel es la fuente de verdad: lo que se edite allí se sobrescribe si se
> vuelve a sincronizar la misma entrada desde `content/`.

## Esquema en una instalación existente

El seed solo se aplica en una base vacía. Cuando se agregan bloques o campos en
`scripts/seed/schema.mjs`, hay que llevarlos a la base (no borra nada):

```bash
SYNC_URL=https://sovialis.com npm run schema:sync
```

## Mapa, sitemap e indexación

- `npm run map:build`: regenera `src/data/bogota-map.json` (límites de localidades y avenidas de OpenStreetMap).
- `npm run sitemap:submit`: envía el sitemap y las URLs a Bing Webmaster (y a Search Console si la service account tiene acceso).
- `npm run gsc:audit`: inspecciona las URLs del sitemap en Search Console y compara el marcado indexado con el HTML actual. Usa `GSC_SERVICE_ACCOUNT` o `~/.config/connexis/connexis-sa.json`; la cuenta debe tener acceso a `sc-domain:sovialis.com`. `-- --submit-sitemap` envía el sitemap y `-- --output /ruta/informe.json` guarda el informe sin credenciales. La API de inspección devuelve el último rastreo de Google, no una validación en vivo ni una solicitud de indexación.
- `npm run test:seo`: pruebas de regresión del grafo JSON-LD. El promedio se publica solo en Product y nunca en Service, BlogPosting, Organization ni LocalBusiness. Los widgets visibles permanecen disponibles.
- IndexNow: la clave está en el plugin SEO y se sirve en `/<clave>.txt`; «Enviar todas las URLs» en el panel → SEO.

## Despliegue

```bash
npm run deploy
```

Genera el seed, compila y publica con `wrangler deploy`. `npm run deploy:secrets` además sube los secretos
desde `~/.config/sovialis/web-secrets.env` (`EMDASH_ENCRYPTION_KEY`, `SOVIALIS_AUTOMATION_TOKEN`).

El despliegue activa `PUBLIC_CF_IMAGES=on`: las fotos salen con `srcset` por `/cdn-cgi/image` (AVIF/WebP al
tamaño de la pantalla). Requiere Images → Transformations activo en la zona (plan gratuito: 5.000
transformaciones únicas al mes). En local no se activa.

### Rendimiento y caché

- **HTML** (`src/worker.ts`): caché del borde con *stale-while-revalidate*. La copia se guarda 7 días; si tiene
  más de 10 min se sirve al instante (`X-Sovialis-Cache: STALE`) y se renueva en segundo plano. Un cambio del
  panel aparece en la primera visita pasados 10 min (o al momento, purgando la zona).
- **Assets**: `/_astro/*` y `/fonts/*` se sirven directo de los assets del Worker (`run_worker_first` con
  exclusiones en `wrangler.jsonc`) con caché inmutable de un año (`public/_headers`). Si se cambia una fuente,
  publicarla con otro nombre.
- **CSS en línea** (`build.inlineStylesheets: "always"`) y precarga de la foto de portada con el mismo
  `srcset`/`sizes` que el Hero (`src/lib/images.ts`).
- **GTM diferido**: se carga tras el evento `load` o con la primera interacción (plugin de analítica →
  «Cargar GTM después de la página»).
- **Mapa de cobertura**: `node scripts/build-map.mjs --solo-compactar` lo deja en ~9 KB.

El plan gratuito de Workers admite 3 MB comprimidos: el plugin `trimAdminLocales` de `astro.config.mjs`
deja solo los idiomas es/en del panel para que el bundle quede en ~2,6 MB.

## Acceso al panel

`/_emdash/admin` está protegido por Cloudflare Access (política «Equipo Sovialis»). El correo que entra
debe estar en `ADMIN_EMAILS` (`wrangler.jsonc`). La automatización usa la cabecera `X-Sovialis-Automation`.

## Convenciones

- Commits convencionales en español, validados por commitlint (`.commitlintrc.json`, scopes definidos).
- Rama de trabajo `feat/*` → PR a `main`.
- Nunca se versionan `.dev.vars`, `.env` ni credenciales.
