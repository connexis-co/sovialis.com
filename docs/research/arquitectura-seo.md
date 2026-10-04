# Arquitectura SEO de sovialis.com — v1

**Fecha:** 4 de octubre de 2026 · **Alcance:** arquitectura de información, URLs, mapa keyword → página, matriz de canibalización, FAQ, schema, navegación, blog y optimización para buscadores de IA. **Archivo hermano:** `sitemap.json` (misma información, legible por máquina; generado del mismo origen de datos).

**Fuentes:** `research/keyword-research-claude/output/` (keywords_master.csv, families.csv, clusters.json, cornerstones.json, plan.json, negocio.json; Keyword Planner Bogotá, oct-2026), `herramienta/src/lib/portafolios.ts`, `herramienta/src/lib/calc/tarifas.ts` y `herramienta/docs/NOTAS-LEGALES.md`. Los volúmenes son búsquedas mensuales en Bogotá; «s/d» = sin dato (Keyword Planner devuelve 0 o menos de 10).

## 0. Resumen ejecutivo

- **71 URLs**: 47 en v1 (lanzamiento con contenido completo) y 24 en v2, más `robots.txt`, `llms.txt`, `llms-full.txt` y el sitemap. 338 FAQ, todas únicas en el sitio (validado por script, también contra casi-duplicados).
- **Barra final siempre** (`/servicios/cuidado-nocturno/`), host canónico `https://sovialis.com` sin www.
- **Patrones:** `/servicios/{servicio}/` · `/zonas/{localidad}/{barrio}/` · `/blog/{articulo}/` (plano) · `/blog/categoria/{categoria}/` · páginas de empresa y legales en la raíz.
- **Home = cabeza genérica** («cuidado del adulto mayor a domicilio en Bogotá», agencia/empresa, «cuidadoras a domicilio»). **Landings = intención específica** (perfil, horario, necesidad). **Zonas = intención local** (topónimo). **Blog = intención informativa.** Una familia de búsqueda por URL; la regla está escrita en la matriz §6 y validada por script (ninguna keyword ni familia de variantes aparece en dos URLs).
- **Restricción legal aplicada en la arquitectura:** ninguna página transaccional usa «enfermera/enfermería a domicilio», inyectología ni procedimientos. Esa demanda (la mayor del nicho: ~590 «enfermera domiciliaria», 590 «inyectología a domicilio», 260 «enfermería a domicilio Bogotá») se capta solo con tres guías honestas: `/blog/enfermera-o-cuidadora-a-domicilio/`, `/blog/cuanto-cobra-una-enfermera-a-domicilio/` y `/blog/inyectologia-a-domicilio-bogota/`.
- **Geografía:** hub `/zonas/` = «norte de Bogotá»; v1 con Usaquén, Cedritos, Chapinero, El Chicó, Suba y Niza; v2 con Santa Bárbara, Colina Campestre, Calle 170, Teusaquillo, Barrios Unidos, Salitre y Modelia, y Chía. La demanda «cuidado + barrio» es casi nula en Keyword Planner; las zonas se justifican por el local pack (aparece en 9 de 16 SERP), por Google Ads geolocalizado y por la demanda proxy «hogar geriátrico + zona».
- **Prioridad absoluta fuera de la web:** ficha de Google Business Profile con la misma NAP, categorías y servicios del sitio.

## 1. Datos de partida y supuestos

1. **Volúmenes bajos y en tramos.** En Bogotá casi todas las frases transaccionales están en 10–30 búsquedas/mes; las cabezas comerciales son «cuidador de adulto mayor» (familia 480), «cuidado del adulto mayor» (familia 140) y las familias de enfermería (590 + 260 + 140). La suma de la cola larga es lo que importa, por eso cada URL agrupa una familia completa de variantes.
2. **Google oculta el volumen de «enfermera a domicilio».** El estudio estima ~2× la familia visible «enfermera domiciliaria» (590). Es demanda que Sovialis no puede atender como servicio sin IPS: se capta con contenido comparativo.
3. **La competencia orgánica es débil** (13 competidores directos con DA 3–18) y el **local pack** aparece en 9 de 16 SERP: la arquitectura local (zonas + NAP + schema) y la ficha de Google pesan tanto como el contenido.
4. **Demanda geográfica.** «cuidado/cuidadora + localidad o barrio» no tiene volumen medible. Hay señal en «hogar geriátrico + zona»: Suba 50, Cedritos ~30 por variante, Modelia ~30, Chía 50, «norte de Bogotá» 50–70. Por eso v1 se limita a 6 zonas donde se cruzan demanda proxy, valor del negocio (estratos altos) y clínicas de referencia.
5. **Precios:** se usan solo los de `TARIFARIO_DEFAULT` (tarifas.ts), siempre como «desde» y como **precio final** (`preciosIncluyenIva: true`). Hay que confirmar el IVA con el contador antes de publicar (NOTAS-LEGALES §7.7). La web debe leer el tarifario del panel en el build para que web, cotización, `llms.txt` y anuncios digan lo mismo (Ley 1480, arts. 23 y 26).
6. **Datos de empresa** (NIT, dirección, teléfono) del panel son de ejemplo: todo dato NAP queda como `[por confirmar]` hasta que JP los marque como verificados.

## 2. Reglas legales aplicadas al SEO

Base: NOTAS-LEGALES §7.6 (habilitación sanitaria y publicidad), §8 (protocolo de autonomía, punto 14: lenguaje) y §3 (contrato con el cliente).

| Tema | Prohibido (title, H1, meta, H2 de páginas transaccionales, anuncios, GBP) | Fórmula permitida |
|---|---|---|
| Perfil auxiliar | «enfermera(s) a domicilio», «servicio de enfermería», «enfermería domiciliaria», «supervisión de enfermería» | «cuidado por personal con formación de auxiliar de enfermería»; «auxiliar de enfermería» como perfil, con ReTHUS como credencial |
| Procedimientos | inyecciones, inyectología, insulina, sueros, curaciones, sondas, oxígeno, toma de muestras, signos vitales (pendiente de abogado, §9.2) | Solo en «qué no hacemos» y en guías: «los hace tu EPS o una IPS habilitada, con la que contratas directamente» |
| Home care | «home care» en el home o en servicios (en Colombia connota salud domiciliaria) | Solo en la guía «¿Qué es home care?» |
| Personal (Decreto 0581) | «nuestras empleadas», «turnos asignados», «supervisamos a la cuidadora», «jefe», «dotación», «uniforme» | «personas verificadas», «relevos coordinados», «seguimiento del servicio con la familia», «plan de cuidado» |
| Reclutamiento | «empleo», «salario», «jornada», «despido», «permiso», «vacante con horario fijo» | «servicios», «honorarios», «disponibilidad», «solicitudes», «contratista» |
| Garantías y prueba social | «garantía de reemplazo», testimonios o cifras inventadas, «las mejores cuidadoras» | «reemplazo en el plazo acordado y sin cobro del tiempo no prestado»; reseñas reales de Google |
| Precios | precios sin impuestos, «desde» que no coincide con el panel, precios de procedimientos | precio final «desde», leído del tarifario del panel |
| Zonas | cualquier mención de zonas no atendidas o del sur | exposición positiva del norte y noroccidente; «confirmamos la cobertura de tu dirección» |

**Dónde sí puede aparecer «enfermera/enfermería/inyectología»:** solo en las guías C01, C05 y C13 (y como mención informativa en C07, C11, S08 y S13), siempre con la ruta correcta (EPS o IPS habilitada) y sin CTA de procedimiento. El validador del script rechaza esos términos en title, H1, meta y H2 de las páginas transaccionales.

**Aviso fijo del pie de página:** «Sovialis presta servicios de cuidado no sanitario a domicilio. No es una Institución Prestadora de Servicios de Salud (IPS) y su personal no realiza procedimientos de salud. Para servicios de salud, consulta a tu EPS o a una IPS habilitada.»

## 3. Decisiones de URL

### 3.1 Dominio, protocolo y barra final

- Canónico: `https://sovialis.com/` (sin www). `http://` y `www.` → 301 a la versión canónica (regla de redirección en Cloudflare).
- **Barra final: `always`.** Astro con `trailingSlash: "always"` y `build.format: "directory"`; el sitio estático en Cloudflare responde `/ruta/` y redirige `/ruta` → `/ruta/` de forma permanente. Canonical, sitemap, enlaces internos, breadcrumbs y schema usan siempre la barra. Los archivos (`/robots.txt`, `/llms.txt`, `/sitemap-index.xml`) no la llevan.
- Motivo: evita duplicados `/x` vs `/x/`, coincide con la salida de directorios de Astro (sin reglas especiales en el CDN) y con el patrón del brief.
- Sin parámetros de contenido. Los `utm_*` se permiten, pero el canonical siempre es la URL limpia. Sin paginación en v1; cuando el blog la necesite: `/blog/pagina/2/` con canonical propio.
- Antes del lanzamiento: revisar en Search Console las URLs que hoy tenga el dominio y redirigirlas con 301 a su equivalente.

### 3.2 Patrones

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Home | `/` | `/` |
| Hub de servicios | `/servicios/` | `/servicios/` |
| Servicio | `/servicios/{servicio}/` | `/servicios/cuidado-nocturno/` |
| Hub de zonas (= «norte de Bogotá») | `/zonas/` | `/zonas/` |
| Localidad | `/zonas/{localidad}/` | `/zonas/usaquen/` |
| Barrio | `/zonas/{localidad}/{barrio}/` | `/zonas/usaquen/cedritos/` |
| Sector o municipio | `/zonas/{sector}/` | `/zonas/calle-170/`, `/zonas/chia/` |
| Blog (artículo) | `/blog/{slug}/` (plano: el slug no cambia si cambia la categoría) | `/blog/eps-cuidador-en-casa/` |
| Categoría del blog | `/blog/categoria/{slug}/` | `/blog/categoria/contratar-cuidado/` |
| Autor | `/autores/{nombre-apellido}/` | `/autores/nombre-apellido/` |
| Empresa, conversión y legales | `/{slug}/` | `/precios/`, `/como-funciona/`, `/politica-de-cookies/` |

### 3.3 Por qué `/zonas/…` y no `/cuidado-adulto-mayor/{zona}/`

1. **Canibalización del home.** El patrón `/cuidado-adulto-mayor/usaquen/` obliga a tener un hub `/cuidado-adulto-mayor/`, cuyo URL, title y H1 compiten de frente con el home por «cuidado del adulto mayor (Bogotá)». Con `/zonas/` el hub se posiciona para «norte de Bogotá» y no toca la cabeza del home.
2. **La palabra clave en la URL pesa poco** frente al title, el H1, el contenido local y los anclajes. El topónimo, que es lo que diferencia la consulta local, sí queda en la URL.
3. **Jerarquía real:** el barrio cuelga de su localidad (Cedritos → Usaquén; Chicó → Chapinero; Niza → Suba). Las migas, el mega menú y la URL cuentan la misma historia. Los sectores que cruzan dos localidades (Calle 170) y los municipios (Chía) cuelgan del hub.
4. **Corto y legible** en la miga del SERP: `sovialis.com › zonas › usaquen › cedritos`.

### 3.4 Reglas de slugs

- Minúsculas, sin tildes ni ñ (ñ → n), palabras separadas por guion, 2–5 palabras, en español.
- Sin año (el año va en el title y se actualiza sin cambiar la URL).
- «bogota» solo en slugs de guías cuya keyword principal lo incluye (`inyectologia-a-domicilio-bogota`, `centro-dia-adulto-mayor-bogota`, `medico-a-domicilio-en-bogota`); los servicios no lo llevan porque todo el sitio es local.
- Prohibidos en slugs de servicios: `enfermera`, `enfermeria-a-domicilio`, `inyectologia`, `procedimientos`, `home-care`.

### 3.5 Lo que no se crea (a propósito)

- **Combinaciones servicio × zona** (`/zonas/usaquen/cuidado-nocturno/`): serían páginas puerta (doorway). La zona enlaza a los servicios; el servicio menciona las zonas.
- **Landings de enfermería, inyectología, procedimientos o home care**: ver §2 y Anexo A.
- **Archivos públicos por etiqueta** y una página general `/preguntas-frecuentes/` (duplicaría las FAQ, que viven en contexto en cada página).
- **Página de modalidad «turnos de día»:** el turno de 8 o 12 horas de día es el servicio por defecto y no tiene demanda propia medible; lo cubren las landings de perfil (cuidadora/auxiliar), el hub de servicios y `/precios/`. Una URL aparte canibalizaría la landing de cuidadora.
- **Página de Engativá:** solo su zona alta tiene sentido comercial; Normandía queda en la página v2 «Salitre y Modelia» (Modelia pertenece a Fontibón).

## 4. Árbol de URLs

`[v1]` lanzamiento con contenido completo · `[v2]` segunda ola · `(noindex)` fuera del índice.

```
# Núcleo
/  [v1]
# Servicios
/servicios/  [v1]
    └─ /servicios/cuidadora-adulto-mayor/  [v1]
    └─ /servicios/auxiliar-de-enfermeria/  [v1]
    └─ /servicios/cuidado-nocturno/  [v1]
    └─ /servicios/cuidado-24-horas/  [v1]
    └─ /servicios/cuidado-por-horas/  [v1]
    └─ /servicios/acompanamiento-citas-medicas/  [v1]
    └─ /servicios/acompanamiento-hospitalario/  [v1]
    └─ /servicios/cuidado-postoperatorio/  [v1]
    └─ /servicios/cuidado-alzheimer-demencia/  [v1]
    └─ /servicios/respiro-familiar/  [v2]
    └─ /servicios/cuidado-personas-dependientes/  [v2]
# Conversión y empresa
  └─ /precios/  [v1]
  └─ /como-funciona/  [v1]
  └─ /nosotros/  [v1]
    └─ /autores/nombre-apellido/  [v1]
  └─ /trabaja-con-nosotros/  [v1]
  └─ /contacto/  [v1]
  └─ /gracias/  [v1] (noindex)
  └─ /404/  [v1] (noindex)
# Zonas
/zonas/  [v1]
    └─ /zonas/usaquen/  [v1]
      └─ /zonas/usaquen/cedritos/  [v1]
    └─ /zonas/chapinero/  [v1]
      └─ /zonas/chapinero/chico/  [v1]
    └─ /zonas/suba/  [v1]
      └─ /zonas/suba/niza/  [v1]
      └─ /zonas/usaquen/santa-barbara/  [v2]
      └─ /zonas/suba/colina-campestre/  [v2]
    └─ /zonas/calle-170/  [v2]
    └─ /zonas/teusaquillo/  [v2]
    └─ /zonas/barrios-unidos/  [v2]
    └─ /zonas/salitre-y-modelia/  [v2]
    └─ /zonas/chia/  [v2]
# Blog
/blog/  [v1]
      └─ /blog/categoria/contratar-cuidado/  [v1] (noindex hasta 4 artículos)
      └─ /blog/categoria/costos-y-alternativas/  [v1] (noindex hasta 4 artículos)
      └─ /blog/categoria/cuidados-y-salud-en-casa/  [v1] (noindex hasta 4 artículos)
      └─ /blog/categoria/eps-derechos-y-tramites/  [v1] (noindex hasta 4 artículos)
      └─ /blog/categoria/bienestar-y-cuidador-familiar/  [v1] (noindex hasta 4 artículos)
  └─ /blog/cuanto-cobra-una-enfermera-a-domicilio/  [v1]
  └─ /blog/cuanto-cuesta-cuidar-a-un-adulto-mayor-en-casa/  [v2]
  └─ /blog/como-contratar-una-cuidadora/  [v1]
  └─ /blog/contratar-cuidadora-directa-o-por-agencia/  [v2]
  └─ /blog/enfermera-o-cuidadora-a-domicilio/  [v1]
  └─ /blog/hogar-geriatrico-o-cuidado-en-casa/  [v1]
  └─ /blog/eps-cuidador-en-casa/  [v1]
  └─ /blog/como-organizar-el-cuidado-de-un-adulto-mayor/  [v2]
  └─ /blog/cuidados-postoperatorios-en-casa/  [v1]
  └─ /blog/cuidar-adulto-mayor-con-alzheimer-en-casa/  [v1]
  └─ /blog/cuidados-paliativos-en-casa/  [v2]
  └─ /blog/que-es-un-acompanante-permanente/  [v1]
  └─ /blog/inyectologia-a-domicilio-bogota/  [v1]
  └─ /blog/actividades-para-adultos-mayores/  [v1]
  └─ /blog/ejercicios-para-adultos-mayores-en-casa/  [v1]
  └─ /blog/juegos-de-memoria-para-adultos-mayores/  [v2]
  └─ /blog/cuidados-basicos-del-adulto-mayor/  [v2]
  └─ /blog/prevencion-de-caidas-en-adultos-mayores/  [v2]
  └─ /blog/cuidados-paciente-encamado/  [v2]
  └─ /blog/cuidar-al-cuidador/  [v2]
  └─ /blog/que-es-home-care/  [v2]
  └─ /blog/leyes-y-derechos-del-adulto-mayor/  [v1]
  └─ /blog/centro-dia-adulto-mayor-bogota/  [v2]
  └─ /blog/dia-del-adulto-mayor-en-colombia/  [v2]
  └─ /blog/apoyos-para-cuidadores-en-bogota/  [v2]
  └─ /blog/medico-a-domicilio-en-bogota/  [v2]
  └─ /blog/alimentacion-del-adulto-mayor/  [v2]
# Legales
  └─ /politica-de-tratamiento-de-datos/  [v1]
  └─ /terminos-y-condiciones/  [v1]
  └─ /politica-de-cookies/  [v1]
# Archivos
/robots.txt  /llms.txt  /llms-full.txt  /sitemap-index.xml
```

## 5. Mapa keyword → página

«Vol.» = volumen mensual en Bogotá de la keyword principal; «Grupo» = suma de las familias de variantes asignadas a la URL (principal + secundarias, cada familia contada una vez).

| URL | Tipo | Keyword principal | Vol. | Grupo | Intención | Prior. |
|---|---|---|---|---|---|---|
| `/` | home | cuidado del adulto mayor | 140 | 320 | transaccional / comercial (agencia) | v1 |
| `/servicios/` | hub-servicios | servicios para adultos mayores | 10 | 50 | comercial (navegación y comparación de modalidades) | v1 |
| `/servicios/cuidadora-adulto-mayor/` | servicio-perfil | cuidador de adulto mayor | 480 | 590 | comercial / transaccional (perfil) | v1 |
| `/servicios/auxiliar-de-enfermeria/` | servicio-perfil | auxiliar de enfermería a domicilio | 30 | 90 | comercial / transaccional (perfil) | v1 |
| `/servicios/cuidado-nocturno/` | servicio-horario | cuidado nocturno de personas mayores | 10 | 80 | transaccional | v1 |
| `/servicios/cuidado-24-horas/` | servicio-horario | cuidadora interna | 10 | 80 | transaccional | v1 |
| `/servicios/cuidado-por-horas/` | servicio-horario | cuidadora por horas | 10 | 120 | transaccional | v1 |
| `/servicios/acompanamiento-citas-medicas/` | servicio-necesidad | servicio de acompañamiento a citas médicas | 10 | 70 | transaccional | v1 |
| `/servicios/acompanamiento-hospitalario/` | servicio-necesidad | acompañamiento hospitalario | 10 | 100 | transaccional | v1 |
| `/servicios/cuidado-postoperatorio/` | servicio-necesidad | cuidado postoperatorio en casa | s/d | 10 | transaccional | v1 |
| `/servicios/cuidado-alzheimer-demencia/` | servicio-necesidad | cuidadores alzheimer a domicilio | 10 | 40 | transaccional | v1 |
| `/servicios/respiro-familiar/` | servicio-necesidad | respiro para cuidadores familiares | s/d | 0 | transaccional | v2 |
| `/servicios/cuidado-personas-dependientes/` | servicio-necesidad | ayuda a domicilio para personas dependientes | 10 | 60 | transaccional | v2 |
| `/precios/` | precios | cuidador de adulto mayor precios | 30 | 130 | comercial / transaccional (precio) | v1 |
| `/como-funciona/` | proceso | proceso de selección de cuidadoras | s/d | 0 | comercial (confianza / objeciones) | v1 |
| `/nosotros/` | empresa | sovialis | s/d | 0 | navegacional (marca) / confianza | v1 |
| `/trabaja-con-nosotros/` | reclutamiento | busco trabajo como cuidadora de adulto mayor | 210 | 1130 | empleo (reclutamiento de contratistas) | v1 |
| `/contacto/` | contacto | sovialis teléfono | s/d | 0 | navegacional / transaccional | v1 |
| `/zonas/` | hub-zonas | cuidado adulto mayor norte de bogotá | s/d | 100 | transaccional local | v1 |
| `/zonas/usaquen/` | zona | cuidado adulto mayor usaquén | s/d | 0 | transaccional local | v1 |
| `/zonas/usaquen/cedritos/` | zona | cuidado adulto mayor cedritos | s/d | 50 | transaccional local | v1 |
| `/zonas/chapinero/` | zona | cuidado adulto mayor chapinero | s/d | 0 | transaccional local | v1 |
| `/zonas/chapinero/chico/` | zona | cuidado adulto mayor chicó | s/d | 0 | transaccional local | v1 |
| `/zonas/suba/` | zona | cuidado adulto mayor suba | s/d | 70 | transaccional local | v1 |
| `/zonas/suba/niza/` | zona | cuidado adulto mayor niza | s/d | 30 | transaccional local | v1 |
| `/zonas/usaquen/santa-barbara/` | zona | cuidado adulto mayor santa bárbara | s/d | 110 | transaccional local | v2 |
| `/zonas/suba/colina-campestre/` | zona | cuidado adulto mayor colina campestre | s/d | 0 | transaccional local | v2 |
| `/zonas/calle-170/` | zona | cuidado adulto mayor calle 170 | s/d | 0 | transaccional local | v2 |
| `/zonas/teusaquillo/` | zona | cuidado adulto mayor teusaquillo | s/d | 10 | transaccional local | v2 |
| `/zonas/barrios-unidos/` | zona | cuidado adulto mayor barrios unidos | s/d | 0 | transaccional local | v2 |
| `/zonas/salitre-y-modelia/` | zona | cuidado adulto mayor salitre | s/d | 60 | transaccional local | v2 |
| `/zonas/chia/` | zona | cuidado adulto mayor chía | s/d | 60 | transaccional local | v2 |
| `/blog/` | hub-blog | recomendaciones para cuidadores de adultos mayores | 10 | 10 | informativa (navegación) | v1 |
| `/blog/categoria/contratar-cuidado/` | categoria-blog | contratar cuidado | s/d | 0 | informativa (navegación) | v1 |
| `/blog/categoria/costos-y-alternativas/` | categoria-blog | costos y alternativas | s/d | 0 | informativa (navegación) | v1 |
| `/blog/categoria/cuidados-y-salud-en-casa/` | categoria-blog | cuidados y salud en casa | s/d | 0 | informativa (navegación) | v1 |
| `/blog/categoria/eps-derechos-y-tramites/` | categoria-blog | eps, derechos y trámites | s/d | 0 | informativa (navegación) | v1 |
| `/blog/categoria/bienestar-y-cuidador-familiar/` | categoria-blog | bienestar y cuidador familiar | s/d | 0 | informativa (navegación) | v1 |
| `/blog/cuanto-cobra-una-enfermera-a-domicilio/` | blog-cornerstone | cuanto cobra una enfermera por dia | 40 | 150 | comercial-informativa (precio de enfermería) | v1 |
| `/blog/cuanto-cuesta-cuidar-a-un-adulto-mayor-en-casa/` | blog-cornerstone | cuanto cuesta cuidar un adulto mayor en colombia | 10 | 10 | comercial-informativa (presupuesto mensual) | v2 |
| `/blog/como-contratar-una-cuidadora/` | blog-cornerstone | contratar cuidador ancianos | 10 | 30 | informativa-comercial (BOFU contratación) | v1 |
| `/blog/contratar-cuidadora-directa-o-por-agencia/` | blog-cornerstone | contrato para cuidadora de adulto mayor | 10 | 50 | informativa (legal / MOFU) | v2 |
| `/blog/enfermera-o-cuidadora-a-domicilio/` | blog-cornerstone | enfermera a domicilio | 590 | 1080 | comercial-informativa (captura legal de «enfermera a domicilio») | v1 |
| `/blog/hogar-geriatrico-o-cuidado-en-casa/` | blog-cornerstone | hogares geriátricos bogotá precios | 320 | 4506 | comercial-informativa (alternativa) | v1 |
| `/blog/eps-cuidador-en-casa/` | blog-cornerstone | cuidador de adulto mayor por eps | 140 | 650 | informativa (EPS / MOFU) | v1 |
| `/blog/como-organizar-el-cuidado-de-un-adulto-mayor/` | blog-cornerstone | plan de cuidados del adulto mayor | 10 | 20 | informativa (MOFU planificación) | v2 |
| `/blog/cuidados-postoperatorios-en-casa/` | blog-cornerstone | cuidado postoperatorio | 110 | 130 | informativa (MOFU condición) | v1 |
| `/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/` | blog-cornerstone | cuidados de un adulto mayor con alzheimer | 10 | 100 | informativa (MOFU condición) | v1 |
| `/blog/cuidados-paliativos-en-casa/` | blog-cornerstone | cuidados paliativos que es | 70 | 180 | informativa (MOFU condición) | v2 |
| `/blog/que-es-un-acompanante-permanente/` | blog-cornerstone | acompañante permanente | s/d | 0 | informativa (BOFU acompañamiento) | v1 |
| `/blog/inyectologia-a-domicilio-bogota/` | blog-cornerstone | inyectología a domicilio | 590 | 2300 | informativa (captura legal de «inyectología») | v1 |
| `/blog/actividades-para-adultos-mayores/` | blog-apoyo | actividades para adultos mayores | 260 | 360 | informativa (TOFU bienestar) | v1 |
| `/blog/ejercicios-para-adultos-mayores-en-casa/` | blog-apoyo | ejercicios para adultos mayores | 260 | 383 | informativa (TOFU bienestar) | v1 |
| `/blog/juegos-de-memoria-para-adultos-mayores/` | blog-apoyo | actividades cognitivas para adultos mayores | 90 | 419 | informativa (TOFU bienestar) | v2 |
| `/blog/cuidados-basicos-del-adulto-mayor/` | blog-apoyo | cuidados del adulto mayor en el hogar | 10 | 160 | informativa (TOFU cuidados) | v2 |
| `/blog/prevencion-de-caidas-en-adultos-mayores/` | blog-apoyo | prevencion de caidas | 73 | 73 | informativa (TOFU seguridad) | v2 |
| `/blog/cuidados-paciente-encamado/` | blog-apoyo | cuidados del adulto mayor postrado en cama | 10 | 50 | informativa (MOFU dependencia) | v2 |
| `/blog/cuidar-al-cuidador/` | blog-apoyo | cuidar al cuidador | 40 | 100 | informativa (TOFU cuidador familiar) | v2 |
| `/blog/que-es-home-care/` | blog-apoyo | home care | 210 | 330 | informativa (definición / MOFU) | v2 |
| `/blog/leyes-y-derechos-del-adulto-mayor/` | blog-apoyo | ley 1251 de 2008 | 364 | 1477 | informativa (TOFU legal / GEO) | v1 |
| `/blog/centro-dia-adulto-mayor-bogota/` | blog-apoyo | centro día adulto mayor bogotá | 210 | 830 | comercial-informativa (alternativa) | v2 |
| `/blog/dia-del-adulto-mayor-en-colombia/` | blog-apoyo | día del adulto mayor en colombia | 165 | 285 | informativa (TOFU estacional: publicar en julio) | v2 |
| `/blog/apoyos-para-cuidadores-en-bogota/` | blog-apoyo | bogota cuidadora | 90 | 130 | informativa (TOFU cuidador familiar / navegacional de terceros) | v2 |
| `/blog/medico-a-domicilio-en-bogota/` | blog-apoyo | medico a domicilio bogota | 880 | 2624 | informativa (servicio adyacente: Sovialis no lo presta) | v2 |
| `/blog/alimentacion-del-adulto-mayor/` | blog-apoyo | alimentacion adultos mayores | 10 | 30 | informativa (TOFU cuidados) | v2 |
| `/politica-de-tratamiento-de-datos/` | legal | política de tratamiento de datos sovialis | s/d | 0 | legal / navegacional | v1 |
| `/terminos-y-condiciones/` | legal | términos y condiciones sovialis | s/d | 0 | legal / navegacional | v1 |
| `/politica-de-cookies/` | legal | política de cookies sovialis | s/d | 0 | legal / navegacional | v1 |
| `/autores/nombre-apellido/` | autor | [nombre apellido] sovialis | s/d | 0 | navegacional / E-E-A-T | v1 |

**Top 10 por volumen de grupo:**

| # | URL | Grupo (Bogotá/mes) | Prior. |
|---|---|---|---|
| 1 | `/blog/hogar-geriatrico-o-cuidado-en-casa/` | 4506 | v1 |
| 2 | `/blog/medico-a-domicilio-en-bogota/` | 2624 | v2 |
| 3 | `/blog/inyectologia-a-domicilio-bogota/` | 2300 | v1 |
| 4 | `/blog/leyes-y-derechos-del-adulto-mayor/` | 1477 | v1 |
| 5 | `/trabaja-con-nosotros/` | 1130 | v1 |
| 6 | `/blog/enfermera-o-cuidadora-a-domicilio/` | 1080 | v1 |
| 7 | `/blog/centro-dia-adulto-mayor-bogota/` | 830 | v2 |
| 8 | `/blog/eps-cuidador-en-casa/` | 650 | v1 |
| 9 | `/servicios/cuidadora-adulto-mayor/` | 590 | v1 |
| 10 | `/blog/juegos-de-memoria-para-adultos-mayores/` | 419 | v2 |

## 6. Matriz de canibalización

### 6.1 Reglas por familia de búsqueda

| Familia de búsqueda | Dueña (única URL que la usa en title/H1/primaria) | No deben apuntarle | Nota |
|---|---|---|---|
| cuidado (del/de) adulto mayor + a domicilio/Bogotá/en casa; empresa/agencia de cuidado; «cuidadoras a domicilio» (plural, agencia) | / | todas las demás | El home es la única página con «cuidado del adulto mayor a domicilio en Bogotá» en title/H1. El plural de agencia «cuidadoras/cuidadores a domicilio» es del home. |
| cuidador(a) de adulto mayor (singular, rol) + Bogotá, qué hace, necesito/busco cuidadora | /servicios/cuidadora-adulto-mayor/ | /, /servicios/, /precios/, zonas, blog | El perfil (persona/rol) vive en la landing de cuidadora. El home la menciona y enlaza con ancla de perfil. |
| auxiliar de enfermería a domicilio / para cuidar adulto mayor | /servicios/auxiliar-de-enfermeria/ | /blog/enfermera-o-cuidadora-a-domicilio/ (solo «diferencia/qué hace») | Siempre con la fórmula «cuidado por personal con formación de auxiliar de enfermería». |
| enfermera(s)/enfermero/enfermería a domicilio (+ Bogotá), qué hace un enfermero, diferencias auxiliar vs. enfermera | /blog/enfermera-o-cuidadora-a-domicilio/ | TODAS las páginas transaccionales (home, servicios, zonas, precios) | Única URL que apunta a la familia «enfermera a domicilio». Contenido comparativo y honesto (ruta EPS/IPS). |
| cuánto cobra una enfermera (día, hora, 12 h), enfermería precios, precio de curaciones | /blog/cuanto-cobra-una-enfermera-a-domicilio/ | /precios/, C05 | Responde con la ruta IPS y compara con tarifas de cuidado; nunca precios de procedimientos propios. |
| precio / tarifa / cuánto cobra una cuidadora o cuidador (hora, día, noche, 24 h, interna) / precio auxiliar / precio acompañamiento | /precios/ | landings de servicio (muestran «desde» pero sin FAQ de precio), C02 | Todas las FAQ de precio por unidad viven solo en /precios/. |
| cuánto cuesta cuidar a un adulto mayor (al mes), presupuesto mensual | /blog/cuanto-cuesta-cuidar-a-un-adulto-mayor-en-casa/ (v2) | /precios/ | Presupuesto mensual por plan; enlaza a /precios/ para la tarifa unitaria. |
| noche / nocturna / nocturno / turno noche + cuidadora o cuidado | /servicios/cuidado-nocturno/ | /servicios/acompanamiento-hospitalario/ (salvo «acompañamiento nocturno en hospitales») | Las noches en clínica se mencionan en nocturno y enlazan a hospitalario. |
| 24 horas / interna / permanente en casa | /servicios/cuidado-24-horas/ | C04 (solo aspectos laborales de la interna), /precios/ (solo precio) | «¿Qué contrato se le hace a una interna?» es de C04; «precio cuidadora interna» es de /precios/. |
| por horas / por días / acompañante a domicilio / compañía | /servicios/cuidado-por-horas/ | citas, hospitalario | «Acompañamiento adulto mayor» genérico = compañía por horas. |
| acompañamiento a citas médicas / exámenes | /servicios/acompanamiento-citas-medicas/ | por horas, C12 |  |
| acompañamiento hospitalario / cuidadora hospitalaria / acompañante en clínica / acompañamiento nocturno en hospital | /servicios/acompanamiento-hospitalario/ | nocturno, C12 |  |
| qué es / qué significa acompañante permanente; cuándo un paciente necesita acompañante | /blog/que-es-un-acompanante-permanente/ | landings de acompañamiento | Informativo; enlaza a las dos landings. |
| cuidado postoperatorio (cabeza informativa), cuidados después de una cirugía, señales de alarma | /blog/cuidados-postoperatorios-en-casa/ | /servicios/cuidado-postoperatorio/ | La landing usa «cuidado postoperatorio en casa en Bogotá» (transaccional) y no responde «cuáles son los cuidados». |
| cuidado postoperatorio en casa (contratar), casas de cuidados postoperatorios | /servicios/cuidado-postoperatorio/ | C09 |  |
| cuidador(es)/cuidadora para Alzheimer o demencia (contratar) | /servicios/cuidado-alzheimer-demencia/ | C10 |  |
| cómo cuidar / cuidados / actividades / hogares para Alzheimer | /blog/cuidar-adulto-mayor-con-alzheimer-en-casa/ | landing Alzheimer, C06 |  |
| hogar geriátrico / geriátrico / ancianato (+ Bogotá, precios, qué es) | /blog/hogar-geriatrico-o-cuidado-en-casa/ | home, zonas |  |
| hogar geriátrico + norte / localidad / barrio | página de zona dueña del topónimo (solo bloque comparativo) | C06 | Nunca en title/H1 de la zona; solo H2 «¿Hogar geriátrico en X o cuidado en casa?». |
| centro día (adulto mayor) | /blog/centro-dia-adulto-mayor-bogota/ (v2) | por horas (menciona y enlaza) |  |
| cuidador por EPS, atención domiciliaria (EPS/prepagada), tutela | /blog/eps-cuidador-en-casa/ | S13, S08 |  |
| inyectología (a domicilio, cerca de mí, Bogotá), aplicar insulina | /blog/inyectologia-a-domicilio-bogota/ | todas las demás | Sin CTA de procedimiento. Ninguna landing usa estos términos. |
| home care (qué es, Bogotá) | /blog/que-es-home-care/ (v2) | home (evita el término) | En Colombia «home care» connota salud domiciliaria (IPS). |
| médico a domicilio | /blog/medico-a-domicilio-en-bogota/ (v2) | todas | Experimento informativo; Sovialis no lo presta. |
| leyes del adulto mayor (1251, 1276, 1315, 2055), a qué edad se es adulto mayor | /blog/leyes-y-derechos-del-adulto-mayor/ | C06 (cita la 1315 sin apuntarle) |  |
| actividades para adultos mayores | /blog/actividades-para-adultos-mayores/ | S02, S03, S11 |  |
| ejercicios / actividad física adulto mayor | /blog/ejercicios-para-adultos-mayores-en-casa/ | S01, S05 |  |
| juegos / memoria / estimulación cognitiva | /blog/juegos-de-memoria-para-adultos-mayores/ (v2) | S01, C10 |  |
| cuidados (plural) del adulto mayor + básicos/hogar/cuáles | /blog/cuidados-basicos-del-adulto-mayor/ (v2) | home | El singular comercial lo posee el home. |
| cuidar al cuidador / síndrome del cuidador | /blog/cuidar-al-cuidador/ (v2) | respiro familiar (v2) |  |
| trabajo / empleo / hoja de vida cuidadora o auxiliar | /trabaja-con-nosotros/ | todas | Las demás páginas no usan vocabulario de empleo; en Ads son negativas. |
| norte de Bogotá + cuidado, «cerca de mí» | /zonas/ | localidades y barrios |  |

