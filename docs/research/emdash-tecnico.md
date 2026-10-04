# EmDash 1.1.0 en Cloudflare: brief técnico para sovialis.com

> Investigación del 4 de octubre de 2026. No construye el sitio: documenta cómo hacerlo.
> Versiones verificadas en npm ese día: `emdash@1.1.0`, `@emdash-cms/cloudflare@1.1.0`, `create-emdash@1.1.0`,
> `@emdash-cms/plugin-forms@0.2.9`, `emdash-smtp@0.4.0`, `@astrojs/cloudflare@14.3.3`, `astro@7.3.x`, `wrangler@4.147.0`.
>
> Fuentes, por prioridad: (1) proyecto en producción de JP `cursodeblogosonline.com/emdash-dev/`, citado como
> **globos**; (2) código instalado en `emdash-dev/node_modules/emdash/src` y `@emdash-cms/*`; (3) docs.emdashcms.com,
> GitHub `emdash-cms/emdash`, plugins.emdashcms.com y developers.cloudflare.com.
> **NO VERIFICADO** marca lo que no se pudo comprobar en código, documentación ni en globos.
>
> En `web/.agents/skills/` ya están las skills oficiales de EmDash (`building-emdash-site`, `creating-plugins`,
> `emdash-cli`). Quien construya el sitio debe leerlas: complementan este brief.

---

## 0. Decisiones recomendadas

| Tema | Recomendación v1 | Motivo |
|---|---|---|
| Plantilla | Partir del esqueleto ya creado en `web/` (deps fijadas) y copiar config de `create-emdash --template cloudflare:marketing` | El scaffold oficial no trae Tailwind v4 ni las fuentes de marca. `web/package.json` ya fija `emdash@1.1.0`, `astro@7.3.5` y `@astrojs/cloudflare@14.3.3` |
| Plan Cloudflare | **Workers Paid (USD 5/mes)** para producción. Probar antes en Free | Free: 10 ms de CPU por request, KV con 1.000 escrituras/día y sin Email Sending ni Worker Loader. El SSR de EmDash podría pasar de 10 ms (**NO VERIFICADO**: medir) |
| Auth del admin | **Passkeys nativas** + app de **Cloudflare Access** (org `holy-king-fdc9`, ya usada en gestion) sobre `/_emdash/admin*` y `/_emdash/api/setup*` | No hay contraseñas compartidas y se cierra la ventana del setup inicial. No copiar el Basic auth de globos |
| Contenido | Seed con colecciones de negocio y dos singletons: `ajustes` (datos de empresa) y `apariencia` (tokens de diseño) | Los ajustes nativos no admiten campos propios. JP pidió que todo se edite desde el panel |
| Theming | Singleton `apariencia` → `<style>:root{--sv-*}</style>` en el layout → `@theme` de Tailwind v4 | Usa la UI nativa con revisiones, borradores, preview y caché de objetos. No exige plugin |
| Leads | Plugin nativo propio `sovialis-leads` (storage del plugin + ruta pública + página admin + CSV + aviso por correo) | Control total de campos, textos en español, Ley 1581 y atribución (UTM y gclid). El plugin oficial de formularios queda para «Trabaja con nosotros», que necesita subir hojas de vida |
| Correo | `cloudflareEmail()` incluido en `@emdash-cms/cloudflare/plugins` + binding `send_email`. Gratis hacia **direcciones de destino verificadas** | Avisos de leads, invitaciones y magic links al equipo. Para escribir a cualquier destinatario hace falta Workers Paid (Email Sending, beta) |
| Analítica | Plugin nativo `sovialis-tracking` (GTM ID en `settingsSchema` + `page:fragments`) | Lo edita el admin, valida el ID y queda fuera del código |
| SEO | Lo nativo (panel SEO, `EmDashHead`, `/sitemap.xml`, `/robots.txt`, redirects) más un plugin propio con `page:metadata` y `content:beforePublish` | Los plugins SEO del registro corren en sandbox y exigen Worker Loader (plan de pago). Son versiones 0.x |
| Plugins del registro | Ninguno en v1 | Todos requieren `LOADER` y plan de pago |

---

## A. Scaffolding y configuración base

### A.1 `create-emdash`

```bash
npm create emdash@latest sovialis-web -- --template cloudflare:marketing --pm npm --install --no-sandboxed-plugins
# Flags reales (packages/create-emdash/src/flags.ts):
#   --template blog|starter|marketing|portfolio  (o <platform>:<key>)
#   --platform cloudflare|node   (cloudflare es el default: D1 + R2)
#   --pm / --package-manager pnpm|npm|yarn|bun   --install / --no-install
#   --sandboxed-plugins / --no-sandboxed-plugins (default: no; Worker Loader requiere plan de pago)
#   -y/--yes (defaults: cloudflare, blog, my-site)   --force
```

Las plantillas Cloudflare son `blog-cloudflare`, `starter-cloudflare`, `marketing-cloudflare` y `portfolio-cloudflare` en `emdash-cms/emdash/templates/`. Los archivos mínimos son: `astro.config.mjs`, `wrangler.jsonc`, `src/worker.ts`, `src/live.config.ts`, `seed/seed.json` (declarado en `package.json → "emdash": {"seed": "seed/seed.json"}`) y `emdash-env.d.ts`, que el dev server genera solo.

**Estado de `web/`** (sin tocar): ya existen `package.json` (con `emdash.seed = seed/seed.json` y scripts `deploy`, `seed:build`, `content:sync` y `sitemap:submit`, cuyos scripts todavía no existen), `tsconfig.json`, `src/live.config.ts`, `.mcp.json` y `.agents/skills/`. Falta `astro.config.mjs`, `wrangler.jsonc`, `src/worker.ts` y el seed.

### A.2 Dependencias

Las que ya fija `web/package.json` bastan para el núcleo: `emdash@1.1.0`, `@emdash-cms/cloudflare@1.1.0`, `@astrojs/cloudflare@14.3.3`, `@astrojs/react`, `astro@7.3.5`, `react@19.2.8`, `tailwindcss` / `@tailwindcss/vite@4.3.3`, `wrangler@4.147.0` y `@cloudflare/workers-types`. Las peer deps de `@emdash-cms/cloudflare` son `@cloudflare/kumo@2.6.0` y `@phosphor-icons/react`, que en globos llegaron instaladas como transitivas. Solo hacen falta explícitas si se agrega `@emdash-cms/plugin-forms`. Globos fija Node 24 (`.nvmrc`), usa `npm ci` y define `engines.node: "^22.22.2 || ^24.15.0 || >=26.0.0"`.

Para depurar (no en producción): `emdash` trae CLI (`npx emdash --help`): `init|types|doctor|seed|migrate|export-seed|secrets|login|logout|whoami|content|schema|media|search|taxonomy|menu|site`.

### A.3 `astro.config.mjs` recomendado

Adaptado de globos (`emdash-dev/astro.config.mjs`) y de la plantilla oficial:

```js
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import emdash from 'emdash/astro';
import { d1, r2, kvCache } from '@emdash-cms/cloudflare';
import { cloudflareEmail } from '@emdash-cms/cloudflare/plugins';

const production = process.env.SOVIALIS_BUILD_ENV === 'production';
const site = production ? 'https://sovialis.com' : (process.env.SITE_URL ?? 'https://dev.sovialis.com');
const local = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  site,
  output: 'server',                      // obligatorio: EmDash es SSR (sin getStaticPaths para contenido CMS)
  trailingSlash: 'ignore',
  i18n: { defaultLocale: 'es', locales: ['es'], routing: 'manual' }, // globos: contenido 'es' y sin redirecciones automáticas
  adapter: cloudflare({
    // Default del adapter v14: 'cloudflare-binding' (añade binding IMAGES). Globos usó 'passthrough' (sirve originales).
    imageService: 'cloudflare-binding',
    configPath: production ? 'wrangler.production.jsonc' : 'wrangler.jsonc',
  }),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: 'DB' }),               // session: 'auto' activa read replicas; no combinar con Smart Placement
      storage: r2({ binding: 'MEDIA' }),
      objectCache: kvCache({ binding: 'CACHE', defaultTtl: 60, revalidate: 1000, keyPrefix: 'sovialis-v1' }),
      siteUrl: site,                                  // passkeys, CSRF, sitemap, robots y JSON-LD usan este origen
      admin: { siteName: 'Sovialis · Panel', logo: '/brand/logo-admin.svg', favicon: '/favicon.svg' },
      plugins: [
        cloudflareEmail({ from: { email: 'web@sovialis.com', name: 'Sovialis' }, replyTo: 'contacto@sovialis.com' }),
        { id: 'sovialis-leads', version: '1.0.0', entrypoint: local('./src/plugins/sovialis-leads/index.ts'),
          adminEntry: local('./src/plugins/sovialis-leads/admin.tsx'),
          adminPages: [{ path: '/leads', label: 'Solicitudes', icon: 'inbox' }] },
        { id: 'sovialis-tracking', version: '1.0.0', entrypoint: local('./src/plugins/sovialis-tracking/index.ts') },
        { id: 'sovialis-seo', version: '1.0.0', entrypoint: local('./src/plugins/sovialis-seo/index.ts') },
      ],
      // sandboxed: [], sandboxRunner: sandbox(),     // solo con binding LOADER (Workers Paid)
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
});
```

Todas las opciones de `emdash({...})` están en `node_modules/emdash/src/astro/integration/runtime.ts` (`EmDashConfig`): `database`, `migrations`, `storage`, `objectCache`, `images` (default true: envuelve el endpoint de imágenes de Astro y lee de R2), `plugins`, `sandboxed`, `sandboxRunner`, `sandbox`, `auth`, `authProviders`, `mcp` (default true; `/_emdash/api/mcp` solo con bearer), `registry`, `updateCheck`, `maxUploadSize` (50 MB por defecto), `siteUrl`, `allowedOrigins`, `trustedProxyHeaders`, `middleware.outer`, `mediaProviders`, `fonts`, `admin`, `toolbar` (`"server"`, `"client"` o `false`; usar `"client"` si hay caché compartida de HTML).

### A.4 `wrangler.jsonc`