### 6.2 Propiedad de topónimos

Cada topónimo lo apunta una sola página. Cuando se publique una página v2 de barrio, la página de la localidad deja de usar ese topónimo en H2 y FAQ y lo enlaza.

| Página | Prior. | Topónimos propios |
|---|---|---|
| `/zonas/usaquen/` | v1 | Usaquén, Santa Ana, La Calleja, Country Club, Bella Suiza, San Patricio, Santa Bárbara, Toberín |
| `/zonas/usaquen/cedritos/` | v1 | Cedritos, Cedro Golf, Cedro Bolívar, Cedro Narváez, Nueva Autopista |
| `/zonas/chapinero/` | v1 | Chapinero, Chapinero Alto, Rosales, El Retiro, La Cabrera, El Nogal, Quinta Camacho, Bosque Calderón, Emaús, Marly |
| `/zonas/chapinero/chico/` | v1 | Chicó, Chicó Norte, Chicó Reservado, Antiguo Country, Lago Gaitán, El Virrey |
| `/zonas/suba/` | v1 | Suba, Pasadena, Puente Largo, La Alhambra, Batán, Prado Veraniego, Mazurén, Colina Campestre, San José de Bavaria |
| `/zonas/suba/niza/` | v1 | Niza, Niza Norte, Niza Sur, Las Villas, Córdoba, Lagos de Córdoba |
| `/zonas/usaquen/santa-barbara/` | v2 | Santa Bárbara, Santa Bárbara Central, Santa Bárbara Occidental, Santa Bárbara Alta, Unicentro |
| `/zonas/suba/colina-campestre/` | v2 | Colina Campestre, Mazurén |
| `/zonas/calle-170/` | v2 | Toberín, Britalia, San José de Bavaria, Villa del Prado |
| `/zonas/teusaquillo/` | v2 | Teusaquillo, Galerías, Palermo, La Soledad, Park Way, Quinta Paredes, Nicolás de Federmán, Pablo VI |
| `/zonas/barrios-unidos/` | v2 | Barrios Unidos, Polo Club, Rionegro, La Castellana, Los Andes, Entre Ríos, Siete de Agosto |
| `/zonas/salitre-y-modelia/` | v2 | Ciudad Salitre, Modelia, Normandía, Hayuelos |
| `/zonas/chia/` | v2 | Chía, Cajicá |

### 6.3 Reglas de redacción y control

1. La keyword principal va en el title, el H1, la primera frase y la URL (o su núcleo). Las secundarias, en H2, cuerpo, `alt` y FAQ.
2. Nunca poner la keyword principal de otra URL en el title o el H1. Si hay que mencionar el tema, se menciona en el cuerpo y se **enlaza a la dueña** con un ancla descriptiva.
3. Anclas exactas («cuidadora de adulto mayor», «cuidado nocturno») apuntan siempre a la dueña; ningún otro destino recibe esa ancla.
4. Las landings muestran precios «desde» en un bloque, pero las **FAQ de precio viven solo en `/precios/`**.
5. **Monitoreo mensual en Search Console:** si dos URLs reciben impresiones para la misma consulta y alternan posiciones durante 4 semanas, se refuerza la dueña (anclas, contenido) y se quita la frase de la otra; si persiste, se consolida con 301.
6. Para Ads, cada grupo usa como landing la dueña de su familia (Anexo B).

## 7. Navegación

### 7.1 Menú principal

`Servicios ▾` · `Precios` · `Cómo funciona` · `Zonas ▾` · `Guías` · `Nosotros` · **[Cotiza por WhatsApp]** (botón primario) · `Contacto` (secundario). En móvil: barra fija inferior con WhatsApp y Llamar.

**Mega menú Servicios** (tres columnas):

- **Por perfil:** [Cuidadora de adulto mayor](/servicios/cuidadora-adulto-mayor/) · [Formación de auxiliar de enfermería](/servicios/auxiliar-de-enfermeria/)
- **Por horario:** [Por horas o por días](/servicios/cuidado-por-horas/) · [Cuidado nocturno](/servicios/cuidado-nocturno/) · [Cuidado 24 horas](/servicios/cuidado-24-horas/)
- **Por necesidad:** [Acompañamiento a citas médicas](/servicios/acompanamiento-citas-medicas/) · [Acompañamiento en clínica](/servicios/acompanamiento-hospitalario/) · [Después de una cirugía](/servicios/cuidado-postoperatorio/) · [Alzheimer y demencia](/servicios/cuidado-alzheimer-demencia/) · [Respiro familiar (v2)](/servicios/respiro-familiar/) · [Personas dependientes (v2)](/servicios/cuidado-personas-dependientes/)
- Pie del panel: [Ver precios](/precios/) · [¿Enfermera o cuidadora? Guía para decidir](/blog/enfermera-o-cuidadora-a-domicilio/)

**Mega menú Zonas** (columnas por localidad; las v2 se muestran al publicarse):

- **[Usaquén](/zonas/usaquen/):** [Cedritos](/zonas/usaquen/cedritos/) · [Santa Bárbara (v2)](/zonas/usaquen/santa-barbara/) · [Calle 170 (v2)](/zonas/calle-170/)
- **[Chapinero](/zonas/chapinero/):** [El Chicó](/zonas/chapinero/chico/)
- **[Suba](/zonas/suba/):** [Niza](/zonas/suba/niza/) · [Colina Campestre (v2)](/zonas/suba/colina-campestre/)
- **Centro y occidente (v2):** [Teusaquillo](/zonas/teusaquillo/) · [Barrios Unidos](/zonas/barrios-unidos/) · [Salitre y Modelia](/zonas/salitre-y-modelia/)
- **Sabana Norte (v2):** [Chía y Cajicá](/zonas/chia/)
- Pie del panel: [Mapa de cobertura](/zonas/) + buscador «¿Atienden mi barrio?» (campo de texto → WhatsApp con el barrio).

### 7.2 Pie de página

- **Servicios:** [Cuidadora de adulto mayor](/servicios/cuidadora-adulto-mayor/) · [Formación de auxiliar de enfermería](/servicios/auxiliar-de-enfermeria/) · [Cuidado por horas](/servicios/cuidado-por-horas/) · [Cuidado nocturno](/servicios/cuidado-nocturno/) · [Cuidado 24 horas](/servicios/cuidado-24-horas/) · [Acompañamiento a citas](/servicios/acompanamiento-citas-medicas/) · [Acompañamiento hospitalario](/servicios/acompanamiento-hospitalario/) · [Cuidado postoperatorio](/servicios/cuidado-postoperatorio/) · [Alzheimer y demencia](/servicios/cuidado-alzheimer-demencia/) · [Precios](/precios/)
- **Zonas:** [Norte de Bogotá](/zonas/) · [Usaquén](/zonas/usaquen/) · [Cedritos](/zonas/usaquen/cedritos/) · [Chapinero](/zonas/chapinero/) · [El Chicó](/zonas/chapinero/chico/) · [Suba](/zonas/suba/) · [Niza](/zonas/suba/niza/)
- **Guías:** [Contratar cuidado](/blog/categoria/contratar-cuidado/) · [Costos y alternativas](/blog/categoria/costos-y-alternativas/) · [Cuidados y salud en casa](/blog/categoria/cuidados-y-salud-en-casa/) · [EPS, derechos y trámites](/blog/categoria/eps-derechos-y-tramites/) · [Bienestar y cuidador familiar](/blog/categoria/bienestar-y-cuidador-familiar/) · [¿Enfermera o cuidadora?](/blog/enfermera-o-cuidadora-a-domicilio/) · [¿La EPS da cuidador?](/blog/eps-cuidador-en-casa/)
- **Sovialis:** [Quiénes somos](/nosotros/) · [Cómo funciona](/como-funciona/) · [Trabaja con nosotros](/trabaja-con-nosotros/) · [Contacto](/contacto/) · [Peticiones, quejas y reclamos (PQRS)](/contacto/#pqrs)
- **Legal:** [Política de tratamiento de datos](/politica-de-tratamiento-de-datos/) · [Términos y condiciones](/terminos-y-condiciones/) · [Política de cookies](/politica-de-cookies/) · [Preferencias de cookies](#preferencias-cookies)
- **Bloque NAP** (idéntico al de Google Business Profile y al schema): nombre, dirección, teléfono, WhatsApp, correo, horario, NIT — todos `[por confirmar]`.
- **Aviso legal fijo** (ver §2).

### 7.3 Migas de pan

Patrón `Inicio › Sección › Subsección › Página`, visible en todas las páginas salvo el home, con su espejo exacto en `BreadcrumbList`. Ejemplos:

- Inicio › Servicios › Cuidado nocturno
- Inicio › Zonas › Usaquén › Cedritos
- Inicio › Guías › EPS, derechos y trámites › ¿La EPS da cuidador en casa?
- Inicio › Precios
- El blog usa la categoría principal en la miga aunque no esté en la URL; el último elemento no es enlace.

## 8. Fichas por página

Formato: URL · tipo · prioridad · menú. Title (≤ 60 caracteres) y meta (≤ 155) validados por script. Volumen entre paréntesis = Bogotá/mes; «s/d» = sin dato.

### 8.1 Núcleo y servicios

#### `/`

- **Tipo:** home · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (57):** Cuidado del adulto mayor a domicilio en Bogotá | Sovialis
- **Meta (145):** Cuidadoras y personal con formación de auxiliar de enfermería para tu familiar en casa: por horas, de día, de noche o 24 h en el norte de Bogotá.
- **H1:** Cuidado del adulto mayor a domicilio en Bogotá
- **Keyword principal:** cuidado del adulto mayor (140) — Familia «cuidado (del/de/a) adulto mayor» (Keyword Planner agrupa variantes). El foco de la página es la frase «cuidado del adulto mayor a domicilio en Bogotá».
- **Secundarias:** cuidado de adulto mayor a domicilio (10); cuidado adulto mayor bogotá (10); cuidado de adulto mayor en bogota (10); cuidadoras a domicilio (40); cuidadores de adultos mayores a domicilio bogotá (40); cuidador en casa (30); empresas de cuidado de personas mayores (10); agencia de cuidado de personas mayores (10); servicio de cuidado de adulto mayor (20); cuidado de ancianos a domicilio (10)
- **Volumen del grupo:** 320 · **Intención:** transaccional / comercial (agencia)
- **H2:** Cuidado en casa para tu familiar, con personas verificadas / Servicios por perfil, por horario y por necesidad / Tarifas claras, con el precio final desde el primer mensaje / Cómo funciona: de la primera conversación al primer servicio / Qué hace y qué no hace nuestro personal / Cobertura en el norte de Bogotá / Por qué las familias eligen Sovialis / Preguntas frecuentes
- **FAQ:**
  - **¿Qué es Sovialis y qué tipo de cuidado presta?** Sovialis es una empresa de Bogotá que presta cuidado no sanitario a domicilio para personas mayores: compañía, higiene, alimentación, movilidad y acompañamiento, con cuidadoras y con personal con formación de auxiliar de enfermería.
  - **¿Sovialis presta servicios de enfermería o procedimientos médicos?** No. Sovialis no es una IPS y su personal no aplica inyecciones ni insulina, no hace curaciones ni maneja sondas u oxígeno. Si tu familiar los necesita, te orientamos para pedirlos a tu EPS o a una IPS habilitada, con la que contratas directamente.
  - **¿En qué zonas de Bogotá atienden?** Atendemos principalmente el norte y el noroccidente de Bogotá —Usaquén, Chapinero, Suba y sus barrios— y confirmamos la cobertura de cada dirección al cotizar.
  - **¿Cómo se paga el servicio?** Por anticipado (por servicio, semanal, quincenal o mensual) y solo a la cuenta de Sovialis. Un pago hecho directamente al personal no se tiene en cuenta como pago del servicio.
  - **¿Qué pasa si la persona que cuida no puede llegar?** Buscamos un reemplazo en el plazo acordado y no cobramos el tiempo no prestado. Si no hay reemplazo, eliges entre recibir el servicio más tarde, pagando solo lo prestado, o cancelarlo sin costo.
  - **¿Puedo contratar un servicio para empezar hoy mismo?** Depende de la disponibilidad de personal para tu zona y horario. Escríbenos y te confirmamos el primer horario posible antes de que pagues.
- **Schema:** Organization, LocalBusiness, WebSite, WebPage, FAQPage
- **Enlaces internos:** [cuidadora de adulto mayor](/servicios/cuidadora-adulto-mayor/); [personal con formación de auxiliar de enfermería](/servicios/auxiliar-de-enfermeria/); [cuidado por horas](/servicios/cuidado-por-horas/); [cuidado de noche](/servicios/cuidado-nocturno/); [cobertura 24 horas](/servicios/cuidado-24-horas/); [acompañamiento en clínica](/servicios/acompanamiento-hospitalario/); [ver todas las tarifas](/precios/); [cómo funciona el servicio](/como-funciona/); [zonas de cobertura en el norte de Bogotá](/zonas/); [¿enfermera o cuidadora? Cómo decidir](/blog/enfermera-o-cuidadora-a-domicilio/)
- **CTA:** Cotiza por WhatsApp (botón fijo) + «Agenda una llamada»

#### `/servicios/`

- **Tipo:** hub-servicios · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (60):** Servicios de cuidado para adultos mayores en casa | Sovialis
- **Meta (147):** Cuidado según el perfil, el horario y la necesidad de tu familiar: cuidadora, auxiliar, por horas, noche, 24 h, clínica, postoperatorio y demencia.
- **H1:** Servicios de cuidado para adultos mayores
- **Keyword principal:** servicios para adultos mayores (10)
- **Secundarias:** servicios para personas mayores (10); servicio para adultos mayores (10); servicio de adulto mayor (10); cuidado y acompañamiento (10); atencion al adulto mayor (20); tipos de cuidado para adultos mayores en casa (s/d)
- **Volumen del grupo:** 50 · **Intención:** comercial (navegación y comparación de modalidades)
- **H2:** Elige por perfil: cuidadora o formación de auxiliar de enfermería / Elige por horario: por horas, turnos de día, noche o 24 horas / Elige por necesidad: citas, clínica, postoperatorio y demencia / Tabla comparativa de modalidades y tarifas desde / Qué tareas incluye el cuidado y cuáles no / Servicios de salud que se contratan aparte con una IPS / Preguntas frecuentes
- **FAQ:**
  - **¿Qué modalidades de servicio ofrece Sovialis?** Turnos de 8 y 12 horas de día o de noche, cuidado 24 horas con relevos y servicios por horas (mínimo 4 horas por visita), con cuidadora o con personal con formación de auxiliar de enfermería.
  - **¿Pueden cuidar a dos personas mayores en la misma casa?** Sí, si se acuerda desde la cotización: el plan de cuidado incluye a ambas personas y la tarifa se ajusta. El personal no atiende a personas que no estén incluidas en el plan.
  - **¿Puedo combinar varias modalidades en la misma semana?** Sí. Puedes combinar, por ejemplo, turnos de día entre semana y cuidado nocturno el fin de semana; la cotización suma cada modalidad con su tarifa.
  - **¿El servicio incluye tareas domésticas?** No incluye oficios domésticos generales como lavar, planchar o asear toda la casa. Sí incluye mantener limpio y seguro el entorno de tu familiar y preparar alimentos sencillos para él o ella.
  - **¿El personal puede conducir el carro de la familia o manejar dinero?** No. Por seguridad, el personal no conduce vehículos ni maneja dinero o tarjetas de la persona cuidada; en salidas y citas la acompaña en el transporte que la familia disponga.
  - **¿Atienden también a niños o adultos con discapacidad?** Nuestro foco son las personas mayores, pero también cuidamos adultos con dependencia y, en casos acordados, niños; para menores de edad verificamos además el registro de inhabilidades de la Ley 1918 de 2018.
- **Schema:** CollectionPage, ItemList, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidadora de adulto mayor](/servicios/cuidadora-adulto-mayor/); [formación de auxiliar de enfermería](/servicios/auxiliar-de-enfermeria/); [por horas o por días](/servicios/cuidado-por-horas/); [turnos de noche](/servicios/cuidado-nocturno/); [cuidado 24 horas](/servicios/cuidado-24-horas/); [acompañamiento a citas médicas](/servicios/acompanamiento-citas-medicas/); [acompañamiento hospitalario](/servicios/acompanamiento-hospitalario/); [después de una cirugía](/servicios/cuidado-postoperatorio/); [Alzheimer y demencia](/servicios/cuidado-alzheimer-demencia/); [tabla completa de precios](/precios/)
- **CTA:** Cotiza tu combinación de servicios

#### `/servicios/cuidadora-adulto-mayor/`

- **Tipo:** servicio-perfil · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (58):** Cuidadora de adulto mayor en Bogotá, verificada | Sovialis
- **Meta (153):** Cuidadora verificada para tu papá o mamá: compañía, higiene, comidas, movilidad y recordatorio de medicamentos. Turnos de 8 h desde $120.000. Cotiza hoy.
- **H1:** Cuidadora de adulto mayor en Bogotá
- **Keyword principal:** cuidador de adulto mayor (480) — Familia de 17 variantes (cuidador/cuidadora/cuidadores de adulto mayor). Volumen exacto de «cuidadora de adulto mayor»: 110.
- **Secundarias:** cuidadora de adulto mayor (110); cuidadora de adulto mayor bogota (70); cuidadores de adulto mayor bogotá (50); cuidador adulto mayor bogota (40); necesito cuidadora de adulto mayor (10); busco cuidadora de adulto mayor (10); cuidadora de ancianos (10); cuidadoras para adultos mayores (10); cuidador de ancianos (10); que hace un cuidador de adulto mayor (10)
- **Volumen del grupo:** 590 · **Intención:** comercial / transaccional (perfil)
- **H2:** Qué hace una cuidadora de Sovialis en casa / Lo que no hace: tareas que corresponden a personal de salud / Cómo seleccionamos y verificamos a cada cuidadora / Turnos disponibles: por horas, 8 o 12 horas, noche y 24 horas / Tarifas de referencia del perfil cuidadora / El primer servicio: plan de cuidado y presentación / Preguntas frecuentes sobre las cuidadoras
- **FAQ:**
  - **¿Qué verificaciones hacen antes de presentar una cuidadora?** Verificamos identidad, referencias, antecedentes, formación y afiliación a seguridad social, y dejamos constancia de cada consulta.
  - **¿La cuidadora puede darle los medicamentos a mi familiar?** Puede recordarle los horarios y asistirle en la toma de medicamentos orales que la familia deja organizados por dosis. No administra inyectables ni insulina.
  - **¿Qué pasa si nadie llega a recibir a mi familiar al terminar el turno?** La cuidadora no lo deja solo: se queda hasta 2 horas adicionales, que se cobran, mientras llega un adulto responsable. Por eso pedimos siempre un contacto y un plan de contingencia.
  - **¿Puede la misma cuidadora acompañar a mi familiar todos los días?** Procuramos continuidad con un grupo pequeño de cuidadoras que ya conocen la rutina. Como cada una define su disponibilidad, en coberturas largas se alternan dos o más personas.
  - **¿Qué tareas de higiene personal hace la cuidadora?** Asiste en el baño o la ducha, el cambio de pañal o el uso del sanitario, el vestido, la higiene oral y el cuidado básico de la piel, respetando la intimidad y las preferencias de tu familiar.
  - **¿La cuidadora prepara las comidas de mi familiar?** Sí: prepara alimentos sencillos o los que indique la familia, asiste en la comida y vigila la hidratación. No cocina para el resto del hogar.
  - **¿Puedo pedir cambio de cuidadora?** Sí. Si la relación no funciona, cuéntanos y buscamos otra persona verificada para los siguientes servicios.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tarifas del perfil cuidadora](/precios/); [perfil con formación de auxiliar de enfermería](/servicios/auxiliar-de-enfermeria/); [turnos de noche](/servicios/cuidado-nocturno/); [cobertura 24 horas](/servicios/cuidado-24-horas/); [cómo seleccionamos al personal](/como-funciona/); [guía para contratar una cuidadora](/blog/como-contratar-una-cuidadora/); [diferencias entre cuidadora y enfermera](/blog/enfermera-o-cuidadora-a-domicilio/); [barrios donde atendemos](/zonas/)
- **CTA:** Pide una cuidadora (WhatsApp)

#### `/servicios/auxiliar-de-enfermeria/`

- **Tipo:** servicio-perfil · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (55):** Cuidado con formación de auxiliar de enfermería, Bogotá
- **Meta (153):** Personal con formación de auxiliar de enfermería y registro ReTHUS para el cuidado básico de personas con alta dependencia o recién salidas del hospital.
- **H1:** Cuidado en casa por personal con formación de auxiliar de enfermería
- **Keyword principal:** auxiliar de enfermería a domicilio (30)
- **Secundarias:** auxiliar de enfermeria para cuidar adulto mayor (10); auxiliar de adulto mayor (10); auxiliar en cuidado de adultos mayores (10); auxiliares a domicilio (10); auxiliar de enfermeria cuidado adulto mayor (10); auxiliar cuidado adulto mayor (10); servicio de auxiliar de enfermería a domicilio (10); auxiliar de enfermeria adulto mayor (10)
- **Volumen del grupo:** 90 · **Intención:** comercial / transaccional (perfil)
- **H2:** Para quién es este perfil / Qué hace en casa: cuidado básico con la experiencia de su formación / Qué no hace en Sovialis: procedimientos de salud / Formación y registro ReTHUS verificados / Turnos de día, de noche y 24 horas / Tarifas de referencia del perfil auxiliar / Si tu familiar necesita procedimientos: cómo coordinar con una IPS / Preguntas frecuentes sobre este perfil
- **FAQ:**
  - **¿Por qué elegir personal con formación de auxiliar si Sovialis no presta enfermería?** Porque su formación le da práctica en movilización segura, baño en cama, prevención de lesiones de piel y reconocimiento de signos de alarma, algo útil en personas con alta dependencia, aunque en Sovialis solo hace cuidado básico.
  - **¿El personal con formación de auxiliar puede aplicar inyecciones o insulina en Sovialis?** No. Aunque su formación lo contemple, en Sovialis no aplica inyectables, insulina ni sueros, porque Sovialis no es una IPS habilitada. Esos procedimientos los prestan tu EPS o una IPS.
  - **¿Cómo se verifica el registro ReTHUS del personal auxiliar?** Verificamos el registro en el ReTHUS antes de presentar a cada persona, y tú también puedes consultarlo en el portal del Ministerio de Salud con los datos que te compartimos con su autorización.
  - **¿Qué hace el personal auxiliar ante un signo de alarma durante el turno?** Presta primeros auxilios, llama a la línea 123 o a la EPS según la situación y avisa de inmediato a la familia. No toma decisiones médicas.
  - **¿Pueden atender a una persona con sonda, traqueostomía u oxígeno?** Podemos hacer el cuidado básico (higiene, compañía, cambios de posición), pero el manejo de la sonda, la traqueostomía o el oxígeno lo hace personal de una IPS; coordinamos horarios con ella.
  - **¿En qué casos recomiendan este perfil en lugar de una cuidadora?** Cuando hay alta dependencia: persona encamada, movilización difícil, recuperación de una hospitalización o varias enfermedades crónicas. En la llamada inicial te ayudamos a decidir.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [perfil cuidadora](/servicios/cuidadora-adulto-mayor/); [cuidado después de una cirugía](/servicios/cuidado-postoperatorio/); [acompañamiento durante una hospitalización](/servicios/acompanamiento-hospitalario/); [tarifas del perfil auxiliar](/precios/); [qué puede hacer cada perfil](/blog/enfermera-o-cuidadora-a-domicilio/); [cómo pedir una inyección a domicilio](/blog/inyectologia-a-domicilio-bogota/)
- **CTA:** Consulta disponibilidad del perfil auxiliar
- **Notas:** LEGAL: nunca «servicio de enfermería», «enfermera» ni procedimientos. La toma de signos vitales queda fuera del copy hasta que el abogado valide NOTAS-LEGALES §9.2.

#### `/servicios/cuidado-nocturno/`

- **Tipo:** servicio-horario · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (49):** Cuidadora de noche para adultos mayores en Bogotá
- **Meta (149):** Turnos nocturnos de 8 y 12 horas para que tu familiar esté acompañado y seguro mientras la familia descansa: idas al baño, cambios de pañal y caídas.
- **H1:** Cuidado nocturno para adultos mayores
- **Keyword principal:** cuidado nocturno de personas mayores (10)
- **Secundarias:** cuidadora de noche (10); cuidadora de adulto mayor turno noche (10); cuidadoras nocturnas (10); cuidadora turno noche (10); cuidador nocturno (10); cuidador nocturno personas mayores (10); cuidadoras nocturnas de ancianos (10); cuidadores nocturnos (10)
- **Volumen del grupo:** 80 · **Intención:** transaccional
- **H2:** Por qué muchas familias necesitan apoyo en la noche / Qué hace la cuidadora mientras tu familiar duerme / Turnos nocturnos de 8 y 12 horas / Noches en casa o acompañamiento en clínica / Tarifas de referencia del turno nocturno / Cómo preparamos el primer turno de noche / Preguntas frecuentes sobre el cuidado nocturno
- **FAQ:**
  - **¿La cuidadora de noche puede dormir durante el turno?** No. El turno nocturno es de vigilia: la cuidadora permanece despierta y atenta para acompañar a tu familiar en las idas al baño, los cambios de posición o los momentos de desorientación.
  - **¿A qué hora empieza y termina el turno nocturno?** El horario lo acuerdas al cotizar: un turno de 12 horas suele ir de 7:00 p. m. a 7:00 a. m., y uno de 8 horas puede cubrir, por ejemplo, de 10:00 p. m. a 6:00 a. m.
  - **¿Qué hace la cuidadora si mi familiar se despierta desorientado?** Lo acompaña con calma, le ayuda a ubicarse, evita que se levante sin apoyo y, si nota un cambio brusco o un signo de alarma, avisa a la familia y llama a emergencias si hace falta.
  - **¿Pueden cubrir solo algunas noches de la semana?** Sí. Puedes contratar noches sueltas o fijas, por ejemplo de domingo a jueves, y combinarlas con turnos de día u otras modalidades.
  - **¿La cuidadora de noche cambia pañales y ayuda con el baño?** Sí: asiste en las idas al sanitario, hace cambios de pañal y de ropa de cama si hace falta, y mantiene la higiene de tu familiar durante la noche.
  - **¿Qué necesita la cuidadora en casa para el turno nocturno?** Un lugar donde sentarse cerca de la habitación, luz de paso hacia el baño y los teléfonos de la familia y de la EPS a la mano.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tarifas del turno nocturno](/precios/); [cuidado 24 horas con relevos](/servicios/cuidado-24-horas/); [noches en clínica](/servicios/acompanamiento-hospitalario/); [cuidado en demencia](/servicios/cuidado-alzheimer-demencia/); [qué hace una cuidadora](/servicios/cuidadora-adulto-mayor/); [zonas de cobertura](/zonas/)
- **CTA:** Cotiza noches de cuidado

#### `/servicios/cuidado-24-horas/`