Combina la plantilla oficial, el `wrangler.production.jsonc` de globos y la sección H:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "sovialis-web",
  "main": "./src/worker.ts",
  "compatibility_date": "2026-10-02",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": false,
  "preview_urls": false,
  "routes": [
    { "pattern": "sovialis.com", "custom_domain": true },
    { "pattern": "www.sovialis.com", "custom_domain": true }
  ],
  // "assets": { "binding": "ASSETS", "run_worker_first": true },  // solo si el Worker debe vigilar también /public (globos dev)
  "d1_databases": [
    { "binding": "DB", "database_name": "sovialis-web", "database_id": "<uuid>" },
    { "binding": "RATINGS_DB", "database_name": "sovialis-web-ratings", "database_id": "<uuid>", "migrations_dir": "migrations" } // opcional (F)
  ],
  "r2_buckets": [{ "binding": "MEDIA", "bucket_name": "sovialis-web-media" }],
  "kv_namespaces": [
    { "binding": "SESSION", "id": "<id>" },   // sesiones de Astro; el adapter la añade sola si falta (auto-provisioning)
    { "binding": "CACHE", "id": "<id>" }      // objectCache de EmDash
  ],
  "send_email": [{ "name": "EMAIL" }],          // ver H; con Email Routing solo llega a destinos verificados
  // "worker_loaders": [{ "binding": "LOADER" }], // plugins sandbox: Workers Paid
  "triggers": { "crons": ["* * * * *"] },       // publicación programada + cron de plugins + mantenimiento
  "vars": { "SOVIALIS_ENVIRONMENT": "production", "EMDASH_SITE_URL": "https://sovialis.com" },
  "observability": { "enabled": true }
}
```

Notas verificadas:
- `@astrojs/cloudflare` (`dist/wrangler.js`) añade por defecto `SESSION` (KV), `IMAGES` (si `imageService` es `cloudflare-binding`) y `ASSETS` cuando faltan, e inyecta `nodejs_als`. La plantilla oficial no declara KV.
- El build escribe `dist/server/wrangler.json` y `.wrangler/deploy/config.json` (`{"configPath":"../../dist/server/wrangler.json"}`), así que `wrangler deploy` en la raíz despliega la config generada. Globos usa `wrangler deploy --config dist/server/wrangler.json` de forma explícita.
- Sin `database_id` ni `id`, wrangler 4.x aprovisiona los recursos en el primer deploy. Globos fija los IDs y los valida antes de desplegar (J.4).

### A.5 `src/worker.ts`

Mínimo oficial (plantilla `marketing-cloudflare`):

```ts
import handler, { createScheduledHandler, PluginBridge } from '@emdash-cms/cloudflare/worker';
export { PluginBridge };   // obligatorio exportarlo aunque no haya sandbox (el binding lo resuelve contra el entry)
export default { ...handler, scheduled: createScheduledHandler() } satisfies ExportedHandler;
```

Versión recomendada, inspirada en `globos/src/worker-production.ts` (www→apex y cabeceras de seguridad, sin el gate Basic):

```ts
import handler, { createScheduledHandler, PluginBridge } from '@emdash-cms/cloudflare/worker';
export { PluginBridge };
const APEX = 'sovialis.com';
export default {
  ...handler,
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === `www.${APEX}`) { url.hostname = APEX; url.protocol = 'https:'; return Response.redirect(url.href, 301); }
    if (!handler.fetch) return new Response('Application unavailable', { status: 503 });
    const res = await handler.fetch(request, env, ctx);
    const h = new Headers(res.headers);
    h.set('X-Content-Type-Options', 'nosniff');
    h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    h.set('X-Frame-Options', 'SAMEORIGIN');
    if (request.headers.has('Cookie')) h.set('Cache-Control', 'private, no-store'); // editores logueados: nunca cachear
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  },
  scheduled: createScheduledHandler(),       // opcional: createScheduledHandler({ generalCron: '* * * * *' })
} satisfies ExportedHandler<Env>;
```

`createScheduledHandler()` ejecuta `runScheduledTasks()` de `emdash/middleware` (publica lo programado e invalida etiquetas de caché). `npx emdash doctor` comprueba que el cron y el handler estén conectados.

### A.6 `live.config.ts`, `env.d.ts` y tipos

```ts
// src/live.config.ts (ya existe en web/; boilerplate idéntico en todos los sitios)
import { defineLiveCollection } from 'astro:content';
import { emdashLoader } from 'emdash/runtime';
export const collections = { _emdash: defineLiveCollection({ loader: emdashLoader() }) };
```

```ts
// src/env.d.ts (globos)
/// <reference types="@cloudflare/workers-types" />
/// <reference types="emdash/locals" />
/// <reference types="@astrojs/cloudflare" />
declare namespace App { interface Locals { cmsContent?: { data: Record<string, unknown>; contentRef: { collection: string; id: string; slug: string } } } }
```

- `emdash-env.d.ts` (raíz) se regenera al arrancar `astro dev`. Contra un sitio remoto: `npx emdash types --url https://sovialis.com -t $EMDASH_TOKEN`.
- Bindings en código: `import { env } from 'cloudflare:workers'` (globos `src/pages/api/ratings.ts`), y `waitUntil` vía `locals.cfContext.waitUntil(p)`. No usar `Astro.locals.runtime.env`.
- `Astro.locals.emdash` es el runtime de EmDash y `Astro.locals.user` el usuario de la sesión, si existe.

### A.7 Secretos

| Variable | Obligatoria | Uso (fuente `emdash/src/config/secrets.ts`) |
|---|---|---|
| `EMDASH_ENCRYPTION_KEY` | Sí, antes de guardar settings `secret` de plugins | AES-GCM de secretos de plugins. Formato `emdash_enc_v1_<43 base64url>`. Se genera con `npx emdash secrets generate` y admite lista separada por comas para rotar. Si se pierde, los secretos quedan ilegibles |
| `EMDASH_PREVIEW_SECRET` | No | Firma de URLs de preview. Si falta se genera y guarda en la BD |
| `EMDASH_IP_SALT` | No | Hash de IP de comentaristas. Si falta se genera y guarda en la BD |
| `EMDASH_AUTH_SECRET` | No (legado) | Solo sirve como fallback del salt |
| `EMDASH_TURNSTILE_SECRET_KEY` | Si los comentarios usan Turnstile | Verificación server-side. Lo lee `process.env` (**NO VERIFICADO** que llegue igual en Workers con `nodejs_compat`) |
| `LEADS_SALT` y `RATING_SALT` | Propias | HMAC de IP y votante (G y F) |

Comandos: `npx wrangler secret put EMDASH_ENCRYPTION_KEY` o, en bloque, `wrangler secret bulk` (globos `scripts/push-dev-secrets.mjs` lee `.dev.vars` y envía por stdin). En local van en `.dev.vars`, que tiene prioridad sobre `.env`.

### A.8 Autenticación del admin

**Qué hay en EmDash 1.1.0.** Por defecto, passkeys (WebAuthn). Además: magic link (requiere proveedor de correo), OAuth GitHub, Google y Microsoft (`authProviders: [github()]` desde `emdash/auth/providers/github`, con `EMDASH_OAUTH_GITHUB_CLIENT_ID` y `..._SECRET`), Atmosphere y Cloudflare Access (`auth: access({...})`). Con un proveedor externo en `auth`, las passkeys se desactivan. Roles: Subscriber 10, Contributor 20, Author 30, Editor 40, Admin 50. El primer usuario siempre es Admin.

**Cómo se crea el primer admin.** Al visitar `/_emdash/admin` por primera vez aparece el setup: título, tagline, email, nombre, «¿incluir contenido de ejemplo?» y registro de passkey. Lo que pasa por debajo:
1. `POST /_emdash/api/setup` `{title, tagline, includeContent}` con `X-EmDash-Request: 1`. Aplica el seed **por tramos** (`SEED_BUDGET_PER_REQUEST = {queries: 500, mediaDownloads: 5}`, pensado para los límites de Workers Free), así que se repite hasta obtener `complete`. Una vez terminado responde `409 ALREADY_CONFIGURED` (globos `scripts/setup-development.mjs` repite el POST hasta 100 veces).
2. `POST /_emdash/api/setup/admin` y `/setup/admin/verify` (passkey), ligados al navegador con la cookie `emdash_setup_nonce` (1 h).

**Riesgo de la ventana de setup.** Mientras no exista admin, cualquiera que llegue primero puede completar el setup y quedarse con el panel. Mitigaciones: desplegar y hacer el setup de inmediato, o proteger `/_emdash/admin*` y `/_emdash/api/setup*` con Cloudflare Access **antes** del primer deploy.

**Qué hizo globos.** Un proveedor externo propio (`src/auth/production.ts`, registrado como `auth: {type:'globos-production', entrypoint, config:{autoProvision:true, syncRoles:true}}`):

```ts
import { env } from 'cloudflare:workers';
export async function authenticate(request: Request) {          // contrato AuthProviderModule (emdash/src/auth/types.ts)
  if (!await isProductionAdmin(request, env)) throw Error('Administrator authentication required');
  return { email: 'contacto@sably.co', name: 'sably', role: 50, subject: 'globos-production-admin' };
}
```

Se combina con un gate en el Worker (`src/lib/production-access.ts`) que exige HTTP Basic (`sably:<GLOBOS_ADMIN_PASSWORD>`, comparación SHA-256 en tiempo constante) en todo `/_emdash` salvo `GET /_emdash/api/media/file/*` y `GET|POST /_emdash/api/comments/blog/<id>`. Funciona, pero es una sola contraseña compartida sin MFA y desactiva las passkeys. **No replicarlo en Sovialis.**

**Recomendación.**
1. **Passkeys nativas.** JP y el equipo registran passkeys en dos dispositivos cada uno. Las invitaciones se hacen en Settings → Users → Invite y requieren el correo de la sección H.
2. **Capa exterior con Cloudflare Access** (Zero Trust ya en uso: `ACCESS_TEAM_DOMAIN=holy-king-fdc9.cloudflareaccess.com` en `herramienta/wrangler.jsonc`, política «Equipo Sovialis»): una app self-hosted que cubra solo `sovialis.com/_emdash/admin` y `sovialis.com/_emdash/api/setup`. EmDash no lee el JWT de Access (no hay `auth: access()`), así que las passkeys siguen siendo la identidad. La API de contenido queda protegida por la sesión de EmDash y las rutas públicas (media, comentarios, `submit` de leads) siguen abiertas. Que bastan esas dos rutas está **NO VERIFICADO**: probar que el admin funcione bien con Access delante.
3. Alternativa, solo si JP quiere SSO: `auth: access({ teamDomain: 'holy-king-fdc9.cloudflareaccess.com', audienceEnvVar: 'CF_ACCESS_AUDIENCE', defaultRole: 40 })`. Obliga a que Access cubra todo `/_emdash/*` con apps «Bypass» para `/_emdash/api/media/file/*`, `/_emdash/api/comments/*`, `/_emdash/api/plugins/sovialis-leads/submit` y `/_emdash/api/search*`. La precedencia por ruta más específica en Access está **NO VERIFICADA** para este caso.

---

## B. Modelo de contenido

### B.1 Formato del seed (`emdash/src/seed/types.ts`)

Claves raíz: `$schema`, `version: "1"`, `defaultLocale` (poner `"es"`, porque sin ella el `apply` rellena con `en`), `meta`, `settings`, `collections`, `blockTypes`, `relations`, `taxonomies`, `menus`, `redirects`, `widgetAreas`, `sections`, `bylines` y `content`.

```jsonc
// SeedCollection
{ "slug": "servicios", "label": "Servicios", "labelSingular": "Servicio", "description": "...", "icon": "heart",
  "supports": ["drafts", "revisions", "preview", "scheduling", "search", "seo"],
  "urlPattern": "/servicios/{slug}/",   // lo usan el sitemap nativo y las URLs públicas
  "routable": true,                      // false = slug no obligatorio (singletons, catálogos)
  "hidden": false, "sortOrder": 1, "group": "Contenido", "commentsEnabled": false, "editLocking": true,
  "titleField": "title", "dateField": "published_at", "admin": { "listColumns": ["precio_desde"], "quickCreate": true },
  "fields": [ /* SeedField[] */ ] }
// SeedField
{ "slug": "title", "label": "Título", "type": "string", "required": true, "unique": false, "searchable": true,
  "indexed": false, "translatable": true, "defaultValue": null, "validation": {}, "widget": "plugin:widget", "options": {} }
```

**Tipos de campo** (`FieldType`): `string`, `text`, `url`, `number`, `integer`, `boolean`, `datetime`, `select`, `multiSelect`, `portableText`, `image`, `file`, `reference`, `json`, `slug`, `repeater` y `blocks`. `validation` (`FieldValidation`) acepta `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `options` (select y multiSelect), `subFields`, `minItems` y `maxItems` (repeater), `allowedMimeTypes`, `targetCollection`, `multiple`, `relation` y `relationSide` (reference), y `allowedTypes` (blocks). `options` (widget) admite `rows`, `showPreview`, `darkVariant`, `collection` y `allowMultiple`.

Ejemplos reales de globos (`emdash.seed.json`):

```json
{"slug":"keywords","label":"Palabras clave","type":"repeater","validation":{"subFields":[{"slug":"text","label":"Texto","type":"text","required":true}]}}
{"slug":"faqs","label":"Preguntas frecuentes","type":"repeater","validation":{"subFields":[{"slug":"q","label":"Pregunta","type":"string","required":true},{"slug":"a","label":"Respuesta","type":"text","required":true}]}}
{"slug":"level","label":"Nivel","type":"select","validation":{"options":["Principiante","Intermedio","Avanzado","Todos los niveles"]}}
{"slug":"hero","label":"Imagen principal","type":"image"}
{"slug":"video","label":"Video","type":"file"}
{"slug":"body","label":"Contenido","type":"portableText","searchable":true}
{"slug":"author_link","label":"Autor","type":"reference","validation":{"targetCollection":"authors","multiple":false}}
{"slug":"related_links","label":"Artículos relacionados","type":"reference","validation":{"targetCollection":"blog","multiple":true}}
```

**Valores en `content`:**
- Entrada: `{ "id": "servicios:cuidado-24h", "slug": "cuidado-24h", "status": "published"|"draft", "locale": "es", "data": {...}, "taxonomies": {"zona":["usaquen"]}, "bylines": [{"byline":"b1"}] }`.
- Referencia a otra entrada del seed: `"$ref:<seed-id>"`.
- Media a descargar: `{"$media": {"url": "https://…/foto.jpg", "alt": "…", "filename": "…", "caption": "…"}}`. El seed descarga, sube a R2 y crea el registro. Globos no lo usó: subió la media después por API (B.6).
- Repeater: arreglo de objetos. `portableText`: arreglo de bloques Portable Text.

**Taxonomías, menús, widgets, secciones, redirects y settings:**

```jsonc
"taxonomies": [{ "name": "zona", "label": "Zonas", "labelSingular": "Zona", "hierarchical": false,
                 "collections": ["servicios", "blog"], "terms": [{ "slug": "usaquen", "label": "Usaquén" }] }],
"menus": [{ "name": "primary", "label": "Navegación principal", "items": [
  { "type": "custom", "label": "Servicios", "url": "/servicios/" },
  { "type": "page", "ref": "pages:nosotros", "collection": "pages", "label": "Nosotros" },
  { "type": "custom", "label": "Más", "url": "#", "children": [ { "type": "custom", "label": "Blog", "url": "/blog/" } ] } ] }],
"widgetAreas": [{ "name": "footer", "label": "Pie", "widgets": [
  { "type": "content", "title": "Sovialis", "content": [ /* Portable Text */ ] },
  { "type": "menu", "menuName": "footer" },
  { "type": "component", "componentId": "…", "props": {} } ] }],
"sections": [{ "slug": "cta-whatsapp", "title": "CTA WhatsApp", "content": [ /* PT */ ] }],
"redirects": [{ "source": "/old", "destination": "/new", "type": 301, "enabled": true }],
"settings": { "title": "Sovialis", "tagline": "…", "timezone": "America/Bogota", "dateFormat": "…", "postsPerPage": 10,
              "social": { "instagram": "…" }, "seo": { "titleSeparator": " | ", "robotsTxt": "…" } }
```

**Comentarios en el seed:** solo `commentsEnabled: true` por colección. La moderación (`commentsModeration: "all"|"first_time"|"none"`, `commentsClosedAfterDays`, `commentsAutoApproveUsers`) se fija después por API (F.1).

### B.2 Esquema propuesto para Sovialis (borrador)

Es un borrador: cerrar con el estudio de keywords (memoria `sovialis-keyword-research.md`) y los riesgos legales (memoria `sovialis-riesgos-legales.md`, sin anunciar «enfermería» mientras no haya IPS).

| Colección | Tipo | Campos clave |
|---|---|---|
| `pages` | ruteable `/{slug}/` o rutas fijas | title, description, hero (image), body (portableText), faqs (repeater), cta_label, cta_url |
| `servicios` | ruteable `/servicios/{slug}/` | title, resumen, hero, body, incluye (repeater), turnos (multiSelect «12 h», «24 h», «por horas»), precio_desde (integer COP, opcional), faqs, zonas (reference múltiple) |
| `zonas` | ruteable `/cuidado-adulto-mayor/{slug}/` (SEO local) | nombre, localidad, hook local (text), faqs, body |
| `blog` | ruteable `/blog/{slug}/`, `commentsEnabled` | title, description, hero, hero_alt, body, primary_keyword, faqs, author (reference), relacionados (reference múltiple) |
| `testimonios` | no ruteable | nombre, relación con el paciente, texto, servicio (reference), consentimiento_publicacion (boolean, obligatorio) |
| `equipo` / `autores` | ruteable opcional | nombre, cargo, foto, bio (E-E-A-T) |
| `ajustes` | **singleton** no ruteable (entrada `global`) | razón social, NIT, teléfono, WhatsApp, correo, dirección, horario, áreas atendidas, url política de datos, redes |
| `apariencia` | **singleton** no ruteable (entrada `global`) | tokens de diseño (sección C) |

### B.3 Cómo se aplica el seed

1. **Auto-seed al arrancar** (`emdash-runtime.ts`): si la BD está vacía y el setup no se ha hecho, el runtime aplica `applySeed(db, seed, {onConflict: 'skip'})`. Sin contenido: solo esquema, menús, settings, etc.
2. **Setup wizard** (A.8): aplica el seed con `includeContent` si se marca.
3. **CLI `emdash seed [path] -d ./data.db --on-conflict skip|update|error --no-content --validate`**. Trabaja sobre **SQLite local**; no tiene destino D1 remoto.
4. Sirve para el arranque y para entornos nuevos, no como migración. Regla de globos (`docs/migration/PRODUCTION.md`): «Nunca ejecutar el seed o una importación de desarrollo sobre producción después del lanzamiento».

### B.4 Evolucionar el esquema sin borrar contenido

- **Admin → Content Types** (vía principal), **CLI** o **REST**:
  ```bash
  npx emdash login --url https://sovialis.com        # device flow u OAuth; o --token ec_pat_…
  npx emdash schema add-field servicios subtitulo --type string --label "Subtítulo" --url https://sovialis.com
  ```
- **Script idempotente «asegurar esquema»** (patrón de globos `scripts/cms/upgrade-development.mjs`): lee el seed, `GET /_emdash/api/schema/collections` y crea con `POST /_emdash/api/schema/collections/{slug}/fields` solo lo que falta. Después hace `PUT /_emdash/api/schema/collections/{slug}` con `{group, sortOrder, admin, dateField, urlPattern, routable}` (globos `configure-development-admin.mjs`). Antes de tocar nada guarda un snapshot JSON privado (`.data/`, ignorado en git).
- **Borrar un campo es destructivo**: elimina la columna y sus valores. Orden correcto: desplegar primero el código que deja de usar el campo y después borrarlo. Para cambios aditivos, el orden inverso.
- **Devolver al repo el esquema vivo**: `npx wrangler d1 export <db> --remote --output=prod.sql`, cargarlo en SQLite y luego `npx emdash export-seed --database prod.db > seed/seed.json`. Gotcha de globos: «El export SQL de D1 no se completó por las tablas virtuales FTS5». Alternativas: `npx emdash site export` (paquete `.emdash`), D1 Time Travel o Settings → Backups (`/_emdash/api/settings/backups`).
- **Migrar entre entornos**: globos llevó dev a producción con `emdash site export` y `emdash site import <file> --analyze`, seguido de `--plan <digest> --confirm`. Solo sirve sobre un sitio vacío y deja un recibo `verification: verified`. **No transfiere opciones ni secretos de plugins**: se reconfiguraron a mano.

### B.5 REST API y tokens

- Base `/_emdash/api`. Respuesta: `{"success": true, "data": …}`; en error, `{"success": false, "error": {"code", "message"}}`. OpenAPI en `GET /_emdash/api/openapi.json`.
- Auth: cookie de sesión o `Authorization: Bearer ec_pat_…`. Los tokens se crean en Admin → Settings → API tokens (`/_emdash/api/admin/api-tokens`). Scopes válidos (`VALID_SCOPES`): `content:read`, `content:write`, `media:read`, `media:write`, `schema:read`, `schema:write`, `taxonomies:manage`, `menus:manage`, `settings:read`, `settings:manage`, `mcp:tools`, `transfer:*` y `admin`.
- CSRF: con cookie, todo método inseguro exige `X-EmDash-Request: 1`. Con bearer no hace falta. Las rutas públicas validan `Origin` contra el origen público.
- Contenido: `GET|POST /content/{col}`, `GET|PUT /content/{col}/{id}` (`id` admite ULID o slug, con `?locale=es`), `POST /content/{col}/{id}/publish|unpublish|schedule|duplicate|restore|discard-draft`. **Bloqueo optimista**: leer y reenviar `_rev`. Editar una entrada publicada crea un borrador que luego hay que publicar con un `_rev` fresco.
- Media: `POST /media` multipart (`file`, `deduplicate`), y luego `PUT /media/{id}` `{alt, caption}`. Para archivos grandes: `POST /media/upload-url`, subida y `POST /media/{id}/confirm`.
- Otros: `/schema/collections[/{slug}[/fields]]`, `/settings`, `/menus[/{name}/items]`, `/taxonomies/{name}/terms`, `/redirects`, `/widget-areas`, `/sections`, `/search` y `/comments/{col}/{id}`.

Helper probado en globos (`scripts/dev-api.mjs`, adaptado a bearer):

```js
export const origin = process.env.EMDASH_URL;  // https://sovialis.com
const headers = { authorization: `Bearer ${process.env.EMDASH_TOKEN}`, origin };
export async function api(path, o = {}) {
  const r = await fetch(origin + path, { ...o, headers: { ...headers, ...o.headers }, signal: AbortSignal.timeout(60_000) });
  const d = await r.json(); if (!r.ok) throw Error(`${o.method || 'GET'} ${path}: ${r.status} ${JSON.stringify(d)}`); return d.data;
}
export const json = (method, body) => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
// Crear borrador con referencias:  await api('/_emdash/api/content/servicios', json('POST', { slug, locale:'es', status:'draft', data, references:{ zonas:[id1,id2] } }));
// Publicar: const cur = await api(`/_emdash/api/content/servicios/${id}?locale=es`); await api(`…/${id}/publish?locale=es`, json('POST', { _rev: cur._rev }));
```

Subir media y asignarla a un campo (globos `scripts/import-development-media.mjs`):

```js
import { mediaItemToValue } from 'emdash/media';
const form = new FormData(); form.set('file', new Blob([bytes], { type }), filename); form.set('deduplicate', 'true');
const { item: media } = await api('/_emdash/api/media', { method: 'POST', body: form });
await api(`/_emdash/api/media/${media.id}`, json('PUT', { alt, caption: '' }));
data.hero = { ...mediaItemToValue('local', { ...media, meta: { storageKey: media.storageKey } }), alt };
```

Markdown a Portable Text (globos `scripts/portable-migration.ts`): `import { markdownToPortableText } from 'emdash/client'`. Las tablas GFM se normalizan con `normalizePortableTextTable` de `@emdash-cms/admin/portable-text-table`. Las tablas fueron un foco de bugs (`repair-table-delimiters.ts`).

### B.6 Consultar contenido en Astro

```ts
import { getEmDashCollection, getEmDashEntry, getSiteSettings, getSiteSetting, getMenu, getTaxonomyTerms,
         getEntryTerms, getWidgetArea, getSection, getComments, getCollectionInfo, search } from 'emdash';