- **Tipo:** servicio-horario · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (57):** Cuidado 24 horas y cuidadora interna en Bogotá | Sovialis
- **Meta (148):** Cobertura continua con relevos coordinados entre personas verificadas: día, noche, fines de semana y festivos. Desde $300.000 por día con cuidadora.
- **H1:** Cuidado 24 horas para adultos mayores, con relevos
- **Keyword principal:** cuidadora interna (10)
- **Secundarias:** cuidadora interna 24 horas (10); cuidadoras internas (10); persona interna para cuidar ancianos (10); interna cuidado ancianos (10); cuidado ancianos 24 horas (10); cuidadoras internas para personas mayores (10); empresas de cuidadoras internas (10); cuidadora interna personas mayores (10); internas para cuidar personas mayores (10)
- **Volumen del grupo:** 80 · **Intención:** transaccional
- **H2:** Cuidado 24 horas con relevos o cuidadora interna: diferencias / Cómo organizamos la cobertura de día y de noche / Para quién conviene el cuidado continuo / Qué incluye la cobertura 24/7 / Tarifas de referencia del servicio 24 horas / Descansos, festivos y continuidad del equipo / Preguntas frecuentes sobre el cuidado 24 horas
- **FAQ:**
  - **¿Ofrecen cuidadora interna que viva en la casa?** Organizamos la cobertura 24 horas con relevos coordinados entre personas verificadas, en lugar de una sola persona interna, para que siempre haya alguien descansado y atento.
  - **¿Cuántas personas participan en un servicio 24 horas?** Depende del plan: la cobertura se organiza por relevos para que quien cuida esté descansado. Al cotizar te explicamos cuántas personas participan y cómo se alternan.
  - **¿Qué pasa en los descansos, vacaciones o incapacidades del personal?** Coordinamos el reemplazo con otra persona verificada en el plazo acordado y te avisamos antes del cambio, para que la cobertura no se interrumpa.
  - **¿El cuidado 24 horas incluye fines de semana y festivos?** Sí, la cobertura continua incluye sábados, domingos y festivos; esos días tienen una tarifa diferente que ves en la cotización antes de aceptar.
  - **¿Desde cuándo conviene pasar a cuidado 24 horas?** Cuando tu familiar ya no puede quedarse solo en ningún momento: por riesgo de caídas, desorientación nocturna o dependencia alta. Si aún tiene ratos de autonomía, un turno de 12 horas puede bastar.
  - **¿Se puede empezar con 24 horas y luego reducir el horario?** Sí. El plan se ajusta cuando cambian las necesidades de tu familiar; solo pedimos el preaviso pactado en el contrato para reorganizar los relevos.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [precio del cuidado 24 horas](/precios/); [solo noches](/servicios/cuidado-nocturno/); [demencia avanzada](/servicios/cuidado-alzheimer-demencia/); [personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [cómo coordinamos los relevos](/como-funciona/); [¿hogar geriátrico o casa?](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Cotiza cobertura 24/7
- **Notas:** Captura «cuidadora interna» con honestidad: Sovialis cubre 24 h con relevos (portafolio «Relevos coordinados»; Decreto 0581: evitar una sola persona fija 24/7).

#### `/servicios/cuidado-por-horas/`

- **Tipo:** servicio-horario · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (50):** Cuidadora por horas para adultos mayores en Bogotá
- **Meta (155):** Compañía y cuidado por horas o por días sueltos, desde 4 horas por visita: ideal para que la familia trabaje, haga diligencias o descanse. Desde $20.000/h.
- **H1:** Cuidado y compañía por horas para adultos mayores
- **Keyword principal:** cuidadora por horas (10)
- **Secundarias:** cuidado de adulto mayor por horas (10); cuidadora de adulto mayor por horas (10); cuidado de ancianos por horas (10); cuidadores por horas (10); cuidado de personas mayores por horas (10); acompañante a domicilio (30); acompañamiento adulto mayor (20); compañía para personas mayores (10); acompañante de ancianos (10)
- **Volumen del grupo:** 120 · **Intención:** transaccional
- **H2:** Cuándo conviene el cuidado por horas / Qué puede hacer la cuidadora en una visita / Mínimo de 4 horas y cómo se programa / Días sueltos: fines de semana y descanso del cuidador familiar / Tarifas de referencia por hora / Preguntas frecuentes sobre el cuidado por horas
- **FAQ:**
  - **¿Cuál es el mínimo de horas por servicio?** El servicio por horas tiene un mínimo de 4 horas por visita; puedes programar visitas sueltas o fijas durante la semana.
  - **¿Puedo pedir el servicio solo para un fin de semana o unas vacaciones?** Sí. Puedes contratar días sueltos, como un fin de semana o una semana de vacaciones del cuidador familiar, por horas o en turnos completos.
  - **¿Qué actividades hace la cuidadora en una visita de pocas horas?** Compañía y conversación, juegos o lectura, una caminata, apoyo en el baño o en una comida y recordatorio de medicamentos, según lo acordado en el plan.
  - **¿Puedo usar las horas para que acompañen a mi familiar a una diligencia?** Sí, la cuidadora puede acompañarlo a diligencias personales cercanas; el transporte lo dispone la familia y la cuidadora no maneja dinero ni tarjetas.
  - **¿Puedo combinar horas en casa con un centro día?** Sí. Algunas familias usan un centro día entre semana y contratan horas para las tardes o los fines de semana; te ayudamos a cuadrar los horarios.
  - **¿Qué pasa si la visita se extiende más de lo programado?** Las horas adicionales se cobran con la misma tarifa por hora, siempre que la cuidadora pueda quedarse; avísanos con tiempo para confirmarlo.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tarifa por hora](/precios/); [acompañamiento a citas médicas](/servicios/acompanamiento-citas-medicas/); [perfil de la cuidadora](/servicios/cuidadora-adulto-mayor/); [noches sueltas](/servicios/cuidado-nocturno/); [ideas de actividades para la visita](/blog/actividades-para-adultos-mayores/)
- **CTA:** Programa una visita por horas

#### `/servicios/acompanamiento-citas-medicas/`

- **Tipo:** servicio-necesidad · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (57):** Acompañante para citas médicas de adultos mayores, Bogotá
- **Meta (149):** Una persona verificada acompaña a tu familiar a consultas, exámenes o terapias, anota las indicaciones y lo regresa a casa. Por horas, desde 4 horas.
- **H1:** Acompañamiento a citas médicas y exámenes
- **Keyword principal:** servicio de acompañamiento a citas médicas (10)
- **Secundarias:** acompañamiento a citas médicas (10); acompañamiento para adultos mayores en bogotá (10); servicio de acompañamiento al adulto mayor (10); servicio de acompañamiento para adultos mayores (10); servicio de acompañamiento a personas mayores (10); empresas de acompañamiento personas mayores (10); acompañamiento adulto mayor bogota (10); servicios de acompañamiento (10)
- **Volumen del grupo:** 70 · **Intención:** transaccional
- **H2:** Qué incluye el acompañamiento a una cita / Antes de la cita: documentos, órdenes y preparación / Durante la cita: trámites, esperas y notas para la familia / Después: regreso a casa y reporte / Tarifa por horas / Preguntas frecuentes sobre el acompañamiento a citas
- **FAQ:**
  - **¿La acompañante entra a la consulta con mi familiar?** Si tu familiar y el médico lo permiten, sí. Toma nota de las indicaciones para la familia, pero no toma decisiones médicas ni firma consentimientos.
  - **¿Cómo se transporta mi familiar a la cita?** En el medio que la familia disponga (taxi, plataforma o carro con conductor); la acompañante va con tu familiar, pero no conduce ni paga con dinero propio.
  - **¿Pueden acompañar a exámenes que requieren sedación?** Sí. En esos casos la institución suele exigir un adulto acompañante para la salida; confirma antes si acepta a una acompañante que no sea de la familia.
  - **¿Cuánto dura un servicio de acompañamiento a citas?** Se programa por horas con un mínimo de 4, que suelen cubrir traslado, espera, consulta y regreso; si se extiende, se suman las horas adicionales.
  - **¿Me envían un reporte de lo que dijo el médico?** Sí. Al terminar te enviamos por WhatsApp o correo las indicaciones y próximas citas que anotó la acompañante, sin interpretarlas clínicamente.
  - **¿Pueden acompañar a mi familiar a reclamar medicamentos o resultados?** Sí, lo acompañan en el trámite. Si quieres que la acompañante lo haga sola, la EPS o la farmacia suele pedir una autorización firmada y los documentos del paciente.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [acompañamiento durante una hospitalización](/servicios/acompanamiento-hospitalario/); [cuidado por horas](/servicios/cuidado-por-horas/); [tarifa por hora](/precios/); [qué es un acompañante permanente](/blog/que-es-un-acompanante-permanente/); [clínicas del norte de Bogotá](/zonas/)
- **CTA:** Agenda un acompañamiento

#### `/servicios/acompanamiento-hospitalario/`

- **Tipo:** servicio-necesidad · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (53):** Acompañante hospitalario en Bogotá, de día y de noche
- **Meta (144):** Turnos de día o de noche para acompañar a tu familiar en la clínica: compañía, apoyo en comidas e higiene y aviso oportuno al personal de salud.
- **H1:** Acompañamiento hospitalario para adultos mayores
- **Keyword principal:** acompañamiento hospitalario (10)
- **Secundarias:** cuidadores en hospitales (10); cuidadora hospitalaria (10); acompañamiento nocturno en hospitales (10); acompañante nocturno (10); empresas de acompañamiento hospitalario (10); servicio de acompañamiento en hospitales (10); acompañamiento de enfermos en hospitales (10); cuidar ancianos en hospitales (10); servicio de acompañantes para enfermos (10)
- **Volumen del grupo:** 100 · **Intención:** transaccional
- **H2:** Qué hace la acompañante dentro de la clínica / Lo que no hace: el cuidado clínico es del hospital / Turnos de día, de noche y relevos con la familia / Clínicas del norte de Bogotá donde acompañamos / Del hospital a la casa: continuidad del cuidado / Tarifas de referencia / Preguntas frecuentes sobre el acompañamiento hospitalario
- **FAQ:**
  - **¿La acompañante reemplaza a la enfermería de la clínica?** No. El cuidado clínico (medicamentos, curaciones, monitoreo) lo hace el personal del hospital; la acompañante da compañía, apoya comidas e higiene básica si la clínica lo permite y avisa a enfermería ante cualquier cambio.
  - **¿Pueden quedarse con mi familiar toda la noche en la clínica?** Sí, con turnos nocturnos de 12 horas, siempre que la institución permita un acompañante en la noche; verificamos sus normas antes de iniciar.
  - **¿Qué necesita la acompañante para entrar a la clínica?** Normalmente su documento y el registro como acompañante según el procedimiento de cada institución (admisiones, puesto de enfermería, carné o manilla). Lo gestionamos con la familia.
  - **¿Pueden acompañar en urgencias o en la UCI?** En urgencias, sí, cuando la institución lo permite. En cuidado intensivo el acompañamiento suele limitarse a los horarios de visita, así que el servicio se ajusta a esas normas.
  - **¿Qué pasa cuando le dan de alta a mi familiar?** La acompañante puede apoyar el regreso a casa y, si lo necesitas, continuar con cuidado en el hogar en los turnos que definamos.
  - **¿Pueden acompañar a mi familiar en una clínica fuera del norte de Bogotá?** Sí, el acompañamiento hospitalario cubre instituciones de toda la ciudad; confirmamos la disponibilidad de personal según la ubicación y el horario.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [turnos de noche](/servicios/cuidado-nocturno/); [recuperación en casa después del alta](/servicios/cuidado-postoperatorio/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [cuándo la clínica pide acompañante permanente](/blog/que-es-un-acompanante-permanente/); [tarifas por turno](/precios/); [clínicas de Usaquén](/zonas/usaquen/); [clínicas de Suba](/zonas/suba/)
- **CTA:** Pide un acompañante para hoy
- **Notas:** Mencionar clínicas solo como referencia, con aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/servicios/cuidado-postoperatorio/`

- **Tipo:** servicio-necesidad · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (51):** Cuidado postoperatorio en casa en Bogotá | Sovialis
- **Meta (138):** Apoyo en los primeros días después de una cirugía: movilidad segura, higiene, comidas y compañía, según las indicaciones médicas y tu EPS.
- **H1:** Cuidado postoperatorio en casa
- **Keyword principal:** cuidado postoperatorio en casa (s/d) — Sin volumen medible (<10) para la frase transaccional; la cabeza «cuidado postoperatorio» (110, informativa) la posee el blog C09.
- **Secundarias:** casas de cuidados postoperatorios (10); cuidadora para postoperatorio (s/d); acompañamiento después de una cirugía (s/d); cuidado después de cirugía de cadera (s/d); estancias postoperatorias para adultos mayores (0); casa de reposo postoperatorio (s/d)
- **Volumen del grupo:** 10 · **Intención:** transaccional
- **H2:** Cómo ayudamos después de una cirugía de cadera, rodilla o abdomen / Qué hace la cuidadora y qué corresponde a tu EPS o IPS / Prevención de caídas y de lesiones de piel en la recuperación / Del hospital a la casa: cómo organizamos el primer día / Turnos recomendados según la etapa de la recuperación / Tarifas de referencia / Preguntas frecuentes sobre el cuidado postoperatorio
- **FAQ:**
  - **¿Pueden recibir a mi familiar el mismo día del alta?** Sí. Si nos das la fecha probable de alta, coordinamos que la cuidadora llegue a casa o lo recoja en la clínica, según la disponibilidad de personal.
  - **¿Quién hace las curaciones de la herida después de la cirugía?** Las curaciones las hace personal de salud de tu EPS o de una IPS habilitada. Nuestra cuidadora cuida que el vendaje permanezca limpio y seco y avisa si nota sangrado, mal olor o fiebre.
  - **¿Durante cuántos días se suele contratar el apoyo postoperatorio?** Depende de la cirugía y de la autonomía de tu familiar; muchas familias empiezan con turnos completos y luego pasan a menos horas. No hay permanencia mínima.
  - **¿La cuidadora ayuda con los ejercicios que dejó el fisioterapeuta?** Puede acompañar y recordar los ejercicios indicados por el fisioterapeuta, sin modificar la rutina ni reemplazar la terapia.
  - **¿Pueden acompañar a mi familiar a los controles después de la cirugía?** Sí, el acompañamiento a controles y terapias puede incluirse en el plan, por horas o dentro del turno, con el transporte que disponga la familia.
  - **¿Cómo ayudan a mi familiar a ir al baño si no puede apoyar la pierna operada?** La cuidadora asiste cada traslado con las ayudas indicadas (caminador, silla o pato), siguiendo las restricciones de apoyo que dio el ortopedista.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [guía de cuidados después de una cirugía](/blog/cuidados-postoperatorios-en-casa/); [personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [acompañamiento en la clínica](/servicios/acompanamiento-hospitalario/); [tarifas](/precios/); [clínicas del norte donde acompañamos](/zonas/)
- **CTA:** Organiza el regreso a casa

#### `/servicios/cuidado-alzheimer-demencia/`

- **Tipo:** servicio-necesidad · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (56):** Cuidadora para personas con Alzheimer o demencia, Bogotá
- **Meta (155):** Cuidadoras con experiencia en demencia: rutinas estables, prevención de caídas y de salidas sin compañía, y calma en los momentos de agitación. Cotiza hoy.
- **H1:** Cuidado en casa para personas con Alzheimer y otras demencias
- **Keyword principal:** cuidadores alzheimer a domicilio (10)
- **Secundarias:** cuidadores de adultos mayores con alzheimer (10); cuidadores personas con alzheimer (10); cuidadoras de personas con alzheimer (10); cuidado de personas mayores con alzheimer (10); cuidadora para persona con demencia (s/d); cuidado de adulto mayor con demencia (s/d)
- **Volumen del grupo:** 40 · **Intención:** transaccional
- **H2:** Cuidado según la etapa de la demencia / Rutina, seguridad y comunicación en casa / Cómo preparamos a la cuidadora para tu familiar / Tardes difíciles, insomnio y deambulación / Turnos recomendados según la etapa / Apoyo para la familia que cuida / Preguntas frecuentes sobre el cuidado en demencia
- **FAQ:**
  - **¿Las cuidadoras tienen experiencia con demencia?** Para estos servicios presentamos personas con experiencia previa en demencia y les compartimos la historia de vida, rutinas y gustos de tu familiar antes del primer turno.
  - **¿Qué hace la cuidadora si mi familiar quiere salir solo de la casa?** Lo acompaña y redirige con calma, sin forzarlo ni encerrarlo: la contención física no está permitida. Por eso acordamos con la familia medidas de seguridad en puertas y una ruta de aviso.
  - **¿Cómo manejan la agitación al final de la tarde?** Con rutinas predecibles, buena luz, actividades tranquilas y menos estímulos al atardecer. Si la agitación es nueva o muy intensa, avisamos a la familia para que consulte al médico tratante.
  - **¿Por qué es importante que cambie poco el personal en casos de demencia?** Porque los cambios de rostro y de rutina pueden aumentar la confusión; por eso procuramos un grupo pequeño y estable de personas y hacemos empalme cuando hay reemplazos.
  - **¿Atienden a personas con párkinson u otras enfermedades neurológicas?** Sí, damos cuidado básico y compañía a personas con párkinson y otras condiciones neurológicas, siguiendo las indicaciones de su equipo médico.
  - **¿Necesito un diagnóstico para contratar el servicio?** No es obligatorio. Si tu familiar tiene diagnóstico o recomendaciones médicas, compartirlas de forma voluntaria nos ayuda a preparar mejor el cuidado.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [guía para cuidar en casa a una persona con Alzheimer](/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/); [noches con cuidadora](/servicios/cuidado-nocturno/); [cobertura 24 horas](/servicios/cuidado-24-horas/); [tarifas](/precios/); [actividades adaptadas](/blog/actividades-para-adultos-mayores/)
- **CTA:** Habla con una coordinadora sobre tu caso

#### `/servicios/respiro-familiar/`

- **Tipo:** servicio-necesidad · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (55):** Respiro para cuidadores familiares en Bogotá | Sovialis
- **Meta (148):** Toma un descanso sin dejar solo a tu familiar: una cuidadora verificada te releva unas horas, unas noches o varios días mientras descansas o viajas.
- **H1:** Respiro familiar: descansa mientras cuidamos a tu familiar
- **Keyword principal:** respiro para cuidadores familiares (s/d) — Sin volumen medible; publicar cuando GSC muestre impresiones de «descanso/respiro del cuidador».
- **Secundarias:** descanso del cuidador familiar (s/d); relevo del cuidador (s/d); servicio de respiro familiar (s/d); vacaciones del cuidador familiar (s/d)
- **Volumen del grupo:** 0 · **Intención:** transaccional
- **H2:** Qué es el respiro familiar y para quién es / Opciones: unas horas, noches o varios días / Cómo preparamos el relevo con tu familiar / Qué dejar listo antes de descansar / Tarifas de referencia / Preguntas frecuentes sobre el respiro familiar
- **FAQ:**
  - **¿Qué es un servicio de respiro para cuidadores familiares?** Es un relevo temporal: una cuidadora asume el cuidado de tu familiar durante unas horas, noches o días para que tú descanses, viajes o atiendas tus asuntos.
  - **¿Cómo preparo a mi familiar para aceptar a una persona nueva en casa?** Cuéntale con anticipación quién vendrá y por qué, hagan juntos la primera presentación y empieza con relevos cortos mientras tú sigues en casa.
  - **¿Qué información debo dejar por escrito antes de tomar unos días de descanso?** Rutinas, medicamentos organizados por dosis, contactos de familia y EPS, preferencias de comida y sueño, y a quién llamar para decisiones urgentes.
  - **¿Cada cuánto debería tomar un respiro como cuidador familiar?** No hay una regla fija; lo recomendable es tener descansos cortos todas las semanas y algunos días seguidos cada cierto tiempo, antes de llegar al agotamiento.
  - **¿El respiro puede ser en la noche para que yo duerma?** Sí. Muchas familias usan noches de cuidado para recuperar el sueño: la cuidadora se encarga de las idas al baño y de los cambios de posición mientras descansas.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cómo evitar el agotamiento del cuidador](/blog/cuidar-al-cuidador/); [cuidado por horas](/servicios/cuidado-por-horas/); [noches de cuidado](/servicios/cuidado-nocturno/); [tarifas](/precios/)
- **CTA:** Reserva tu respiro

#### `/servicios/cuidado-personas-dependientes/`

- **Tipo:** servicio-necesidad · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (54):** Cuidado de personas dependientes o encamadas en Bogotá
- **Meta (149):** Cuidado básico para dependencia alta: higiene en cama, cambios de posición, alimentación asistida y compañía, con personal con formación de auxiliar.
- **H1:** Cuidado en casa para personas dependientes o encamadas
- **Keyword principal:** ayuda a domicilio para personas dependientes (10)
- **Secundarias:** cuidador de personas dependientes (10); cuidado de dependientes (10); cuidadores profesionales de personas dependientes (10); cuidadores de enfermos a domicilio (10); cuidadores de pacientes (10); cuidadora para paciente encamado (s/d)
- **Volumen del grupo:** 60 · **Intención:** transaccional
- **H2:** Cuidado básico para personas con dependencia alta / Movilización segura y cambios de posición / Higiene en cama y cuidado de la piel / Alimentación asistida e hidratación / Qué corresponde a la EPS o a una IPS / Turnos recomendados y tarifas / Preguntas frecuentes sobre el cuidado de personas dependientes
- **FAQ:**
  - **¿Atienden a personas que pasan la mayor parte del día en cama?** Sí, con cuidado básico: higiene, cambios de posición, alimentación asistida y compañía. Los procedimientos de salud los hace la EPS o una IPS.
  - **¿Cómo se moviliza a una persona dependiente sin lastimarla ni lastimarse?** Con técnicas de movilización segura, ayudas como la sábana deslizante o la grúa cuando se necesitan, y nunca a la fuerza; por eso para dependencia alta sugerimos personal con formación de auxiliar.
  - **¿Pueden atender a una persona con secuelas de un ACV?** Sí: apoyamos rutinas, movilidad y comunicación según las indicaciones de su equipo de rehabilitación, sin reemplazar las terapias.
  - **¿Se puede dejar sola por ratos a una persona con dependencia alta?** No es recomendable: necesita a alguien atento para cambios de posición, hidratación y emergencias; por eso suele requerir turnos completos o cuidado continuo.
  - **¿Cómo se lleva el registro de lo que pasa en cada turno?** En una bitácora de cuidado —que no es historia clínica— con comidas, deposiciones, cambios de posición, ánimo y novedades, que la familia puede consultar.
- **Schema:** Service, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [guía de cuidados de un paciente encamado](/blog/cuidados-paciente-encamado/); [cuidado continuo](/servicios/cuidado-24-horas/); [tarifas](/precios/)
- **CTA:** Cotiza cuidado para dependencia alta

### 8.2 Conversión, empresa y utilidad

#### `/precios/`

- **Tipo:** precios · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (53):** Precios 2026 del cuidado de adultos mayores en Bogotá
- **Meta (151):** Tarifas finales: cuidadora desde $20.000 la hora y $160.000 el turno de 12 h de día; auxiliar desde $180.000. Noches, 24 h, fines de semana y festivos.
- **H1:** Precios del cuidado de adultos mayores en casa (2026)
- **Keyword principal:** cuidador de adulto mayor precios (30)
- **Secundarias:** cuánto cobra un cuidador de adulto mayor por hora (20); cuanto cobra una cuidadora de adulto mayor (10); cuanto cobra un cuidador de adulto mayor (10); cuanto cobra una persona por cuidar un adulto mayor (10); precio cuidadora interna 24 horas (10); auxiliar de enfermería precio (10); precio acompañamiento hospitalario (10); cuanto cobra una cuidadora de ancianos por dia (10); cuanto cobran por cuidar a un adulto mayor (10); cuanto se cobra la noche para cuidar ancianos (10)
- **Volumen del grupo:** 130 · **Intención:** comercial / transaccional (precio)
- **H2:** Tabla de tarifas por perfil y modalidad / Tarifas de sábados, domingos y festivos / Qué incluye el precio / Calcula tu cotización / Formas de pago, cancelaciones y reemplazos / Lo que no está incluido: procedimientos de salud / Preguntas frecuentes sobre precios
- **FAQ:**
  - **¿Cuánto cobra una cuidadora de adulto mayor por hora en Bogotá?** En Sovialis, desde $20.000 por hora entre semana, con un mínimo de 4 horas por servicio (desde $80.000 por visita). Sábados, domingos y festivos, desde $22.000 por hora.
  - **¿Cuánto cuesta un turno de 12 horas de cuidadora?** Desde $160.000 de día y $190.000 de noche entre semana; los sábados, domingos y festivos, desde $170.000 y $200.000.
  - **¿Cuánto cuesta el cuidado 24 horas?** Desde $300.000 por día con cuidadora y desde $340.000 con personal con formación de auxiliar de enfermería; sábados, domingos y festivos, desde $320.000 y $360.000.
  - **¿Cuánto cuesta el perfil con formación de auxiliar de enfermería?** Entre semana, desde $25.000 por hora, $135.000 por 8 horas y $180.000 por 12 horas de día; de noche, desde $155.000 (8 h) y $215.000 (12 h).
  - **¿Por qué el turno de noche y los festivos cuestan más?** Porque cubrir noches, fines de semana y festivos exige pagar más al personal y es más difícil de programar. La diferencia aparece en la tabla y en tu cotización antes de aceptar.
  - **¿Los precios incluyen IVA?** Sí, son precios finales: el valor publicado ya incluye los impuestos que apliquen, y la cotización muestra el desglose.
  - **¿Cobran por cancelar un servicio?** Puedes cancelar sin costo con 24 horas de anticipación; si cancelas después, se cobra el 50 % del servicio, salvo hospitalización, fallecimiento o fuerza mayor.
- **Schema:** WebPage, OfferCatalog, BreadcrumbList, FAQPage
- **Enlaces internos:** [qué hace la cuidadora](/servicios/cuidadora-adulto-mayor/); [perfil con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [cuidado 24 horas](/servicios/cuidado-24-horas/); [servicio por horas](/servicios/cuidado-por-horas/); [pagos y contrato](/como-funciona/); [¿y si necesito enfermería?](/blog/cuanto-cobra-una-enfermera-a-domicilio/)
- **CTA:** Calcula y cotiza (calculadora + WhatsApp)
- **Notas:** Precios = TARIFARIO_DEFAULT de herramienta/src/lib/calc/tarifas.ts (preciosIncluyenIva=true). La web debe leerlos del panel en build para no desincronizarse (Ley 1480 art. 23 y 26). Confirmar IVA con el contador antes de publicar (NOTAS-LEGALES §7.7). Cancelación: valores por defecto del contrato (24 h / 50 %).

#### `/como-funciona/`

- **Tipo:** proceso · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (53):** Cómo funciona Sovialis: selección, plan y seguimiento
- **Meta (155):** Del primer mensaje al primer servicio en cinco pasos: conversación inicial, cotización con precio final, plan de cuidado, persona verificada y seguimiento.
- **H1:** Cómo funciona el servicio de Sovialis
- **Keyword principal:** proceso de selección de cuidadoras (s/d) — Página de conversión sin demanda propia medible; apoya la confianza (E-E-A-T) y responde objeciones.
- **Secundarias:** verificación de antecedentes de cuidadoras (s/d); reemplazo de cuidadora (s/d); contrato de servicio de cuidado a domicilio (s/d); seguimiento del servicio de cuidado (s/d)
- **Volumen del grupo:** 0 · **Intención:** comercial (confianza / objeciones)
- **H2:** 1. Nos cuentas qué necesita tu familiar / 2. Te enviamos una cotización con precio final / 3. Acordamos el plan de cuidado / 4. Presentamos a la persona verificada / 5. Seguimiento del servicio y reemplazos / Contrato, pagos y cancelaciones en lenguaje claro / Tus datos y los de tu familiar / Preguntas frecuentes sobre el proceso
- **FAQ:**
  - **¿Quién define el plan de cuidado en Sovialis?** Lo definimos con la familia y, cuando puede, con la propia persona mayor: rutinas, tareas, horarios y contactos. Ese plan guía cada servicio.
  - **¿La familia puede dar instrucciones directamente al personal?** Las indicaciones del día a día se incorporan al plan de cuidado. Si algo cambia, avísanos para actualizarlo y que todas las personas que cuidan a tu familiar lo sigan igual.
  - **¿Qué documento firmo al contratar?** Un contrato de prestación de servicios con un anexo de precios, cancelaciones y plazos de reemplazo, que puedes firmar de forma electrónica; las programaciones posteriores se aceptan por WhatsApp o correo.
  - **¿Tengo derecho a retracto si contrato a distancia?** Sí: tienes 5 días hábiles para retractarte, salvo que el servicio ya haya comenzado con tu acuerdo; el dinero se devuelve dentro de los 15 días calendario siguientes.
  - **¿Qué pasa si necesito cambiar el horario del servicio?** Avísanos con la mayor anticipación posible: confirmamos la disponibilidad del personal y actualizamos la programación. Los cambios con menos de 24 horas pueden contar como cancelación tardía.
  - **¿Qué datos de salud de mi familiar necesitan?** Solo los que decidas compartir: los datos de salud son sensibles y de entrega voluntaria, y ningún servicio se condiciona a que los entregues.
- **Schema:** WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tarifas](/precios/); [servicios](/servicios/); [términos y condiciones](/terminos-y-condiciones/); [política de tratamiento de datos](/politica-de-tratamiento-de-datos/); [canal de PQRS](/contacto/); [quiénes somos](/nosotros/)
- **CTA:** Empieza con una conversación (WhatsApp o llamada)
- **Notas:** Decreto 0581: hablar de «seguimiento del servicio» y «coordinación», nunca de «supervisar a la cuidadora», «asignar turnos» ni «nuestras empleadas».

#### `/nosotros/`

- **Tipo:** empresa · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (46):** Quiénes somos: Sovialis, vínculos que protegen
- **Meta (154):** Conoce a Sovialis: empresa bogotana de cuidado no sanitario a domicilio para personas mayores. Equipo, cómo trabajamos, compromisos y datos de la empresa.
- **H1:** Sovialis: vínculos que protegen
- **Keyword principal:** sovialis (s/d) — Marca nueva: la demanda de marca aparecerá con la ficha de Google Business y la publicidad.
- **Secundarias:** sovialis bogotá (s/d); sovialis opiniones (s/d); quiénes somos sovialis (s/d); empresa sovialis (s/d)
- **Volumen del grupo:** 0 · **Intención:** navegacional (marca) / confianza
- **H2:** Por qué existe Sovialis / Lo que hacemos y lo que no hacemos / Cómo seleccionamos y acompañamos al personal / Equipo de coordinación / Nuestros compromisos con las familias / Datos de la empresa / Preguntas frecuentes sobre Sovialis
- **FAQ:**
  - **¿Quién está detrás de Sovialis?** Sovialis es una empresa bogotana con un equipo de coordinación que acompaña a las familias y al personal; en esta página encuentras sus nombres, su formación y cómo contactarlos.
  - **¿Sovialis es una IPS?** No. Sovialis no está habilitada como Institución Prestadora de Servicios de Salud: presta cuidado no sanitario y orienta a las familias hacia su EPS o una IPS cuando necesitan servicios de salud.
  - **¿Qué significa «Vínculos que protegen»?** Es nuestro lema: creemos que el buen cuidado nace de una relación de confianza entre la persona mayor, su familia y quien la cuida.
  - **¿Dónde están ubicados?** Nuestra oficina está en [dirección por confirmar], Bogotá. La mayoría de los servicios se coordinan por teléfono o WhatsApp y se prestan en la casa de cada familia.
  - **¿Cómo puedo verificar que Sovialis es una empresa legalmente constituida?** Puedes consultar nuestro NIT [por confirmar] en el Registro Único Empresarial y Social (RUES) de las cámaras de comercio.
- **Schema:** AboutPage, Organization, Person, BreadcrumbList, FAQPage
- **Enlaces internos:** [cómo trabajamos](/como-funciona/); [servicios](/servicios/); [coordinación asistencial](/autores/nombre-apellido/); [únete al equipo de cuidadoras](/trabaja-con-nosotros/); [contacto](/contacto/)
- **CTA:** Conversa con la coordinación
- **Notas:** NAP y NIT reales pendientes (los del panel son de EJEMPLO hasta que JP marque «verificada»). No inventar testimonios ni pólizas.

#### `/trabaja-con-nosotros/`

- **Tipo:** reclutamiento · **Prioridad:** v1 · **Menú:** footer · **Indexación:** index
- **Title (54):** Trabaja como cuidadora o auxiliar en Bogotá | Sovialis
- **Meta (144):** ¿Eres cuidadora o auxiliar de enfermería? Publica tu disponibilidad, elige los servicios que aceptas y recibe honorarios por servicio en Bogotá.
- **H1:** Trabaja con Sovialis como cuidadora o auxiliar de enfermería
- **Keyword principal:** busco trabajo como cuidadora de adulto mayor (210)
- **Secundarias:** trabajo como cuidadora de adulto mayor (70); trabajo de cuidadora de adulto mayor (70); trabajos de cuidadora de adulto mayor en casa particular (70); trabajo auxiliar de enfermeria bogota (260); empleo de auxiliar de enfermeria bogota (390); auxiliar de enfermería turno noche bogotá (20); auxiliar de enfermería medio tiempo bogotá (20); hoja de vida cuidadora de adulto mayor (10); se necesita cuidador de adulto mayor (10)
- **Volumen del grupo:** 1130 · **Intención:** empleo (reclutamiento de contratistas)
- **H2:** Cómo funciona: tú publicas tu disponibilidad y eliges / Requisitos y documentos / Proceso de verificación / Honorarios y pagos por servicio / Seguridad social, ARL y elementos de protección / Postúlate / Preguntas frecuentes para cuidadoras y auxiliares
- **FAQ:**
  - **¿Qué requisitos necesito para prestar servicios con Sovialis?** Documento de identidad, experiencia en cuidado de personas, referencias verificables, autorización para consultar antecedentes, afiliación a seguridad social como independiente y, para el perfil auxiliar, título y registro ReTHUS.
  - **¿Puedo elegir los días y las zonas en que presto servicios?** Sí. Publicas tu disponibilidad (días, horas y localidades), recibes solicitudes y decides cuáles aceptas, sin penalidad por rechazar.
  - **¿Cómo se pagan los honorarios?** Por servicio prestado, contra cuenta de cobro y el soporte de pago de seguridad social (PILA), en los plazos del contrato.
  - **¿Quién me afilia a la ARL?** Sovialis hace la afiliación a la ARL, como exige la ley para contratistas; quién paga el aporte depende de la clase de riesgo según la norma.
  - **¿Necesito experiencia para empezar?** Valoramos la experiencia previa en cuidado de personas y la formación en cuidado del adulto mayor o en primeros auxilios; cuéntanos tu trayectoria al postularte.
  - **¿Puedo trabajar también con otras agencias o familias?** Sí. No pedimos exclusividad; solo te pedimos no atender directamente a las familias que conociste por Sovialis durante el tiempo pactado.
- **Schema:** WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [conoce a Sovialis](/nosotros/); [tratamiento de tus datos](/politica-de-tratamiento-de-datos/); [zonas donde hay solicitudes](/zonas/)
- **CTA:** Postúlate (formulario con autorización de datos)
- **Notas:** LEGAL (protocolo §8, punto 14): usar «contratista», «servicio», «honorarios», «solicitud», «disponibilidad». Nunca «empleo», «salario», «jornada», «turno asignado», «jefe», «dotación». Sin JobPosting en v1. Si el modelo pasa a laboral para turnos continuos, reescribir la página.

#### `/contacto/`

- **Tipo:** contacto · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (34):** Contacto y cotizaciones | Sovialis
- **Meta (139):** Escríbenos por WhatsApp, llámanos o usa el formulario para cotizar el cuidado de tu familiar en el norte de Bogotá. También recibimos PQRS.
- **H1:** Contacto y cotizaciones
- **Keyword principal:** sovialis teléfono (s/d)
- **Secundarias:** sovialis contacto (s/d); sovialis whatsapp (s/d); sovialis dirección (s/d); cotización cuidadora bogotá (s/d)
- **Volumen del grupo:** 0 · **Intención:** navegacional / transaccional
- **H2:** Escríbenos por WhatsApp / Formulario de cotización / Teléfono, correo y horario de atención / Dirección y zonas de servicio / Peticiones, quejas, reclamos y sugerencias (PQRS) / Preguntas frecuentes sobre el contacto
- **FAQ:**
  - **¿En qué horario responden?** Respondemos en [horario de atención por confirmar]; fuera de ese horario deja tu mensaje y te contactamos en cuanto abramos.
  - **¿Qué información necesitan para cotizar?** La zona o dirección aproximada, el tipo de ayuda que necesita tu familiar, los días y horarios y la fecha de inicio; con eso te enviamos una cotización con precio final.
  - **¿Puedo pedir la cotización para el cuidado de otra persona?** Sí, es común que un hijo o una hija contrate para su papá o su mamá: quien firma el contrato se obliga a pagar y la persona cuidada es la beneficiaria.
  - **¿Cómo radico una PQRS?** Por el formulario de PQRS de esta página o por correo; acusamos recibo en 2 días hábiles y respondemos en máximo 15 días hábiles.
  - **¿Comparten mis datos con terceros?** Solo con encargados necesarios para prestar el servicio, como el alojamiento de la información, y bajo nuestra política de tratamiento de datos. No vendemos tus datos.
- **Schema:** ContactPage, LocalBusiness, BreadcrumbList, FAQPage
- **Enlaces internos:** [consulta las tarifas](/precios/); [zonas de servicio](/zonas/); [política de tratamiento de datos](/politica-de-tratamiento-de-datos/); [qué pasa después de escribirnos](/como-funciona/)
- **CTA:** Enviar solicitud / abrir WhatsApp

#### `/autores/nombre-apellido/`

- **Tipo:** autor · **Prioridad:** v1 · **Menú:** none · **Indexación:** index
- **Title (54):** [Nombre Apellido], coordinación asistencial | Sovialis
- **Meta (149):** Perfil de [Nombre Apellido], [profesión, p. ej., enfermera profesional, ReTHUS n.º …], responsable de la revisión editorial de las guías de Sovialis.
- **H1:** [Nombre Apellido]
- **Keyword principal:** [nombre apellido] sovialis (s/d)
- **Volumen del grupo:** 0 · **Intención:** navegacional / E-E-A-T
- **H2:** Formación y registro profesional / Experiencia en cuidado de personas mayores / Qué revisa en las guías de Sovialis / Guías escritas o revisadas / Contacto profesional
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Schema:** ProfilePage, Person, BreadcrumbList
- **Enlaces internos:** [guías](/blog/); [equipo de Sovialis](/nosotros/)
- **CTA:** Ninguno
- **Notas:** PLACEHOLDER: solo publicar con una persona real y verificable (título, ReTHUS si aplica, LinkedIn). Su rol es revisión editorial; no presentarla como «supervisión de enfermería» del servicio.

#### `/gracias/`

- **Tipo:** utilidad · **Prioridad:** v1 · **Menú:** none · **Indexación:** noindex
- **Title (42):** Gracias, recibimos tu solicitud | Sovialis
- **Meta (74):** Recibimos tu solicitud. Te contactaremos pronto por el canal que elegiste.
- **H1:** Gracias, recibimos tu solicitud
- **Keyword principal:** — (s/d)
- **Volumen del grupo:** 0 · **Intención:** utilidad (conversión, noindex)
- **H2:** Qué pasa ahora / Mientras tanto: guías útiles
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Enlaces internos:** [cómo funciona](/como-funciona/); [guías](/blog/)
- **CTA:** Abrir WhatsApp
- **Notas:** noindex,follow; no se incluye en el sitemap. Dispara la conversión de GA4/Ads.

#### `/404/`

- **Tipo:** utilidad · **Prioridad:** v1 · **Menú:** none · **Indexación:** noindex
- **Title (31):** Página no encontrada | Sovialis
- **Meta (53):** La página que buscas no existe o cambió de dirección.
- **H1:** No encontramos esta página
- **Keyword principal:** — (s/d)
- **Volumen del grupo:** 0 · **Intención:** utilidad (404 real)
- **H2:** Servicios / Zonas / Guías
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Enlaces internos:** [inicio](/); [servicios](/servicios/); [zonas](/zonas/); [guías](/blog/)
- **CTA:** Volver al inicio
- **Notas:** Debe responder con estado HTTP 404 (src/pages/404.astro).

### 8.3 Zonas

#### `/zonas/`

- **Tipo:** hub-zonas · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (57):** Cuidado del adulto mayor en el norte de Bogotá | Sovialis
- **Meta (152):** Atendemos Usaquén, Chapinero, Suba y barrios como Cedritos, el Chicó y Niza. Revisa la cobertura de tu barrio y las clínicas cercanas donde acompañamos.
- **H1:** Zonas de cobertura en el norte de Bogotá
- **Keyword principal:** cuidado adulto mayor norte de bogotá (s/d) — Sin volumen medible para «cuidado/cuidadora + norte»; demanda proxy: «hogares geriátricos bogotá norte» 70 + «hogares geriátricos en el norte de bogotá» 50.
- **Secundarias:** cuidado de personas mayores zona norte (0); cuidadora domiciliaria zona norte (0); cuidadora zona norte (0); cuidado de ancianos cerca de mi (10); cuidado de personas mayores cerca de mi (10); cuidador de ancianos cerca de mi (10); hogares geriátricos bogotá norte (70); hogares geriatricos en el norte de bogota (50)
- **Volumen del grupo:** 100 · **Intención:** transaccional local
- **H2:** Localidades y barrios donde atendemos / Mapa de cobertura / Clínicas y hospitales de referencia en el norte de Bogotá / Cómo confirmamos la cobertura de tu dirección / ¿Hogar geriátrico en el norte o cuidado en casa? / Preguntas frecuentes sobre la cobertura
- **FAQ:**
  - **¿Cómo sé si mi dirección está dentro de la cobertura?** Escríbenos la dirección o el barrio al cotizar; confirmamos si hay personal disponible en la zona y en el horario que necesitas antes de enviarte la cotización.
  - **¿Cobran recargo por desplazamiento?** Dentro de las zonas de cobertura no cobramos recargo por desplazamiento; si tu dirección está fuera, te lo decimos antes de cotizar.
  - **¿Atienden en La Calera y otros municipios de la Sabana?** Según la disponibilidad de personal, podemos atender algunos servicios en municipios cercanos; consúltanos con la dirección exacta.
  - **¿Pueden llegar a conjuntos con portería que exigen registro previo?** Sí. Danos con anticipación los datos que pide la administración y registramos a la persona que cuidará a tu familiar para que su ingreso sea ágil.
  - **¿Por qué se enfocan en el norte de Bogotá?** Concentrar el servicio en el norte y el noroccidente nos permite llegar más rápido, organizar reemplazos con agilidad y contar con personal que conoce las clínicas de la zona.
- **Schema:** CollectionPage, ItemList, Service, BreadcrumbList, FAQPage
- **Enlaces internos:** [Usaquén](/zonas/usaquen/); [Cedritos](/zonas/usaquen/cedritos/); [Chapinero](/zonas/chapinero/); [El Chicó](/zonas/chapinero/chico/); [Suba](/zonas/suba/); [Niza](/zonas/suba/niza/); [acompañamiento en clínicas del norte](/servicios/acompanamiento-hospitalario/); [hogar geriátrico o cuidado en casa](/blog/hogar-geriatrico-o-cuidado-en-casa/); [tarifas](/precios/)
- **CTA:** Consulta la cobertura de tu dirección

#### `/zonas/usaquen/`

- **Tipo:** zona · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (54):** Cuidado del adulto mayor en Usaquén, Bogotá | Sovialis
- **Meta (145):** Cuidadoras y personal con formación de auxiliar en Usaquén, Santa Ana, La Calleja y el Country: día, noche, 24 h y acompañamiento en la Santa Fe.
- **H1:** Cuidado del adulto mayor a domicilio en Usaquén
- **Keyword principal:** cuidado adulto mayor usaquén (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Usaquén». Demanda proxy de la zona: «hogares geriatricos usaquen» 10.
- **Secundarias:** cuidadora usaquén (s/d); cuidadora de adulto mayor usaquén (s/d); cuidado de ancianos en usaquén (s/d); cuidado adulto mayor santa ana (s/d); cuidado adulto mayor la calleja (s/d)
- **Volumen del grupo:** 0 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Usaquén / Barrios de Usaquén donde atendemos / Clínicas y hospitales de referencia cerca de Usaquén / Vivienda y seguridad en casa en Usaquén / Servicios disponibles en Usaquén / ¿Hogar geriátrico en Usaquén o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Usaquén
- **FAQ:**
  - **¿Atienden en Santa Ana, La Calleja y el Country?** Sí, hacen parte de nuestra cobertura en Usaquén; al cotizar confirmamos la disponibilidad de personal para tu dirección y horario.
  - **¿Pueden acompañar a mi familiar a la Fundación Santa Fe o a la Clínica Reina Sofía?** Sí, acompañamos citas y hospitalizaciones en las clínicas de Usaquén, siempre bajo las normas de acompañantes de cada institución. Sovialis no tiene vínculo con ellas.
  - **¿La cuidadora puede acompañar a mi familiar al mercado de pulgas de Usaquén?** Sí, como salida acompañada si tu familiar camina con seguridad: elegimos horarios con menos gente, hacemos pausas y prevemos el regreso en taxi si se cansa.
  - **¿Cómo manejan las casas con escaleras o pendientes cerca de los cerros?** Revisamos contigo los puntos de riesgo (escaleras, desniveles, baño sin barras) y la cuidadora asiste cada desplazamiento; si hace falta, sugerimos adaptaciones sencillas antes de empezar.
  - **¿Cubren Toberín y los barrios cercanos a la Calle 170?** Sí, también atendemos Toberín y los sectores cercanos a la Calle 170; consulta tu dirección para confirmar la disponibilidad.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [Cedritos](/zonas/usaquen/cedritos/); [El Chicó](/zonas/chapinero/chico/); [cuidadora en Usaquén](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Fundación Santa Fe de Bogotá](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Usaquén
- **Bloques locales:** clínicas de referencia: la Fundación Santa Fe de Bogotá, la Clínica Reina Sofía, LaCardio (Fundación Cardioinfantil), el Hospital Simón Bolívar. Vivienda: Edificios con portería y conjuntos; casas en el sector fundacional y en Santa Ana, con pendientes hacia los cerros. Recursos: Plaza fundacional y mercado de pulgas dominical de Usaquén; parques de barrio; ciclovía de la Carrera 7 los domingos. Vías: Carrera 7, Carrera 9, Autopista Norte, Calle 116 y Calle 127; TransMilenio por la Autopista Norte.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/usaquen/cedritos/`

- **Tipo:** zona · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (47):** Cuidado del adulto mayor en Cedritos | Sovialis
- **Meta (154):** Cuidadoras verificadas en Cedritos (Cedro Golf, Cedro Bolívar, Nueva Autopista): por horas, turnos de día o noche, 24 h y acompañamiento a la Reina Sofía.
- **H1:** Cuidado del adulto mayor a domicilio en Cedritos
- **Keyword principal:** cuidado adulto mayor cedritos (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Cedritos». Demanda proxy de la zona: «hogares geriatricos cedritos» 30 · «hogar geriátrico cedritos» 30 · «hogares geriátricos en cedritos bogotá» 20.
- **Secundarias:** cuidadora cedritos (s/d); cuidadora de adulto mayor cedritos (s/d); cuidado de ancianos en cedritos (s/d); cuidado adulto mayor cedro golf (s/d); cuidado adulto mayor cedro bolívar (s/d); hogares geriatricos cedritos (30); hogar geriátrico cedritos (30); hogares geriátricos en cedritos bogotá (20)
- **Volumen del grupo:** 50 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Cedritos / Barrios de Cedritos donde atendemos / Clínicas y hospitales de referencia cerca de Cedritos / Vivienda y seguridad en casa en Cedritos / Servicios disponibles en Cedritos / ¿Hogar geriátrico en Cedritos o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Cedritos
- **FAQ:**
  - **¿Atienden en todos los sectores de Cedritos?** Sí: Cedro Golf, Cedro Bolívar, Cedro Narváez, Nueva Autopista y alrededores. Confirmamos tu dirección exacta al cotizar.
  - **¿Qué clínicas quedan cerca de Cedritos para acompañar citas?** Las de referencia son la Clínica Reina Sofía, LaCardio y la Fundación Santa Fe; acompañamos citas y hospitalizaciones allí según las normas de cada institución.
  - **¿Pueden cuidar a mi familiar en un edificio sin ascensor?** Sí. Si tu familiar sube escaleras, la cuidadora lo asiste en cada tramo; si ya no puede hacerlo con seguridad, planeamos salidas y citas para reducir subidas y bajadas.
  - **¿Una cuidadora puede llegar a Cedritos para un turno de las 6:00 a. m.?** Sí, siempre que haya personal con disponibilidad para ese horario; al cotizar confirmamos la hora de llegada y quién cubre el relevo.
  - **¿Pueden recoger a mi familiar en un centro día de la zona?** Sí. Combinamos el centro día con horas de cuidado en casa y el traslado de ida o de regreso, en el transporte que disponga la familia.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [cuidado en Usaquén](/zonas/usaquen/); [Niza](/zonas/suba/niza/); [cuidadora en Cedritos](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Clínica Reina Sofía](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Cedritos
- **Bloques locales:** clínicas de referencia: la Clínica Reina Sofía, LaCardio (Fundación Cardioinfantil), la Fundación Santa Fe de Bogotá. Vivienda: Edificios de apartamentos de varios pisos, no todos con ascensor, y conjuntos cerrados. Recursos: Zona comercial de las calles 140 y 147; parques de barrio. Vías: Calle 140, Calle 147, Avenida 19 y Autopista Norte.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/chapinero/`

- **Tipo:** zona · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (56):** Cuidado del adulto mayor en Chapinero, Bogotá | Sovialis
- **Meta (145):** Cuidadoras en Chapinero, Rosales, Chapinero Alto y Quinta Camacho: compañía, turnos de día o noche y acompañamiento en el San Ignacio o la Marly.
- **H1:** Cuidado del adulto mayor a domicilio en Chapinero
- **Keyword principal:** cuidado adulto mayor chapinero (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Chapinero». Demanda proxy de la zona: «hogar geriatrico chapinero» 10.
- **Secundarias:** cuidadora chapinero (s/d); cuidadora de adulto mayor chapinero (s/d); cuidado de ancianos en chapinero (s/d); cuidado adulto mayor chapinero alto (s/d); cuidado adulto mayor rosales (s/d)
- **Volumen del grupo:** 0 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Chapinero / Barrios de Chapinero donde atendemos / Clínicas y hospitales de referencia cerca de Chapinero / Vivienda y seguridad en casa en Chapinero / Servicios disponibles en Chapinero / ¿Hogar geriátrico en Chapinero o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Chapinero
- **FAQ:**
  - **¿Atienden en Rosales, Chapinero Alto y Quinta Camacho?** Sí, junto con El Retiro, La Cabrera, El Nogal y los barrios cercanos de Chapinero; al cotizar confirmamos tu dirección.
  - **¿Pueden acompañar hospitalizaciones en el Hospital San Ignacio o la Clínica Marly?** Sí, con turnos de día o de noche, siempre según las normas de acompañantes de cada institución.
  - **¿Cómo manejan las calles empinadas de Chapinero Alto en las salidas?** Planeamos salidas por rutas con menos pendiente o en taxi, y la cuidadora acompaña de cerca a tu familiar en andenes y escaleras.
  - **¿Pueden cuidar a un adulto mayor que vive solo en un apartamento de Chapinero?** Sí. Para personas que viven solas acordamos visitas por horas o turnos, un contacto de emergencia en la familia y un reporte después de cada servicio.
  - **¿La cuidadora puede acompañar a mi familiar a misa o a actividades del barrio?** Sí, las salidas a actividades sociales o religiosas hacen parte del plan si tu familiar quiere y puede hacerlas con seguridad.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [El Chicó](/zonas/chapinero/chico/); [Usaquén](/zonas/usaquen/); [cuidadora en Chapinero](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en el Hospital Universitario San Ignacio](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Chapinero
- **Bloques locales:** clínicas de referencia: el Hospital Universitario San Ignacio, la Clínica Marly, la Clínica del Country. Vivienda: Apartamentos en edificios de distintas épocas; en Chapinero Alto y Rosales, calles en pendiente y escaleras. Recursos: Ciclovía de la Carrera 7 los domingos; parques de bolsillo; zona gastronómica de Quinta Camacho. Vías: Carrera 7, Carrera 11, Avenida Caracas y Calle 72; TransMilenio por la Caracas.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/chapinero/chico/`

- **Tipo:** zona · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (55):** Cuidado del adulto mayor en el Chicó, Bogotá | Sovialis
- **Meta (151):** Cuidadoras verificadas en el Chicó, Chicó Norte y el Antiguo Country: compañía, turnos de día o noche, 24 h y acompañamiento en la Clínica del Country.
- **H1:** Cuidado del adulto mayor a domicilio en el Chicó
- **Keyword principal:** cuidado adulto mayor chicó (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Chicó». Demanda proxy de la zona: sin búsquedas con el topónimo; prioridad por valor del negocio (estrato alto, clínicas de referencia).
- **Secundarias:** cuidadora chicó (s/d); cuidadora de adulto mayor chicó (s/d); cuidado de ancianos en chicó (s/d); cuidado adulto mayor chicó norte (s/d); cuidado adulto mayor chicó reservado (s/d)
- **Volumen del grupo:** 0 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en el Chicó / Barrios de el Chicó donde atendemos / Clínicas y hospitales de referencia cerca de el Chicó / Vivienda y seguridad en casa en el Chicó / Servicios disponibles en el Chicó / Preguntas frecuentes sobre el cuidado en el Chicó
- **FAQ:**
  - **¿Qué sectores del Chicó cubren?** El Chicó, Chicó Norte, Chicó Reservado, Antiguo Country, Lago Gaitán y El Virrey, entre otros; confirmamos tu dirección al cotizar.
  - **¿Pueden acompañar a mi familiar a la Clínica del Country?** Sí, en citas, exámenes y hospitalizaciones, de día o de noche, según las normas de acompañantes de la clínica.
  - **¿La cuidadora puede acompañar paseos por el Parque El Virrey o el de la 93?** Sí, si tu familiar camina con seguridad: planeamos recorridos cortos, pausas y el regreso a casa según su resistencia y el clima.
  - **¿Pueden coordinarse con el personal de servicio que ya trabaja en la casa?** Sí. Acordamos en el plan qué tareas son de la cuidadora y cuáles del personal doméstico, para que no se crucen funciones.
  - **¿Pueden cuidar a mi familiar mientras viajamos fuera del país?** Sí, con cobertura por turnos o 24 horas, un familiar o persona de contacto en Bogotá para decisiones urgentes y reportes diarios por mensaje.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [cuidado en Chapinero](/zonas/chapinero/); [Usaquén](/zonas/usaquen/); [cuidadora en Chicó](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Clínica del Country](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/)
- **CTA:** Consulta disponibilidad en Chicó
- **Bloques locales:** clínicas de referencia: la Clínica del Country, la Fundación Santa Fe de Bogotá. Vivienda: Apartamentos amplios en edificios con portería y ascensor; personal de servicio doméstico en muchos hogares. Recursos: Parque El Virrey y Parque de la 93 para caminatas cortas. Vías: Carrera 11, Carrera 15, Calle 85, Calle 93 y Autopista Norte.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/suba/`

- **Tipo:** zona · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (51):** Cuidado del adulto mayor en Suba, Bogotá | Sovialis
- **Meta (142):** Cuidadoras en Suba: Pasadena, Puente Largo, La Alhambra, Mazurén y Colina Campestre. Turnos de día o noche, 24 h y acompañamiento en la Shaio.
- **H1:** Cuidado del adulto mayor a domicilio en Suba
- **Keyword principal:** cuidado adulto mayor suba (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Suba». Demanda proxy de la zona: «hogar geriatrico suba» 50 · «hogares geriatricos en suba bogota» 20.
- **Secundarias:** cuidadora suba (s/d); cuidadora de adulto mayor suba (s/d); cuidado de ancianos en suba (s/d); cuidado adulto mayor pasadena (s/d); cuidado adulto mayor puente largo (s/d); hogar geriatrico suba (50); hogares geriatricos en suba bogota (20)
- **Volumen del grupo:** 70 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Suba / Barrios de Suba donde atendemos / Clínicas y hospitales de referencia cerca de Suba / Vivienda y seguridad en casa en Suba / Servicios disponibles en Suba / ¿Hogar geriátrico en Suba o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Suba
- **FAQ:**
  - **¿Atienden en Pasadena, Puente Largo y La Alhambra?** Sí, junto con Batán, Prado Veraniego y otros barrios del oriente de Suba; confirmamos tu dirección al cotizar.
  - **¿Pueden acompañar a mi familiar en la Clínica Shaio?** Sí, en citas, procedimientos ambulatorios y hospitalizaciones, de día o de noche, según las normas de acompañantes de la clínica.
  - **¿Llegan a direcciones de Suba lejos de las vías principales?** En la mayoría de casos sí; para direcciones alejadas de la Avenida Suba o la Avenida Boyacá confirmamos tiempos de llegada y reemplazos antes de cotizar.
  - **¿Acompañan terapias o citas en la Clínica Juan N. Corpas?** Sí, acompañamos el traslado, la espera y la consulta o terapia, con el transporte que disponga la familia.
  - **¿La cobertura incluye Mazurén, Colina Campestre y San José de Bavaria?** Sí, esos sectores hacen parte de nuestra cobertura en Suba; consulta tu dirección para confirmar la disponibilidad de personal.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [Niza](/zonas/suba/niza/); [Usaquén](/zonas/usaquen/); [cuidadora en Suba](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Fundación Clínica Shaio](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Suba
- **Bloques locales:** clínicas de referencia: la Fundación Clínica Shaio, la Clínica La Colina, la Clínica Juan N. Corpas. Vivienda: Conjuntos cerrados de casas y edificios; casas de dos y tres pisos con escaleras internas. Recursos: Parque Mirador de los Nevados; Humedal de Córdoba (ver Niza). Vías: Avenida Suba, Avenida Boyacá, Calle 127 y Avenida Pepe Sierra (Calle 116).
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/suba/niza/`

- **Tipo:** zona · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (49):** Cuidado del adulto mayor en Niza, Suba | Sovialis
- **Meta (138):** Cuidadoras en Niza, Niza Norte, Las Villas y Córdoba: por horas, turnos de día o noche, 24 h y acompañamiento a la Shaio o la Reina Sofía.
- **H1:** Cuidado del adulto mayor a domicilio en Niza
- **Keyword principal:** cuidado adulto mayor niza (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Niza». Demanda proxy de la zona: «hogar geriátrico niza 127» 50 (marca de terceros) · «hogares geriátricos en niza bogotá» 20.
- **Secundarias:** cuidadora niza (s/d); cuidadora de adulto mayor niza (s/d); cuidado de ancianos en niza (s/d); cuidado adulto mayor niza norte (s/d); cuidado adulto mayor niza sur (s/d); hogares geriátricos en niza bogotá (20); hogar geriatrico niza (10)
- **Volumen del grupo:** 30 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Niza / Barrios de Niza donde atendemos / Clínicas y hospitales de referencia cerca de Niza / Vivienda y seguridad en casa en Niza / Servicios disponibles en Niza / ¿Hogar geriátrico en Niza o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Niza
- **FAQ:**
  - **¿Atienden en Niza Norte, Niza Sur y Las Villas?** Sí, además de Córdoba, Lagos de Córdoba y los barrios vecinos; confirmamos tu dirección al cotizar.
  - **¿Pueden acompañar caminatas por el Humedal de Córdoba?** Sí, por senderos aptos para la movilidad de tu familiar, con pausas, hidratación y el regreso planeado.
  - **¿Cómo cuidan a mi familiar si el baño está en el segundo piso de la casa?** La cuidadora asiste cada subida y bajada; si las escaleras ya son un riesgo, proponemos organizar la rutina en un solo piso y adaptaciones como barras o una silla de ducha.
  - **¿Qué hace la cuidadora ante una urgencia en Niza?** Llama al 123, avisa a la familia y a la EPS y acompaña el traslado a la institución que indiquen; tener definida la clínica de preferencia agiliza la decisión.
  - **¿La cuidadora puede acompañar a mi familiar de compras al Bulevar Niza?** Sí, como salida acompañada. La familia define el presupuesto y los pagos los hace tu familiar o un adulto de la familia, no la cuidadora.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [cuidado en Suba](/zonas/suba/); [Cedritos](/zonas/usaquen/cedritos/); [cuidadora en Niza](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Fundación Clínica Shaio](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Niza
- **Bloques locales:** clínicas de referencia: la Fundación Clínica Shaio, la Clínica Reina Sofía, la Clínica La Colina. Vivienda: Casas de dos y tres pisos con escaleras internas y conjuntos cerrados. Recursos: Humedal de Córdoba; centros comerciales Bulevar Niza e Iserra 100. Vías: Avenida Suba, Calle 127, Avenida Boyacá y Avenida Córdoba.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/usaquen/santa-barbara/`

- **Tipo:** zona · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (52):** Cuidado del adulto mayor en Santa Bárbara | Sovialis
- **Meta (148):** Cuidadoras en Santa Bárbara Central, Occidental y Alta: turnos de día o noche, 24 h, apoyo postoperatorio y acompañamiento en la Fundación Santa Fe.
- **H1:** Cuidado del adulto mayor a domicilio en Santa Bárbara
- **Keyword principal:** cuidado adulto mayor santa bárbara (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Santa Bárbara». Demanda proxy de la zona: «hogar geriatrico santa barbara» 110 (marca de terceros).
- **Secundarias:** cuidadora santa bárbara (s/d); cuidadora de adulto mayor santa bárbara (s/d); cuidado de ancianos en santa bárbara (s/d); cuidado adulto mayor santa bárbara central (s/d); cuidado adulto mayor santa bárbara occidental (s/d); hogar geriatrico santa barbara (110)
- **Volumen del grupo:** 110 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Santa Bárbara / Barrios de Santa Bárbara donde atendemos / Clínicas y hospitales de referencia cerca de Santa Bárbara / Vivienda y seguridad en casa en Santa Bárbara / Servicios disponibles en Santa Bárbara / Preguntas frecuentes sobre el cuidado en Santa Bárbara
- **FAQ:**
  - **¿Atienden en Santa Bárbara Central, Occidental y Alta?** Sí, y en los sectores cercanos a Unicentro; confirmamos tu dirección al cotizar.
  - **¿Pueden acompañar a mi familiar a pie hasta la Fundación Santa Fe?** Si la distancia y su movilidad lo permiten, sí; si no, acompañamos el traslado en taxi o en el carro de la familia.
  - **¿Ofrecen cuidado nocturno en Santa Bárbara para personas que viven solas?** Sí. Para quien vive solo, el turno nocturno da tranquilidad a la familia: la cuidadora acompaña las idas al baño y avisa de inmediato cualquier novedad.
  - **¿Pueden apoyar a mi familiar después de una cirugía en la Fundación Santa Fe?** Sí: lo recibimos al alta y acompañamos la recuperación en casa, mientras los controles y procedimientos los hace el equipo de salud.
  - **¿Pueden acompañar a mi familiar a terapias de rehabilitación en la zona?** Sí, acompañamos traslados y esperas en terapias físicas o de lenguaje y anotamos las recomendaciones para la familia.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [cuidado en Usaquén](/zonas/usaquen/); [Cedritos](/zonas/usaquen/cedritos/); [cuidadora en Santa Bárbara](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Fundación Santa Fe de Bogotá](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/)
- **CTA:** Consulta disponibilidad en Santa Bárbara
- **Bloques locales:** clínicas de referencia: la Fundación Santa Fe de Bogotá, la Clínica Reina Sofía. Vivienda: Edificios residenciales con portería; casas en Santa Bárbara Alta hacia los cerros. Recursos: Parques de barrio y sector comercial de Unicentro. Vías: Carrera 7, Carrera 15, Calle 116 y Calle 127.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/suba/colina-campestre/`

- **Tipo:** zona · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (55):** Cuidado del adulto mayor en Colina Campestre | Sovialis
- **Meta (133):** Cuidadoras en Colina Campestre y Mazurén: rutinas de la mañana, turnos de día o noche, 24 h y acompañamiento en la Clínica La Colina.
- **H1:** Cuidado del adulto mayor a domicilio en Colina Campestre
- **Keyword principal:** cuidado adulto mayor colina campestre (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Colina Campestre». Demanda proxy de la zona: sin búsquedas con el topónimo; prioridad por valor del negocio.
- **Secundarias:** cuidadora colina campestre (s/d); cuidadora de adulto mayor colina campestre (s/d); cuidado de ancianos en colina campestre (s/d); cuidado adulto mayor mazurén (s/d)
- **Volumen del grupo:** 0 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Colina Campestre / Barrios de Colina Campestre donde atendemos / Clínicas y hospitales de referencia cerca de Colina Campestre / Vivienda y seguridad en casa en Colina Campestre / Servicios disponibles en Colina Campestre / Preguntas frecuentes sobre el cuidado en Colina Campestre
- **FAQ:**
  - **¿Atienden en Colina Campestre y Mazurén?** Sí, en conjuntos y casas de ambos sectores; confirmamos tu dirección al cotizar.
  - **¿Pueden quedarse con mi familiar durante una hospitalización en la Clínica La Colina?** Sí, con turnos de día o de noche, siempre que la clínica permita acompañante en ese horario.
  - **¿Pueden usar las zonas comunes del conjunto para caminar con mi familiar?** Sí. Las caminatas por senderos y zonas verdes del conjunto ayudan a mantener la movilidad; respetamos el reglamento de la copropiedad.
  - **¿Pueden ayudar a mi familiar con las rutinas de la mañana antes de que salgamos a trabajar?** Sí, con un servicio por horas temprano (mínimo 4 horas) que cubre levantarse, baño, desayuno y recordatorio de medicamentos.
  - **¿Tienen experiencia con personas mayores que aún son muy independientes?** Sí. En esos casos el servicio se enfoca en compañía, salidas y una supervisión discreta, respetando sus decisiones y su autonomía.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [cuidado en Suba](/zonas/suba/); [Niza](/zonas/suba/niza/); [cuidadora en Colina Campestre](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Clínica La Colina](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/)
- **CTA:** Consulta disponibilidad en Colina Campestre
- **Bloques locales:** clínicas de referencia: la Clínica La Colina, la Fundación Clínica Shaio. Vivienda: Conjuntos cerrados de casas y edificios con zonas comunes y senderos. Recursos: Zonas verdes de los conjuntos; centros comerciales de la Calle 138 y la Avenida Boyacá. Vías: Avenida Boyacá, Calle 138, Calle 147 y Avenida Suba.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/calle-170/`

- **Tipo:** zona · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (57):** Cuidado del adulto mayor cerca de la Calle 170 | Sovialis
- **Meta (125):** Cuidadoras en Toberín, Britalia, San José de Bavaria y Villa del Prado: por horas, turnos, 24 h y acompañamiento en LaCardio.
- **H1:** Cuidado del adulto mayor a domicilio en el norte de Bogotá, cerca de la Calle 170
- **Keyword principal:** cuidado adulto mayor calle 170 (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Calle 170». Demanda proxy de la zona: sin búsquedas con el topónimo; sector de alto crecimiento residencial entre Usaquén y Suba.
- **Secundarias:** cuidadora calle 170 (s/d); cuidadora de adulto mayor calle 170 (s/d); cuidado de ancianos en calle 170 (s/d); cuidado adulto mayor toberín (s/d); cuidado adulto mayor britalia (s/d); cuidado adulto mayor san josé de bavaria (s/d)
- **Volumen del grupo:** 0 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en el norte de Bogotá, cerca de la Calle 170 / Barrios de el norte de Bogotá, cerca de la Calle 170 donde atendemos / Clínicas y hospitales de referencia cerca de el norte de Bogotá, cerca de la Calle 170 / Vivienda y seguridad en casa en el norte de Bogotá, cerca de la Calle 170 / Servicios disponibles en el norte de Bogotá, cerca de la Calle 170 / Preguntas frecuentes sobre el cuidado en el norte de Bogotá, cerca de la Calle 170
- **FAQ:**
  - **¿Qué barrios cerca de la Calle 170 cubren?** Toberín, Britalia, San José de Bavaria, Villa del Prado y sectores vecinos; confirmamos tu dirección al cotizar.
  - **¿Pueden acompañar a mi familiar a LaCardio o al Hospital Simón Bolívar?** Sí, en citas y hospitalizaciones, de día o de noche, según las normas de acompañantes de cada institución.
  - **¿Pueden acompañar a mi familiar en el Portal Norte de TransMilenio o en transporte público?** Sí, si tu familiar se moviliza con seguridad en transporte público; en horas pico preferimos taxi o el carro de la familia para evitar caídas y empujones.
  - **¿Atienden más al norte de la Calle 170, hacia la salida de Bogotá?** Algunas direcciones sí, según disponibilidad; para sectores como Guaymaral o la vía a Chía confirmamos tiempos de llegada antes de cotizar.
  - **¿Qué hago si necesito un acompañante hospitalario para esta misma noche?** Escríbenos por WhatsApp con la clínica y el horario: si hay personal disponible te lo confirmamos de inmediato, y si no, te lo decimos de una vez para que busques otra opción.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [Usaquén](/zonas/usaquen/); [Suba](/zonas/suba/); [cuidadora en Calle 170](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en LaCardio (Fundación Cardioinfantil)](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/)
- **CTA:** Consulta disponibilidad en Calle 170
- **Bloques locales:** clínicas de referencia: LaCardio (Fundación Cardioinfantil), el Hospital Simón Bolívar, la Clínica La Colina. Vivienda: Conjuntos de apartamentos con varias torres y casas en conjuntos cerrados. Recursos: Parques de barrio; Portal Norte y estación Toberín de TransMilenio. Vías: Calle 170, Autopista Norte, Avenida Boyacá y Avenida 9.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/teusaquillo/`

- **Tipo:** zona · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (50):** Cuidado del adulto mayor en Teusaquillo | Sovialis
- **Meta (136):** Cuidadoras en Teusaquillo, Galerías, Palermo, La Soledad y Park Way: turnos de día o noche, 24 h y acompañamiento en la Clínica Palermo.
- **H1:** Cuidado del adulto mayor a domicilio en Teusaquillo
- **Keyword principal:** cuidado adulto mayor teusaquillo (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Teusaquillo». Demanda proxy de la zona: «hogar geriatrico teusaquillo» 10.
- **Secundarias:** cuidadora teusaquillo (s/d); cuidadora de adulto mayor teusaquillo (s/d); cuidado de ancianos en teusaquillo (s/d); cuidado adulto mayor galerías (s/d); cuidado adulto mayor palermo (s/d); hogar geriatrico teusaquillo (10)
- **Volumen del grupo:** 10 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Teusaquillo / Barrios de Teusaquillo donde atendemos / Clínicas y hospitales de referencia cerca de Teusaquillo / Vivienda y seguridad en casa en Teusaquillo / Servicios disponibles en Teusaquillo / ¿Hogar geriátrico en Teusaquillo o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Teusaquillo
- **FAQ:**
  - **¿Atienden en Galerías, Palermo, La Soledad y Park Way?** Sí, además de Quinta Paredes, Nicolás de Federmán y Pablo VI; confirmamos tu dirección al cotizar.
  - **¿Pueden acompañar a mi familiar en la Clínica Palermo o en Méderi?** Sí, en citas y hospitalizaciones, de día o de noche, según las normas de acompañantes de cada institución.
  - **¿Cómo cuidan a mi familiar en una casa antigua de varios pisos?** Organizamos la rutina para que pase la mayor parte del día en un solo piso y asistimos cada subida y bajada; si la escalera es empinada, sugerimos pasamanos a ambos lados.
  - **¿La cuidadora puede acompañar caminatas por el Park Way o el Parque Simón Bolívar?** Sí, con recorridos adaptados a su resistencia, pausas e hidratación, y el regreso planeado.
  - **¿Pueden acompañar a mi familiar a actividades culturales o bibliotecas de la zona?** Sí, si tu familiar las disfruta: acompañamos la salida, cuidamos los tiempos de descanso y el regreso a casa.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [Chapinero](/zonas/chapinero/); [Barrios Unidos](/zonas/barrios-unidos/); [cuidadora en Teusaquillo](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Clínica Palermo](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Teusaquillo
- **Bloques locales:** clínicas de referencia: la Clínica Palermo, el Hospital Universitario Mayor Méderi. Vivienda: Casas de estilo inglés de dos y tres pisos y edificios de apartamentos. Recursos: Park Way y Parque Simón Bolívar. Vías: Avenida Caracas, Carrera 30 (NQS), Calle 45 y Calle 53.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/barrios-unidos/`

- **Tipo:** zona · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (53):** Cuidado del adulto mayor en Barrios Unidos | Sovialis
- **Meta (137):** Cuidadoras en Polo Club, Rionegro, La Castellana y Los Andes: por horas, turnos de día o noche, 24 h y acompañamiento a citas y clínicas.
- **H1:** Cuidado del adulto mayor a domicilio en Barrios Unidos
- **Keyword principal:** cuidado adulto mayor barrios unidos (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Barrios Unidos». Demanda proxy de la zona: sin búsquedas con el topónimo.
- **Secundarias:** cuidadora barrios unidos (s/d); cuidadora de adulto mayor barrios unidos (s/d); cuidado de ancianos en barrios unidos (s/d); cuidado adulto mayor polo club (s/d); cuidado adulto mayor rionegro (s/d)
- **Volumen del grupo:** 0 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Barrios Unidos / Barrios de Barrios Unidos donde atendemos / Clínicas y hospitales de referencia cerca de Barrios Unidos / Vivienda y seguridad en casa en Barrios Unidos / Servicios disponibles en Barrios Unidos / Preguntas frecuentes sobre el cuidado en Barrios Unidos
- **FAQ:**
  - **¿Atienden en Polo Club, Rionegro y La Castellana?** Sí, además de Los Andes, Entre Ríos y el Siete de Agosto; confirmamos tu dirección al cotizar.
  - **¿La cuidadora puede acompañar a mi familiar al Parque de Los Novios?** Sí, en salidas adaptadas a su movilidad, con pausas y el regreso planeado.
  - **¿Pueden cuidar a mi familiar mientras la familia atiende el negocio del primer piso?** Sí. La cuidadora se dedica solo a tu familiar y no apoya tareas del negocio, para que la atención no se interrumpa.
  - **¿Pueden acompañar citas en clínicas fuera de Barrios Unidos?** Sí. Acompañamos el traslado y la consulta en la institución que indique tu EPS o tu medicina prepagada, dentro de Bogotá.
  - **¿Trabajan con personas mayores que tienen mascotas en casa?** Sí, siempre que la mascota no represente un riesgo; la cuidadora puede ayudar a tu familiar a alimentarla, pero el cuidado de la mascota no hace parte del servicio.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [Teusaquillo](/zonas/teusaquillo/); [Chapinero](/zonas/chapinero/); [cuidadora en Barrios Unidos](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Clínica del Country](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/)
- **CTA:** Consulta disponibilidad en Barrios Unidos
- **Bloques locales:** clínicas de referencia: la Clínica del Country, las clínicas de la red de tu EPS. Vivienda: Casas de dos pisos, muchas con local comercial en el primer piso, y edificios de apartamentos. Recursos: Parque de Los Novios (El Lago) y parques de barrio. Vías: Avenida 68, Calle 80, Autopista Norte y Avenida Suba.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/salitre-y-modelia/`

- **Tipo:** zona · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (56):** Cuidado del adulto mayor en Salitre y Modelia | Sovialis
- **Meta (143):** Cuidadoras en Ciudad Salitre, Modelia, Normandía y Hayuelos: turnos de día o noche, 24 h y acompañamiento en la Clínica Universitaria Colombia.
- **H1:** Cuidado del adulto mayor a domicilio en Salitre y Modelia
- **Keyword principal:** cuidado adulto mayor salitre (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Salitre». Demanda proxy de la zona: «hogares geriátricos en modelia bogotá» 30 · «hogar geriatrico modelia» 30 · «hogares geriatricos modelia» 20.
- **Secundarias:** cuidadora salitre (s/d); cuidadora de adulto mayor salitre (s/d); cuidado de ancianos en salitre (s/d); cuidado adulto mayor ciudad salitre (s/d); cuidado adulto mayor modelia (s/d); cuidado adulto mayor normandía (s/d); hogares geriátricos en modelia bogotá (30); hogar geriatrico modelia (30)
- **Volumen del grupo:** 60 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Salitre y Modelia / Barrios de Salitre y Modelia donde atendemos / Clínicas y hospitales de referencia cerca de Salitre y Modelia / Vivienda y seguridad en casa en Salitre y Modelia / Servicios disponibles en Salitre y Modelia / ¿Hogar geriátrico en Salitre y Modelia o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Salitre y Modelia
- **FAQ:**
  - **¿Atienden en Ciudad Salitre, Modelia y Normandía?** Sí, en conjuntos y casas de esos barrios; confirmamos tu dirección al cotizar.
  - **¿Pueden acompañar a mi familiar en la Clínica Universitaria Colombia?** Sí, en citas, exámenes y hospitalizaciones, de día o de noche, según las normas de acompañantes de la clínica.
  - **¿Pueden acompañar a mi familiar que llega en avión al aeropuerto El Dorado?** Sí, como acompañamiento por horas: lo esperamos a la salida, lo acompañamos en el traslado a casa y avisamos a la familia.
  - **¿La cuidadora puede llevar a mi familiar a su grupo de actividad física del parque?** Sí. Si participa en grupos de actividad física del barrio o del Distrito, lo acompañamos y cuidamos su hidratación y descanso.
  - **¿Atienden también en Hayuelos y otros barrios de Fontibón?** Atendemos Hayuelos y sectores cercanos a la Avenida La Esperanza según la disponibilidad de personal; confírmanos la dirección.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [Teusaquillo](/zonas/teusaquillo/); [cuidadora en Salitre](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Clínica Universitaria Colombia](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Salitre
- **Bloques locales:** clínicas de referencia: la Clínica Universitaria Colombia, las clínicas de la red de tu EPS. Vivienda: Conjuntos de apartamentos en Ciudad Salitre; casas de dos pisos en Modelia y Normandía. Recursos: Zonas verdes de los conjuntos; parques de barrio; cercanía al aeropuerto El Dorado. Vías: Avenida La Esperanza, Avenida 68, Avenida Boyacá y Calle 26.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

#### `/zonas/chia/`

- **Tipo:** zona · **Prioridad:** v2 · **Menú:** main · **Indexación:** index
- **Title (52):** Cuidado del adulto mayor en Chía y Cajicá | Sovialis
- **Meta (144):** Cuidadoras en Chía y Cajicá: por horas, turnos de día o noche, 24 h y acompañamiento en la Clínica Universidad de La Sabana. Consulta cobertura.
- **H1:** Cuidado del adulto mayor a domicilio en Chía y Cajicá
- **Keyword principal:** cuidado adulto mayor chía (s/d) — Sin volumen medible (<10) en Keyword Planner para «cuidado/cuidadora + Chía». Demanda proxy de la zona: «hogar geriatrico chia» 50 · «hogar geriatrico cajica» 10 · «enfermeras chia» 10.
- **Secundarias:** cuidadora chía (s/d); cuidadora de adulto mayor chía (s/d); cuidado de ancianos en chía (s/d); cuidado adulto mayor cajicá (s/d); hogar geriatrico chia (50); hogar geriatrico cajica (10); cuidadora cajicá (s/d)
- **Volumen del grupo:** 60 · **Intención:** transaccional local
- **H2:** Cómo trabajamos en Chía y Cajicá / Barrios de Chía y Cajicá donde atendemos / Clínicas y hospitales de referencia cerca de Chía y Cajicá / Vivienda y seguridad en casa en Chía y Cajicá / Servicios disponibles en Chía y Cajicá / ¿Hogar geriátrico en Chía y Cajicá o cuidado en casa? / Preguntas frecuentes sobre el cuidado en Chía y Cajicá
- **FAQ:**
  - **¿Atienden en Chía y Cajicá?** Sí, en el casco urbano y en conjuntos cercanos, según la disponibilidad de personal; en veredas o condominios alejados confirmamos tiempos de llegada antes de cotizar.
  - **¿Cobran transporte adicional para servicios en Chía?** Si la dirección requiere un desplazamiento especial, te lo informamos en la cotización antes de que aceptes; nunca se cobra un valor que no esté en ella.
  - **¿Pueden acompañar a mi familiar en la Clínica Universidad de La Sabana?** Sí, en citas y hospitalizaciones, de día o de noche, según las normas de acompañantes de la clínica.
  - **¿Qué pasa si hay trancón en la Autopista Norte y la cuidadora se retrasa?** Programamos la llegada con margen y, si hay un retraso, te avisamos de inmediato; el tiempo no prestado no se cobra.
  - **¿Pueden cuidar a mi familiar en una casa campestre con jardín y desniveles?** Sí. Revisamos senderos, escalones e iluminación exterior, y la cuidadora acompaña cada salida al jardín para prevenir caídas.
- **Schema:** WebPage, Service, Place, BreadcrumbList, FAQPage
- **Enlaces internos:** [zonas de cobertura](/zonas/); [Calle 170](/zonas/calle-170/); [cuidadora en Chía](/servicios/cuidadora-adulto-mayor/); [turnos de noche](/servicios/cuidado-nocturno/); [acompañamiento en la Clínica Universidad de La Sabana](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/); [tarifas](/precios/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Consulta disponibilidad en Chía
- **Bloques locales:** clínicas de referencia: la Clínica Universidad de La Sabana, el Hospital San Antonio de Chía. Vivienda: Casas en conjuntos cerrados y condominios campestres con jardín y desniveles. Recursos: Parques del casco urbano de Chía; senderos de los conjuntos. Vías: Autopista Norte, Carrera Séptima (vía a Chía) y Variante Chía–Cajicá.
- **Notas:** Bloques locales únicos obligatorios (ver §Zonas: anti-doorway). Clínicas y barrios: verificar dirección y pertenencia antes de publicar; aviso «Sovialis no tiene vínculo con estas instituciones».

### 8.4 Blog: hub y categorías

#### `/blog/`

- **Tipo:** hub-blog · **Prioridad:** v1 · **Menú:** main · **Indexación:** index
- **Title (54):** Guías para cuidar a un adulto mayor en casa | Sovialis
- **Meta (155):** Guías prácticas para familias en Bogotá: cómo contratar cuidado, costos, EPS y trámites, cuidados en casa, Alzheimer, actividades y apoyo para quien cuida.
- **H1:** Guías para familias que cuidan a una persona mayor
- **Keyword principal:** recomendaciones para cuidadores de adultos mayores (10)
- **Secundarias:** consejos para cuidar a un adulto mayor (0); blog cuidado adulto mayor (s/d)
- **Volumen del grupo:** 10 · **Intención:** informativa (navegación)
- **H2:** Contratar cuidado / Costos y alternativas / Cuidados y salud en casa / EPS, derechos y trámites / Bienestar y cuidador familiar / Guías más leídas
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Schema:** Blog, CollectionPage, BreadcrumbList
- **Enlaces internos:** [contratar cuidado](/blog/categoria/contratar-cuidado/); [EPS y trámites](/blog/categoria/eps-derechos-y-tramites/); [¿enfermera o cuidadora?](/blog/enfermera-o-cuidadora-a-domicilio/); [servicios de Sovialis](/servicios/)
- **CTA:** Banner suave: «¿Necesitas apoyo en casa? Cotiza por WhatsApp»
- **Notas:** Sin bloque FAQ por diseño (página de listado).

#### `/blog/categoria/contratar-cuidado/`

- **Tipo:** categoria-blog · **Prioridad:** v1 · **Menú:** footer · **Indexación:** noindex hasta 4 artículos
- **Title (49):** Contratar cuidado: guías para familias | Sovialis
- **Meta (99):** Cómo elegir el perfil, contratar con seguridad y organizar el cuidado de una persona mayor en casa.
- **H1:** Contratar cuidado
- **Keyword principal:** contratar cuidado (s/d)
- **Volumen del grupo:** 0 · **Intención:** informativa (navegación)
- **H2:** Guías de esta categoría / Empieza por aquí / Servicios relacionados
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Schema:** CollectionPage, ItemList, BreadcrumbList
- **Enlaces internos:** [todas las guías](/blog/)
- **CTA:** Banner suave por categoría
- **Notas:** noindex,follow hasta tener 4 artículos publicados; luego index. Sin FAQ por diseño.

#### `/blog/categoria/costos-y-alternativas/`

- **Tipo:** categoria-blog · **Prioridad:** v1 · **Menú:** footer · **Indexación:** noindex hasta 4 artículos
- **Title (53):** Costos y alternativas: guías para familias | Sovialis
- **Meta (95):** Cuánto cuesta cuidar a un adulto mayor y cómo se compara con hogares geriátricos y centros día.
- **H1:** Costos y alternativas
- **Keyword principal:** costos y alternativas (s/d)
- **Volumen del grupo:** 0 · **Intención:** informativa (navegación)
- **H2:** Guías de esta categoría / Empieza por aquí / Servicios relacionados
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Schema:** CollectionPage, ItemList, BreadcrumbList
- **Enlaces internos:** [todas las guías](/blog/)
- **CTA:** Banner suave por categoría
- **Notas:** noindex,follow hasta tener 4 artículos publicados; luego index. Sin FAQ por diseño.

#### `/blog/categoria/cuidados-y-salud-en-casa/`

- **Tipo:** categoria-blog · **Prioridad:** v1 · **Menú:** footer · **Indexación:** noindex hasta 4 artículos
- **Title (42):** Cuidados y salud en casa: guías | Sovialis
- **Meta (106):** Guías prácticas de cuidado diario, recuperación y condiciones como el Alzheimer, explicadas para familias.
- **H1:** Cuidados y salud en casa
- **Keyword principal:** cuidados y salud en casa (s/d)
- **Volumen del grupo:** 0 · **Intención:** informativa (navegación)
- **H2:** Guías de esta categoría / Empieza por aquí / Servicios relacionados
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Schema:** CollectionPage, ItemList, BreadcrumbList
- **Enlaces internos:** [todas las guías](/blog/)
- **CTA:** Banner suave por categoría
- **Notas:** noindex,follow hasta tener 4 artículos publicados; luego index. Sin FAQ por diseño.

#### `/blog/categoria/eps-derechos-y-tramites/`

- **Tipo:** categoria-blog · **Prioridad:** v1 · **Menú:** footer · **Indexación:** noindex hasta 4 artículos
- **Title (42):** EPS, derechos y trámites: guías | Sovialis
- **Meta (112):** Atención domiciliaria por EPS, tutela, derechos de las personas mayores y cómo pedir servicios de salud en casa.
- **H1:** EPS, derechos y trámites
- **Keyword principal:** eps, derechos y trámites (s/d)
- **Volumen del grupo:** 0 · **Intención:** informativa (navegación)
- **H2:** Guías de esta categoría / Empieza por aquí / Servicios relacionados
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Schema:** CollectionPage, ItemList, BreadcrumbList
- **Enlaces internos:** [todas las guías](/blog/)
- **CTA:** Banner suave por categoría
- **Notas:** noindex,follow hasta tener 4 artículos publicados; luego index. Sin FAQ por diseño.

#### `/blog/categoria/bienestar-y-cuidador-familiar/`

- **Tipo:** categoria-blog · **Prioridad:** v1 · **Menú:** footer · **Indexación:** noindex hasta 4 artículos
- **Title (47):** Bienestar y cuidador familiar: guías | Sovialis
- **Meta (87):** Actividades, ejercicio y vida social de las personas mayores, y apoyo para quien cuida.
- **H1:** Bienestar y cuidador familiar
- **Keyword principal:** bienestar y cuidador familiar (s/d)
- **Volumen del grupo:** 0 · **Intención:** informativa (navegación)
- **H2:** Guías de esta categoría / Empieza por aquí / Servicios relacionados
- **FAQ:** ninguna por diseño (página de listado o utilidad; evita duplicar respuestas).
- **Schema:** CollectionPage, ItemList, BreadcrumbList
- **Enlaces internos:** [todas las guías](/blog/)
- **CTA:** Banner suave por categoría
- **Notas:** noindex,follow hasta tener 4 artículos publicados; luego index. Sin FAQ por diseño.

### 8.5 Blog: cornerstones (C01–C13)

#### `/blog/cuanto-cobra-una-enfermera-a-domicilio/` · C01

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/costos-y-alternativas/`
- **Title (57):** ¿Cuánto cobra una enfermera a domicilio en Bogotá? (2026)
- **Meta (144):** Qué cobra una enfermera, una auxiliar o una cuidadora por hora, turno o día en Bogotá, qué incluye cada tarifa y cuándo no necesitas enfermería.
- **H1:** ¿Cuánto cobra una enfermera a domicilio en Bogotá? Precios por perfil (2026)
- **Keyword principal:** cuanto cobra una enfermera por dia (40)
- **Secundarias:** enfermeria precios (20); cuanto cobra una enfermera por 12 horas colombia (10); cuanto cobra una enfermera particular por hora (10); cuanto cobra una enfermera por cuidar a un adulto mayor (10); cuanto cobra una enfermera por dia en colombia (10); enfermería profesional precio (10); turno de enfermeria precio (10); costos de enfermeras a domicilio (10); cuanto cobra una enfermera a domicilio por día (10); precio de curaciones a domicilio (10)
- **Volumen del grupo:** 150 · **Intención:** comercial-informativa (precio de enfermería)
- **H2:** Respuesta rápida: de qué depende el precio / Enfermera profesional, auxiliar de enfermería o cuidadora: qué estás pagando / Procedimientos (inyecciones, curaciones, sueros): se cobran por evento en una IPS / Turnos de cuidado: referencias por hora, 12 horas y 24 horas / Qué debe incluir una tarifa seria: seguridad social, reemplazos y póliza / Señales de que tu familiar necesita cuidado y no enfermería / Preguntas frecuentes
- **FAQ:**
  - **¿Cuánto cobra una enfermera por día en Bogotá?** Depende del perfil y de los procedimientos: la enfermería a domicilio la prestan IPS habilitadas, que fijan su tarifa por turno o por procedimiento. Si tu familiar necesita compañía y cuidado básico, en Sovialis el turno de 12 horas de día cuesta desde $160.000 con cuidadora y desde $180.000 con personal con formación de auxiliar.
  - **¿Por qué una enfermera profesional cobra más que una auxiliar?** Porque tiene formación universitaria y puede valorar al paciente y asumir procedimientos complejos; la auxiliar tiene formación técnica y la cuidadora, formación en cuidado básico.
  - **¿Cuánto cuesta una inyección o una curación a domicilio?** Se cobra por procedimiento y la tarifa la define la IPS que lo presta; pide siempre la orden médica y verifica que la IPS esté habilitada en el REPS.
  - **¿Una enfermera a domicilio puede cuidar a un adulto mayor todo el día?** Puede, pero si no hay procedimientos frecuentes suele ser más adecuado y económico un cuidado por turnos con cuidadora o auxiliar, y programar la enfermería solo para los procedimientos.
  - **¿Qué debe incluir la tarifa de un servicio de cuidado o enfermería?** Seguridad social del personal, reemplazos ante ausencias, seguimiento del servicio e, idealmente, una póliza de responsabilidad civil; pregunta por cada punto antes de contratar.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tarifas de cuidado de Sovialis](/precios/); [diferencias entre enfermera y cuidadora](/blog/enfermera-o-cuidadora-a-domicilio/); [cuidado por personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [cómo pedir una inyección a domicilio](/blog/inyectologia-a-domicilio-bogota/)
- **CTA:** Compara con nuestras tarifas de cuidado (no de enfermería)
- **Notas:** LEGAL: informativo-comparativo. No ofrecer enfermería ni precios de procedimientos propios. Precios de mercado solo con fuente y fecha (negocio.json).

#### `/blog/cuanto-cuesta-cuidar-a-un-adulto-mayor-en-casa/` · C02

- **Tipo:** blog-cornerstone · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/costos-y-alternativas/`
- **Title (55):** ¿Cuánto cuesta al mes cuidar a un adulto mayor en casa?
- **Meta (152):** Presupuestos mensuales con tarifas 2026: por horas, 12 h entre semana, noches y 24 horas. Gastos extra y cómo bajar el costo sin descuidar la seguridad.
- **H1:** ¿Cuánto cuesta al mes cuidar a un adulto mayor en casa en Bogotá?
- **Keyword principal:** cuanto cuesta cuidar un adulto mayor en colombia (10)
- **Secundarias:** costo mensual de cuidar a un adulto mayor (s/d); presupuesto para cuidar a un adulto mayor (s/d); cuánto cuesta una cuidadora al mes (s/d); gastos de cuidar a un adulto mayor en casa (s/d)
- **Volumen del grupo:** 10 · **Intención:** comercial-informativa (presupuesto mensual)
- **H2:** Respuesta rápida: el costo depende de las horas de cuidado / Cuatro planes de ejemplo con tarifas 2026 / Gastos que se suman: insumos, adaptaciones y transporte / Cuidado en casa frente a hogar geriátrico: cómo comparar / Cómo reducir el costo sin descuidar la seguridad / Apoyos públicos y de la EPS que vale la pena revisar / Preguntas frecuentes
- **FAQ:**
  - **¿Cuánto cuesta al mes una cuidadora de lunes a viernes en turno de 12 horas?** Con tarifas de Sovialis, unos 22 turnos de día entre semana suman desde $3.520.000 al mes (22 × $160.000); el total exacto depende de los festivos del mes.
  - **¿Cuánto cuesta al mes el cuidado 24 horas todos los días?** Desde unos $9.160.000 al mes con cuidadora: cerca de 22 días a $300.000 y 8 días de fin de semana o festivo a $320.000; varía según el calendario.
  - **¿Cuánto cuesta cuidar a un adulto mayor solo unas horas a la semana?** Con tres visitas de 4 horas por semana, desde $240.000 semanales (unos $1.040.000 al mes) con cuidadora.
  - **¿Qué gastos adicionales debo prever además de la cuidadora?** Pañales e insumos de aseo, ayudas técnicas como barras o silla de ducha, transporte a citas y, si los necesita, procedimientos de una IPS; la tarifa de Sovialis no incluye esos elementos.
  - **¿Cómo bajar el costo mensual sin dejar solo a mi familiar?** Combinando recursos: centro día entre semana, horas de cuidadora en los momentos críticos (baño, comidas, noches) y turnos completos solo cuando el riesgo lo exige.
  - **¿La familia puede repartir el costo entre varios hermanos?** Sí. La factura sale a nombre de quien contrata, que es quien responde por los pagos, y los hermanos pueden acordar internamente el aporte de cada uno.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tabla de precios](/precios/); [cuidado por horas](/servicios/cuidado-por-horas/); [cuidado 24 horas](/servicios/cuidado-24-horas/); [comparar con un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/); [centros día en Bogotá](/blog/centro-dia-adulto-mayor-bogota/)
- **CTA:** Arma tu presupuesto con la calculadora
- **Notas:** Re-enfocado: /precios/ posee «cuánto cobra/precio» por unidad; este artículo posee el presupuesto mensual. Cifras calculadas con tarifas.ts.

#### `/blog/como-contratar-una-cuidadora/` · C03

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/contratar-cuidado/`
- **Title (55):** Cómo contratar una cuidadora para un adulto mayor: guía
- **Meta (142):** Paso a paso para contratar una cuidadora para tu papá o tu mamá: qué preguntar, qué verificar, cómo hacer el empalme y cuándo pedir un cambio.
- **H1:** Cómo contratar una cuidadora para tu papá o tu mamá: guía paso a paso
- **Keyword principal:** contratar cuidador ancianos (10)
- **Secundarias:** como contratar una cuidadora de adulto mayor (s/d); como contratar cuidadora interna (0); como buscar una cuidadora interna (s/d); contratar ayuda a domicilio (10); preguntas para entrevistar a una cuidadora (s/d); busco cuidadora de personas mayores (10)
- **Volumen del grupo:** 30 · **Intención:** informativa-comercial (BOFU contratación)
- **H2:** Antes de buscar: define cuánta ayuda necesita tu familiar / Dónde buscar: agencia, recomendados o plataformas / 12 preguntas para entrevistar a una cuidadora / Verificaciones que no te puedes saltar: antecedentes, referencias y ReTHUS / El primer día: plan de cuidado y empalme / Señales de alerta y cómo pedir un cambio / Preguntas frecuentes
- **FAQ:**
  - **¿Qué preguntas hacerle a una cuidadora en la entrevista?** Pregunta por su experiencia con personas con la condición de tu familiar, cómo actuaría ante una caída, qué tareas no hace, su disponibilidad y referencias que puedas verificar.
  - **¿Dónde consultar los antecedentes de una cuidadora en Colombia?** Con su autorización, puedes consultar los antecedentes judiciales en la Policía Nacional, los disciplinarios en la Procuraduría y los fiscales en la Contraloría; si es auxiliar de enfermería, verifica también el ReTHUS.
  - **¿Cómo buscar una cuidadora interna confiable?** Define primero horario y descansos, pide referencias de familias anteriores, verifica antecedentes y formaliza el contrato por escrito; si prefieres no ser empleador, contrata el cuidado a través de una empresa.
  - **¿Cuánto tiempo toma conseguir una cuidadora?** Por cuenta propia puede tomar días o semanas entre buscar, entrevistar y verificar; con una agencia depende de la disponibilidad de personal para tu horario y zona.
  - **¿Cómo hacer el empalme con una cuidadora nueva?** Dedica el primer turno a mostrarle la casa, la rutina, los medicamentos organizados por dosis y los contactos de emergencia, y deja todo por escrito en un plan de cuidado.
  - **¿Qué señales indican que debo cambiar de cuidadora?** Llegadas tarde frecuentes, cambios de ánimo o lesiones sin explicación en tu familiar, tareas del plan que no se cumplen o trato irrespetuoso; ante indicios de maltrato, actúa de inmediato y denúncialo.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidadoras verificadas en Bogotá](/servicios/cuidadora-adulto-mayor/); [cómo seleccionamos al personal](/como-funciona/); [qué perfil necesitas](/blog/enfermera-o-cuidadora-a-domicilio/); [tarifas](/precios/)
- **CTA:** Te ayudamos a elegir: habla con la coordinación
- **Notas:** Título sin «enfermera» (ajuste legal). «busco/necesito cuidadora de adulto mayor» quedan en la landing de cuidadora.

#### `/blog/contratar-cuidadora-directa-o-por-agencia/` · C04

- **Tipo:** blog-cornerstone · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/contratar-cuidado/`
- **Title (58):** Contratar cuidadora directa o por agencia: guía legal 2026
- **Meta (144):** Contrato, seguridad social, jornada y recargos al contratar una cuidadora en Colombia; riesgos de no formalizarla y comparativa con una agencia.
- **H1:** Contratar una cuidadora directamente o por agencia: contrato, seguridad social y costos (2026)
- **Keyword principal:** contrato para cuidadora de adulto mayor (10)
- **Secundarias:** contrato para cuidado de personas mayores (10); qué contrato se hace a una cuidadora interna (s/d); que horario tiene una cuidadora interna (s/d); que es cuidadora interna (s/d); qué derechos tengo como cuidadora de adulto mayor (10); qué derechos tiene una cuidadora de adulto mayor (s/d); sueldo cuidadora 24 horas en colombia (20); cuidadora interna derechos (s/d)
- **Volumen del grupo:** 50 · **Intención:** informativa (legal / MOFU)
- **H2:** ¿Empleada, contratista o servicio de una empresa? Qué figura aplica / Costo real de contratar directamente en 2026 / Cuidadora interna: jornada, descansos, noches y domingos / Riesgos de no formalizar: accidentes, UGPP y demandas / Comparativa: contratación directa frente a una empresa de cuidado / Lista de chequeo legal para la familia / Preguntas frecuentes
- **FAQ:**
  - **¿Qué contrato se le hace a una cuidadora interna?** Si la familia la contrata directamente para trabajar en el hogar bajo sus órdenes, es un contrato de trabajo doméstico, que debe constar por escrito, y hay que afiliarla a seguridad social.
  - **¿Cuál es la jornada máxima de una cuidadora interna?** La jornada máxima legal general bajó a 42 horas semanales desde el 15 de julio de 2026 (Ley 2101 de 2021); el trabajo doméstico interno tiene reglas especiales, así que confirma tu caso con un abogado laboral antes de pactarla.
  - **¿Cuánto se paga a una cuidadora empleada por trabajar de noche o en domingo?** El trabajo nocturno (7:00 p. m. a 6:00 a. m.) tiene un recargo del 35 % y el dominical o festivo, del 90 % desde el 1 de julio de 2026 y del 100 % desde julio de 2027, según la Ley 2466 de 2025.
  - **¿Qué riesgos tiene no afiliar a la cuidadora a seguridad social?** Si sufre un accidente o una enfermedad, la familia empleadora responde por las prestaciones que habría cubierto la seguridad social y puede recibir sanciones de la UGPP por aportes no pagados.
  - **¿Si contrato por agencia, quién responde si algo sale mal?** La empresa responde ante la familia por la ejecución del servicio, según el Estatuto del Consumidor; revisa en el contrato cómo maneja incidentes, reemplazos y pólizas.
  - **¿Qué derechos tiene una cuidadora de adulto mayor?** Si es empleada: salario al menos mínimo, prestaciones, afiliación a salud, pensión y riesgos laborales, descansos y recargos. Si es contratista independiente: honorarios pactados, autonomía para aceptar servicios y afiliación a la ARL gestionada por el contratante.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cómo funciona un servicio por empresa](/como-funciona/); [guía para contratar una cuidadora](/blog/como-contratar-una-cuidadora/); [tarifas finales de Sovialis](/precios/); [cuidado 24 horas con relevos](/servicios/cuidado-24-horas/)
- **CTA:** Compara el costo total con una cotización
- **Notas:** REQUIERE revisión de abogado laboral antes de publicar (Decreto 0581 de 2026 y reglas del trabajo doméstico interno).

#### `/blog/enfermera-o-cuidadora-a-domicilio/` · C05

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/contratar-cuidado/`
- **Title (58):** ¿Enfermera a domicilio o cuidadora? Cuándo elegir cada una
- **Meta (149):** Diferencias entre enfermera, auxiliar de enfermería y cuidadora a domicilio en Bogotá: qué puede hacer cada una, cuándo exigir una IPS y cómo elegir.
- **H1:** ¿Enfermera a domicilio o cuidadora? Diferencias y cuándo necesitas cada una
- **Keyword principal:** enfermera a domicilio (590) — Familia «enfermera domiciliaria / en domicilio / enfermeros domiciliarios» = 590. Google oculta el volumen exacto de «enfermera a domicilio» (README del estudio: ~2× según Trends).
- **Secundarias:** enfermeras a domicilio en bogotá (260); enfermera a domicilio en bogota (140); enfermero a domicilio (170); enfermeras en bogota (140); enfermeria a domicilio bogota (260); diferencia entre auxiliar de enfermería y enfermera (10); auxiliar de enfermeria vs enfermera (10); qué hace un enfermero (40); auxiliar de enfermeria que hacen (30); que hace un auxiliar de enfermeria domiciliaria (s/d)
- **Volumen del grupo:** 1080 · **Intención:** comercial-informativa (captura legal de «enfermera a domicilio»)
- **H2:** Respuesta rápida: procedimientos = enfermería; rutinas y compañía = cuidado / Qué puede hacer cada perfil: enfermera, auxiliar y cuidadora (tabla) / Cuándo sí necesitas enfermería a domicilio y cómo pedirla / Cuándo basta una cuidadora o personal con formación de auxiliar / Casos típicos: postoperatorio, Alzheimer, persona encamada y acompañamiento / Cómo verificar un prestador (REPS) y el registro del personal (ReTHUS) / Preguntas frecuentes
- **FAQ:**
  - **¿Qué diferencia hay entre una enfermera y una auxiliar de enfermería?** La enfermera profesional tiene formación universitaria y lidera el plan de cuidados de enfermería; la auxiliar tiene formación técnica laboral y realiza cuidados básicos y procedimientos bajo supervisión, dentro de una institución habilitada.
  - **¿Una cuidadora puede hacer lo mismo que una enfermera en casa?** No. La cuidadora acompaña y apoya rutinas (higiene, comidas, movilidad, compañía), pero no hace procedimientos de salud como inyecciones, curaciones o manejo de sondas.
  - **¿Dónde contrato una enfermera a domicilio en Bogotá?** A través de tu EPS o tu medicina prepagada, o de una IPS con servicio domiciliario habilitado en el REPS; pide siempre la orden médica del procedimiento.
  - **¿Cómo verifico si una empresa de enfermería a domicilio está habilitada?** Consulta el Registro Especial de Prestadores de Servicios de Salud (REPS) del Ministerio de Salud con el nombre o NIT de la empresa y revisa que tenga habilitada la modalidad domiciliaria.
  - **¿Qué hace un auxiliar de enfermería en un domicilio?** Dentro de una IPS habilitada puede hacer cuidados básicos y procedimientos delegados; en un servicio de cuidado no sanitario como el de Sovialis, se limita al cuidado básico con el valor agregado de su formación.
  - **¿Si mi familiar tiene sonda o recibe insulina necesita enfermera todo el día?** No siempre: el procedimiento lo hace personal de salud en los horarios indicados y el resto del día puede acompañarlo una cuidadora; así se combinan seguridad y costo.
  - **¿Cuándo es mejor una enfermera jefe?** Cuando hay que valorar al paciente con frecuencia, ajustar un plan de cuidados complejo o atender tratamientos que requieren juicio clínico; ese servicio lo presta una IPS.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidadora de adulto mayor](/servicios/cuidadora-adulto-mayor/); [personal con formación de auxiliar de enfermería](/servicios/auxiliar-de-enfermeria/); [inyectología a domicilio](/blog/inyectologia-a-domicilio-bogota/); [atención domiciliaria por EPS](/blog/eps-cuidador-en-casa/); [cuánto cobra una enfermera](/blog/cuanto-cobra-una-enfermera-a-domicilio/)
- **CTA:** ¿Lo tuyo es cuidado y compañía? Cotiza con Sovialis
- **Notas:** Única URL del sitio que puede apuntar a la familia «enfermera(s)/enfermería a domicilio». Honesta: explica la ruta EPS/IPS y no promete enfermería.

#### `/blog/hogar-geriatrico-o-cuidado-en-casa/` · C06

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/costos-y-alternativas/`
- **Title (57):** Hogar geriátrico o cuidado en casa: costos en Bogotá 2026
- **Meta (149):** Compara un hogar geriátrico en Bogotá con el cuidado en casa: costos, ventajas, cuándo conviene cada opción y qué revisar antes de elegir (Ley 1315).
- **H1:** Hogar geriátrico o cuidado en casa: costos en Bogotá y cómo decidir
- **Keyword principal:** hogares geriátricos bogotá precios (320)
- **Secundarias:** geriatricos en bogota (480); ancianato en bogota (480); hogar geriatrico bogota (320); hogares geriátricos bogotá económicos (110); mejores hogares geriátricos en bogotá (110); hogar geriátrico precios (70); hogar para adultos mayores bogota (70); que es un geriátrico (246); geriatrico (1300); hogar geriatrico (1000)
- **Volumen del grupo:** 4506 · **Intención:** comercial-informativa (alternativa)
- **H2:** Respuesta rápida: cuándo conviene cada opción / Cuánto cuesta un hogar geriátrico en Bogotá frente al cuidado en casa / Ventajas y desventajas de cada opción / Cuándo conviene cada una: dependencia, demencia y red familiar / Qué revisar antes de elegir un hogar geriátrico (Ley 1315 de 2009) / La opinión de la persona mayor / Preguntas frecuentes
- **FAQ:**
  - **¿Qué es un hogar geriátrico?** Es una institución que ofrece alojamiento, alimentación y cuidado permanente a personas mayores; en Colombia debe cumplir las condiciones mínimas de la Ley 1315 de 2009 y someterse a la inspección de las autoridades.
  - **¿Cuándo es mejor un hogar geriátrico que el cuidado en casa?** Cuando la persona necesita supervisión 24 horas, la casa no puede adaptarse y la familia no puede coordinar el cuidado, o cuando la propia persona mayor prefiere vivir en comunidad.
  - **¿Qué revisar antes de elegir un hogar geriátrico en Bogotá?** Documentos de funcionamiento al día, personal suficiente de día y de noche, plan de atención individual, menú adecuado, visitas abiertas y un contrato con tarifas y servicios por escrito.
  - **¿Es más económico un hogar geriátrico que una cuidadora en casa?** Depende del nivel de cuidado: para pocas horas de apoyo, la casa suele costar menos; para cuidado 24 horas, un hogar suele ser más económico porque reparte el personal entre varios residentes. Compara siempre el mismo nivel de atención.
  - **¿Qué pasa si la persona mayor no quiere mudarse a un hogar?** Su opinión es decisiva: la Ley 1996 de 2019 reconoce su capacidad para decidir, así que conviene conversarlo, visitar opciones juntos y respetar su elección.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidado del adulto mayor a domicilio en Bogotá](/); [tarifas del cuidado en casa](/precios/); [cuidado 24 horas en casa](/servicios/cuidado-24-horas/); [cuidar en casa a una persona con Alzheimer](/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/); [cobertura en el norte de Bogotá](/zonas/)
- **CTA:** Compara con una cotización de cuidado en casa
- **Notas:** Posee «hogar geriátrico» sin topónimo o con «Bogotá». Las variantes con barrio/localidad/«norte» las posee la página de zona correspondiente (solo en el bloque comparativo).

#### `/blog/eps-cuidador-en-casa/` · C07

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/eps-derechos-y-tramites/`
- **Title (59):** ¿La EPS da cuidador en casa? Atención domiciliaria y tutela
- **Meta (151):** Qué cubre la atención domiciliaria de la EPS, cuándo la Corte ordena un cuidador, cómo pedirla en Compensar, Sanitas o Sura y cuándo procede la tutela.
- **H1:** ¿La EPS da cuidador en casa? Atención domiciliaria, tutela y cómo pedirla
- **Keyword principal:** cuidador de adulto mayor por eps (140)
- **Secundarias:** atencion domiciliaria (70); atencion domiciliaria compensar (210); atencion domiciliaria colsanitas (110); sanitas atencion domiciliaria (70); atencion domiciliaria sura (40); cuidador permanente eps (10); como solicitar atencion domiciliaria (s/d); qué incluye la atención domiciliaria (s/d)
- **Volumen del grupo:** 650 · **Intención:** informativa (EPS / MOFU)
- **H2:** Respuesta rápida: atención domiciliaria sí; cuidador, solo en casos excepcionales / Qué cubre la atención domiciliaria de la EPS / Cuándo la Corte Constitucional ha ordenado un cuidador / Cómo pedir atención domiciliaria paso a paso (Compensar, Sanitas, Sura y otras) / Tutela: cuándo procede y qué documentos necesitas / Mientras la EPS responde: alternativas privadas / Preguntas frecuentes
- **FAQ:**
  - **¿La EPS está obligada a dar un cuidador en casa?** No como regla general: el cuidado es, en principio, responsabilidad de la familia. La Corte Constitucional (por ejemplo, en la sentencia SU-508 de 2020) ha ordenado a las EPS asumirlo de forma excepcional cuando hay necesidad médica comprobada y la familia no puede brindarlo.
  - **¿Qué es la atención domiciliaria de la EPS?** Es la prestación de servicios de salud en la casa del paciente (consultas, enfermería, terapias o procedimientos) cuando el médico tratante la ordena; no incluye un cuidador permanente.
  - **¿Cómo solicito la atención domiciliaria en mi EPS?** Pide al médico tratante la orden de atención domiciliaria con el diagnóstico y la justificación, y radícala por los canales de tu EPS; si la niegan o se demora, pide la respuesta por escrito.
  - **¿Qué necesito para poner una tutela por un cuidador?** Historia clínica y orden o concepto médico que muestre la necesidad, prueba de que la familia no puede asumir el cuidado (económica o físicamente) y la respuesta negativa de la EPS, si la hay.
  - **¿La medicina prepagada cubre cuidador en casa?** Depende del plan: algunos incluyen atención domiciliaria o enfermería por evento, pero rara vez un cuidador permanente; revisa coberturas y exclusiones de tu contrato.
  - **¿Qué hago mientras la EPS responde?** Organiza el cuidado con la familia o con un servicio privado por horas o por turnos para no dejar sola a la persona, y guarda los soportes del proceso.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidado por horas mientras la EPS responde](/servicios/cuidado-por-horas/); [¿enfermera o cuidadora?](/blog/enfermera-o-cuidadora-a-domicilio/); [tarifas privadas](/precios/); [derechos de las personas mayores](/blog/leyes-y-derechos-del-adulto-mayor/)
- **CTA:** Mientras tanto, cubre las horas críticas con una cuidadora
- **Notas:** Verificar jurisprudencia citada (SU-508 de 2020, T-319 de 2025) antes de publicar. Nombres de EPS solo informativos.

#### `/blog/como-organizar-el-cuidado-de-un-adulto-mayor/` · C08

- **Tipo:** blog-cornerstone · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/contratar-cuidado/`
- **Title (52):** Cómo organizar el cuidado de un adulto mayor en casa
- **Meta (147):** Plan de cuidado paso a paso: mide cuánta ayuda necesita tu familiar, reparte tareas, elige entre horas, turnos o 24 horas y descarga una plantilla.
- **H1:** Cómo organizar el cuidado de un adulto mayor en casa: plan semanal, turnos y relevos
- **Keyword principal:** plan de cuidados del adulto mayor (10)
- **Secundarias:** tipos de cuidados en el adulto mayor (10); cómo organizar el cuidado de un adulto mayor en casa (s/d); turnos para cuidar a un adulto mayor (s/d); plantilla de plan de cuidado adulto mayor (s/d)
- **Volumen del grupo:** 20 · **Intención:** informativa (MOFU planificación)
- **H2:** Respuesta rápida: empieza por las horas de mayor riesgo / Paso 1: mide cuánta ayuda necesita (actividades de la vida diaria) / Paso 2: reparte el cuidado entre familia, cuidadoras y otros apoyos / Por horas, por turnos o 24 horas: cómo elegir / Ejemplos de planes semanales / Plantilla de plan de cuidado para descargar / Cuándo revisar el plan / Preguntas frecuentes
- **FAQ:**
  - **¿Qué debe incluir un plan de cuidados para un adulto mayor?** Rutinas, necesidades, medicamentos y horarios, contactos de emergencia y preferencias de la persona, en un documento que comparten todos los que la cuidan para hacerlo de la misma manera.
  - **¿Cómo saber cuántas horas de cuidado necesita mi familiar?** Observa durante una semana qué actividades no puede hacer solo (bañarse, vestirse, comer, moverse, tomar medicamentos) y en qué momentos ocurren; esos momentos marcan las horas que hay que cubrir.
  - **¿Cómo repartir el cuidado entre hermanos?** Definan por escrito quién cubre qué días o tareas, quién coordina y cómo se comparten los gastos, y revisen el acuerdo cada mes.
  - **¿Cada cuánto hay que revisar el plan de cuidado?** Al menos cada tres meses y siempre después de una hospitalización, una caída o un cambio de medicamentos.
  - **¿Qué conviene más, varios turnos cortos o uno largo?** Los turnos cortos sirven si la necesidad se concentra en momentos puntuales (baño, comidas); si tu familiar no puede quedarse solo durante el día, un turno continuo da más seguridad.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [modalidades de servicio](/servicios/); [por horas](/servicios/cuidado-por-horas/); [noches](/servicios/cuidado-nocturno/); [24 horas](/servicios/cuidado-24-horas/); [plan de cuidado con Sovialis](/como-funciona/)
- **CTA:** Descarga la plantilla y cotiza tu plan
- **Notas:** Re-enfocado para no canibalizar las landings de modalidad: posee la planificación, no «enfermera/cuidadora por horas/24 horas».

#### `/blog/cuidados-postoperatorios-en-casa/` · C09

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/cuidados-y-salud-en-casa/`
- **Title (53):** Cuidados después de una cirugía: guía para la familia
- **Meta (148):** Primeras 72 horas en casa, cuidados según la cirugía (cadera, rodilla, abdomen), señales de alarma y qué hace la familia y qué el personal de salud.
- **H1:** Cuidado postoperatorio: guía para la familia en las primeras semanas
- **Keyword principal:** cuidado postoperatorio (110)
- **Secundarias:** cuidados en el hogar después de una cirugía (10); cuáles son los cuidados postoperatorios en casa (10); cuidados después de cirugía de cadera (s/d); recuperación de cirugía de rodilla en casa (s/d); señales de alarma después de una cirugía (s/d)
- **Volumen del grupo:** 130 · **Intención:** informativa (MOFU condición)
- **H2:** Las primeras 72 horas en casa / Cuidados según la cirugía: cadera, rodilla y abdomen / Herida, drenajes y medicamentos: qué hace la familia y qué el personal de salud / Prevenir caídas y lesiones de piel durante la recuperación / Señales de alarma para volver a urgencias / Cuándo contratar apoyo en casa / Preguntas frecuentes
- **FAQ:**
  - **¿Cuáles son los cuidados postoperatorios en casa más importantes?** Seguir al pie de la letra las indicaciones del alta, mantener la herida limpia y seca, tomar los medicamentos a tiempo, moverse según lo indicado y vigilar las señales de alarma.
  - **¿Qué señales de alarma indican volver a urgencias después de una cirugía?** Fiebre, sangrado o pus en la herida, dolor que no cede con los medicamentos, dificultad para respirar, dolor o hinchazón en una pierna o confusión súbita.
  - **¿Cuánto tiempo necesita ayuda una persona mayor después de una cirugía de cadera?** Depende del tipo de cirugía, la edad y la movilidad previa; el equipo médico y el fisioterapeuta indicarán los plazos, y la mayor necesidad de ayuda suele estar en las primeras semanas.
  - **¿Qué ayudas técnicas conviene tener en casa para la recuperación?** Según la cirugía, suelen ser útiles una silla de ducha, barras de apoyo, caminador o muletas y una cama a buena altura; el equipo médico te indicará lo necesario.
  - **¿Puede una persona mayor ducharse después de una cirugía?** Solo cuando el equipo médico lo autorice y según el tipo de apósito; mientras tanto, el aseo puede hacerse con baño de esponja, protegiendo la herida.
  - **¿Qué comer después de una cirugía para recuperarse mejor?** Sigue la dieta indicada al alta; en general ayudan una buena hidratación, proteína suficiente y fibra para prevenir el estreñimiento por los analgésicos, salvo restricciones médicas.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidado postoperatorio en casa en Bogotá](/servicios/cuidado-postoperatorio/); [personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [acompañamiento en la clínica](/servicios/acompanamiento-hospitalario/); [¿necesitas enfermería?](/blog/enfermera-o-cuidadora-a-domicilio/)
- **CTA:** Organiza el regreso a casa con una cuidadora
- **Notas:** Título sin «enfermera» (ajuste legal). Curaciones y drenajes: solo explicar que los hace personal de salud.

#### `/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/` · C10

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/cuidados-y-salud-en-casa/`
- **Title (51):** Cómo cuidar en casa a un adulto mayor con Alzheimer
- **Meta (148):** Guía para familias: etapas de la demencia, rutina y seguridad en casa, agitación e insomnio, actividades y cuándo considerar un hogar especializado.
- **H1:** Cómo cuidar en casa a un adulto mayor con Alzheimer o demencia: guía para familias
- **Keyword principal:** cuidados de un adulto mayor con alzheimer (10)
- **Secundarias:** cuidado de personas con alzheimer (10); cómo se debe cuidar una persona con alzheimer (s/d); hogares para adultos mayores con alzheimer (20); casa de reposo alzheimer (10); actividades para adulto mayor con alzheimer (10); juegos para alzheimer (10); actividades cognitivas para adultos mayores con demencia (10); centros de cuidado para personas con alzheimer (10); cuidados de un paciente con alzheimer (10)
- **Volumen del grupo:** 100 · **Intención:** informativa (MOFU condición)
- **H2:** Etapas de la demencia y nivel de cuidado en cada una / Rutina diaria y seguridad en el hogar / Agitación, insomnio y deambulación: cómo manejarlos / Actividades que sí funcionan / Qué pedirle a una cuidadora con experiencia en demencia / Hogar especializado o casa: cuándo cambiar / Preguntas frecuentes
- **FAQ:**
  - **¿Cómo se debe cuidar a una persona con Alzheimer en casa?** Con rutinas estables, un entorno seguro y simple, comunicación calmada con frases cortas y actividades adaptadas a lo que todavía disfruta, respetando su dignidad y sus decisiones posibles.
  - **¿Qué actividades sirven para una persona con Alzheimer?** Las que conectan con su historia y aún puede hacer: música que le gusta, doblar ropa, regar plantas, mirar fotos, juegos sencillos de emparejar o caminatas cortas.
  - **¿Cómo reaccionar si mi familiar no me reconoce?** Preséntate con calma, sin corregirlo ni discutir, y conecta desde la emoción; insistir en que recuerde suele aumentar la angustia.
  - **¿Cuándo considerar un hogar especializado en Alzheimer?** Cuando el cuidado en casa ya no garantiza seguridad, hay agresividad o deambulación difícil de manejar o la familia está agotada; la decisión se toma con el equipo médico y, en lo posible, con la persona.
  - **¿Qué cambios en casa ayudan a prevenir accidentes en la demencia?** Retirar tapetes, guardar medicamentos y objetos peligrosos, iluminar los pasillos de noche, poner seguros en las puertas que dan a la calle y rotular los cuartos con imágenes.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage, MedicalCondition (about)
- **Enlaces internos:** [cuidadora para personas con Alzheimer en Bogotá](/servicios/cuidado-alzheimer-demencia/); [noches con apoyo](/servicios/cuidado-nocturno/); [más ideas de actividades](/blog/actividades-para-adultos-mayores/); [hogar o casa: cómo decidir](/blog/hogar-geriatrico-o-cuidado-en-casa/)
- **CTA:** Habla con nosotros sobre el cuidado en demencia

#### `/blog/cuidados-paliativos-en-casa/` · C11

- **Tipo:** blog-cornerstone · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/cuidados-y-salud-en-casa/`
- **Title (52):** Cuidados paliativos en casa: qué son y cómo pedirlos
- **Meta (146):** Qué son los cuidados paliativos, qué cubre la EPS según la Ley 1733 de 2014, cómo pedirlos en casa y qué papel cumplen la familia y una cuidadora.
- **H1:** Cuidados paliativos en casa: qué son, quién los cubre y cómo organizarlos
- **Keyword principal:** cuidados paliativos que es (70)
- **Secundarias:** paliativo cuidado (30); cuáles son los cuidados paliativos (20); cuidado paliativo definicion (20); para que son los cuidados paliativos (10); como solicitar cuidados paliativos en casa (10); cuidados paliativos domiciliarios (10); cuidados paliativos a domicilio (10); medico paliativo a domicilio (10); quien cubre los cuidados paliativos (s/d)
- **Volumen del grupo:** 180 · **Intención:** informativa (MOFU condición)
- **H2:** Qué son los cuidados paliativos (y qué no son) / Qué cubre la EPS: Ley 1733 de 2014 / Cómo solicitar cuidados paliativos en casa / El equipo de salud y el papel de la familia / Confort y acompañamiento en el día a día / Cuidadoras de apoyo: compañía y cuidado básico / Preguntas frecuentes
- **FAQ:**
  - **¿Qué son los cuidados paliativos?** Son la atención integral de personas con enfermedades crónicas, degenerativas o terminales que busca aliviar el dolor y otros síntomas y mejorar la calidad de vida de la persona y su familia, sin acelerar ni retrasar la muerte.
  - **¿La EPS cubre los cuidados paliativos en casa?** Sí: la Ley 1733 de 2014 reconoce el derecho a los cuidados paliativos y las EPS deben garantizarlos a través de su red, en la modalidad que indique el equipo tratante, incluida la domiciliaria.
  - **¿Cómo solicitar cuidados paliativos en casa?** Pide al médico tratante la remisión al servicio de cuidados paliativos de tu EPS; el equipo valorará a la persona y definirá si la atención puede darse en el domicilio.
  - **¿Cuidados paliativos significa que ya no hay tratamiento?** No. Pueden darse junto con tratamientos que buscan controlar la enfermedad y empezar desde el diagnóstico de una enfermedad grave, no solo al final de la vida.
  - **¿Qué puede hacer una cuidadora en un plan de cuidados paliativos?** Acompañar, ayudar con la higiene, la alimentación y los cambios de posición, vigilar el confort y avisar al equipo de salud; el manejo del dolor y los medicamentos los define y aplica el equipo paliativo.
  - **¿Qué es el documento de voluntad anticipada?** Es el documento en el que una persona deja por escrito sus decisiones sobre los tratamientos que quiere o no recibir al final de la vida; lo reconoce la Ley 1733 de 2014 y lo reglamenta la Resolución 2665 de 2018.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [acompañamiento continuo en casa](/servicios/cuidado-24-horas/); [atención domiciliaria por EPS](/blog/eps-cuidador-en-casa/); [personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/)
- **CTA:** Acompañamiento en casa, en coordinación con el equipo paliativo
- **Notas:** Sovialis no ofrece cuidados paliativos (servicio de salud): solo compañía y cuidado básico complementarios.

#### `/blog/que-es-un-acompanante-permanente/` · C12

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/contratar-cuidado/`
- **Title (59):** Acompañante permanente: qué es y cuándo lo exige la clínica
- **Meta (154):** Qué significa que un paciente necesite acompañante permanente, quién lo decide, qué hace (y qué no) un acompañante en clínica y cómo organizar las noches.
- **H1:** Acompañante permanente en clínica y en citas: qué es y cuándo se necesita
- **Keyword principal:** acompañante permanente (s/d) — Sin volumen medible; alto valor GEO (respuestas citables) y apoyo a las landings de acompañamiento.
- **Secundarias:** que significa acompañante permanente (s/d); que es acompañante permanente (s/d); cuando un paciente necesita acompañante (s/d); qué pacientes requieren acompañante (s/d); que es un acompañante hospitalario (s/d); que hace un acompañante de adulto mayor (s/d)
- **Volumen del grupo:** 0 · **Intención:** informativa (BOFU acompañamiento)
- **H2:** Qué es un acompañante permanente / Qué pacientes lo requieren y quién lo decide / Qué hace (y qué no) un acompañante en clínica y en citas / Acompañamiento nocturno en hospital: cómo organizarlo / ¿Familia o acompañante contratado? / Preguntas frecuentes
- **FAQ:**
  - **¿Qué significa que un paciente necesite acompañante permanente?** Que el equipo médico considera que no debe quedarse solo en ningún momento (por riesgo de caída, desorientación o dependencia), por lo que la clínica pide que un adulto lo acompañe las 24 horas.
  - **¿Qué pacientes suelen requerir acompañante en una clínica?** Personas mayores con demencia o delirium, con alto riesgo de caída o con dependencia para moverse o comer, y menores de edad; cada institución define sus criterios.
  - **¿El acompañante puede ser alguien que no sea de la familia?** En muchas clínicas sí, siempre que sea mayor de edad y se registre según sus normas; conviene informarlo al puesto de enfermería.
  - **¿Qué no debe hacer un acompañante hospitalario?** No debe administrar medicamentos, manipular sueros o equipos ni levantar al paciente sin autorización; ante cualquier cambio, avisa a enfermería.
  - **¿Cómo organizar los turnos de acompañamiento entre familiares?** Hagan un cuadro de relevos de máximo 12 horas, procuren que las noches las cubra alguien descansado y dejen por escrito la información clave del paciente para cada relevo.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [acompañante hospitalario en Bogotá](/servicios/acompanamiento-hospitalario/); [acompañamiento a citas médicas](/servicios/acompanamiento-citas-medicas/); [turnos de noche](/servicios/cuidado-nocturno/)
- **CTA:** Pide un acompañante para la clínica

#### `/blog/inyectologia-a-domicilio-bogota/` · C13

- **Tipo:** blog-cornerstone · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/eps-derechos-y-tramites/`
- **Title (56):** Inyectología a domicilio en Bogotá: requisitos y trámite
- **Meta (150):** Qué es la inyectología a domicilio, quién puede aplicar una inyección en casa, qué pedir (orden médica, IPS habilitada) y cómo solicitarla por tu EPS.
- **H1:** Inyectología a domicilio en Bogotá: quién puede aplicarla y cómo pedirla
- **Keyword principal:** inyectología a domicilio (590)
- **Secundarias:** inyectologia (1000); inyectologia cerca de mi (210); inyectologia a domicilio bogota (110); inyectología a domicilio cerca de mi (110); servicio de inyectología a domicilio (90); servicios de inyectologia (90); inyectologia bogota (50); inyectologia 24 horas bogota (40); cuanto cobra una enfermera por poner suero a domicilio (s/d)
- **Volumen del grupo:** 2300 · **Intención:** informativa (captura legal de «inyectología»)
- **H2:** Qué es la inyectología y qué procedimientos incluye / Quién puede aplicar una inyección en casa / Requisitos: orden médica y prestador habilitado en el REPS / Cómo pedirla por la EPS, la prepagada o de forma particular / Cómo verificar a la IPS antes de abrir la puerta / ¿Y el resto del día? Cuidado y compañía en casa / Preguntas frecuentes
- **FAQ:**
  - **¿Qué es la inyectología?** Es la aplicación de medicamentos inyectables (intramuscular, subcutánea o intravenosa) por personal de salud, con orden médica y en condiciones de bioseguridad.
  - **¿Quién puede aplicar una inyección a domicilio en Colombia?** Personal de salud con título y registro en el ReTHUS que actúe a través de un prestador habilitado para la modalidad domiciliaria, con la orden médica correspondiente.
  - **¿Necesito orden médica para que me apliquen una inyección en casa?** Sí. El medicamento debe estar formulado por un médico, y quien lo aplica debe verificar la orden, la dosis y la vía antes de hacerlo.
  - **¿Cómo pedir inyectología a domicilio por la EPS?** Con la orden del médico tratante, solicita en tu EPS la aplicación domiciliaria si tu familiar no puede desplazarse; la EPS la autoriza a través de su red de prestadores.
  - **¿Qué preguntar antes de recibir a alguien para una inyección en casa?** El nombre de la IPS y su habilitación, el nombre y registro de quien la aplica, y que traiga el material desechable sellado y un recipiente seguro para los residuos.
  - **¿La insulina la puede aplicar la familia?** Muchas personas con diabetes o sus familiares aprenden a aplicarla con entrenamiento del equipo de salud; sigue siempre las indicaciones del médico o del educador en diabetes.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [¿enfermera o cuidadora?](/blog/enfermera-o-cuidadora-a-domicilio/); [atención domiciliaria por EPS](/blog/eps-cuidador-en-casa/); [cuidado diario por personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [cuidado del adulto mayor en casa](/)
- **CTA:** ¿Además necesitas cuidado diario? Conoce nuestros servicios (sin CTA de procedimiento)
- **Notas:** LEGAL: Sovialis no aplica inyecciones. Prohibido el CTA «agenda tu inyección». Si existe IPS aliada, se menciona como contacto que la familia contrata directamente.

### 8.6 Blog: artículos de apoyo

#### `/blog/actividades-para-adultos-mayores/`

- **Tipo:** blog-apoyo · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/bienestar-y-cuidador-familiar/`
- **Title (50):** Actividades para adultos mayores en casa: 40 ideas
- **Meta (155):** Ideas de actividades físicas, mentales, creativas y sociales para personas mayores en casa, también con movilidad reducida, y cómo armar una semana activa.
- **H1:** Actividades para adultos mayores en casa: 40 ideas para cada día
- **Keyword principal:** actividades para adultos mayores (260)
- **Secundarias:** actividades para adulto mayor (260); actividad para el adulto mayor (260); actividades con adultos mayores (70); actividad lúdica para adultos (90); actividades ludicas para adultos (90); actividades recreativas para adultos mayores (10)
- **Volumen del grupo:** 360 · **Intención:** informativa (TOFU bienestar)
- **H2:** Respuesta rápida: cómo elegir actividades para una persona mayor / Actividades físicas suaves / Actividades para la mente / Actividades creativas y manuales / Actividades sociales y con la familia / Actividades para personas con movilidad reducida / Cómo armar una semana de actividades / Preguntas frecuentes
- **FAQ:**
  - **¿Qué actividades puede hacer un adulto mayor en casa?** Cocinar recetas sencillas, cuidar plantas, escuchar y comentar música, hacer manualidades, leer en voz alta, ordenar fotos, jugar cartas o dominó y hacer estiramientos suaves.
  - **¿Cómo motivar a un adulto mayor que no quiere hacer nada?** Ofrece pocas opciones ligadas a sus gustos, empieza con actividades cortas, participa con él o ella y valora el esfuerzo; si el desinterés es nuevo o persistente, coméntalo con su médico porque puede ser señal de depresión.
  - **¿Cuántas actividades al día son recomendables?** No hay una cifra única: lo ideal es alternar momentos de actividad física, mental y social a lo largo del día, respetando el descanso y la energía de la persona.
  - **¿Qué actividades sirven para un adulto mayor en silla de ruedas?** Ejercicios de brazos con banda elástica, juegos de mesa, pintura, música con instrumentos de percusión, cocina en la mesa y jardinería en macetas a su altura.
  - **¿Qué actividades grupales funcionan para personas mayores?** Bingo, karaoke, tertulias sobre recuerdos, baile sentado, talleres de manualidades y caminatas en grupo, adaptadas a la movilidad de cada participante.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [rutina de ejercicios](/blog/ejercicios-para-adultos-mayores-en-casa/); [compañía por horas](/servicios/cuidado-por-horas/); [cuidadora que acompaña las actividades](/servicios/cuidadora-adulto-mayor/); [actividades en demencia](/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/)
- **CTA:** Una cuidadora puede acompañar estas actividades: cotiza por horas
- **Notas:** Pieza TOFU de mayor volumen. «juegos/memoria/cognitivas» los posee S03; «ejercicios/actividad física» los posee S02.

#### `/blog/ejercicios-para-adultos-mayores-en-casa/`

- **Tipo:** blog-apoyo · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/bienestar-y-cuidador-familiar/`
- **Title (54):** Ejercicios para adultos mayores en casa: rutina segura
- **Meta (130):** Rutina segura para personas mayores en casa: calentamiento, fuerza, equilibrio, ejercicios sentados y estiramientos, según la OMS.
- **H1:** Ejercicios para adultos mayores en casa: rutina segura paso a paso
- **Keyword principal:** ejercicios para adultos mayores (260)
- **Secundarias:** ejercicios para adultos mayor (260); adultos mayores ejercicios (110); actividad física adulto mayor (73); actividad fisica en el adulto mayor (73); ejercicios para personas mayores (30); ejercicios en casa para mayores (20); adulto mayor y actividad fisica (73)
- **Volumen del grupo:** 383 · **Intención:** informativa (TOFU bienestar)
- **H2:** Respuesta rápida: qué ejercicios y cuánto / Antes de empezar: precauciones / Calentamiento / Ejercicios de fuerza / Ejercicios de equilibrio / Ejercicios sentados / Estiramientos para terminar / Preguntas frecuentes
- **FAQ:**
  - **¿Qué ejercicios son buenos para los adultos mayores?** Caminar, ejercicios de fuerza con el propio peso o con bandas elásticas, ejercicios de equilibrio y estiramientos suaves, combinados según la indicación de su médico.
  - **¿Cuánta actividad física necesita una persona mayor?** La OMS recomienda entre 150 y 300 minutos semanales de actividad moderada, fortalecimiento muscular dos o más días y ejercicios de equilibrio y fuerza tres o más días, adaptados a la condición de cada persona.
  - **¿Qué ejercicios puede hacer un adulto mayor sentado?** Elevar talones y puntas, extender las rodillas, marchar sentado, abrir y cerrar las manos, subir los brazos y girar suavemente el tronco.
  - **¿Qué precauciones tomar antes de hacer ejercicio en casa?** Consultar al médico si hay enfermedad del corazón, mareos o caídas recientes, usar calzado firme, tener una silla estable de apoyo, hidratarse y detenerse ante dolor en el pecho o falta de aire.
  - **¿A qué hora del día es mejor hacer ejercicio?** En el momento en que la persona tenga más energía y los medicamentos no le causen mareo; mantener un horario fijo ayuda a crear el hábito.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [más actividades en casa](/blog/actividades-para-adultos-mayores/); [cuidadora que acompaña la rutina](/servicios/cuidadora-adulto-mayor/); [cuidado del adulto mayor a domicilio](/)
- **CTA:** Acompañamiento para hacer la rutina con seguridad
- **Notas:** Citar OMS (Directrices sobre actividad física, 2020) con enlace.

#### `/blog/juegos-de-memoria-para-adultos-mayores/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/bienestar-y-cuidador-familiar/`
- **Title (56):** Juegos de memoria para adultos mayores (con imprimibles)
- **Meta (153):** Juegos y ejercicios de memoria, lenguaje, atención y cálculo para personas mayores, con fichas gratis para imprimir y consejos para evitar frustraciones.
- **H1:** Juegos y ejercicios de memoria para adultos mayores (con fichas para imprimir)
- **Keyword principal:** actividades cognitivas para adultos mayores (90)
- **Secundarias:** juegos para adultos mayores (90); juegos de memoria para adultos mayores (50); ejercicios de memoria para adultos mayores (s/d); imprimir actividades para adultos mayores (70); juegos didácticos para adultos mayores (59); ejercicios cognitivas para adultos mayores (40); ejercicios de estimulación cognitiva para adultos mayores (10); juegos de mesa adulto mayor (10)
- **Volumen del grupo:** 419 · **Intención:** informativa (TOFU bienestar)
- **H2:** Respuesta rápida: qué es la estimulación cognitiva / Juegos de memoria / Juegos de palabras y lenguaje / Ejercicios de atención y cálculo / Juegos de mesa adaptados / Fichas para imprimir / Preguntas frecuentes
- **FAQ:**
  - **¿Qué juegos ayudan a la memoria de los adultos mayores?** Sopas de letras, crucigramas, parejas de cartas, completar refranes, ordenar secuencias, juegos de categorías y recordar listas de compras.
  - **¿La estimulación cognitiva previene el Alzheimer?** No hay evidencia de que lo prevenga por sí sola, pero mantenerse activo mental, física y socialmente se asocia con un mejor funcionamiento cognitivo; consulta al médico ante olvidos que afecten la vida diaria.
  - **¿Cuánto tiempo al día dedicar a ejercicios de memoria?** Funcionan mejor las sesiones cortas, varias veces por semana, que una sesión larga; detente si aparece frustración o cansancio.
  - **¿Dónde conseguir actividades imprimibles para adultos mayores?** En esta guía hay fichas gratuitas para imprimir; también puedes crear las tuyas con fotos familiares, recetas y canciones conocidas por tu familiar.
  - **¿Qué juegos de mesa son adecuados para personas mayores?** Dominó, parqués, cartas, lotería o bingo, rompecabezas de piezas grandes y juegos de palabras, con reglas sencillas y piezas fáciles de manipular.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [actividades para adultos mayores](/blog/actividades-para-adultos-mayores/); [cuidado en Alzheimer](/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/); [compañía por horas](/servicios/cuidado-por-horas/)
- **CTA:** Descarga las fichas (lead magnet con correo opcional)

#### `/blog/cuidados-basicos-del-adulto-mayor/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/cuidados-y-salud-en-casa/`
- **Title (56):** Cuidados básicos del adulto mayor en casa: guía práctica
- **Meta (151):** Los cuidados esenciales de una persona mayor en casa: alimentación, hidratación, higiene, medicamentos, sueño, caídas y compañía, y cuándo pedir ayuda.
- **H1:** Cuidados básicos del adulto mayor en casa: guía práctica para la familia
- **Keyword principal:** cuidados del adulto mayor en el hogar (10)
- **Secundarias:** cuidados básicos del adulto mayor (10); 10 cuidados del adulto mayor (10); cuáles son los cuidados del adulto mayor (10); cuidados del adulto mayor dependiente (10); ayudar a adultos mayores (90); higiene personal adulto mayor (10); cuidados de higiene en el adulto mayor (10)
- **Volumen del grupo:** 160 · **Intención:** informativa (TOFU cuidados)
- **H2:** Respuesta rápida: los 10 cuidados básicos / Alimentación e hidratación / Higiene y cuidado de la piel / Medicamentos sin errores / Movilidad, sueño y prevención de caídas / Compañía y salud emocional / Cuándo pedir ayuda / Preguntas frecuentes
- **FAQ:**
  - **¿Cuáles son los cuidados básicos de un adulto mayor?** Alimentación e hidratación adecuadas, higiene y cuidado de la piel, actividad física, sueño regular, control de medicamentos, prevención de caídas y compañía para evitar el aislamiento.
  - **¿Cada cuánto debe bañarse un adulto mayor?** Depende de su piel, su actividad y sus preferencias: no siempre necesita ducha completa diaria, pero sí aseo diario de zonas íntimas, axilas y pies, y un secado cuidadoso de los pliegues.
  - **¿Cuánta agua debe tomar una persona mayor?** La sed disminuye con la edad, así que conviene ofrecer líquidos a lo largo del día aunque no los pida, salvo que el médico haya indicado restringirlos.
  - **¿Cómo organizar los medicamentos de un adulto mayor?** Con un pastillero semanal por horarios, una lista actualizada de medicamentos y dosis y alarmas o recordatorios; revisa la lista con el médico en cada control.
  - **¿Cómo evitar que un adulto mayor se sienta solo?** Mantén rutinas de contacto (llamadas, visitas), facilita su participación en grupos o actividades del barrio y pídele su opinión en las decisiones de la casa.
  - **¿Qué señales indican que un adulto mayor ya necesita ayuda en casa?** Pérdida de peso, descuido de la higiene, olvidos con los medicamentos, caídas, desorden inusual en la casa o aislamiento; si los notas, conversa con él o ella y con su médico.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidado del adulto mayor a domicilio](/); [prevención de caídas](/blog/prevencion-de-caidas-en-adultos-mayores/); [alimentación](/blog/alimentacion-del-adulto-mayor/); [cuidadora](/servicios/cuidadora-adulto-mayor/)
- **CTA:** ¿Ya necesita ayuda? Cotiza una cuidadora
- **Notas:** Posee «cuidados (plural) del adulto mayor + hogar/básicos/cuáles». El singular comercial «cuidado del adulto mayor» lo posee el home.

#### `/blog/prevencion-de-caidas-en-adultos-mayores/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/cuidados-y-salud-en-casa/`
- **Title (58):** Prevención de caídas en adultos mayores: guía para la casa
- **Meta (147):** Por qué se caen las personas mayores, cómo adaptar la casa cuarto por cuarto, qué hacer después de una caída y qué ejercicios ayudan a prevenirlas.
- **H1:** Prevención de caídas en adultos mayores: guía para adaptar la casa
- **Keyword principal:** prevencion de caidas (73)
- **Secundarias:** caídas en adultos mayores (s/d); cómo prevenir caídas en el adulto mayor (s/d); adaptar la casa para un adulto mayor (s/d); barras de apoyo para baño adulto mayor (s/d); qué hacer si un adulto mayor se cae (s/d)
- **Volumen del grupo:** 73 · **Intención:** informativa (TOFU seguridad)
- **H2:** Respuesta rápida: las causas más comunes / Revisión de la casa cuarto por cuarto / Baño seguro / Calzado, visión y medicamentos / Ejercicios que ayudan / Qué hacer después de una caída / Preguntas frecuentes
- **FAQ:**
  - **¿Por qué se caen con frecuencia los adultos mayores?** Por la pérdida de fuerza y equilibrio, problemas de visión, medicamentos que causan mareo, calzado inadecuado y obstáculos en la casa como tapetes o poca luz.
  - **¿Qué hacer si un adulto mayor se cae en casa?** No lo levantes de inmediato: revisa si está consciente, si tiene dolor intenso o no puede mover una extremidad, y en ese caso llama al 123. Si está bien, ayúdalo a incorporarse despacio con apoyo de una silla.
  - **¿Qué adaptaciones reducen el riesgo de caídas en el baño?** Barras de apoyo junto al sanitario y la ducha, piso antideslizante, silla de ducha, elevador de inodoro y luz nocturna en el camino al baño.
  - **¿Qué ejercicios ayudan a prevenir caídas?** Los de equilibrio y fuerza de piernas, como pararse de una silla sin usar las manos, caminar talón-punta con apoyo o sostenerse en un pie junto a un mesón.
  - **¿Los medicamentos pueden aumentar el riesgo de caídas?** Sí, en especial los que dan sueño, bajan la presión o actúan sobre el sistema nervioso; pide al médico revisar la lista completa si tu familiar ya se ha caído.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [acompañamiento nocturno](/servicios/cuidado-nocturno/); [ejercicios de equilibrio](/blog/ejercicios-para-adultos-mayores-en-casa/); [cuidadora](/servicios/cuidadora-adulto-mayor/); [cuidados básicos](/blog/cuidados-basicos-del-adulto-mayor/)
- **CTA:** Si hubo una caída reciente, no lo dejes solo: cotiza

#### `/blog/cuidados-paciente-encamado/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/cuidados-y-salud-en-casa/`
- **Title (58):** Cuidados de un adulto mayor encamado: guía para la familia
- **Meta (152):** Cómo cuidar a una persona mayor que pasa el día en cama: cambios de posición, escaras, higiene en cama, alimentación segura y movilización sin lesiones.
- **H1:** Cuidados de un adulto mayor encamado o postrado: guía para la familia
- **Keyword principal:** cuidados del adulto mayor postrado en cama (10)
- **Secundarias:** adulto mayor postrado en cama (10); cuidado de pacientes postrados (10); cuidados en pacientes postrados (10); cuidados de paciente encamado (10); pacientes encamados cuidados (10); enfermos encamados (10); cambios posturales en paciente encamado (s/d); prevenir escaras (s/d)
- **Volumen del grupo:** 50 · **Intención:** informativa (MOFU dependencia)
- **H2:** Respuesta rápida: los cuidados esenciales / Cambios de posición y prevención de escaras / Higiene en cama / Alimentación e hidratación seguras / Movilización sin lesiones para quien cuida / Cuándo llamar a la EPS / Preguntas frecuentes
- **FAQ:**
  - **¿Cada cuánto hay que cambiar de posición a una persona en cama?** Como referencia general se recomienda cada 2 horas, o con la frecuencia que indique su equipo de salud según el estado de la piel y el tipo de colchón.
  - **¿Cómo prevenir las escaras en un paciente encamado?** Cambiando de posición con frecuencia, manteniendo la piel limpia, seca e hidratada, revisando a diario talones, cadera y espalda baja y usando colchón antiescaras si está indicado.
  - **¿Cómo bañar a una persona que no se levanta de la cama?** Con baño de esponja por partes: prepara todo antes, mantén la habitación templada, descubre solo la zona que lavas, seca bien los pliegues y revisa la piel mientras lo haces.
  - **¿Qué hacer si aparece una herida por presión?** Avisa a su médico o a la EPS para que personal de salud la valore y la cure; mientras tanto, evita que la persona se apoye sobre esa zona.
  - **¿Cómo alimentar a una persona encamada sin que se atore?** Siéntala lo más erguida posible, ofrece porciones pequeñas y despacio, y mantenla sentada un rato después de comer; si tose o se atraganta seguido, consulta porque puede necesitar otra textura de dieta.
  - **¿Qué elementos facilitan el cuidado de un paciente encamado?** Cama hospitalaria con barandas, colchón antiescaras, sábana para movilizar, protectores de colchón, cojines para posicionar y pañales de buena absorción.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidado de personas dependientes](/servicios/cuidado-personas-dependientes/); [personal con formación de auxiliar](/servicios/auxiliar-de-enfermeria/); [evitar el agotamiento del cuidador](/blog/cuidar-al-cuidador/)
- **CTA:** Apoyo para movilizar y cuidar a tu familiar en cama

#### `/blog/cuidar-al-cuidador/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/bienestar-y-cuidador-familiar/`
- **Title (46):** Cuidar al cuidador: cómo evitar el agotamiento
- **Meta (136):** Qué es el síndrome del cuidador, cómo saber si estás sobrecargado, cómo organizar relevos y descansos y cuándo buscar ayuda profesional.
- **H1:** Cuidar al cuidador: síndrome del cuidador y cómo evitar el agotamiento
- **Keyword principal:** cuidar al cuidador (40)
- **Secundarias:** cuidados del cuidador (40); sindrome del cuidador del adulto mayor (10); sindrome del cuidador adulto mayor (10); sindrome del cuidador de ancianos (10); la sobrecarga de las cuidadoras de personas dependientes (10); cuidador familiar de personas dependientes (10); enfermedad del cuidador de ancianos (10); autocuidado del cuidador (10)
- **Volumen del grupo:** 100 · **Intención:** informativa (TOFU cuidador familiar)
- **H2:** Respuesta rápida: señales de agotamiento / Qué es el síndrome del cuidador / Cómo medir la sobrecarga / Pedir y organizar ayuda / Respiro: descansos que sí funcionan / Cuidar tu salud física y emocional / Preguntas frecuentes
- **FAQ:**
  - **¿Qué es el síndrome del cuidador?** Es el agotamiento físico y emocional de quien cuida durante mucho tiempo a un familiar dependiente, con cansancio, irritabilidad, problemas de sueño, aislamiento y descuido de la propia salud.
  - **¿Cómo saber si estoy sobrecargado como cuidador?** Si duermes mal, dejaste tus actividades y amistades, sientes culpa al descansar o irritabilidad con tu familiar, es momento de pedir ayuda; escalas como la de Zarit ayudan a medirlo con un profesional.
  - **¿Qué puedo hacer para descansar si cuido a mi papá o a mi mamá?** Programa relevos fijos con otros familiares o con una cuidadora por horas, aunque sean pocas horas a la semana, y úsalos para dormir, hacer ejercicio o ver a otras personas.
  - **¿Es normal sentir culpa por contratar ayuda?** Es frecuente, pero pedir apoyo permite cuidar mejor y por más tiempo; tu familiar se beneficia de tener cerca a alguien descansado y presente.
  - **¿Cuándo buscar ayuda profesional para el cuidador?** Si hay tristeza persistente, ansiedad, consumo de alcohol para sobrellevar la carga o pensamientos de hacerse daño, consulta a tu EPS; ante una emergencia, llama al 123.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [relevos por horas](/servicios/cuidado-por-horas/); [respiro familiar](/servicios/respiro-familiar/); [apoyos del Distrito para cuidadores](/blog/apoyos-para-cuidadores-en-bogota/)
- **CTA:** Tómate un respiro: cotiza unas horas de cuidado

#### `/blog/que-es-home-care/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/contratar-cuidado/`
- **Title (53):** ¿Qué es home care? Diferencias con el cuidado en casa
- **Meta (151):** Qué significa home care en Colombia, qué servicios de salud incluye, en qué se diferencia de una agencia de cuidadoras y cómo verificar a un prestador.
- **H1:** ¿Qué es home care? Diferencias con el cuidado no sanitario en casa
- **Keyword principal:** home care (210)
- **Secundarias:** qué es home care (90); home care que es (20); que es home care (90); home care bogota (20); home care cerca de mi (10)
- **Volumen del grupo:** 330 · **Intención:** informativa (definición / MOFU)
- **H2:** Respuesta rápida: qué es home care / Home care de salud: qué incluye y quién lo presta / Cuidado no sanitario en casa: qué incluye / Tabla comparativa / Cómo verificar un prestador de home care / Cuándo combinar ambos / Preguntas frecuentes
- **FAQ:**
  - **¿Qué significa home care?** Es un término en inglés para la atención en el hogar; en Colombia se usa sobre todo para servicios de salud domiciliaria que prestan IPS habilitadas: médicos, enfermería y terapias.
  - **¿Qué diferencia hay entre home care y una agencia de cuidadoras?** El home care de salud lo presta una IPS con personal de salud y orden médica; una agencia de cuidado como Sovialis presta cuidado no sanitario: compañía, higiene, alimentación y movilidad.
  - **¿El home care lo cubre la EPS?** Los servicios de salud domiciliaria pueden estar cubiertos si el médico tratante los ordena y la EPS los autoriza a través de su red de prestadores.
  - **¿Qué servicios incluye un programa de home care?** Suele incluir visitas médicas, enfermería, terapias física y respiratoria, toma de muestras y, en algunos casos, hospitalización en casa, según el prestador.
  - **¿Cómo elegir una empresa de home care en Bogotá?** Verifica su habilitación en el REPS para la modalidad domiciliaria, que sus profesionales tengan ReTHUS y cómo coordinan con tu EPS o tu prepagada.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidado no sanitario del adulto mayor en casa](/); [¿enfermera o cuidadora?](/blog/enfermera-o-cuidadora-a-domicilio/); [atención domiciliaria por EPS](/blog/eps-cuidador-en-casa/)
- **CTA:** ¿Buscas cuidado diario y compañía? Cotiza
- **Notas:** El home evita «home care» en su copy (en Colombia connota salud). Este artículo posee toda la familia «home care».

#### `/blog/leyes-y-derechos-del-adulto-mayor/`

- **Tipo:** blog-apoyo · **Prioridad:** v1 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/eps-derechos-y-tramites/`
- **Title (54):** Adulto mayor en Colombia: edad, derechos y leyes clave
- **Meta (139):** A qué edad se es adulto mayor en Colombia, qué dicen las leyes 1251 de 2008, 1276 y 1315 de 2009 y 2055 de 2020, y cómo denunciar maltrato.
- **H1:** Adulto mayor en Colombia: a qué edad se considera, derechos y leyes que lo protegen
- **Keyword principal:** ley 1251 de 2008 (364)
- **Secundarias:** ley 1276 de 2009 (165); ley 2055 de 2020 (134); ley 1315 de 2009 (134); ley del adulto mayor en colombia (30); adultos mayores edades (320); adultos mayores colombia (320); desde cuando se es adulto mayor (10); derechos del adulto mayor en colombia (s/d)
- **Volumen del grupo:** 1477 · **Intención:** informativa (TOFU legal / GEO)
- **H2:** Respuesta rápida: a qué edad se es adulto mayor / Ley 1251 de 2008: derechos de los adultos mayores / Ley 1276 de 2009: Centros Vida y definición de adulto mayor / Ley 1315 de 2009: condiciones de los centros de protección / Ley 2055 de 2020: Convención Interamericana / Cómo denunciar maltrato o abandono / Preguntas frecuentes
- **FAQ:**
  - **¿A partir de qué edad se es adulto mayor en Colombia?** Desde los 60 años, según la Ley 1276 de 2009; esa ley permite incluir a personas de 55 a 59 años cuando su desgaste físico, vital y psicológico así lo determine.
  - **¿Qué dice la Ley 1251 de 2008?** Establece normas para proteger, promover y defender los derechos de los adultos mayores en Colombia y orienta las políticas públicas de envejecimiento y vejez.
  - **¿Qué es la Ley 2055 de 2020?** Es la ley que aprobó en Colombia la Convención Interamericana sobre la Protección de los Derechos Humanos de las Personas Mayores.
  - **¿Qué regula la Ley 1315 de 2009?** Fija las condiciones mínimas que deben cumplir los centros de protección, los centros de día y las instituciones de atención para personas mayores.
  - **¿Qué hacer si un adulto mayor es maltratado o abandonado?** Denúncialo ante la Policía (línea 123), la Fiscalía, la Comisaría de Familia o la Personería; el maltrato y el abandono de personas mayores son delitos en el Código Penal.
  - **¿Los adultos mayores tienen derecho a atención preferencial?** Sí, varias normas les reconocen atención preferencial en entidades públicas y privadas que atienden al público, incluidos los servicios de salud.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [derechos frente a la EPS](/blog/eps-cuidador-en-casa/); [qué exige la ley a un hogar geriátrico](/blog/hogar-geriatrico-o-cuidado-en-casa/); [nuestros compromisos](/nosotros/); [cuidado digno en casa](/)
- **CTA:** Cuidado respetuoso de sus derechos: conoce Sovialis
- **Notas:** Fusiona «adultos mayores edades» (320) con las leyes (≈800 búsquedas/mes en Bogotá). Enlazar cada norma a la fuente oficial (Secretaría del Senado / Función Pública).

#### `/blog/centro-dia-adulto-mayor-bogota/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/costos-y-alternativas/`
- **Title (52):** Centro día para adultos mayores en Bogotá: guía 2026
- **Meta (153):** Qué es un centro día para personas mayores, opciones públicas y privadas en Bogotá, servicios, costos, cómo elegir y cómo combinarlo con cuidado en casa.
- **H1:** Centro día para adultos mayores en Bogotá: qué es, opciones y cómo elegir
- **Keyword principal:** centro día adulto mayor bogotá (210)
- **Secundarias:** centro dia (480); centro dia adulto mayor (110); centro dia adulto mayor bogota (210); centro de dia para adultos mayores (10); club de dia para adultos mayores (10); casa de dia para el adulto mayor (10); estancia de dia para adultos mayores (10)
- **Volumen del grupo:** 830 · **Intención:** comercial-informativa (alternativa)
- **H2:** Respuesta rápida: qué es un centro día / Centros día públicos del Distrito y privados / Qué servicios ofrecen / Costos y cómo elegir / Centro día y cuidado en casa: un esquema mixto / Preguntas frecuentes
- **FAQ:**
  - **¿Qué es un centro día para adultos mayores?** Es un lugar al que la persona mayor asiste durante el día para actividades, alimentación y compañía, y del que regresa a dormir a su casa.
  - **¿Hay centros día gratuitos en Bogotá?** Sí, la Secretaría Distrital de Integración Social ofrece centros día para personas mayores que cumplen ciertos criterios; consulta requisitos y cupos en sus canales oficiales.
  - **¿Qué diferencia hay entre un centro día y un hogar geriátrico?** En el centro día la persona pasa la jornada y vuelve a casa; en el hogar geriátrico vive de forma permanente.
  - **¿Un centro día sirve para una persona con demencia?** Algunos tienen programas para demencia leve o moderada; pregunta por su experiencia, la cantidad de personal y cómo manejan la desorientación o la deambulación.
  - **¿Qué revisar al visitar un centro día?** Que haya actividades acordes a sus intereses, personal suficiente, alimentación adecuada, accesibilidad, protocolos de emergencia y comunicación diaria con la familia.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [horas de cuidado para tardes y fines de semana](/servicios/cuidado-por-horas/); [hogar geriátrico o casa](/blog/hogar-geriatrico-o-cuidado-en-casa/); [recogida en centros día de Cedritos](/zonas/usaquen/cedritos/)
- **CTA:** Complementa el centro día con horas de cuidado
- **Notas:** Posee la familia «centro día» (≈690/mes Bogotá). Verificar oferta vigente de la SDIS antes de publicar.

#### `/blog/dia-del-adulto-mayor-en-colombia/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/bienestar-y-cuidador-familiar/`
- **Title (47):** Día del adulto mayor en Colombia: fecha e ideas
- **Meta (152):** Cuándo se celebra el día de las personas mayores en Colombia y el día internacional, ideas para celebrar en casa o en grupo y regalos que dan autonomía.
- **H1:** Día del adulto mayor en Colombia: cuándo es y cómo celebrarlo
- **Keyword principal:** día del adulto mayor en colombia (165)
- **Secundarias:** dia del adulto mayor en colombia (165); día adulto mayor (110); actividades para el día del adulto mayor (10); día internacional de las personas de edad (s/d)
- **Volumen del grupo:** 285 · **Intención:** informativa (TOFU estacional: publicar en julio)
- **H2:** Respuesta rápida: fechas / Origen del día en Colombia / Ideas para celebrar en casa / Actividades para grupos y centros / Regalos que dan autonomía / Preguntas frecuentes
- **FAQ:**
  - **¿Cuándo se celebra el día del adulto mayor en Colombia?** El último domingo de agosto, día nacional creado por la Ley 271 de 1996; además, el 1 de octubre es el Día Internacional de las Personas de Edad.
  - **¿Qué actividades hacer el día del adulto mayor?** Una comida con sus platos favoritos, música de su época, un álbum de fotos comentado, una salida corta a un lugar que le guste o una actividad en grupo adaptada a su movilidad.
  - **¿Qué regalar a un adulto mayor en su día?** Tiempo compartido, una salida, un álbum de fotos o ayudas que le den autonomía, como una lupa, un reloj grande o calzado antideslizante.
  - **¿Cómo celebrar con una persona mayor que tiene demencia?** En casa, con pocas personas, música conocida, su comida favorita y en su mejor horario del día; evita el ruido y los cambios bruscos de rutina.
  - **¿Por qué existe el Día Internacional de las Personas de Edad?** Las Naciones Unidas lo fijaron el 1 de octubre para reconocer los aportes de las personas mayores y llamar la atención sobre sus derechos.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [actividades para adultos mayores](/blog/actividades-para-adultos-mayores/); [acompañamiento en salidas](/servicios/acompanamiento-citas-medicas/); [conoce Sovialis](/nosotros/)
- **CTA:** Regala compañía: horas de cuidado
- **Notas:** Verificar nombre oficial vigente del día nacional antes de publicar.

#### `/blog/apoyos-para-cuidadores-en-bogota/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/bienestar-y-cuidador-familiar/`
- **Title (54):** Apoyos para cuidadores en Bogotá: Manzanas del Cuidado
- **Meta (144):** Qué es Bogotá Cuidadora y el Sistema Distrital de Cuidado, qué ofrecen las Manzanas del Cuidado a personas cuidadoras y mayores, y cómo acceder.
- **H1:** Apoyos para cuidadores familiares en Bogotá: Sistema Distrital de Cuidado y Manzanas del Cuidado
- **Keyword principal:** bogota cuidadora (90)
- **Secundarias:** bogotá cuidadora (90); manzanas del cuidado (s/d); bogota cuidadora necesito apoyo (10); bogotá cuidadora ayudas (10); pensión para cuidadores de adultos mayores colombia (10); programa cuidadores (10); sistema distrital de cuidado (s/d)
- **Volumen del grupo:** 130 · **Intención:** informativa (TOFU cuidador familiar / navegacional de terceros)
- **H2:** Respuesta rápida: qué apoyos existen / Sistema Distrital de Cuidado y Manzanas del Cuidado / Servicios para personas cuidadoras / Servicios para personas mayores / Cómo acceder / Complementar con apoyo privado / Preguntas frecuentes
- **FAQ:**
  - **¿Qué es Bogotá Cuidadora?** Es el nombre con el que se conoce el portal y la oferta del Sistema Distrital de Cuidado de Bogotá, con servicios gratuitos para personas cuidadoras y para quienes requieren cuidado; verifica la oferta vigente en los canales oficiales de la Alcaldía.
  - **¿Qué son las Manzanas del Cuidado?** Son espacios del Distrito donde se concentran servicios para personas cuidadoras (formación, respiro, orientación) y para las personas que cuidan, cerca de sus casas.
  - **¿Existe una pensión o subsidio para cuidadores de adultos mayores en Colombia?** Hoy no existe una pensión general para cuidadores familiares; hay programas sociales específicos según el caso. Consulta la oferta vigente del Distrito y de la Nación.
  - **¿Cómo inscribirse en los servicios de cuidado del Distrito?** A través de los canales oficiales del Sistema Distrital de Cuidado (portal, línea de atención o la Manzana del Cuidado de tu localidad), con tu documento y el de la persona que cuidas.
  - **¿Los servicios del Distrito reemplazan a una cuidadora en casa?** No suelen ofrecer cuidado diario en el domicilio; sirven como respiro y formación. Para cobertura en casa por horas o turnos, puedes combinarlos con un servicio privado.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cómo evitar el agotamiento](/blog/cuidar-al-cuidador/); [respiro familiar](/servicios/respiro-familiar/); [cuidado por horas](/servicios/cuidado-por-horas/)
- **CTA:** Complementa los apoyos públicos con horas de cuidado
- **Notas:** Programa de terceros: verificar nombres y vigencia (cambios de administración) antes de publicar; sin insinuar afiliación.

#### `/blog/medico-a-domicilio-en-bogota/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/eps-derechos-y-tramites/`
- **Title (59):** Médico a domicilio en Bogotá: opciones por EPS y particular
- **Meta (152):** Cómo conseguir un médico a domicilio en Bogotá por EPS, prepagada o de forma particular, qué verificar antes de la visita y cuándo ir mejor a urgencias.
- **H1:** Médico a domicilio en Bogotá: cómo pedirlo por EPS, prepagada o particular
- **Keyword principal:** medico a domicilio bogota (880)
- **Secundarias:** médico domiciliario (590); servicios médicos domiciliarios (390); servicio médico a domicilio bogotá (320); atención médica a domicilio (170); médicos domicilio 24 horas (134); médicos a domicilio bogotá 24 horas (140)
- **Volumen del grupo:** 2624 · **Intención:** informativa (servicio adyacente: Sovialis no lo presta)
- **H2:** Respuesta rápida: tres caminos / Por la EPS: atención domiciliaria / Medicina prepagada y pólizas / Servicios particulares: cómo verificarlos / Urgencia o médico a domicilio: cómo decidir / Preparar la visita médica en casa / Preguntas frecuentes
- **FAQ:**
  - **¿Qué opciones hay para tener un médico a domicilio en Bogotá?** Tres caminos: la atención domiciliaria de tu EPS con orden médica, la medicina prepagada o pólizas que incluyen visitas en casa y los servicios médicos particulares de IPS habilitadas.
  - **¿Cuándo llamar a un médico a domicilio y cuándo ir a urgencias?** Ante dolor en el pecho, dificultad para respirar, pérdida de fuerza en un lado del cuerpo, confusión súbita o sangrado abundante, llama al 123 o ve a urgencias; el médico a domicilio es para consultas no urgentes.
  - **¿Qué verificar antes de recibir a un médico particular en casa?** Que la IPS esté habilitada en el REPS y el médico tenga registro en el ReTHUS, el valor de la consulta por escrito y que entregue fórmula y registro de la atención.
  - **¿Sirve un médico a domicilio para personas mayores que no pueden salir de casa?** Sí, para controles de enfermedades crónicas, revisión de medicamentos o cambios leves de salud; evita traslados difíciles y complementa el seguimiento de su EPS.
  - **¿Necesito acompañante cuando venga el médico a casa?** Es recomendable que un familiar o la cuidadora esté presente para aportar la historia, la lista de medicamentos y anotar las indicaciones.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [atención domiciliaria por EPS](/blog/eps-cuidador-en-casa/); [qué es home care](/blog/que-es-home-care/); [acompañamiento a citas](/servicios/acompanamiento-citas-medicas/)
- **CTA:** La cuidadora puede acompañar la visita médica
- **Notas:** Experimento de tráfico (≈880/mes) con baja conversión; publicar solo si el v1 ya está completo. Nunca promete médicos.

#### `/blog/alimentacion-del-adulto-mayor/`

- **Tipo:** blog-apoyo · **Prioridad:** v2 · **Menú:** none · **Indexación:** index · **Categoría:** `/blog/categoria/cuidados-y-salud-en-casa/`
- **Title (57):** Alimentación del adulto mayor: guía práctica para la casa
- **Meta (142):** Qué debe comer una persona mayor, cómo prevenir la desnutrición, qué hacer si no quiere comer o le cuesta tragar y un menú semanal de ejemplo.
- **H1:** Alimentación del adulto mayor: qué comer, cuánto y cómo prepararlo
- **Keyword principal:** alimentacion adultos mayores (10)
- **Secundarias:** alimentación de adultos mayores (10); alimentacion para adultos mayores (10); alimentación en los adultos mayores (10); alimentacion adecuada para adultos mayores (10); alimentación en personas mayores (10)
- **Volumen del grupo:** 30 · **Intención:** informativa (TOFU cuidados)
- **H2:** Respuesta rápida: el plato del adulto mayor / Proteínas, fibra e hidratación / Problemas para masticar o tragar / Falta de apetito / Menú semanal de ejemplo / Preguntas frecuentes
- **FAQ:**
  - **¿Qué debe comer un adulto mayor en el día?** Comidas variadas con verduras, frutas, proteínas (huevo, leguminosas, pescado, carnes), cereales integrales y lácteos, repartidas en varias tomas y adaptadas a sus enfermedades e indicaciones médicas.
  - **¿Cómo saber si un adulto mayor está desnutrido?** Pérdida de peso sin buscarla, ropa que le queda grande, cansancio, poco apetito o heridas que tardan en sanar; consulta para una valoración nutricional.
  - **¿Qué hacer si un adulto mayor no quiere comer?** Ofrece porciones pequeñas y frecuentes y sus platos favoritos, acompáñalo en la mesa y revisa con el médico si hay problemas dentales, de deglución, tristeza o efectos de medicamentos.
  - **¿Qué alimentos facilitan masticar y tragar?** Preparaciones blandas y húmedas como cremas, purés, huevos, pescado desmenuzado, frutas maduras y compotas; si se atora con frecuencia, pide valoración de fonoaudiología.
  - **¿Los adultos mayores necesitan suplementos?** Solo si el médico o el nutricionista los indica tras una valoración; muchas necesidades se cubren con una dieta bien planeada.
- **Schema:** BlogPosting, WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [cuidados básicos](/blog/cuidados-basicos-del-adulto-mayor/); [cuidadora que prepara y acompaña las comidas](/servicios/cuidadora-adulto-mayor/)
- **CTA:** Una cuidadora puede preparar y acompañar sus comidas

### 8.7 Legales

#### `/politica-de-tratamiento-de-datos/`

- **Tipo:** legal · **Prioridad:** v1 · **Menú:** footer · **Indexación:** index
- **Title (54):** Política de tratamiento de datos personales | Sovialis
- **Meta (148):** Cómo trata Sovialis los datos de clientes, personas cuidadas, contratistas y aspirantes: finalidades, derechos, canales y plazos (Ley 1581 de 2012).
- **H1:** Política de tratamiento de datos personales
- **Keyword principal:** política de tratamiento de datos sovialis (s/d)
- **Secundarias:** habeas data sovialis (s/d); autorización de datos sensibles de salud (s/d)
- **Volumen del grupo:** 0 · **Intención:** legal / navegacional
- **H2:** Responsable del tratamiento y canales / Datos que tratamos y para qué / Datos sensibles y de menores / Derechos de los titulares / Procedimiento de consultas y reclamos / Transmisión a encargados y almacenamiento / Vigencia
- **FAQ:**
  - **¿Qué datos personales recolecta Sovialis?** Datos de contacto de quien contrata, datos de identificación y del servicio de la persona cuidada y, solo con autorización expresa y voluntaria, datos de salud necesarios para el cuidado.
  - **¿Cómo ejerzo mis derechos de conocer, actualizar o suprimir mis datos?** Envía tu solicitud al canal de protección de datos de esta política. Respondemos consultas en máximo 10 días hábiles (prorrogables 5) y reclamos en 15 días hábiles (prorrogables 8).
  - **¿Dónde se almacenan mis datos?** En servidores de proveedores tecnológicos que pueden estar fuera de Colombia, como Cloudflare, bajo contratos de transmisión que los obligan a protegerlos y a usarlos solo para nuestros fines.
  - **¿Quién autoriza el tratamiento de los datos de una persona mayor con discapacidad?** La propia persona, si puede expresar su voluntad, porque la Ley 1996 de 2019 presume su capacidad; si tiene un apoyo formalizado, este firma según sus facultades.
  - **¿Puedo revocar la autorización que di?** Sí, en cualquier momento, salvo cuando exista un deber legal o contractual de conservar los datos; la revocatoria se tramita por el mismo canal.
- **Schema:** WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [términos y condiciones](/terminos-y-condiciones/); [política de cookies](/politica-de-cookies/); [canal de contacto](/contacto/)
- **CTA:** Ninguno (enlace a canal de protección de datos)
- **Notas:** Texto base: buildPoliticaDatos del panel (legal/*.ts). Esta URL debe ser la politicaDatosUrl de los contratos.

#### `/terminos-y-condiciones/`

- **Tipo:** legal · **Prioridad:** v1 · **Menú:** footer · **Indexación:** index
- **Title (46):** Términos y condiciones del servicio | Sovialis
- **Meta (146):** Condiciones de cotización, contrato, pagos anticipados, cancelaciones, reemplazos, retracto, exclusiones del servicio y canal de PQRS de Sovialis.
- **H1:** Términos y condiciones
- **Keyword principal:** términos y condiciones sovialis (s/d)
- **Secundarias:** condiciones del servicio de cuidado a domicilio (s/d)
- **Volumen del grupo:** 0 · **Intención:** legal / navegacional
- **H2:** Alcance del servicio y exclusiones / Cotización y aceptación / Pagos, mora y suspensión / Cancelaciones y reemplazos / Retracto / Peticiones, quejas y reclamos / Ley aplicable
- **FAQ:**
  - **¿Qué condiciones aplican a una cotización?** Tiene vigencia de 15 días y el precio queda sujeto a la disponibilidad de personal al momento de aceptarla.
  - **¿Hay permanencia mínima?** No. Puedes terminar el contrato con el preaviso pactado, sin penalidad por terminación anticipada.
  - **¿Qué ocurre si el pago se atrasa?** Se causan intereses de mora a la tasa máxima legal y, con aviso previo de 24 horas, el servicio puede suspenderse, nunca durante un servicio en curso ni dejando a la persona sin un adulto responsable.
  - **¿Qué tareas están excluidas del servicio?** Los procedimientos de salud (inyecciones, insulina, sondas, curaciones, oxígeno, toma de muestras), los oficios domésticos generales, el cuidado de terceros, conducir, manejar dinero y cualquier forma de contención física.
  - **¿Qué ley protege mis derechos como cliente?** El Estatuto del Consumidor (Ley 1480 de 2011). Puedes reclamar directamente a Sovialis y, si no se resuelve, acudir a la Superintendencia de Industria y Comercio.
- **Schema:** WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tratamiento de datos](/politica-de-tratamiento-de-datos/); [tarifas vigentes](/precios/); [PQRS](/contacto/)
- **CTA:** Ninguno
- **Notas:** Debe coincidir con las 12 condiciones de la cotización y el contrato SOV-LEG-CLI-002 (NOTAS-LEGALES §6).

#### `/politica-de-cookies/`

- **Tipo:** legal · **Prioridad:** v1 · **Menú:** footer · **Indexación:** index
- **Title (30):** Política de cookies | Sovialis
- **Meta (132):** Qué cookies usa sovialis.com, para qué sirven, quién las instala, cuánto duran y cómo cambiar tus preferencias en cualquier momento.
- **H1:** Política de cookies
- **Keyword principal:** política de cookies sovialis (s/d)
- **Secundarias:** preferencias de cookies sovialis (s/d)
- **Volumen del grupo:** 0 · **Intención:** legal / navegacional
- **H2:** Qué son las cookies / Cookies técnicas / Cookies de medición y publicidad / Tabla de cookies / Cómo cambiar tus preferencias
- **FAQ:**
  - **¿Qué cookies usa sovialis.com?** Cookies técnicas necesarias para que el sitio funcione y, solo si las aceptas, cookies de medición y publicidad, por ejemplo de Google Analytics y Google Ads.
  - **¿Cómo cambio mis preferencias de cookies?** Desde el enlace «Preferencias de cookies» al pie de cada página o borrando las cookies en tu navegador.
  - **¿Las cookies recogen datos de salud?** No. Las cookies de medición registran la navegación, no la información sobre tu familiar que compartes en formularios o mensajes.
  - **¿Puedo navegar sin aceptar cookies de medición?** Sí; el sitio funciona igual y solo se usan las cookies técnicas indispensables.
  - **¿Cuánto tiempo se guardan las cookies?** Depende de cada cookie; en la tabla de esta página verás su nombre, finalidad, proveedor y duración.
- **Schema:** WebPage, BreadcrumbList, FAQPage
- **Enlaces internos:** [tratamiento de datos](/politica-de-tratamiento-de-datos/)
- **CTA:** Ninguno (abrir panel de preferencias)
- **Notas:** Banner de consentimiento con Consent Mode v2: rechazo por defecto de medición/publicidad.

## 9. Zonas: contenido local y cómo evitar páginas puerta

**Requisitos para publicar (o indexar) una página de zona:**

1. **Cobertura real:** hay personas que publican disponibilidad en esa zona (protocolo §8) y la coordinación puede cumplir el plazo de reemplazo allí.
2. **Contenido único ≥ 60 %** frente a las demás zonas (unas 600–900 palabras), con bloques que no se pueden copiar cambiando el nombre:
   - barrios atendidos (lista propia, ver §6.2) y mapa estático del polígono de cobertura;
   - clínicas y hospitales de referencia cercanos y cómo funciona el acompañamiento allí, con el aviso «Sovialis no tiene vínculo con estas instituciones»;
   - vivienda típica y su efecto en el cuidado (escaleras, pendientes, porterías, conjuntos);
   - recursos para salidas (parques, humedales, centros comerciales) y vías de acceso;
   - 5 FAQ locales únicas (ya redactadas en las fichas);
   - en zonas con demanda proxy, un bloque «¿Hogar geriátrico en X o cuidado en casa?» que enlaza a la guía C06.
3. **Prohibido:** plantilla con solo el topónimo cambiado; direcciones o sedes ficticias; un `LocalBusiness` por zona (hay un solo negocio con `areaServed`); reseñas inventadas; fotos de banco repetidas; listar zonas sin cobertura.
4. **Fotos reales** de la zona o de servicios (con consentimiento) y `alt` descriptivo.
5. Publicar con `noindex` mientras falte un bloque; quitarlo al completarlo.
6. **Expansión v2/v3:** se crea un barrio nuevo solo si Search Console muestra impresiones para «cuidado/cuidadora + topónimo», si hay campañas de Ads geolocalizadas que lo necesiten o si el negocio confirma clientes recurrentes allí.

**Matriz de bloques locales** (verificar direcciones y pertenencia de barrios y clínicas antes de publicar):

| Zona | Prior. | Clínicas de referencia | Vivienda | Demanda proxy |
|---|---|---|---|---|
| `/zonas/usaquen/` | v1 | la Fundación Santa Fe de Bogotá, la Clínica Reina Sofía, LaCardio (Fundación Cardioinfantil), el Hospital Simón Bolívar | Edificios con portería y conjuntos; casas en el sector fundacional y en Santa Ana, con pendientes hacia los cerros. | «hogares geriatricos usaquen» 10. |
| `/zonas/usaquen/cedritos/` | v1 | la Clínica Reina Sofía, LaCardio (Fundación Cardioinfantil), la Fundación Santa Fe de Bogotá | Edificios de apartamentos de varios pisos, no todos con ascensor, y conjuntos cerrados. | «hogares geriatricos cedritos» 30 · «hogar geriátrico cedritos» 30 · «hogares geriátricos en cedritos bogotá» 20. |
| `/zonas/chapinero/` | v1 | el Hospital Universitario San Ignacio, la Clínica Marly, la Clínica del Country | Apartamentos en edificios de distintas épocas; en Chapinero Alto y Rosales, calles en pendiente y escaleras. | «hogar geriatrico chapinero» 10. |
| `/zonas/chapinero/chico/` | v1 | la Clínica del Country, la Fundación Santa Fe de Bogotá | Apartamentos amplios en edificios con portería y ascensor; personal de servicio doméstico en muchos hogares. | sin búsquedas con el topónimo; prioridad por valor del negocio (estrato alto, clínicas de referencia). |
| `/zonas/suba/` | v1 | la Fundación Clínica Shaio, la Clínica La Colina, la Clínica Juan N. Corpas | Conjuntos cerrados de casas y edificios; casas de dos y tres pisos con escaleras internas. | «hogar geriatrico suba» 50 · «hogares geriatricos en suba bogota» 20. |
| `/zonas/suba/niza/` | v1 | la Fundación Clínica Shaio, la Clínica Reina Sofía, la Clínica La Colina | Casas de dos y tres pisos con escaleras internas y conjuntos cerrados. | «hogar geriátrico niza 127» 50 (marca de terceros) · «hogares geriátricos en niza bogotá» 20. |
| `/zonas/usaquen/santa-barbara/` | v2 | la Fundación Santa Fe de Bogotá, la Clínica Reina Sofía | Edificios residenciales con portería; casas en Santa Bárbara Alta hacia los cerros. | «hogar geriatrico santa barbara» 110 (marca de terceros). |
| `/zonas/suba/colina-campestre/` | v2 | la Clínica La Colina, la Fundación Clínica Shaio | Conjuntos cerrados de casas y edificios con zonas comunes y senderos. | sin búsquedas con el topónimo; prioridad por valor del negocio. |
| `/zonas/calle-170/` | v2 | LaCardio (Fundación Cardioinfantil), el Hospital Simón Bolívar, la Clínica La Colina | Conjuntos de apartamentos con varias torres y casas en conjuntos cerrados. | sin búsquedas con el topónimo; sector de alto crecimiento residencial entre Usaquén y Suba. |
| `/zonas/teusaquillo/` | v2 | la Clínica Palermo, el Hospital Universitario Mayor Méderi | Casas de estilo inglés de dos y tres pisos y edificios de apartamentos. | «hogar geriatrico teusaquillo» 10. |
| `/zonas/barrios-unidos/` | v2 | la Clínica del Country, las clínicas de la red de tu EPS | Casas de dos pisos, muchas con local comercial en el primer piso, y edificios de apartamentos. | sin búsquedas con el topónimo. |
| `/zonas/salitre-y-modelia/` | v2 | la Clínica Universitaria Colombia, las clínicas de la red de tu EPS | Conjuntos de apartamentos en Ciudad Salitre; casas de dos pisos en Modelia y Normandía. | «hogares geriátricos en modelia bogotá» 30 · «hogar geriatrico modelia» 30 · «hogares geriatricos modelia» 20. |
| `/zonas/chia/` | v2 | la Clínica Universidad de La Sabana, el Hospital San Antonio de Chía | Casas en conjuntos cerrados y condominios campestres con jardín y desniveles. | «hogar geriatrico chia» 50 · «hogar geriatrico cajica» 10 · «enfermeras chia» 10. |

## 10. Blog: taxonomía, autor y guía editorial

### 10.1 Categorías (5)

| Categoría | URL | Artículos (v1 en negrita) |
|---|---|---|
| Contratar cuidado | `/blog/categoria/contratar-cuidado/` | **/blog/como-contratar-una-cuidadora/**, /blog/contratar-cuidadora-directa-o-por-agencia/, **/blog/enfermera-o-cuidadora-a-domicilio/**, /blog/como-organizar-el-cuidado-de-un-adulto-mayor/, **/blog/que-es-un-acompanante-permanente/**, /blog/que-es-home-care/ |
| Costos y alternativas | `/blog/categoria/costos-y-alternativas/` | **/blog/cuanto-cobra-una-enfermera-a-domicilio/**, /blog/cuanto-cuesta-cuidar-a-un-adulto-mayor-en-casa/, **/blog/hogar-geriatrico-o-cuidado-en-casa/**, /blog/centro-dia-adulto-mayor-bogota/ |
| Cuidados y salud en casa | `/blog/categoria/cuidados-y-salud-en-casa/` | **/blog/cuidados-postoperatorios-en-casa/**, **/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/**, /blog/cuidados-paliativos-en-casa/, /blog/cuidados-basicos-del-adulto-mayor/, /blog/prevencion-de-caidas-en-adultos-mayores/, /blog/cuidados-paciente-encamado/, /blog/alimentacion-del-adulto-mayor/ |
| EPS, derechos y trámites | `/blog/categoria/eps-derechos-y-tramites/` | **/blog/eps-cuidador-en-casa/**, **/blog/inyectologia-a-domicilio-bogota/**, **/blog/leyes-y-derechos-del-adulto-mayor/**, /blog/medico-a-domicilio-en-bogota/ |
| Bienestar y cuidador familiar | `/blog/categoria/bienestar-y-cuidador-familiar/` | **/blog/actividades-para-adultos-mayores/**, **/blog/ejercicios-para-adultos-mayores-en-casa/**, /blog/juegos-de-memoria-para-adultos-mayores/, /blog/cuidar-al-cuidador/, /blog/dia-del-adulto-mayor-en-colombia/, /blog/apoyos-para-cuidadores-en-bogota/ |

Las categorías quedan en `noindex,follow` hasta tener 4 artículos publicados.

### 10.2 Etiquetas

Solo internas (artículos relacionados y filtros del CMS), sin páginas públicas: perfil (cuidadora, auxiliar), modalidad (por horas, nocturno, 24 horas), condición (Alzheimer y demencia, postoperatorio, encamado, paliativos, párkinson), trámite (EPS, tutela, leyes), etapa (TOFU, MOFU, BOFU) y zona.

### 10.3 Autor y revisión (E-E-A-T)

- **Autor/revisor:** `/autores/nombre-apellido/` (marcador). Persona real de la coordinación con formación en salud, por ejemplo una enfermera profesional con ReTHUS. Su rol es **revisión editorial de contenidos**; nunca se presenta como «supervisión de enfermería» del servicio (§2).
- **En cada guía:** byline del autor, «Revisado por [nombre, profesión, registro]», «Actualizado el [fecha]», fuentes enlazadas al final y enlace a la página de autor. Schema: `BlogPosting.author` → `Person`; `WebPage.reviewedBy` → `Person`; `publisher` → `#organization`.
- **Página de autor:** formación, registro verificable, experiencia con personas mayores, guías escritas o revisadas y enlaces profesionales (`sameAs`).

### 10.4 Guía editorial

1. **Respuesta primero:** cada H2 que es una pregunta abre con 40–60 palabras que la responden por completo (cita directa para fragmentos destacados y LLM); después vienen el detalle, las tablas y los ejemplos.
2. **Estructura:** H1 único; H2 de 5 a 8; tablas para comparaciones (perfiles, precios, opciones); listas numeradas para procesos; un bloque FAQ al final, sin repetir preguntas de otras páginas del sitio.
3. **Extensión orientativa:** cornerstones de 1.800–2.500 palabras; artículos de apoyo de 1.000–1.500; zonas de 600–900; landings de 900–1.400.
4. **Voz (DESIGN.md):** la persona mayor es sujeto y participa en las decisiones; lenguaje respetuoso, sin infantilizar ni alarmar («persona mayor», no «abuelito» ni «viejito»; «adulto mayor» se usa por SEO). Tuteo cálido y frases cortas.
5. **Veracidad:** sin estadísticas, testimonios ni garantías inventadas. Cifras solo con fuente oficial enlazada y fecha. Precios solo del panel. Normas citadas con número y año, enlazadas a la Secretaría del Senado o a Función Pública.
6. **Legal:** aplicar §2 en cada texto; los artículos marcados («requiere abogado») no se publican sin revisión.
7. **Enlaces:** cada artículo BOFU/MOFU enlaza a su landing dueña en el primer tercio y en el cierre; 2–4 enlaces contextuales a guías relacionadas; anclas descriptivas y variadas.
8. **CTA suave** al final y en la barra lateral (WhatsApp); en guías legales sensibles (C05, C13) el CTA lleva a cuidado, nunca a procedimientos.
9. **Actualización:** revisar cada 6 meses o cuando cambie una norma o una tarifa; actualizar `dateModified` solo con cambios reales.
10. **Imágenes:** fotografías reales con consentimiento, `alt` descriptivo, formato AVIF/WebP y dimensiones fijas (sin desplazamiento de diseño).

## 11. Datos estructurados

### 11.1 Decisión de tipos

- **`Organization` + `LocalBusiness` (genérico).** No se usan `MedicalBusiness`, `MedicalOrganization`, `MedicalClinic` ni especialidades médicas: describirían un servicio de salud que Sovialis no presta (§2). Tampoco `HomeAndConstructionBusiness` (es para oficios del hogar). `LocalBusiness` genérico con `knowsAbout`, `areaServed` y un catálogo de servicios es lo correcto para un negocio de área de servicio.
- **`Service`** en cada landing: `serviceType`, `provider` → `#localbusiness`, `areaServed` (Bogotá + localidades) y `offers` con `UnitPriceSpecification` (COP, valores del panel).
- **`FAQPage`** en páginas con FAQ visibles. Desde 2023 Google solo muestra resultados enriquecidos de FAQ para sitios gubernamentales y de salud reconocidos, así que el valor está en la semántica y en la lectura de los LLM, no en el resultado enriquecido.
- **`BreadcrumbList`** en todas las páginas salvo el home; **`BlogPosting`** en las guías; **`WebPage.reviewedBy`** para la revisión; **`ProfilePage` + `Person`** para el autor; **`AboutPage`** y **`ContactPage`**; **`CollectionPage` + `ItemList`** en los hubs; **`Place`/`AdministrativeArea`** como `areaServed` en las zonas.
- **No usar:** `HowTo` (Google dejó de mostrarlo), `JobPosting` (implicaría vacantes de empleo), `Review`/`AggregateRating` propios (sin reseñas verificables en el sitio), un `LocalBusiness` por zona.

### 11.2 Grafo de identificadores

| Entidad | @id |
|---|---|
| Organization | `https://sovialis.com/#organization` |
| LocalBusiness | `https://sovialis.com/#localbusiness` |
| WebSite | `https://sovialis.com/#website` |
| WebPage (por URL) | `{url}#webpage` |
| Breadcrumb | `{url}#breadcrumb` |
| FAQ | `{url}#faq` |
| Service | `https://sovialis.com/servicios/{slug}/#service` |
| Autor | `https://sovialis.com/autores/{slug}/#person` |

### 11.3 Ejemplo: home (`@graph`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sovialis.com/#organization",
      "name": "Sovialis",
      "legalName": "[Sovialis S.A.S. — por confirmar]",
      "url": "https://sovialis.com/",
      "logo": "https://sovialis.com/logo.png",
      "slogan": "Vínculos que protegen",
      "taxID": "[NIT por confirmar]",
      "description": "Sovialis es una empresa de Bogotá que presta cuidado no sanitario a domicilio para personas mayores, con cuidadoras y personal con formación de auxiliar de enfermería.",
      "sameAs": [
        "[URL de la ficha de Google]",
        "[Instagram]",
        "[Facebook]",
        "[LinkedIn]"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+57 [por confirmar]",
        "contactType": "customer service",
        "areaServed": "CO",
        "availableLanguage": "es"
      }
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://sovialis.com/#localbusiness",
      "name": "Sovialis",
      "parentOrganization": {
        "@id": "https://sovialis.com/#organization"
      },
      "url": "https://sovialis.com/",
      "telephone": "+57 [por confirmar]",
      "priceRange": "$$",
      "image": "https://sovialis.com/og/home.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "[por confirmar]",
        "addressLocality": "Bogotá",
        "addressRegion": "Bogotá D.C.",
        "addressCountry": "CO"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Bogotá"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Usaquén"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Chapinero"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Suba"
        }
      ],
      "knowsAbout": [
        "cuidado del adulto mayor a domicilio",
        "acompañamiento hospitalario",
        "cuidado de personas con demencia"
      ],
      "openingHoursSpecification": "[por confirmar]",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicios de cuidado",
        "url": "https://sovialis.com/precios/"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://sovialis.com/#website",
      "url": "https://sovialis.com/",
      "name": "Sovialis",
      "inLanguage": "es-CO",
      "publisher": {
        "@id": "https://sovialis.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://sovialis.com/#webpage",
      "url": "https://sovialis.com/",
      "name": "Cuidado del adulto mayor a domicilio en Bogotá",
      "isPartOf": {
        "@id": "https://sovialis.com/#website"
      },
      "about": {
        "@id": "https://sovialis.com/#localbusiness"
      },
      "inLanguage": "es-CO"
    },
    {
      "@type": "FAQPage",
      "@id": "https://sovialis.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Sovialis presta servicios de enfermería o procedimientos médicos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Sovialis no es una IPS…"
          }
        }
      ]
    }
  ]
}
```

### 11.4 Ejemplo: servicio

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://sovialis.com/servicios/cuidado-nocturno/#service",
  "name": "Cuidado nocturno para adultos mayores",
  "serviceType": "Cuidado no sanitario a domicilio — turno nocturno",
  "provider": {
    "@id": "https://sovialis.com/#localbusiness"
  },
  "areaServed": {
    "@type": "City",
    "name": "Bogotá"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Turno nocturno de 12 horas con cuidadora (lunes a viernes)",
      "priceCurrency": "COP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": 190000,
        "priceCurrency": "COP",
        "unitText": "turno de 12 horas",
        "valueAddedTaxIncluded": true
      }
    }
  ]
}
```

Los precios del JSON-LD se generan en el build desde el tarifario del panel (misma fuente que la tabla visible).

### 11.5 Ejemplo: guía

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://sovialis.com/blog/eps-cuidador-en-casa/#article",
      "headline": "¿La EPS da cuidador en casa? Atención domiciliaria, tutela y cómo pedirla",
      "author": {
        "@id": "https://sovialis.com/autores/nombre-apellido/#person"
      },
      "publisher": {
        "@id": "https://sovialis.com/#organization"
      },
      "datePublished": "2026-10-XX",
      "dateModified": "2026-10-XX",
      "inLanguage": "es-CO",
      "mainEntityOfPage": {
        "@id": "https://sovialis.com/blog/eps-cuidador-en-casa/#webpage"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://sovialis.com/blog/eps-cuidador-en-casa/#webpage",
      "reviewedBy": {
        "@id": "https://sovialis.com/autores/nombre-apellido/#person"
      },
      "lastReviewed": "2026-10-XX",
      "breadcrumb": {
        "@id": "https://sovialis.com/blog/eps-cuidador-en-casa/#breadcrumb"
      }
    }
  ]
}
```

## 12. Optimización para buscadores de IA (GEO)

### 12.1 `/llms.txt` (borrador; se genera en el build con los precios del panel)

```markdown
# Sovialis

> Sovialis es una empresa de Bogotá (Colombia) que presta cuidado no sanitario a domicilio para personas mayores: cuidadoras y personal con formación de auxiliar de enfermería, por horas, en turnos de día o de noche y 24 horas con relevos, además de acompañamiento a citas médicas y en clínica. Atiende principalmente el norte y el noroccidente de Bogotá. No es una IPS: no presta servicios de salud ni procedimientos (inyecciones, insulina, curaciones, sondas, oxígeno); para eso orienta a las familias hacia su EPS o una IPS habilitada.

Datos clave (actualizados el {fecha}):
- Nombre: Sovialis · Razón social: [Sovialis S.A.S. — por confirmar] · NIT: [por confirmar] · Lema: «Vínculos que protegen»
- Contacto: WhatsApp [por confirmar] · Teléfono [por confirmar] · [correo]@sovialis.com · [dirección], Bogotá
- Precios finales (impuestos incluidos), lunes a viernes: cuidadora desde $20.000 por hora (mínimo 4 horas), $120.000 por 8 h de día, $160.000 por 12 h de día, $190.000 por 12 h de noche y $300.000 por 24 h. Personal con formación de auxiliar de enfermería desde $25.000 por hora, $180.000 por 12 h de día, $215.000 por 12 h de noche y $340.000 por 24 h. Sábados, domingos y festivos tienen tarifa diferente. Fuente: https://sovialis.com/precios/
- Pago anticipado; cancelación sin costo con 24 h de anticipación; reemplazo en el plazo acordado sin cobro del tiempo no prestado.

## Servicios
- [Cuidadora de adulto mayor](https://sovialis.com/servicios/cuidadora-adulto-mayor/): compañía, higiene, comidas, movilidad y recordatorio de medicamentos.
- [Cuidado con formación de auxiliar de enfermería](https://sovialis.com/servicios/auxiliar-de-enfermeria/): cuidado básico para dependencia alta, sin procedimientos de salud.
- [Cuidado por horas](https://sovialis.com/servicios/cuidado-por-horas/) · [Cuidado nocturno](https://sovialis.com/servicios/cuidado-nocturno/) · [Cuidado 24 horas](https://sovialis.com/servicios/cuidado-24-horas/)
- [Acompañamiento a citas médicas](https://sovialis.com/servicios/acompanamiento-citas-medicas/) · [Acompañamiento hospitalario](https://sovialis.com/servicios/acompanamiento-hospitalario/)
- [Cuidado postoperatorio en casa](https://sovialis.com/servicios/cuidado-postoperatorio/) · [Alzheimer y demencia](https://sovialis.com/servicios/cuidado-alzheimer-demencia/)

## Cómo funciona y condiciones
- [Precios](https://sovialis.com/precios/) · [Cómo funciona](https://sovialis.com/como-funciona/) · [Términos y condiciones](https://sovialis.com/terminos-y-condiciones/)

## Zonas
- [Norte de Bogotá](https://sovialis.com/zonas/): [Usaquén](https://sovialis.com/zonas/usaquen/), [Cedritos](https://sovialis.com/zonas/usaquen/cedritos/), [Chapinero](https://sovialis.com/zonas/chapinero/), [El Chicó](https://sovialis.com/zonas/chapinero/chico/), [Suba](https://sovialis.com/zonas/suba/), [Niza](https://sovialis.com/zonas/suba/niza/)

## Guías
- [¿Enfermera a domicilio o cuidadora?](https://sovialis.com/blog/enfermera-o-cuidadora-a-domicilio/)
- [¿La EPS da cuidador en casa?](https://sovialis.com/blog/eps-cuidador-en-casa/)
- [Hogar geriátrico o cuidado en casa](https://sovialis.com/blog/hogar-geriatrico-o-cuidado-en-casa/)
- [Inyectología a domicilio: requisitos y trámite](https://sovialis.com/blog/inyectologia-a-domicilio-bogota/)

## Optional
- [Quiénes somos](https://sovialis.com/nosotros/) · [Trabaja con nosotros](https://sovialis.com/trabaja-con-nosotros/) · [Política de datos](https://sovialis.com/politica-de-tratamiento-de-datos/)
- Versión completa en texto: https://sovialis.com/llms-full.txt
```

### 12.2 `/llms-full.txt`

Texto plano en Markdown generado en el build (sin HTML ni navegación), con: la descripción canónica de la entidad; la tabla completa de precios del panel con fecha; el alcance y las exclusiones del servicio (lo que no se hace y a quién acudir); el proceso de contratación, pagos, cancelaciones, reemplazos y retracto; el texto de cada landing de servicio y de zona v1; todas las FAQ del sitio agrupadas por página, con la URL de origen; y los enlaces a las guías. Objetivo: menos de 200 KB y fecha de actualización arriba.

### 12.3 Redacción que los LLM pueden citar

- **Párrafo de respuesta** de 40–60 palabras bajo cada H2-pregunta, que se entienda solo, con la entidad nombrada («En Sovialis, el turno de 12 horas…») y sin pronombres que dependan del párrafo anterior.
- **Definiciones** con la forma «X es…» en la primera frase de las guías.
- **Datos con unidad, alcance y fecha:** «desde $160.000 por 12 horas de día, de lunes a viernes, octubre de 2026».
- **Tablas HTML reales** (no imágenes) para precios y comparativas.
- **Fuentes enlazadas** a normas y entidades oficiales; fecha visible de actualización.
- **Consistencia:** el mismo dato (precio, alcance, zonas) dicho igual en la web, `llms.txt`, el schema, Google Business Profile y los anuncios.

### 12.4 Entidad y NAP

- **Frase canónica** (idéntica en el home, Nosotros, schema, GBP, redes y directorios): «Sovialis es una empresa de Bogotá que presta cuidado no sanitario a domicilio para personas mayores, con cuidadoras y personal con formación de auxiliar de enfermería.»
- **NAP idéntico** en el pie de página, Contacto, `LocalBusiness`, GBP, Bing Places, Apple Business Connect, redes y directorios locales; un solo número principal y un solo formato de dirección.
- `sameAs` con todos los perfiles oficiales; logotipo en `Organization.logo`; página de autor con credenciales reales.
- **Bing Webmaster Tools** + IndexNow (Cloudflare Crawler Hints): alimentan Bing, Copilot y la búsqueda de ChatGPT.

### 12.5 `robots.txt` (texto exacto)

```
# robots.txt — https://sovialis.com
# Política: visibilidad máxima en buscadores y asistentes de IA.

User-agent: *
Allow: /
Disallow: /api/
Disallow: /cdn-cgi/

# Buscadores y asistentes de IA (permitidos de forma explícita)
User-agent: Googlebot
User-agent: Bingbot
User-agent: Applebot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: GPTBot
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: ClaudeBot
User-agent: Claude-User
User-agent: Claude-SearchBot
User-agent: DuckAssistBot
User-agent: Amazonbot
User-agent: meta-externalagent
User-agent: MistralAI-User
User-agent: CCBot
Allow: /
Disallow: /api/
Disallow: /cdn-cgi/

Sitemap: https://sovialis.com/sitemap-index.xml
```

Notas:

- Un grupo con `User-agent` específico reemplaza al grupo `*` para ese robot (RFC 9309); por eso se repiten las líneas `Disallow`.
- `/gracias/` y `/404/` **no** se bloquean en robots: llevan `noindex` en la página (si se bloquearan, Google no vería el `noindex`).
- `Google-Extended` y `Applebot-Extended` no rastrean: controlan el uso del contenido en Gemini y Apple Intelligence. Permitirlos da visibilidad a la marca en esas respuestas. `GPTBot` y `CCBot` alimentan el entrenamiento de modelos; se permiten por la misma razón. Si JP decide no ceder contenido para entrenamiento, basta con cambiar `Allow` por `Disallow` en esos cuatro.
- **Cloudflare:** desactivar «Block AI bots» / AI Crawl Control y el «robots.txt administrado» (o confirmar que no añade bloqueos); revisar que Bot Fight Mode y las reglas WAF no desafíen a robots verificados. Comprobar en los registros que OAI-SearchBot, PerplexityBot y Claude-SearchBot reciben 200.

## 13. Plan de lanzamiento

### 13.1 v1 — 47 URLs con contenido completo

Orden de producción sugerido (todo debe estar publicado el día del lanzamiento):

1. **Sprint 1 — conversión:** `/`, `/servicios/` y las 9 landings v1, `/precios/` (con calculadora alimentada por el panel), `/como-funciona/`, `/contacto/` (con PQRS), `/nosotros/`, las 3 páginas legales, `/gracias/`, `/404/`, `robots.txt`, `llms.txt`, `llms-full.txt` y el sitemap.
2. **Sprint 2 — local:** `/zonas/` + Usaquén, Cedritos, Chapinero, El Chicó, Suba y Niza; ficha de Google Business Profile con la misma NAP; `/trabaja-con-nosotros/`; página de autor.
3. **Sprint 3 — guías v1 (12), en este orden:** C05 enfermera o cuidadora → C13 inyectología → C06 hogar geriátrico → C07 EPS → C01 cuánto cobra una enfermera → C03 cómo contratar → C12 acompañante permanente → C10 Alzheimer → C09 postoperatorio → leyes del adulto mayor → actividades → ejercicios. Blog y categorías se publican con las categorías en `noindex` hasta tener 4 artículos.

| URL v1 | Tipo | Grupo (vol.) |
|---|---|---|
| `/` | home | 320 |
| `/servicios/` | hub-servicios | 50 |
| `/servicios/cuidadora-adulto-mayor/` | servicio-perfil | 590 |
| `/servicios/auxiliar-de-enfermeria/` | servicio-perfil | 90 |
| `/servicios/cuidado-nocturno/` | servicio-horario | 80 |
| `/servicios/cuidado-24-horas/` | servicio-horario | 80 |
| `/servicios/cuidado-por-horas/` | servicio-horario | 120 |
| `/servicios/acompanamiento-citas-medicas/` | servicio-necesidad | 70 |
| `/servicios/acompanamiento-hospitalario/` | servicio-necesidad | 100 |
| `/servicios/cuidado-postoperatorio/` | servicio-necesidad | 10 |
| `/servicios/cuidado-alzheimer-demencia/` | servicio-necesidad | 40 |
| `/precios/` | precios | 130 |
| `/como-funciona/` | proceso | 0 |
| `/nosotros/` | empresa | 0 |
| `/trabaja-con-nosotros/` | reclutamiento | 1130 |
| `/contacto/` | contacto | 0 |
| `/zonas/` | hub-zonas | 100 |
| `/zonas/usaquen/` | zona | 0 |
| `/zonas/usaquen/cedritos/` | zona | 50 |
| `/zonas/chapinero/` | zona | 0 |
| `/zonas/chapinero/chico/` | zona | 0 |
| `/zonas/suba/` | zona | 70 |
| `/zonas/suba/niza/` | zona | 30 |
| `/blog/` | hub-blog | 10 |
| `/blog/categoria/contratar-cuidado/` | categoria-blog | 0 |
| `/blog/categoria/costos-y-alternativas/` | categoria-blog | 0 |
| `/blog/categoria/cuidados-y-salud-en-casa/` | categoria-blog | 0 |
| `/blog/categoria/eps-derechos-y-tramites/` | categoria-blog | 0 |
| `/blog/categoria/bienestar-y-cuidador-familiar/` | categoria-blog | 0 |
| `/blog/cuanto-cobra-una-enfermera-a-domicilio/` | blog-cornerstone | 150 |
| `/blog/como-contratar-una-cuidadora/` | blog-cornerstone | 30 |
| `/blog/enfermera-o-cuidadora-a-domicilio/` | blog-cornerstone | 1080 |
| `/blog/hogar-geriatrico-o-cuidado-en-casa/` | blog-cornerstone | 4506 |
| `/blog/eps-cuidador-en-casa/` | blog-cornerstone | 650 |
| `/blog/cuidados-postoperatorios-en-casa/` | blog-cornerstone | 130 |
| `/blog/cuidar-adulto-mayor-con-alzheimer-en-casa/` | blog-cornerstone | 100 |
| `/blog/que-es-un-acompanante-permanente/` | blog-cornerstone | 0 |
| `/blog/inyectologia-a-domicilio-bogota/` | blog-cornerstone | 2300 |
| `/blog/actividades-para-adultos-mayores/` | blog-apoyo | 360 |
| `/blog/ejercicios-para-adultos-mayores-en-casa/` | blog-apoyo | 383 |
| `/blog/leyes-y-derechos-del-adulto-mayor/` | blog-apoyo | 1477 |
| `/politica-de-tratamiento-de-datos/` | legal | 0 |
| `/terminos-y-condiciones/` | legal | 0 |
| `/politica-de-cookies/` | legal | 0 |
| `/autores/nombre-apellido/` | autor | 0 |
| `/gracias/` | utilidad | 0 |
| `/404/` | utilidad | 0 |

### 13.2 v2 — 24 URLs, con disparadores

| URL v2 | Tipo | Grupo (vol.) | Disparador |
|---|---|---|---|
| `/servicios/respiro-familiar/` | servicio-necesidad | 0 | demanda visible en GSC o necesidad de Ads |
| `/servicios/cuidado-personas-dependientes/` | servicio-necesidad | 60 | demanda visible en GSC o necesidad de Ads |
| `/zonas/usaquen/santa-barbara/` | zona | 110 | cobertura real confirmada + impresiones en GSC o campaña geolocalizada |
| `/zonas/suba/colina-campestre/` | zona | 0 | cobertura real confirmada + impresiones en GSC o campaña geolocalizada |
| `/zonas/calle-170/` | zona | 0 | cobertura real confirmada + impresiones en GSC o campaña geolocalizada |
| `/zonas/teusaquillo/` | zona | 10 | cobertura real confirmada + impresiones en GSC o campaña geolocalizada |
| `/zonas/barrios-unidos/` | zona | 0 | cobertura real confirmada + impresiones en GSC o campaña geolocalizada |
| `/zonas/salitre-y-modelia/` | zona | 60 | cobertura real confirmada + impresiones en GSC o campaña geolocalizada |
| `/zonas/chia/` | zona | 60 | cobertura real confirmada + impresiones en GSC o campaña geolocalizada |
| `/blog/cuanto-cuesta-cuidar-a-un-adulto-mayor-en-casa/` | blog-cornerstone | 10 | v1 completo y estable |
| `/blog/contratar-cuidadora-directa-o-por-agencia/` | blog-cornerstone | 50 | revisión de abogado laboral |
| `/blog/como-organizar-el-cuidado-de-un-adulto-mayor/` | blog-cornerstone | 20 | v1 completo y estable |
| `/blog/cuidados-paliativos-en-casa/` | blog-cornerstone | 180 | v1 completo y estable |
| `/blog/juegos-de-memoria-para-adultos-mayores/` | blog-apoyo | 419 | v1 completo y estable |
| `/blog/cuidados-basicos-del-adulto-mayor/` | blog-apoyo | 160 | v1 completo y estable |
| `/blog/prevencion-de-caidas-en-adultos-mayores/` | blog-apoyo | 73 | v1 completo y estable |
| `/blog/cuidados-paciente-encamado/` | blog-apoyo | 50 | v1 completo y estable |
| `/blog/cuidar-al-cuidador/` | blog-apoyo | 100 | v1 completo y estable |
| `/blog/que-es-home-care/` | blog-apoyo | 330 | v1 completo y estable |
| `/blog/centro-dia-adulto-mayor-bogota/` | blog-apoyo | 830 | v1 completo y estable |
| `/blog/dia-del-adulto-mayor-en-colombia/` | blog-apoyo | 285 | publicar en julio (estacional) |
| `/blog/apoyos-para-cuidadores-en-bogota/` | blog-apoyo | 130 | v1 completo y estable |
| `/blog/medico-a-domicilio-en-bogota/` | blog-apoyo | 2624 | v1 completo y estable |
| `/blog/alimentacion-del-adulto-mayor/` | blog-apoyo | 30 | v1 completo y estable |

**Orden sugerido v2:** C02 presupuesto mensual → centro día → juegos de memoria → cuidados básicos → prevención de caídas → paciente encamado → cuidar al cuidador → C08 organizar el cuidado → home care → C11 paliativos → apoyos de Bogotá → C04 (con abogado) → médico a domicilio; día del adulto mayor en julio; servicios v2 y zonas v2 según sus disparadores.

### 13.3 Medición (primeras 12 semanas)

- Search Console: impresiones y clics por URL dueña; alerta de canibalización (§6.3); cobertura del índice.
- GA4: eventos `whatsapp_click`, `call_click`, `form_submit` (→ `/gracias/`), `calculator_use`; conversión por URL de entrada.
- Google Business Profile: llamadas, solicitudes de ruta, clics a la web (enlace con `utm_source=google&utm_medium=organic&utm_campaign=gbp`).
- Menciones en IA: revisar cada mes consultas tipo «cuidadora adulto mayor Bogotá» en ChatGPT, Perplexity, Gemini y Copilot, y el tráfico de referencia desde esos dominios.

## 14. Pendientes y validaciones

1. **NAP real:** razón social, NIT, dirección, teléfono, WhatsApp, correo y horario (hoy de ejemplo en el panel).
2. **Contador:** tratamiento del IVA → confirmar el texto «precio final con impuestos incluidos» (NOTAS-LEGALES §7.7).
3. **Abogado:** signos vitales en el perfil auxiliar (§9.2); texto de `/trabaja-con-nosotros/` según el modelo de vinculación (§9.1); artículo C04.
4. **Verificar** direcciones de clínicas, pertenencia de barrios a localidades y la vigencia de programas distritales (Bogotá Cuidadora, centros día).
5. **Autor real** con credenciales verificables.
6. **Categoría de Google Business Profile:** elegir una categoría de cuidado de personas mayores o de ayuda a domicilio que **no** sea de salud; los servicios de la ficha, iguales a los del sitio.
7. **Fotografías reales** con consentimiento (DESIGN.md).
8. **API del tarifario:** endpoint de solo lectura en gestion.sovialis.com (o exportación en el build) para alimentar `/precios/`, los «desde», el JSON-LD y `llms.txt`.
9. **URLs antiguas del dominio:** revisar en Search Console y mapear con 301.
10. **Políticas operativas** mencionadas en FAQ que deben confirmarse: cambio de cuidadora a petición, reporte después de cada cita, sin recargo de desplazamiento dentro de la cobertura y preaviso para cambios.

## Anexo A. Páginas condicionales (fase IPS)

- `/servicios/enfermeria-domiciliaria/` — **NO PUBLICAR.** Solo si Sovialis obtiene habilitación como IPS (REPS, modalidad domiciliaria). Tomaría la familia «enfermera a domicilio» transaccional; C05 seguiría como guía.
- `/servicios/procedimientos-en-casa/` — **NO PUBLICAR.** Ídem (inyectología, curaciones, sondas). Con una IPS aliada que contrata directamente con la familia, no se crea landing propia: solo se menciona el contacto en C13.

## Anexo B. Landings de Google Ads del estudio → URLs nuevas

| Grupo (plan.json) | Landing del estudio | Landing nueva | Nota |
|---|---|---|---|
| Agencia / empresa de cuidado | / (home) | `/` |  |
| Enfermera a domicilio | /servicios/enfermera-a-domicilio-bogota | — (no crear) | No pujar con anuncios que ofrezcan enfermería (§2). Si se prueba, solo con texto de cuidado y la landing `/servicios/auxiliar-de-enfermeria/`, previa revisión legal. |
| Cuidado del adulto mayor en casa | /cuidado-del-adulto-mayor-a-domicilio-bogota | `/` | Se fusiona con el home para no canibalizar. |
| Cuidadora de adulto mayor | /servicios/cuidadora-de-adulto-mayor-bogota | `/servicios/cuidadora-adulto-mayor/` |  |
| Precios y tarifas | /precios | `/precios/` |  |
| Turnos: por horas, noche y 24 h | /servicios/turnos-12-y-24-horas | `/servicios/cuidado-por-horas/`, `/servicios/cuidado-nocturno/`, `/servicios/cuidado-24-horas/` | Dividir el grupo en tres. |
| Acompañamiento | /servicios/acompanamiento-adulto-mayor | `/servicios/acompanamiento-citas-medicas/`, `/servicios/acompanamiento-hospitalario/` | Dividir en dos. |
| Auxiliar de enfermería a domicilio | /servicios/auxiliar-de-enfermeria-a-domicilio | `/servicios/auxiliar-de-enfermeria/` | Texto con la fórmula legal. |
| Paliativos y otras condiciones | /servicios/cuidados-paliativos-en-casa | `/servicios/cuidado-24-horas/` o guía C11 | Sin landing de «cuidados paliativos» (servicio de salud). |
| Alzheimer, demencia y párkinson | /servicios/cuidado-alzheimer-demencia | `/servicios/cuidado-alzheimer-demencia/` |  |
| Inyectología / procedimientos | /servicios/inyectologia-a-domicilio … | — (no crear) | Pausado hasta habilitación IPS. |
| Hogar geriátrico vs. cuidado en casa | /hogar-geriatrico-o-cuidado-en-casa | `/blog/hogar-geriatrico-o-cuidado-en-casa/` | Prueba con presupuesto pequeño. |