const { entries, nextCursor, cacheHint, error } = await getEmDashCollection('servicios', {
  locale: 'es', status: 'published', limit: 20, cursor,            // o offset (no ambos)
  where: { zona: 'usaquen', published_at: { gte: '2026-01-01' } }, // taxonomías detectadas solas; byline: '<id>'
  orderBy: { published_at: 'desc' },
});
const { entry, isPreview, fallbackLocale } = await getEmDashEntry('servicios', Astro.params.slug!, {
  locale: 'es', references: { zonas: { limit: 100 } },             // páginas de referencias en entry.references.zonas.entries
});
if (!entry) return Astro.rewrite('/404');
```

- **`entry.id` es el slug** (para URLs). **`entry.data.id` es el ULID** (para `Comments`, `getEntryTerms`, votos y `PublicPageContext.content.id`). Confundirlos devuelve vacío sin error.
- Los campos `image` son objetos `MediaValue` (`{provider, id, src?, alt, width, height, focalX, blurhash, dominantColor…}`), no strings.
- Si Astro route cache está activo, pasar `cacheHint` a `Astro.cache.set(cacheHint)` y usar las variantes `get…WithCacheHint()`.
- Globos memoiza por request con `getRequestContext()` de `emdash/request-context` (`WeakMap` por contexto), pagina con `nextCursor` y limita la hidratación de referencias a 4 en paralelo para no saturar D1 (`src/lib/emdash-content.ts` y `src/lib/cms/hydrate.ts`).
- Menús: `getMenu('primary', { locale: 'es' })` devuelve `{items: MenuItem[]}` con `url` y `children` resueltos.

### B.7 Portable Text e imágenes

```astro
---
import { PortableText, Image } from 'emdash/ui';
import RichHeading from '@/components/RichHeading.astro';
const { entry } = Astro.props;
---
<Image image={entry.data.hero} class="aspect-[16/9] w-full object-cover" loading="eager" fetchpriority="high" />
<PortableText value={entry.data.body} components={{ block: { h2: RichHeading, h3: RichHeading } }} />
```

- `emdash/ui` exporta `PortableText`, `Blocks`, `defineBlockComponents`, `Image` (alias de EmDashImage, con srcset y `darkVariant`), `Media`, `WidgetArea`, `EmDashHead`, `EmDashBodyStart`, `EmDashBodyEnd` y bloques (`Code`, `Embed`, `Gallery`, `Columns`, `HtmlBlock`, `Iframe`, `PTImage`). Globos le añade anclas a los H2 y H3 (`components/RichBody.astro`).
- URL de un archivo: `/_emdash/api/media/file/<storageKey>`, pública con GET. Globos tiene un helper `imageSource(value)` que acepta string, `url`, `src`, `meta.storageKey` o `provider==='local'` + `id`.
- Servicio de imágenes: con `imageService: 'passthrough'` (globos) se sirve el original y no hay variantes responsive. Con el default `cloudflare-binding` hay transformaciones mediante el binding `IMAGES` (cuota gratis de Cloudflare Images **NO VERIFICADA**). La documentación avisa de que, sin binding `IMAGES`, se sirven originales en silencio.

---

## C. Ajustes del sitio y theming

### C.1 Qué es nativo

- **Settings → General, Social y SEO** (`SiteSettings`): `title`, `tagline`, `logo`, `favicon`, `url`, `postsPerPage`, `dateFormat`, `timezone`, `social.{twitter,github,facebook,instagram,linkedin,youtube}` y `seo.{titleSeparator, defaultOgImage, robotsTxt, googleVerification, bingVerification}`. Se leen con `getSiteSettings()` y `getSiteSetting('timezone')`. **No admite claves propias.**
- **No existe un sistema de «theme settings».** El `src/themes/globos-classic/theme.json` de globos es una convención del proyecto: EmDash no lo lee (búsqueda sin resultados en `emdash/src` y `@emdash-cms/admin`). Un «tema» en EmDash es un proyecto Astro con seed (`package.json → emdash.seed`).
- `emdash({ admin: { logo, siteName, footerLabel, favicon } })` personaliza la marca del panel, no la del sitio.

### C.2 Opciones para tokens editables

| Opción | Pros | Contras |
|---|---|---|
| **1. Colección singleton `apariencia`** (recomendada) | UI nativa, revisiones, borrador y preview, caché KV de objetos, sin código de admin, se migra con el seed | Sin selector de color nativo (se valida con `pattern`). Requiere convención de una sola entrada |
| 2. Plugin nativo con página React y `ctx.settings`, inyectado por `page:fragments` en `head` | Selector de color propio, solo admins (`settings:manage`) | Más código. Sin revisiones ni preview. Lee la BD en cada render. Los fragments llegan después del CSS del layout (orden) |
| 3. Tokens en código (`@theme`) | Cero runtime | No editable (va contra la preferencia de JP: «todo editable desde el panel») |

Mejora opcional para la opción 1: un plugin nativo que aporte un **field widget** de color. En la colección, `"widget": "sovialis-theme:color"`; en el plugin, `admin.fieldWidgets: [{name:'color', label:'Color', fieldTypes:['string']}]` y en `adminEntry`, `export const fields = { color: ColorPicker }`. El admin le pasa `{value, onChange, label, id, required, options, validation, minimal}` (verificado en `@emdash-cms/admin/dist/index.js`).

### C.3 Implementación de la opción 1

Seed (valores de ejemplo de la familia azul de `sovialis.com/DESIGN.md`; confirmar contra el manual de marca «Océano»):

```json
{ "slug": "apariencia", "label": "Apariencia", "labelSingular": "Apariencia", "routable": false,
  "supports": ["drafts", "revisions"], "group": "Configuración", "sortOrder": 99, "admin": { "quickCreate": false },
  "fields": [
    { "slug": "title", "label": "Nombre", "type": "string", "required": true },
    { "slug": "color_primario", "label": "Color primario (#RRGGBB)", "type": "string", "required": true, "validation": { "pattern": "^#[0-9a-fA-F]{6}$" } },
    { "slug": "color_primario_hover", "label": "Primario al pasar el cursor", "type": "string", "validation": { "pattern": "^#[0-9a-fA-F]{6}$" } },
    { "slug": "color_acento", "label": "Acento", "type": "string", "validation": { "pattern": "^#[0-9a-fA-F]{6}$" } },
    { "slug": "color_tinta", "label": "Texto principal", "type": "string", "validation": { "pattern": "^#[0-9a-fA-F]{6}$" } },
    { "slug": "color_superficie", "label": "Superficie", "type": "string", "validation": { "pattern": "^#[0-9a-fA-F]{6}$" } },
    { "slug": "fuente_titulos", "label": "Fuente de títulos", "type": "select", "validation": { "options": ["Jost", "Figtree"] } },
    { "slug": "fuente_texto", "label": "Fuente de texto", "type": "select", "validation": { "options": ["Figtree", "Jost"] } },
    { "slug": "radio", "label": "Redondeo (px)", "type": "select", "validation": { "options": ["0", "4", "8", "12", "16", "24"] } }
  ] }
// content.apariencia: [{ "id": "apariencia:global", "slug": "global", "status": "published",
//   "data": { "title": "Global", "color_primario": "#0B4E78", "color_acento": "#137DA5", "color_tinta": "#18384C", "color_superficie": "#ECF4F8", "fuente_titulos": "Jost", "fuente_texto": "Figtree", "radio": "12" } }]
```

Que `pattern` se aplique también del lado del servidor está **NO VERIFICADO**, así que el layout vuelve a validar:

```ts
// src/lib/theme-tokens.ts
import { getEmDashEntry } from 'emdash';
const HEX = /^#[0-9a-f]{6}$/i;
const FONTS: Record<string, string> = { Jost: "'Jost Variable', system-ui, sans-serif", Figtree: "'Figtree Variable', system-ui, sans-serif" };
const DEFAULTS = { primary: '#0B4E78', primaryHover: '#084C51', accent: '#137DA5', ink: '#18384C', surface: '#ECF4F8', heading: FONTS.Jost, body: FONTS.Figtree, radius: '12px' };
export async function themeCss(): Promise<string> {
  const { entry } = await getEmDashEntry('apariencia', 'global', { locale: 'es' });   // pasa por el objectCache KV
  const d = (entry?.data ?? {}) as Record<string, unknown>;
  const hex = (v: unknown, f: string) => (typeof v === 'string' && HEX.test(v) ? v : f);
  const t = {
    primary: hex(d.color_primario, DEFAULTS.primary), primaryHover: hex(d.color_primario_hover, DEFAULTS.primaryHover),
    accent: hex(d.color_acento, DEFAULTS.accent), ink: hex(d.color_tinta, DEFAULTS.ink), surface: hex(d.color_superficie, DEFAULTS.surface),
    heading: FONTS[String(d.fuente_titulos)] ?? DEFAULTS.heading, body: FONTS[String(d.fuente_texto)] ?? DEFAULTS.body,
    radius: /^(0|4|8|12|16|24)$/.test(String(d.radio)) ? `${d.radio}px` : DEFAULTS.radius,
  };
  // Opcional: calcular contraste WCAG de blanco sobre primary y forzar DEFAULTS.primary si < 4.5:1.
  return `:root{--sv-primary:${t.primary};--sv-primary-hover:${t.primaryHover};--sv-accent:${t.accent};--sv-ink:${t.ink};--sv-surface:${t.surface};--sv-font-heading:${t.heading};--sv-font-body:${t.body};--sv-radius:${t.radius}}`;
}
```

```astro
<!-- layouts/Base.astro, en <head> y ANTES de EmDashHead -->
<style is:inline set:html={await themeCss()}></style>
```

```css
/* src/styles/global.css (Tailwind v4) */
@import "tailwindcss";
@import "@fontsource-variable/jost"; @import "@fontsource-variable/figtree";  /* auto-hospedadas, ya en package.json */
@theme inline {
  --color-primary: var(--sv-primary); --color-primary-hover: var(--sv-primary-hover); --color-accent: var(--sv-accent);
  --color-ink: var(--sv-ink); --color-surface: var(--sv-surface);
  --font-heading: var(--sv-font-heading); --font-sans: var(--sv-font-body); --radius-brand: var(--sv-radius);
}
```

Mismo patrón para el singleton `ajustes` (NAP, WhatsApp, horario, política de datos): `getEmDashEntry('ajustes','global')` en el layout y en el JSON-LD. Así se cumple «datos de empresa… nada fijo en código» (memoria `sovialis-feedback-configurable.md`).

---

## D. API de plugins (`definePlugin`)

### D.1 Formatos y registro

| Formato | Export | Dónde corre | Admin | Registro |
|---|---|---|---|---|
| **native** (default si no se indica `format`) | `createPlugin(options)` que devuelve `definePlugin({...})` | `plugins: []`, en el mismo isolate y con autoridad del sitio | React (`adminEntry`), Block Kit y componentes Astro (`componentsEntry`) | Descriptor `{id, version, entrypoint, adminEntry?, adminPages?, adminWidgets?, settingsSchema?, storage?, options?}` |
| **standard** / sandboxed | `src/plugin.ts` con `export default` de `SandboxedPlugin`, hecho con `@emdash-cms/plugin-cli` | `plugins: []` (adaptado) o `sandboxed: []` (V8 isolate vía Worker Loader) | Solo Block Kit | Manifiesto `emdash-plugin.jsonc` y registro `registry.emdashcms.com` |

```js
import { sandbox } from '@emdash-cms/cloudflare';
emdash({ plugins: [trusted()], sandboxed: [untrusted()], sandboxRunner: sandbox() });
```

- `sandbox()` lee wrangler y devuelve `undefined` con aviso si falta `"worker_loaders": [{"binding": "LOADER"}]`: «Worker Loader requires a Workers paid plan». Sin él, las instalaciones del registro fallan con `SANDBOX_NOT_AVAILABLE`. Límites por plugin en el sandbox: 50 ms de CPU, 10 subrequests, 30 s wall.
- Los plugins declarados en config quedan **activos por defecto** (`emdash-runtime.ts`: sin fila de estado = activo). Se pueden desactivar en Admin → Extensions.
- Globos registra los descriptores en línea (sección A.3). El `entrypoint` exporta `createPlugin()` y el `adminEntry` exporta `pages`.

### D.2 `PluginDefinition` (`emdash/src/plugins/types.ts`)

```ts
definePlugin({
  id: 'sovialis-leads', version: '1.0.0',
  capabilities?: PluginCapability[],
  allowedHosts?: string[],                 // para network:request (admite *.example.com)
  storage?: { leads: { indexes: ['status','createdAt',['ipHash','createdAt']], uniqueIndexes?: [] } },
  hooks?: PluginHooks,
  routes?: Record<string, PluginRoute>,
  mcp?: { tools: { … } },
  admin?: { entry?, settingsSchema?, pages?, widgets?, editorPanels?, editorActions?, portableTextBlocks?, fieldWidgets? },
});
```

**Capacidades vigentes** (`@emdash-cms/plugin-types` `CURRENT_PLUGIN_CAPABILITIES`): `network:request`, `network:request:unrestricted`, `content:read`, `content:revisions:read`, `content:write`, `content:publish`, `content:restore`, `comments:read`, `comments:moderate`, `schema:read`, `admin.editor-draft:read`, `admin.editor-draft:patch`, `hooks.content-policy:register`, `taxonomies:read`, `taxonomies:write`, `bylines:read`, `redirects:read`, `redirects:write`, `media:read`, `media:bytes:read`, `media:metadata:write`, `media:write`, `users:read`, `email:send`, `hooks.email-transport:register`, `hooks.email-events:register` y `hooks.page-fragments:register`. Nombres antiguos que se normalizan: `network:fetch`, `read:content`, `write:content`, `read:media`, `write:media`, `read:users`, `email:provide`, `email:intercept` y `page:inject`. **Settings, KV, storage declarado, log y cron no necesitan capacidad.**

### D.3 Hooks (`HOOK_NAMES`)

| Hook | Firma y retorno | Capacidad |
|---|---|---|
| `plugin:install`, `plugin:activate`, `plugin:deactivate`, `plugin:uninstall` | `(event, ctx) => void` | — |
| `content:beforeSave` / `content:afterSave` | `ContentHookEvent {content, collection, isNew, id?, actor?}` | lectura y escritura según el caso |
| `content:beforePublish`, `beforeSchedule`, `beforeUnpublish` | `(ContentPolicyEvent) => void \| {cancel: true, reason}` | `hooks.content-policy:register` |
| `content:afterPublish`, `afterUnpublish`, `afterRestore`, `afterSchedule`, `afterUnschedule`, `content:beforeDelete` (`false` cancela), `content:afterDelete` | — | — |
| `media:beforeUpload` / `media:afterUpload` | — | — |
| `cron` | `(CronEvent {name, data, scheduledAt}, ctx)`. Se agenda con `ctx.cron.schedule(name, {schedule: '0 2 * * *' \| '@weekly'})` en `plugin:activate` | — |
| `email:beforeSend` / `email:afterSend` | Mensaje modificado o `false` / `void` | `hooks.email-events:register` |
| `email:deliver` | **Exclusivo**: un solo proveedor, elegido en Settings → Email | `hooks.email-transport:register` |
| `comment:beforeCreate`, `comment:moderate` (exclusivo), `comment:afterCreate`, `comment:afterModerate` | — | **`users:read`** (sin ella el hook se omite) |
| `byline:afterSave` / `byline:afterDelete` | — | — |
| `page:metadata` | Devuelve `{kind:'meta'\|'property'\|'link'\|'jsonld', …}` o un arreglo | — (también en sandbox) |
| `page:fragments` | `{kind:'external-script'\|'inline-script'\|'html', placement:'head'\|'body:start'\|'body:end', key?}` | **`hooks.page-fragments:register`**, solo nativo |

Cada hook acepta un handler o `{priority (default 100), timeout (5000 ms), dependencies, errorPolicy: 'continue'|'abort', exclusive, handler}`.

### D.4 Rutas

```ts
routes: {
  'leads/list': { methods: ['GET'], permission: 'content:edit_any', request: { body: 'none' }, handler: async (ctx) => {...} },
  submit: { public: true, methods: ['POST'], request: { body: 'json', maxBytes: 8192 }, input: zodSchema, handler },
  export: { methods: ['GET'], permission: 'settings:manage', request: { body: 'none' }, response: 'raw', handler },
}
```

- URL: `/_emdash/api/plugins/<pluginId>/<routeName>`. Los nombres con `/` se convierten en subrutas, por ejemplo `/_emdash/api/plugins/sovialis-leads/leads/list`.
- Handler nativo con un argumento: `RouteContext` (`PluginContext` + `input`, `request`, `requestMeta {ip, userAgent, referer, geo{country, region, city}}`, `user?`). En sandbox la firma es `(routeCtx, ctx)`.
- `public: true` salta sesión, permiso y scope, pero **no** la defensa cross-origin: los POST públicos pasan `checkPublicCsrf` contra `Origin` (`emdash/src/astro/middleware/auth.ts`). No hay rate limit propio en rutas de plugin (solo en auth y comentarios), así que hay que implementarlo.
- Privadas: requieren sesión con `X-EmDash-Request: 1`, o bearer con scope. `permission` es una de las de `@emdash-cms/auth`, como `content:read_drafts`, `content:edit_any`, `settings:manage`, `plugins:manage`, `users:read` o `comments:moderate`. Si falta, el default heredado es `plugins:manage`. El mapeo exacto de permisos a roles está **NO VERIFICADO**.
- Body: `none` (query), `json` (default), `text`, `bytes` o `form-data` (`{entries: [{name, kind:'text'|'file', …}]}`). Por defecto 1 MiB, con un máximo de 8 MiB.
- Respuesta: se envuelve como `{success:true, data}`. Errores: `throw new PluginRouteError(code, msg, status)` o `PluginRouteError.badRequest|forbidden|notFound|conflict|internal(...)`. Para CSV u otros binarios: `response: 'raw'` y `return pluginResponse({ headers, body: {kind:'text', value} })`, importado de `'emdash'`. `cacheControl` solo aplica a GET públicos con éxito.

### D.5 Contexto (`PluginContext`)

`ctx.plugin {id, version}`, `ctx.kv` (`get/set/delete/list/getVersioned/compareAndSet`, con prefijos `state:` y `cache:`), `ctx.settings` (mismos métodos; los campos `secret` del `settingsSchema` se cifran con `EMDASH_ENCRYPTION_KEY`), `ctx.storage.<col>` (`get/put/delete/exists/getMany/putMany/deleteMany/query({where, orderBy, limit≤100, cursor})/count(where)/updateIf/compareAndSet`, en la tabla `_plugin_storage` de D1), `ctx.content?`, `ctx.schema?`, `ctx.media?`, `ctx.http?` (`fetch` limitado a `allowedHosts`), `ctx.users?`, `ctx.comments?`, `ctx.email?` (`send({to, cc?, replyTo?, subject, text, html?})`, **`undefined` si no hay proveedor de `email:deliver`**), `ctx.cron`, `ctx.log`, `ctx.site` y `ctx.url(path)`. Para trabajo diferido: `import { after } from 'emdash'` (usa `waitUntil`).

### D.6 Admin del plugin

- **React (nativo)**: `adminEntry` exporta `pages` (por ruta), `widgets` (por id) y `fields` (widgets de campo). Las páginas se declaran en `adminPages` del descriptor y/o en `admin.pages` (globos usa ambos). Las llamadas a sus rutas desde React:
  ```ts
  fetch(`/_emdash/api/plugins/globos-whatsapp/${path}`, { method, credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-EmDash-Request': '1' }, body })   // la respuesta trae {success, data, error?.message}
  ```
- **`settingsSchema`** (tipos `string` con `multiline`, `number`, `boolean`, `select`, `secret`, `url` y `email`) genera un formulario de ajustes automático. La ubicación exacta en el admin está **NO VERIFICADA**: probablemente Extensions → plugin → Settings. Para nativos se declara en el descriptor y en `admin.settingsSchema`.
- **Block Kit** (`@emdash-cms/blocks`): para sandbox y nativos. Ejemplo: `emdash-smtp` se configura enviando `POST /_emdash/api/plugins/emdash-smtp/admin {type:'form_submit', action_id, values}` (globos `scripts/cms/configure-brevo.mjs`).

### D.7 Referencia: `globos-whatsapp` (leer después)

- `globos/src/plugins/globos-whatsapp/index.ts`: `definePlugin` con `capabilities: ['hooks.page-fragments:register']`, `admin.pages`, rutas `config` (GET) y `save` (POST, `request:{body:'json', maxBytes:65536}`), y `choices`, todas con `permission:'settings:manage'`. Guarda la config en `ctx.kv.set('config')`. El hook `page:fragments` devuelve `[{kind:'html', placement:'body:end', key, html}, {kind:'inline-script', …}]` escapando con `escapeHtmlAttr` de `emdash/page`, ignora `/_emdash` y empuja `dataLayer.push({event:'click_whatsapp', …})`.
- `globos/src/plugins/globos-whatsapp/admin.tsx`: página React con helper `api()` y `export const pages = { '/whatsapp': WhatsAppAdmin }`.
- `globos/src/plugins/globos-whatsapp/model.ts`: `DEFAULT_SETTINGS`, `validateSettings`, `resolveWhatsApp` (reglas por curso, país, ruta, horario y prioridad).
- Registro: `globos/astro.config.mjs`, objeto con `adminEntry` y `adminPages:[{path:'/whatsapp', label:'WhatsApp', icon:'message-circle'}]`.
- Otros de referencia: `globos-integrity` (políticas `content:beforePublish|beforeSchedule|beforeUnpublish|beforeDelete` con `ContentRepository` y `getDb()` de `emdash/runtime`), `globos-seo` (`page:metadata` JSON-LD) y `globos-promotions` (`page:fragments` + `ctx.content.list` + página de calendario).
- **Gotcha documentado**: sin `hooks.page-fragments:register` la config se guardaba pero el botón no aparecía.

---

## E. SEO nativo

### E.1 Qué hace EmDash solo

- **Panel SEO por entrada** (colecciones con `supports: ["seo"]`): título SEO, meta description, imagen OG, canonical y «ocultar de buscadores» (`noindex, nofollow`).
- **`<EmDashHead page={ctx}/>`**: emite description, robots, canonical, `og:*`, `twitter:*`, `article:*`, verificación de Google y Bing (Settings → SEO), hreflang si hay i18n, y JSON-LD: **`BlogPosting`** para `pageType:'article'` con canonical, **`WebSite`** en el resto cuando hay `siteName`. Superpone en automático los valores del panel SEO si la entrada se leyó con `getEmDashEntry()` en la misma request y `page.content` apunta a ella. **No fija `<title>`**: se usa `getSeoMeta(entry, {siteUrl, path, defaultTitle, defaultDescription, defaultOgImage})` de `emdash/seo`. Orden de precedencia: plugins, luego sitio, luego base (gana el primero). Un plugin que emita `{kind:'jsonld', id:'primary'}` reemplaza el JSON-LD base.
- El contexto de página se crea con `createPublicPageContext({ Astro, kind:'content'|'custom', pageType, title, pageTitle, description, canonical, image, content:{collection, id: entry.data.id, slug}, siteName, siteUrl, breadcrumbs })` desde `emdash/page`, o se construye a mano como en globos (`components/Seo.astro`).
- **`/sitemap.xml`**: índice con un hijo `/sitemap-{collection}.xml` por colección con contenido publicado. Excluye noindex, corta en 2.000 entradas por archivo y arma las URLs con `urlPattern`. **`/robots.txt`**: permite todo, bloquea `/_emdash/` y enlaza el sitemap, o usa `seo.robotsTxt` de Settings. EmDash solo inyecta estas rutas si el proyecto no define `src/pages/sitemap.xml.ts`, `sitemap-[collection].xml.ts` o `robots.txt.ts` (`hasUserDefinedPublicRoute`).
- **Redirects**: admin y `/_emdash/api/redirects` (301, 302, 307, 308, 410 y 451, con comodines), redirect automático al cambiar el slug de algo publicado, y registro de 404 (`/_emdash/api/redirects/404s`).

### E.2 Lo que agregó globos

| Archivo | Qué hace |
|---|---|
| `src/lib/seo.ts` | Builders `organizationSchema`, `websiteSchema`, `courseSchema` (Course+Product, `aggregateRating` solo con votos propios), `blogPostingSchema`, `breadcrumbSchema` y `faqSchema` |
| `src/plugins/globos-seo/index.ts` | `page:metadata` que reemplaza el `BlogPosting` base (`id:'primary'`) por uno con autor y sección reales |
| `components/Seo.astro` | `getSeoMeta` + `PublicPageContext` + `EmDashHead`. Filtra `BlogPosting` y `WebSite` de los schemas propios para no duplicar |
| `src/lib/sitemap.ts`, `pages/sitemap-index.xml.ts`, `pages/sitemaps/[name].xml.ts` | Sitemaps segmentados con imagen y `lastmod` real. Conviven con el `/sitemap.xml` nativo porque no lo sobrescribieron (gotcha: dos índices; robots apunta solo al suyo) |
| `src/lib/sitemap-policy.ts` | `isSitemapEligible(seo, path, siteUrl)`: excluye `noIndex` y canonicals ajenos |
| `src/lib/llms.ts`, `pages/llms.txt.ts`, `pages/llms-full.txt.ts` | Contexto para asistentes de IA, armado desde el CMS en cada request |
| `src/worker-production.ts` | Sirve un `robots.txt` propio antes de EmDash (`Disallow: /_emdash/ /api/ /landing/`, `Allow: /_emdash/api/media/file/`) |
| `scripts/indexnow.mjs`, `scripts/bing-submit.mjs` | IndexNow (clave en `public/<key>.txt`; URLs del sitemap con `lastmod` de menos de 2 días o `--all`) y Bing Webmaster API (`BING_WMT_API_KEY`) |
| `plugins/globos-integrity` (`blog-seo.ts`) | Bloquea la publicación sin keyword principal, con keyword duplicada o con un H1 dentro del cuerpo |

### E.3 Plugins SEO del registro

Publish Check 0.3.0 (`@emdashplugins.bsky.social`), SEO Suite 0.2.0 (`@nookeshk.bsky.social`), seo-guard 0.1.0, Crosslink 0.1.0 y Link Guardian 0.1.0 se instalan desde el registro, es decir, en **sandbox con `LOADER` (Workers Paid)**. Todos son 0.x. Globos los evaluó y no instaló ninguno: «Evitar dos generadores de JSON-LD para una misma entidad». **Recomendación**: SEO nativo más `sovialis-seo` propio (`page:metadata` con `LocalBusiness`, `Service`, `FAQPage` y `BreadcrumbList` leyendo el singleton `ajustes`, y `content:beforePublish` con reglas editoriales tipo globos). Si se pasa a Workers Paid, probar Publish Check en modo aviso.

---

## F. Comentarios nativos y estrellas

### F.1 Activar y moderar

```js
// Seed: "commentsEnabled": true en la colección. Moderación por API (globos scripts/cms/configure-comments.mjs):
await api('/_emdash/api/schema/collections/blog', json('PUT', {
  commentsEnabled: true, commentsModeration: 'all',   // 'all' | 'first_time' | 'none'
  commentsAutoApproveUsers: false, commentsClosedAfterDays: 0 }));
```

- Moderación en Admin → Comments (`/_emdash/api/admin/comments`, con estados `approved`, `pending` y `spam`). Trae honeypot, validación y **rate limit nativo** (429 `RATE_LIMITED`), además de Turnstile opcional (`EMDASH_TURNSTILE_SECRET_KEY` y la prop `turnstileSiteKey`).
- Aviso por correo nativo: va al **autor del contenido cuando un comentario se aprueba** (`comments/notifications.ts`), no a moderación cuando llega uno pendiente. Para eso: plugin con `comment:afterCreate` y capacidades `users:read` + `email:send`.
- El helper SSR trae hasta 500 comentarios por entrada. Si hacen falta más, paginar contra la API nativa.

### F.2 Frontend

Componentes nativos:

```astro
---
import { Comments, CommentForm } from 'emdash/ui/comments';   // separados del barrel para no cargar su CSS en todas las páginas
---
<Comments collection="blog" contentId={entry.data.id} threaded sort="oldest" />
<CommentForm collection="blog" contentId={entry.data.id} turnstileSiteKey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY} />
```

Versión de globos con diseño propio (`themes/globos-classic/components/blog/BlogComments.astro`):
- Lectura SSR: `getCollectionInfo('blog')` (`commentsEnabled`, `commentsModeration`) y `getComments({collection:'blog', contentId, threaded:true})`, que devuelve `{items, total}`, cada ítem con `replies`, `authorName`, `body`, `createdAt` e `id`. Solo muestra la proyección pública, sin email ni IP.
- Envío: `POST /_emdash/api/comments/blog/<contentId>` con `{'Content-Type':'application/json','X-EmDash-Request':'1'}` y cuerpo `{authorName, authorEmail, body, parentId?, website_url}` (honeypot). Lee `data.status` (`approved` o pending) y mapea errores: 429, `COMMENTS_CLOSED`, `COMMENTS_DISABLED` y 400.
- Respuestas: `parentId` = id del comentario raíz.
- Si un gate protege `/_emdash`, dejar abierto `GET|POST /_emdash/api/comments/<col>/<id>` (globos `isPrivateCmsRequest`).

### F.3 Estrellas (globos, estilo kk Star Ratings)

| Pieza | Archivo |
|---|---|
| BD | D1 aparte `RATINGS_DB` (`globos-ratings-dev` / `cursodeglobosonline-ratings`) con `"migrations_dir": "migrations"`. Se aplica con `wrangler d1 migrations apply <db> --remote` (`npm run db:migrate:dev`) |
| Migraciones | `migrations/0001_course_votes.sql` y `0002_blog_votes.sql`: `(post_id, voter, ip_hash, rating CHECK 1..5, country, created_at, updated_at, PK(post_id, voter)) WITHOUT ROWID` + índice `(post_id, ip_hash)` |
| API | `src/pages/api/ratings.ts` y `src/pages/api/blog-ratings.ts` (endpoints Astro dentro del Worker, fuera de `/_emdash`). Delegan en `src/lib/ratings-api.ts` (`ratingsGet` con caché de borde de 60 s vía `caches.default`; `ratingsPost`) |
| Seguridad | Mismo origen (`Origin === url.origin`), JSON de 512 bytes como máximo, `voter` = UUID v4 de localStorage guardado como HMAC-SHA256 con `RATING_SALT`, IP en HMAC (IPv6 /64), máximo 3 votantes por IP y entrada con un `INSERT … SELECT … WHERE` atómico y `ON CONFLICT DO UPDATE`. Valida que la entrada esté publicada (`getEmDashEntry`) |
| Lecturas SSR | `src/lib/ratings.ts` (`getBlogRatings()` memoizado por request con `getRequestContext()`) y `ratings-config.ts` (validación, `MIN_VOTES_FOR_SCHEMA=1`, formato es-ES) |
| UI | `components/StarRating.astro` (voto, cambio de voto, sincronía entre instancias; sin JS queda de solo lectura), `Rating.astro` y `blog/BlogRating.astro` |
| JSON-LD | `courseSchema()` añade `aggregateRating {ratingValue (1 decimal), ratingCount, bestRating:5, worstRating:1}` desde los mismos datos visibles. El blog muestra estrellas pero no las pone en el schema |
| Legado | `functions/api/ratings.ts` (Pages Function) sigue vivo en producción mediante una excepción de ruta `cursodeglobosonline.com/api/ratings*` para conservar la sal HMAC original |

**Advertencia SEO para Sovialis.** Las reseñas sobre el propio negocio en `LocalBusiness` u `Organization` son «self-serving» y Google no muestra estrellas por ellas (política de review snippets). `Service` tampoco está entre los tipos admitidos. Usar las estrellas como prueba social visible; el `aggregateRating` en JSON-LD solo si encaja en un tipo admitido y sin datos de terceros. Revisar con la skill `seo-tecnico` antes de implementarlo.

---

## G. Formularios y leads

### G.1 `@emdash-cms/plugin-forms` 0.2.9 (oficial, revisado en el código)

- **Formato nativo** (`formsPlugin()` devuelve el descriptor y `createPlugin()` el plugin). **No necesita sandbox ni Worker Loader.** Se registra en `plugins: [formsPlugin({ defaultSpamProtection: 'turnstile' })]`. Peer deps: `@cloudflare/kumo@2.6.0` y `@phosphor-icons/react`.
- Capacidades: `email:send`, `media:write` y `network:request` (`allowedHosts: ["*"]`). Storage: `forms` (`status`, `createdAt`, slug único) y `submissions` (`formId`, `status`, `starred`, `createdAt`).
- Rutas públicas: `submit` y `definition`. Privadas: `forms/*`, `submissions/list|get|update|delete|export` (CSV o JSON) y `settings/turnstile-status`. Admin: páginas «Forms» y «Submissions» más el widget «Recent Submissions». Settings: `turnstileSiteKey` y `turnstileSecretKey` (secret).
- Funciones: constructor de formularios, multipágina, campos condicionales, subida de archivos a R2, honeypot o Turnstile, aviso inmediato o resumen diario por `ctx.email`, autorespuesta, webhook diferido con `after()`, retención con cron semanal y CSV.
- Frontend: `import { Form } from '@emdash-cms/plugin-forms/ui'` → `<Form id="contacto" />` (SSR, con mejora progresiva mediante `@emdash-cms/plugin-forms/client`), o bloque Portable Text `emdash-form`. Estilos: `@emdash-cms/plugin-forms/styles` (clases `.ec-form*`).
- Riesgos: versión 0.x. Guarda IP, user-agent, referer y país en `meta` (debe figurar en la política de datos). Textos de admin y de validación en inglés (**NO VERIFICADO** si se pueden traducir). Sin rate limit aparte de Turnstile. Los avisos solo salen si hay proveedor `email:deliver`.
- Globos evaluó otro plugin, `@netdollar.dev/forms` (del registro, que sí exige sandbox), y no instaló ninguno. Su formulario sigue abriendo WhatsApp y no guarda leads.

### G.2 Recomendación v1: plugin nativo `sovialis-leads`

Da control de campos, textos en español, atribución, Ley 1581 y estados de seguimiento, sin depender de un 0.x. `plugin-forms` queda para «Trabaja con nosotros» (hojas de vida), en una fase 2.

```ts
// src/plugins/sovialis-leads/index.ts
import { definePlugin, after, PluginRouteError, pluginResponse, type RouteContext } from 'emdash';
import { z } from 'astro/zod';
import { env } from 'cloudflare:workers';

type Lead = { nombre: string; telefono: string; email?: string; servicio: string; turno?: string; localidad?: string;
  mensaje?: string; consentimiento: true; pagina: string; utm?: Record<string, string>; gclid?: string; fbclid?: string;
  status: 'nuevo' | 'contactado' | 'cotizado' | 'cerrado' | 'descartado'; notas?: string; ipHash: string; country: string | null; createdAt: string };

const Submit = z.object({
  nombre: z.string().trim().min(2).max(100), telefono: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  servicio: z.string().max(80), turno: z.string().max(40).optional(), localidad: z.string().max(80).optional(),
  mensaje: z.string().max(2000).optional(), consentimiento: z.literal(true),           // Ley 1581: casilla obligatoria
  pagina: z.string().max(300), utm: z.record(z.string(), z.string().max(200)).optional(),
  gclid: z.string().max(200).optional(), fbclid: z.string().max(200).optional(),
  website: z.string().max(0).optional(),                                               // honeypot: debe llegar vacío
  'cf-turnstile-response': z.string().min(1).max(2048),
});
const enc = new TextEncoder();
async function hmac(secret: string, msg: string) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)))].map(b => b.toString(16).padStart(2, '0')).join('');
}
const leads = (ctx: RouteContext) => ctx.storage.leads as import('emdash').StorageCollection<Lead>;

export function createPlugin() {
  return definePlugin({
    id: 'sovialis-leads', version: '1.0.0',
    capabilities: ['email:send', 'network:request'], allowedHosts: ['challenges.cloudflare.com'],
    storage: { leads: { indexes: ['status', 'createdAt', 'servicio', ['ipHash', 'createdAt']] } },
    admin: {
      pages: [{ path: '/leads', label: 'Solicitudes', icon: 'inbox' }],
      settingsSchema: {
        notifyTo: { type: 'email', label: 'Correo que recibe las solicitudes', description: 'Debe ser destino verificado en Email Routing' },
        turnstileSiteKey: { type: 'string', label: 'Turnstile site key' },
        turnstileSecretKey: { type: 'secret', label: 'Turnstile secret key' },
      },
    },
    routes: {
      submit: { public: true, methods: ['POST'], request: { body: 'json', maxBytes: 8192 }, handler: async (ctx) => {
        const parsed = Submit.safeParse(ctx.input);
        if (!parsed.success) throw PluginRouteError.badRequest('Revisa los datos del formulario.', parsed.error.flatten().fieldErrors);
        const d = parsed.data;
        if (d.website) return { ok: true };                                            // bot: éxito silencioso
        const secret = await ctx.settings.get<string>('turnstileSecretKey');
        if (!secret) throw PluginRouteError.internal('Formulario no configurado');
        const tv = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST',
          body: new URLSearchParams({ secret, response: d['cf-turnstile-response'], remoteip: ctx.requestMeta.ip ?? '' }) });
        if (!(await tv.json() as { success: boolean }).success) throw PluginRouteError.forbidden('No pudimos verificar el envío.');
        const ipHash = await hmac((env as { LEADS_SALT: string }).LEADS_SALT, ctx.requestMeta.ip ?? '0.0.0.0');
        const since = new Date(Date.now() - 3_600_000).toISOString();
        if (await leads(ctx).count({ ipHash, createdAt: { gte: since } }) >= 5) throw new PluginRouteError('RATE_LIMITED', 'Demasiados envíos. Intenta más tarde.', 429);
        const id = crypto.randomUUID(); const { website: _, 'cf-turnstile-response': __, ...data } = d;
        const lead: Lead = { ...data, email: data.email || undefined, consentimiento: true, status: 'nuevo', ipHash,
          country: ctx.requestMeta.geo?.country ?? null, createdAt: new Date().toISOString() };
        await leads(ctx).put(id, lead);
        const to = await ctx.settings.get<string>('notifyTo');
        if (to && ctx.email) after(() => ctx.email!.send({ to, replyTo: lead.email, subject: `Nueva solicitud: ${lead.servicio} · ${lead.nombre}`,
          text: `Nombre: ${lead.nombre}\nTeléfono: ${lead.telefono}\nServicio: ${lead.servicio} ${lead.turno ?? ''}\nLocalidad: ${lead.localidad ?? '-'}\nPágina: ${lead.pagina}\n\n${lead.mensaje ?? ''}\n\nPanel: ${ctx.url('/_emdash/admin/plugins/sovialis-leads/leads')}` }) // ruta exacta del admin NO VERIFICADA
          .catch(e => ctx.log.error('lead email failed', { error: String(e) })));
        return { ok: true, id };
      } },
      'leads/list': { methods: ['GET'], permission: 'content:edit_any', request: { body: 'none' }, handler: async (ctx) => {
        const q = ctx.input as Record<string, string>;
        return leads(ctx).query({ where: q.status ? { status: q.status } : undefined, orderBy: { createdAt: 'desc' }, limit: 50, cursor: q.cursor || undefined });
      } },
      'leads/update': { methods: ['POST'], permission: 'content:edit_any', request: { body: 'json', maxBytes: 4096 }, handler: async (ctx) => {
        const { id, status, notas } = z.object({ id: z.string().uuid(), status: z.enum(['nuevo','contactado','cotizado','cerrado','descartado']), notas: z.string().max(4000).optional() }).parse(ctx.input);
        const cur = await leads(ctx).get(id); if (!cur) throw PluginRouteError.notFound();
        await leads(ctx).put(id, { ...cur, status, notas }); return { ok: true };
      } },
      'leads/export': { methods: ['GET'], permission: 'settings:manage', request: { body: 'none' }, response: 'raw', handler: async (ctx) => {
        const rows: Lead[] = []; let cursor: string | undefined;
        do { const p = await leads(ctx).query({ orderBy: { createdAt: 'desc' }, limit: 100, cursor }); rows.push(...p.items.map(i => i.data)); cursor = p.hasMore ? p.cursor : undefined; } while (cursor);
        const cols = ['createdAt','status','nombre','telefono','email','servicio','turno','localidad','pagina','gclid'] as const;
        const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const csv = '﻿' + [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\r\n');
        return pluginResponse({ headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="solicitudes-${new Date().toISOString().slice(0,10)}.csv"` }, body: { kind: 'text', value: csv } });
      } },
    },
  });
}
```

`admin.tsx` sigue el patrón de globos: `export const pages = { '/leads': LeadsAdmin }`. Muestra una tabla con filtros por estado, cambio de estado y botón «Exportar CSV» (`window.location = '/_emdash/api/plugins/sovialis-leads/leads/export'`). En el frontend:

```astro
<form data-lead-form class="…">
  <!-- nombre, telefono, servicio (select), turno, localidad, mensaje, casilla consentimiento con enlace a /politica-de-datos -->
  <input name="website" tabindex="-1" autocomplete="off" class="sr-only" aria-hidden="true" />
  <div class="cf-turnstile" data-sitekey={siteKey} data-language="es"></div>
  <button type="submit">Solicitar valoración</button><p role="status" aria-live="polite" data-status></p>
</form>
<script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<script>
  for (const f of document.querySelectorAll<HTMLFormElement>('[data-lead-form]')) f.addEventListener('submit', async (e) => {
    e.preventDefault(); const fd = Object.fromEntries(new FormData(f)); const p = new URLSearchParams(location.search);
    const body = { ...fd, consentimiento: fd.consentimiento === 'on', pagina: location.pathname,
      utm: Object.fromEntries([...p].filter(([k]) => k.startsWith('utm_'))), gclid: p.get('gclid') ?? undefined, fbclid: p.get('fbclid') ?? undefined };
    const r = await fetch('/_emdash/api/plugins/sovialis-leads/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json(); const s = f.querySelector('[data-status]')!;
    if (r.ok && j.success) { (window as any).dataLayer?.push({ event: 'generate_lead', form_id: 'valoracion', servicio: fd.servicio }); s.textContent = 'Recibimos tu solicitud. Te llamamos pronto.'; f.reset(); }
    else s.textContent = j.error?.message ?? 'No pudimos enviar. Escríbenos por WhatsApp.';
  });
</script>
```

El POST público pasa la verificación de `Origin` del middleware porque se hace desde el mismo origen. Fase 2: reenviar el lead a `gestion.sovialis.com` (webhook con secreto compartido) para cotizar desde la herramienta.

---

## H. Correo transaccional en Cloudflare

### H.1 Pipeline de EmDash

`email:beforeSend` (transforma o cancela), **`email:deliver` (exclusivo; se elige en Admin → Settings → Email, `/_emdash/api/settings/email`)** y `email:afterSend`. El núcleo envía magic links, invitaciones, recuperación de cuenta y el aviso de comentario aprobado al autor. En dev se activa solo un proveedor de consola (`/_emdash/api/dev/emails`); en producción, sin proveedor, falla con «Email is not configured». Los plugins envían con `ctx.email.send()` si declaran `email:send` y hay proveedor.

### H.2 Proveedor incluido: `cloudflareEmail()` (verificado en el código)

```js
// astro.config.mjs
import { cloudflareEmail } from '@emdash-cms/cloudflare/plugins';
emdash({ plugins: [cloudflareEmail({ binding: 'EMAIL', from: { email: 'web@sovialis.com', name: 'Sovialis' }, replyTo: 'contacto@sovialis.com' })] });
// wrangler.jsonc:  "send_email": [{ "name": "EMAIL" }]
```

Registra `email:deliver` exclusivo con `capabilities: ['hooks.email-transport:register']`, lee el binding vía `cloudflare:workers` y llama `binding.send({from, to, subject, text, html?, cc?, replyTo?})`. Después hay que elegirlo en Settings → Email. Que quede seleccionado solo cuando es el único proveedor es **NO VERIFICADO**: el código del runtime solo lo afirma para el proveedor de consola.

### H.3 Qué es gratis en Cloudflare (verificado el 4-oct-2026)

| Servicio | Estado | Precio | Para Sovialis |
|---|---|---|---|
| **Email Routing** (entrante) + envío a **direcciones de destino verificadas** | GA | **Gratis en todos los planes**, sin cuota ni límite diario, incluso si solo está activo Email Routing | Avisos de leads a JP y al equipo; invitaciones y magic links al equipo |
| **Email Sending** (a cualquier destinatario) | **Beta** | Solo Workers Paid: 3.000 al mes incluidos y luego USD 0,35 por 1.000. Cuentas nuevas con cuota diaria conservadora | Autorespuesta al cliente y correos a terceros |

Límites: 50 destinatarios por mensaje, 5 MiB (25 MiB hacia destinos verificados), 200 destinos verificados por cuenta. El remitente debe pertenecer a un dominio dado de alta en Email Service. Si con **solo** Email Routing activo basta un `from` en sovialis.com está **NO VERIFICADO**; probar en staging.

### H.4 Configuración de bindings

```jsonc
"send_email": [
  { "name": "EMAIL" },                                                         // cualquier destino verificado de la cuenta
  { "name": "NOTIFY_OWNER", "destination_address": "connexis.co@gmail.com" },  // un solo destino fijo
  { "name": "EMAIL_TEAM", "allowed_destination_addresses": ["connexis.co@gmail.com", "equipo.sovialis@gmail.com"] },
  { "name": "EMAIL_FROM_WEB", "allowed_sender_addresses": ["web@sovialis.com"] }
]
```

Pasos: Dashboard → Compute → Email Service → Email Routing → habilitar en `sovialis.com` (crea MX y SPF) → Destination Addresses → agregar y verificar cada correo del equipo.

### H.5 Código

API nueva (objeto):

```ts
const { messageId } = await env.EMAIL.send({
  to: 'equipo.sovialis@gmail.com', from: { email: 'web@sovialis.com', name: 'Sovialis Web' }, replyTo: lead.email,
  subject: 'Nueva solicitud', text, html,          // también cc, bcc, headers, attachments [{content(base64), filename, type, disposition}]
});
// Errores: error.code 'E_SENDER_NOT_VERIFIED' | 'E_RATE_LIMIT_EXCEEDED' | …
```

API heredada (MIME crudo; requiere instalar `mimetext`):

```ts
import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';
const msg = createMimeMessage();
msg.setSender({ name: 'Sovialis', addr: 'web@sovialis.com' }); msg.setRecipient('equipo.sovialis@gmail.com');
msg.setSubject('Nueva solicitud'); msg.addMessage({ contentType: 'text/plain', data: text });
await env.EMAIL.send(new EmailMessage('web@sovialis.com', 'equipo.sovialis@gmail.com', msg.asRaw()));
```

Proveedor propio (por ejemplo, para restringir destinos o tener un plan B):

```ts
export function createPlugin() {
  return definePlugin({ id: 'sovialis-mail', version: '1.0.0', capabilities: ['hooks.email-transport:register'],
    hooks: { 'email:deliver': { exclusive: true, handler: async ({ message }, ctx) => {
      const { env } = await import('cloudflare:workers');
      await (env as any).EMAIL.send({ from: { email: 'web@sovialis.com', name: 'Sovialis' }, to: message.to, cc: message.cc,
        replyTo: message.replyTo, subject: message.subject, text: message.text, ...(message.html ? { html: message.html } : {}) });
      ctx.log.info('email sent', { to: message.to });
    } } } });
}
```

Alternativa con proveedor externo: `emdash-smtp@0.4.0` (nativo; Brevo, SES, Postmark, Resend… por HTTPS). Globos lo instaló pero no lo probó. Según `docs/migration/PLUGINS.md`, guarda los secretos en el KV del plugin sin cifrado de `settingsSchema` y hubo que fijar `nodemailer` 10.0.13 con `overrides`. `emdash-plugin-resend@0.2.0` está desactualizado (peer `emdash ^0.5`).

---

## I. Analítica (GTM y GA4)

### I.1 Qué hizo globos

En `astro.config.mjs`: `if (production) process.env.PUBLIC_GTM_ID ??= 'GTM-KKP7WL8Q'`. En `src/lib/site.ts`, `GTM_ID = import.meta.env.PUBLIC_GTM_ID`. `BaseLayout.astro` inyecta el snippet `<script is:inline>` de GTM en `<head>` y `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=…">` al abrir el `<body>`, además de GA4 y Meta Pixel opcionales. `src/lib/analytics.ts` expone `trackEvent(event, params)` (`dataLayer.push`, `gtag`, `fbq` con `META_MAP`) y el layout dispara eventos declarativos `[data-track]` y `scroll_depth`. **El ID queda fijo en el build**: no se edita desde el admin.

### I.2 Recomendación: plugin nativo `sovialis-tracking`

```ts
import { definePlugin } from 'emdash';
import { escapeHtmlAttr } from 'emdash/page';
const GTM = /^GTM-[A-Z0-9]{4,12}$/;
let memo: { at: number; id: string | null } | null = null;            // evita leer settings en cada render (60 s)
export function createPlugin() {
  return definePlugin({ id: 'sovialis-tracking', version: '1.0.0', capabilities: ['hooks.page-fragments:register'],
    admin: { settingsSchema: {
      gtmId: { type: 'string', label: 'ID de Google Tag Manager', description: 'GTM-XXXXXXX. Vacío = desactivado.' },
      consentDefault: { type: 'select', label: 'Consentimiento por defecto', default: 'denied',
        options: [{ value: 'denied', label: 'Denegado hasta aceptar' }, { value: 'granted', label: 'Concedido' }] } } },
    hooks: { 'page:fragments': async ({ page }, ctx) => {
      if (new URL(page.url).pathname.startsWith('/_emdash')) return null;
      if (!memo || Date.now() - memo.at > 60_000) { const v = (await ctx.settings.get<string>('gtmId'))?.trim() ?? ''; memo = { at: Date.now(), id: GTM.test(v) ? v : null }; }
      if (!memo.id) return null;
      const consent = (await ctx.settings.get<string>('consentDefault')) === 'granted' ? 'granted' : 'denied';
      const id = memo.id;
      return [
        { kind: 'inline-script', placement: 'head', key: 'consent', code: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'${consent}',ad_user_data:'${consent}',ad_personalization:'${consent}',analytics_storage:'${consent}'});` },
        { kind: 'inline-script', placement: 'head', key: 'gtm', code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');` },
        { kind: 'html', placement: 'body:start', key: 'gtm-noscript', html: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeHtmlAttr(id)}" height="0" width="0" style="display:none;visibility:hidden" title="GTM"></iframe></noscript>` },
      ];
    } } });
}
```

- Exige que el layout incluya `<EmDashHead page>`, `<EmDashBodyStart page>` y `<EmDashBodyEnd page>`. EmDash no pone CSP en páginas públicas (solo en `/_emdash`), así que los scripts inline funcionan.
- GA4 se configura **dentro de GTM**, no en código, para evitar el doble disparo que globos encontró en el sitio viejo.
- Eventos propuestos: `generate_lead`, `click_whatsapp`, `click_call`, `view_service` y `scroll_depth`, reutilizando `trackEvent()` de globos.
- Plugins del registro: `@yourbright/emdash-analytics-plugin@0.4.9` tiene peer `emdash ^0.15.0` (incompatible con 1.1.0). «Analytics» (Cloudflare Web Analytics) y «Umami» son del registro, así que exigen sandbox.

---

## J. Despliegue

### J.1 Crear recursos

```bash
set -a; source ~/.config/sovialis/cloudflare.env; set +a      # token de la herramienta; validar sus permisos (D1, R2, KV, Workers, DNS)
npx wrangler d1 create sovialis-web            && npx wrangler d1 create sovialis-web-staging
npx wrangler r2 bucket create sovialis-web-media && npx wrangler r2 bucket create sovialis-web-media-staging
npx wrangler kv namespace create SESSION       && npx wrangler kv namespace create CACHE      # repetir para staging
npx wrangler d1 create sovialis-web-ratings    # solo si se implementan estrellas (F.3)
npx emdash secrets generate                    # copiar el valor a un gestor; NUNCA a git
npx wrangler secret put EMDASH_ENCRYPTION_KEY --config wrangler.production.jsonc
npx wrangler secret put LEADS_SALT --config wrangler.production.jsonc
```

Entornos separados como en globos: Worker, D1, R2 y KV propios para `dev.sovialis.com` (`workers_dev:false`, `preview_urls:false`, `X-Robots-Tag: noindex` y gate) y para producción. Alternativa: `env.staging` en un solo `wrangler.jsonc`, como hace la herramienta. Ojo: los bindings **no se heredan** entre `env`.

### J.2 Dominio apex

- **Recomendado: `custom_domain`** (`{"pattern": "sovialis.com", "custom_domain": true}` y otro para `www`). Wrangler crea el DNS y el certificado. Falla si ya existe un registro A, AAAA o CNAME en ese nombre: borrarlo antes. El estado actual del apex de sovialis.com está **NO VERIFICADO**.
- `routes` con `zone_id` (`"cursodeglobosonline.com/*"`): lo usó globos para **montarse encima** de un sitio Pages existente sin tocar el DNS, con reversión quitando la ruta. Útil solo para migrar desde otro origen.
- www→apex: redirect 301 en `src/worker.ts` (A.5) o con una Single Redirect Rule de la zona (como `formatos.sovialis.com` en la herramienta).

### J.3 Build y deploy (patrón globos)

```jsonc
// package.json
"build:prod": "SOVIALIS_BUILD_ENV=production astro build",
"deploy:prod": "npm run build:prod && node scripts/deploy.mjs production",
"db:migrate:prod": "wrangler d1 migrations apply sovialis-web-ratings --remote --config wrangler.production.jsonc"
```

```js
// scripts/deploy.mjs: valida el wrangler generado contra una lista explícita antes de desplegar (globos scripts/deploy-production.mjs)
import { readFile, rm } from 'node:fs/promises'; import { spawnSync } from 'node:child_process';
const EXPECTED = { name: 'sovialis-web', DB: '<uuid>', MEDIA: 'sovialis-web-media', SESSION: '<id>', CACHE: '<id>', site: 'https://sovialis.com' };
for (const f of ['wrangler.production.jsonc', 'dist/server/wrangler.json']) {
  const c = JSON.parse((await readFile(f, 'utf8')).replace(/^\s*\/\/.*$/gm, ''));   // jsonc sin comentarios
  if (c.name !== EXPECTED.name || c.vars?.EMDASH_SITE_URL !== EXPECTED.site) throw Error(`Config inesperada en ${f}`);
  if (c.d1_databases?.find(d => d.binding === 'DB')?.database_id !== EXPECTED.DB) throw Error('D1 inesperada');
}
await rm('dist/server/.dev.vars', { force: true });     // GOTCHA: el adapter copia .dev.vars dentro de dist/server
const r = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', 'dist/server/wrangler.json'], { stdio: 'inherit' });
process.exit(r.status ?? 1);
```

Orden recomendado: `npm ci` → `npm run check` → tests → `npm run build:prod` → (`npx emdash migrate --status` / `--check` si se usa el modo de migraciones `check`) → `npm run deploy:prod` → smoke test de rutas → `node scripts/indexnow.mjs` → enviar el sitemap a GSC.

### J.4 Migraciones del núcleo

Por defecto `migrations: auto`: el runtime aplica las pendientes en la primera request. Para controlarlas: `emdash({ migrations: { runtime: 'check', dev: 'auto' } })`. Con `check`, el sitio responde 503 si hay pendientes. El flujo es `npx emdash migrate --status`, luego `npx emdash migrate` (interactivo, o `--expected-target-fingerprint` en CI) y por último `wrangler deploy`. Override por entorno: `EMDASH_MIGRATIONS_MODE`.

### J.5 Ajustes y su porqué

| Ajuste | Explicación |
|---|---|
| Cron `"* * * * *"` | Publicación programada (`runScheduledTasks`), cron de plugins y mantenimiento. Sin cron **y** sin `scheduled` exportado, lo programado no se publica. Son 1.440 invocaciones al día (Free permite 5 cron triggers). Que cuenten como requests facturables está **NO VERIFICADO** |
| `run_worker_first: true` | Solo si el Worker debe vigilar también los estáticos (globos dev: todo privado). Sin él, `/public` se sirve sin invocar el Worker. Con él, los `_redirects` de `public/` dejan de aplicarse solos (globos los parsea en `src/lib/legacy-redirects.ts`): usar los redirects nativos de EmDash |
| `imageService: 'passthrough'` | Globos sirve originales: sin variantes y con más peso, lo que afecta el LCP. Preferir `cloudflare-binding` (binding `IMAGES`) y medir el costo |
| `objectCache: kvCache` | Cachea consultas de contenido, settings, menús y taxonomías. Se invalida al editar. Consistencia eventual de unos 60 s. Preview y edición la saltan. **Free: 1.000 escrituras KV al día**, que podría agotarse (volumen real **NO VERIFICADO**). En Paid no hay límite. Globos: TTL 60 s y `revalidate` 1 s |
| `toolbar` | Default `"server"`. Si se cachea HTML compartido, usar `"client"` |
| `d1({session:'auto'})` | Read replicas. Incompatible con Smart Placement |
| `observability.enabled` | Logs de Workers |

### J.6 Después del primer deploy

1. Setup inmediato (A.8) y registro de passkeys.
2. Settings → General, Social y SEO: URL, zona horaria `America/Bogota`, imagen OG por defecto y verificación de GSC.
3. Settings → Email: elegir `cloudflare-email` y enviar una invitación de prueba a un destino verificado.
4. Ajustes de los plugins: `notifyTo`, Turnstile y GTM.
5. Moderación de comentarios (F.1).
6. `ajustes` y `apariencia` con datos reales: JP marca la empresa como «verificada», igual que en la herramienta.
7. Enviar `https://sovialis.com/sitemap.xml` a GSC y lanzar IndexNow.

---

## K. Gotchas (de globos y del código)

1. **`hooks.page-fragments:register` es obligatoria** para `page:fragments`. Sin ella el hook no corre y no hay error visible (la config del botón de WhatsApp se guardaba pero el botón no salía). `page:fragments` solo existe en nativos; en sandbox se descarta.
2. **`entry.id` (slug) frente a `entry.data.id` (ULID)**: comentarios, votos, `getEntryTerms` y `PublicPageContext.content.id` usan el ULID.
3. Los campos `image` son objetos. `<img src={entry.data.hero}>` renderiza `[object Object]`. Usar `<Image image>` o un helper.
4. **Nada de `getStaticPaths`** para contenido CMS: `output: 'server'`.
5. El setup aplica el seed **por tramos** y responde 409 cuando ya terminó. Hay que repetir el POST.
6. **Ventana de setup abierta**: hacerlo apenas se despliega o poner Access delante.
7. **Un proveedor externo en `auth` desactiva las passkeys**. El gate Basic de globos protege con una sola contraseña.
8. **Nunca volver a correr seed ni importar sobre producción**. `emdash seed` (CLI) solo trabaja con SQLite local.
9. **`wrangler d1 export` falla por las tablas FTS5** de búsqueda. Usar `emdash site export`, Backups o Time Travel.
10. **`site export/import` no lleva opciones ni secretos de plugins**: reconfigurarlos a mano. Que lleve el storage de plugins (leads) está **NO VERIFICADO**: exportar CSV antes de migrar.
11. Las **tablas de Markdown a Portable Text** rompieron delimitadores: hubo un script de reparación sin reseed (`repair-table-delimiters.ts`) y un importador corregido.
12. **Borrar un campo destruye su columna**: primero el código, después el esquema.
13. La **moderación de comentarios no va en el seed**: se fija por `PUT /schema/collections/{slug}`. Algunos ajustes de admin (`group`, `sortOrder`, `dateField`) también se reaplicaron por API después del setup (`configure-development-admin.mjs`).
14. Comentarios: máximo 500 por entrada en el helper SSR. El aviso nativo va al autor al aprobar, no a moderación.
15. Si hay gate en `/_emdash`, dejar abiertos `GET /_emdash/api/media/file/*`, los comentarios públicos y las rutas `public` de plugins. Con `X-Robots-Tag`, el resto no se indexa.
16. **CSRF**: con cookie, toda llamada mutante a `/_emdash/api` necesita `X-EmDash-Request: 1`. Los POST públicos validan `Origin`.
17. **Rutas públicas de plugin sin rate limit**: implementarlo (Turnstile y conteo por `ipHash`).
18. **`ctx.email` es `undefined`** sin proveedor `email:deliver` seleccionado. Los formularios guardan, pero no avisan.
19. **Email Routing gratis solo llega a destinos verificados**. Para correo a clientes hace falta Workers Paid (Email Sending, beta).
20. **`emdash-smtp`**: el canal npm nativo (0.4.0) y el del registro en sandbox (0.4.1) son distintos. Guarda la API key en KV del plugin y hubo que fijar `nodemailer`.
21. **Sitemaps duplicados**: si se crean sitemaps propios con otro nombre, el `/sitemap.xml` nativo sigue vivo. Para reemplazarlo hay que definir `src/pages/sitemap.xml.ts` (y `robots.txt.ts`) con ese nombre exacto.
22. **`dist/server/.dev.vars`**: el adapter copia secretos locales al build. Borrarlos antes de `wrangler deploy`.
23. **KV object cache**: la propagación puede tardar unos 60 s, y en Free solo hay 1.000 escrituras al día.
24. `imageService: 'passthrough'` no genera variantes. Sin binding `IMAGES`, los originales se sirven en silencio.
25. Workers Free: 10 ms de CPU y 50 subrequests por request. El SSR de EmDash con varias consultas podría pasarse (**NO VERIFICADO**). Globos limita la hidratación de referencias a 4 en paralelo y memoiza por request.
26. Plugins del **registro** (SEO, Forms de terceros, analítica): requieren `LOADER` y plan de pago. Sin él: `SANDBOX_NOT_AVAILABLE`.
27. Instalación de npm: hubo avisos de `npm audit` (`http-cache-semantics`) sin versión corregida y `overrides` de `keyv` y `cacheable` en `package.json`. No forzar downgrades de Astro.
28. Rutas `/es/` frente a i18n: globos usa `routing: 'manual'` para que Astro no redirija. Para Sovialis (solo `es`), mantener `manual`.
29. Disco en iCloud: globos sufrió archivos «dataless» que colgaban git y los builds. Usaron `node_modules.nosync` y un worktree en `~/dev/`. No mover ni renombrar la carpeta de globos (`cursodeblogosonline.com`, con su typo), porque rompe el workspace de Antigravity.
30. La caché HTML compartida y el toolbar de edición no se llevan: usar `toolbar: 'client'` o `Cache-Control: private` cuando hay cookie (el Worker de globos lo hace).
31. Las peer deps de plugins oficiales piden versiones exactas (`@cloudflare/kumo@2.6.0`). Revisar `npm ls` antes de agregar `plugin-forms`.
32. El `cloudflareEmail()` solo funciona en runtime workerd (deploy o `astro dev` con el adapter). En Node falla al importar `cloudflare:workers`.

---

## Fuentes

- Globos (local): `emdash-dev/astro.config.mjs`, `wrangler*.jsonc`, `src/worker*.ts`, `src/auth/*`, `src/lib/{emdash-content,seo,sitemap,sitemap-policy,llms,ratings*,analytics,production-access,staging-access}.ts`, `src/plugins/*`, `src/themes/globos-classic/**`, `scripts/**`, `migrations/*.sql`, `docs/migration/{README,PRODUCTION,PLUGINS}.md`, `docs/SESSION_LOG.md`.
- Paquetes: `node_modules/emdash/src/{plugins/types.ts,astro/integration/runtime.ts,astro/integration/routes.ts,astro/middleware/auth.ts,seed/types.ts,schema/types.ts,settings/types.ts,config/secrets.ts,comments/*,components/*,page/*,emdash-runtime.ts,astro/routes/api/setup/index.ts}`, `@emdash-cms/cloudflare/src/{index.ts,worker.ts,plugins/cloudflare-email.ts}`, `@emdash-cms/plugin-types/dist/index.d.ts`, `@emdash-cms/auth/dist/index.d.mts`, `@astrojs/cloudflare/dist/{wrangler.js,utils/image-config.js}`.
- GitHub: `emdash-cms/emdash` `packages/plugins/forms/src/{index.ts,handlers/submit.ts,astro/*,types.ts}`, `packages/create-emdash/src/{index.ts,flags.ts}`, `templates/marketing-cloudflare/*`.
- Docs: https://docs.emdashcms.com/getting-started/, /deployment/cloudflare/, /deployment/plugin-sandbox/, /deployment/object-cache/, /deployment/secrets/, /deployment/core-migrations/, /deployment/schema-evolution/, /guides/authentication/, /guides/email/, /guides/seo/, /guides/site-settings/, /themes/creating-themes/, /themes/seed-files/, /plugins/creating-plugins/api-routes/, /reference/rest-api/.
- Registro: https://plugins.emdashcms.com/ (consultado el 4-oct-2026).
- Cloudflare: https://developers.cloudflare.com/email-service/ (overview, pricing, limits, send-bindings, workers-api, email-routing-addresses), /email-routing/email-workers/send-email-workers/, /workers/platform/limits/, /kv/platform/limits/.
- npm (`npm view`, 4-oct-2026): `@emdash-cms/plugin-forms@0.2.9`, `emdash-plugin-resend@0.2.0`, `emdash-smtp@0.4.0`, `@yourbright/emdash-analytics-plugin@0.4.9`, `create-emdash@1.1.0`.
