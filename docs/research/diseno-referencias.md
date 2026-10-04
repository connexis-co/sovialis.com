# Sovialis · Brief de diseño web (UX/UI + CRO) y estudio de referencias

> **Fecha:** 2026-10-04 · **Para:** JP Misat / Connexis · **Stack objetivo:** Astro 7.3 + Tailwind CSS 4.3 + islas React 19 + EmDash 1.1 sobre Cloudflare Workers
> **Método:** se descargó y leyó el HTML/CSS/JS real de 4 sitios de referencia (curl, sin navegador) y se sondearon ~30 sitios de competencia/inspiración (HTML + resúmenes de WebFetch). Todo lo que sale de CSS/JS está marcado como *medido*; lo que sale de un resumen de página o de una búsqueda está marcado como *reportado* y no se verificó visualmente.
> **Alcance:** solo documento. No se tocó código ni otros archivos del proyecto.

---

## 0. Decisiones firmes (léelas primero)

| # | Tema | Decisión | Por qué (resumen) |
|---|------|----------|-------------------|
| 1 | **Hero home** | **Hero estático editorial dividido** (texto + foto vertical 4:5) con **H1 indexable en HTML**, 2 CTA (WhatsApp / Cotiza en 2 min), 3 sellos de confianza y una franja «¿Qué necesita tu familiar?» con 6–7 atajos a las landings. **Sin slider.** | Una sola imagen LCP con `fetchpriority="high"`; texto SEO visible; cero JS en el camino crítico; el público (hijos de 40–65) llega con una pregunta concreta, no a explorar. |
| 2 | **Hero landings de servicio / Ads** | **Hero dividido con formulario corto** (nombre, WhatsApp, zona) + botones WhatsApp/Llamar; en móvil el formulario baja a una tarjeta justo después del hero y el CTA abre el modal. | Intención alta y tráfico de pago: se captura en la primera pantalla; el formulario de 3 campos es el estándar de Qida/Cuidum. |
| 3 | **Tipografía** | **Jost** (marca) para titulares ≥ 28 px, pesos 500/600 + **Atkinson Hyperlegible Next** (variable 200–800) para cuerpo, UI, precios y teléfonos. Cuerpo **18 px → 20 px**, interlineado 1,6. **Sin cursivas** en párrafos. Se retira `@fontsource-variable/figtree` de `package.json`. | Jost (tipo Futura) pierde legibilidad a tamaños pequeños; Atkinson desambigua 1/l/I y 0/O (cifras de dinero y teléfonos) y fue diseñada para baja visión. Ambas OFL, ≈ 64 KB woff2 latin en total. |
| 4 | **Color** | Océano tal cual. **CTA primario = Océano #005E9D** con texto blanco (6,8:1; hover #004E85 8,7:1). Texto = Azul Tinta #0B2A4E (13,6:1 sobre Arena). **Un solo verde permitido: el de WhatsApp #25D366**, siempre con texto Tinta (7,3:1). Coral #F08A65 solo como fondo de insignia/alerta con texto Tinta (5,9:1) o `coral-700` #B4431F si es texto. Cian (3,8:1) y Cian Vital (2,8:1) **solo decorativos/gráficos grandes**. | Cifras calculadas en §7.2. El verde de WhatsApp es identidad funcional de un tercero, no de marca. |
| 5 | **Forma** | Radios: 14 px controles · 24 px tarjetas · 32 px hero/pie · píldora 999 px. Sombras suaves teñidas de Tinta. El motivo S/pulsos reemplaza las diagonales de VisitValle como forma decorativa. | La S es curva y «protectora»; las diagonales agresivas no encajan con «Vínculos que protegen». |
| 6 | **Movimiento** | **CSS primero.** Tokens 120/200/400/700 ms, `ease-out` `cubic-bezier(.05,.7,.1,1)`. Revelados con `animation-timeline: view()` bajo `@supports`, transiciones nativas entre páginas con `@view-transition`, parallax ≤ 16 px solo en puntero fino. **Sin librería de animación en páginas públicas** (Motion `animate` mini = 2,3 KB solo si hace falta). `prefers-reduced-motion` con variante definida para cada animación. | Menos JS, mejor INP/LCP; en mayores, el movimiento continuo molesta. |
| 6b | **Interactividad nativa** | `<dialog>` (modal + menú móvil con drill-down), `<details name>` (mega menú desktop + FAQ), scroll-snap + progreso CSS para carruseles. Embla 8.6 (≈ 7 KB gz) solo si se exige arrastre con inercia/loop. React solo en 2 islas: estimador de precio y buscador de zonas (Base UI Combobox). | CDC Bogotá ya usa este patrón: CSS+JS propios de la home ≈ 40 KB gz (medido: 28 KB CSS + 12 KB JS) más Embla (≈ 7 KB). |
| 7 | **WhatsApp** | **Desktop:** botón flotante 56 px que aparece a > 300 px de scroll, 3 halos pulsantes (2,1 s, desfase 0,7 s), etiqueta píldora oscura «Escríbenos por WhatsApp» que **sale hacia la izquierda** (hover/foco + una auto-aparición por sesión). **Móvil:** **barra inferior fija** (Llamar + WhatsApp) en lugar del flotante + icono WhatsApp en el header. Todo CTA lleva `data-cta` para medición. | Replicado de CDC Bogotá (código propio, medido) con mejoras de descubribilidad y salida/entrada con `visibility`. |
| 8 | **Modal de cotización** | `<dialog>` nativo 600 px, radio 24 px, 3 pasos progresivos (nombre + WhatsApp → correo opcional → servicio + zona + mensaje), **etiquetas permanentes** (no flotantes), casilla de consentimiento con enlace a la política (Ley 1581), Turnstile + honeypot, «o escríbenos por WhatsApp» con mensaje prellenado. **No se piden datos de salud.** | Menos fricción y menor riesgo de datos sensibles. |
| 9 | **Menú móvil** | Diálogo a pantalla completa con drill-down (Servicios «7 servicios» → lista con icono y «desde $»; Zonas «N zonas» con buscador), filas de 56 px, CTA WhatsApp + «Déjanos tus datos» fijos abajo. | Medido en CDC Bogotá. |
| 10 | **Precios** | Tarjetas «**desde $X**» por turno (12 h día, noche, 24 h), con nota de vigencia/IVA editable; todo campo de la CMS; nada de cifras «de ejemplo» publicadas. Nunca la palabra «enfermera/enfermería» ni procedimientos. | Riesgo legal documentado (sin IPS, IVA 19 %); la intención de precio existe en las búsquedas. |
| 11 | **Confianza** | Solo señales verificables y editables. Testimonios: componente con estado `verificado + consentimiento` (si falta, no se publica). **Sin `aggregateRating` propio** en JSON-LD. Aviso «Imágenes ilustrativas» donde se usen fotos IA; el equipo en «Nosotros» debe ser **real**. | Política de reseñas de Google y honestidad con el cliente. |
| 12 | **Blog** | Replicar el artículo de cursodeglobosonline.com (mismo stack: Astro 7 + EmDash): migas → H1 → meta → estrellas → imagen → TOC → «En resumen» → tablas → FAQ → tarjeta CTA → autor → «¿Te resultó útil?» → comentarios → relacionados; JSON-LD `BlogPosting` + `BreadcrumbList` + `FAQPage` (+ `Person`). | Es la implementación de referencia ya en producción. |
| 13 | **Cobertura** | Mapa **SVG esquemático** del norte de Bogotá + lista de zonas con buscador sin tildes + landing por zona. Sin embed de Google Maps. | 0 KB de mapas de terceros; SEO local por zona. |
| 14 | **Imagen** | 14 briefs fotográficos (§8), realismo aspiracional, ratio de generación 3:2 / 4:5 / 16:9 con recortes definidos. | Proceso `imagenes-ultrarrealistas` de JP. |

**Presupuesto de rendimiento (home, móvil 4G):** LCP ≤ 2,0 s (p75 ≤ 2,5 s) · INP ≤ 200 ms · CLS ≤ 0,05 · JS hidratado ≤ 60 KB gz · CSS ≤ 35 KB gz · HTML ≤ 60 KB gz · foto hero ≤ 90 KB (AVIF móvil) / 160 KB (desktop) · fuentes ≤ 70 KB.

---

## 1. Contexto y restricciones que condicionan el diseño

- **Negocio:** Sovialis (Bogotá). Cuidadoras y personas con formación de auxiliar de enfermería, turnos 12 h / 24 h / noche, acompañamiento a citas y hospital, postoperatorio en casa, demencia. Eslogan «Vínculos que protegen». **No es IPS**: la web no puede ofrecer enfermería ni procedimientos (inyecciones, curaciones, sondas, suero). Fórmula segura: «cuidado por personal con formación de auxiliar de enfermería»; los procedimientos los contrata la familia con una IPS aliada. *(Fuente interna: memoria `sovialis-riesgos-legales`.)*
- **Público:** hijos/hijas de 40–65 años (comprador) del norte de Bogotá (Usaquén, Chapinero, Cedritos, Santa Bárbara, Chicó, Calle 170, Suba, Niza, Colina…). Compra de alta carga emocional, desde el móvil, con urgencia a veces (alta hospitalaria). La persona mayor también lee y opina: accesibilidad real, no decorativa.
- **Precios provisionales:** $160.000/turno de 12 h es el supuesto del dueño; IVA 19 % probable (margen 43 % → 32 %) y estructura laboral en revisión. **Todo precio debe vivir en la CMS** con interruptor «IVA incluido» y fecha de vigencia. *(Memoria `sovialis-feedback-configurable`: JP completa datos después; nada fijo en código.)*
- **EmDash (verificado en `.agents/skills/building-emdash-site`):** páginas **siempre server-rendered** (`output: "server"`), sin `getStaticPaths`; tipos de campo `blocks` + `blockTypes` (composición de página), `repeater`, `portableText`, `image` (objeto, no string), `reference`; menús con hijos pero **`MenuItem` solo trae `label/url/target/children`** (sin icono, sin precio, sin descripción); comentarios nativos (`/_emdash/api/comments/...`); búsqueda `LiveSearch`; ajustes del sitio (`title, tagline, logo, favicon, social…`). Los bloques **no admiten `reference`, JSON ni bloques anidados**.
  → Consecuencias de diseño: el mega menú se alimenta de la colección `servicios` (icono, resumen, `precio_desde`), no del menú; los bloques «ServiceCards», «Zonas», «Testimonios» llevan `coleccion` + `limite` + `solo_destacados` en lugar de referencias.
- **Archivos del repo a tener en cuenta:** `web/package.json` ya trae `@fontsource-variable/jost`, `@fontsource-variable/figtree`, `radix-ui 1.6.7`, `lucide-react`, CVA, `tailwind-merge`. El `DESIGN.md` de la raíz (verde azulado, Manrope/Source Sans) es de Codex y **está superado** por la paleta Océano + Jost de `brand-claude/`. `@astrojs/react` figura en 6.0.6 y el último publicado es 7.0.0: verificar compatibilidad antes del primer build.

---

## 2. visitvalle.travel (home y /planea-tu-visita/)

### 2.1 Stack real *(medido)*
WordPress 7.1 + **Elementor 3.25 / Pro 3.27** + plugins **Crocoblock JetTabs / JetAccordion / JetPopup / JetElements** + WPML + caché Breeze. Tema `hello-elementor`.
- **Carruseles = Swiper** (el que trae Elementor `e_swiper_latest`, widget `n-carousel`). **No usa GSAP ni scroll-snap.**
- **Hero = jQuery propio** (alterna una clase `active-slide`; 28 líneas). El «scroll de tarjetas apiladas» es jQuery con `getBoundingClientRect()` en cada evento `scroll` (sin `requestAnimationFrame`): trabajo en el hilo principal por cada píxel de scroll.
- **Peso:** 30 hojas CSS ≈ **979 KB** (97 KB gz) + 24 scripts ≈ **522 KB** (160 KB gz) y el HTML referencia **tres copias de jQuery** (2.2.4, 3.6.0 y la 3.7.1 empaquetada). HTML 273 KB.
- **Fuentes:** *Roquefort Trial* (display, variante *trial*, `font-display:auto`) + Source Sans Pro. Tamaños dominantes en CSS: 16–24 px; etiquetas de pestañas 15 px; FAQ: respuesta 17 px (15 px en móvil) y pregunta 24 px (17 px en móvil): **demasiado pequeño para nuestro público**.
- **Paleta:** verde profundo #0B3D30, crema #FFF7E7/#F3EAD7, marrones #7F6149/#664E3A (footer #664E3A). **Radios:** 200 px (píldoras), 30/24 px (tarjetas, pestañas), 18 px, 12 px (submenú). **Anchos de contenedor:** 1340/1600 px. Botones `min-height` 54–64 px. **Movimiento:** hover 0,4 s `ease-in-out`; fundido de slide 0,6 s; contenido de slide `fadeInScaleUp` 0,6 s con retraso escalonado 0,1/0,2/0,3 s (en realidad es `translateY(100%)→0`, el nombre engaña); fondo del slider lateral 1 s; contenido de pestañas `moveUp` 0,5 s `cubic-bezier(.26,.69,.37,.96)`.
- **Schema:** Organization, WebSite, WebPage, ImageObject, Person, Article (sin FAQPage aunque tiene FAQ).

### 2.2 Header / navegación *(medido)*
Contenedor de 100 px **superpuesto al hero** (el hero lleva `margin-top:-100px`), transparente, **no sticky**. Logo SVG 128×48 a la izquierda; 6 ítems (Top Experiencias, Explora el Valle, Conoce el destino, Pueblos Mágicos, Planea tu visita, Blog) en 18 px/600 con subrayado animado en hover y separadores de 1 px; selector de idioma con banderas (WPML). Submenús con fondo `#0000008C` y radio 12 px. Móvil: logo + un icono que abre un **JetPopup** (menú superpuesto).
**Tomar:** header transparente sobre foto (solo en home y landings con foto oscura y **con degradado de contraste garantizado**), selector de idioma discreto. **No tomar:** que no tenga estado «scrolled» (sin fondo al bajar el texto blanco queda sobre blanco), ni la dependencia de plugins.

### 2.3 Hero con foto a pantalla completa y tarjeta de texto *(medido)*
```
.mb-banner (min-height:100vh, overflow:hidden, margin-top:-100px)
 └ .mb-slides-wrap (min-height:90vh)
    ├ .e-con (slide ×4: position:absolute; opacity:0; visibility:hidden; transition:.6s)
    │   · fondo = CSS background-image (webp) ← no hay <img>; no se puede preload ni fetchpriority
    │   · overlay opacidad .3 (--overlay-opacity)
    │   └ .banner-content-wrap (ancho 60 %): <h4> eyebrow · <h1>/<h4> título · botón «Descubrir»
    └ .mb-slides-indicators: «01. Explora el Valle · 02. Festivales… · 03. … · 04. …» (clic = cambia slide)
```
Reglas CSS clave (copiadas del CSS real):
```css
.slides > .e-con            { opacity:0; visibility:hidden; z-index:0; transition:.6s }
.slides > .e-con.active-slide{ opacity:1; visibility:visible; z-index:1 }
.active-slide .banner-content-wrap > *            { animation: fadeInScaleUp .6s ease 1 }
.active-slide .banner-content-wrap > *:nth-child(1){ animation-delay:.1s } /* :nth-child(2) .2s, (3) .3s */
@keyframes fadeInScaleUp{ 0%{opacity:0; transform:translateY(100%)} 100%{opacity:1; transform:translateY(0)} }
/* Botón «text roll»: dos copias del texto apiladas */
.mb-btn1,.mb-btn2 { transition:.4s ease-in-out }
.mb-btn2          { transform:translateY(100%) }
.btn:hover .mb-btn2{ transform:translateY(0) } .btn:hover .mb-btn1{ transform:translateY(-100%) }
```
**Problemas SEO/UX medidos:** (1) fondo vía CSS = LCP no descubrible (el Web Almanac 2025 reporta que el 9 % de páginas móviles tiene un fondo CSS como elemento LCP y que cambiar a `<img>` mejoró la mediana de LCP un 35 % en sitios monitoreados); (2) solo el slide 1 usa `<h1>`, los otros son `<h4>` (correcto, pero el resto del texto compite poco); (3) no hay pausa ni control de teclado en el slider (WCAG 2.2.2) y los indicadores son `div`; (4) 100 vh + margen negativo = CLS/zoom raros en móvil con barra de URL dinámica.
**Tomar:** foto inmersiva con esquinas muy redondeadas, tarjeta de texto flotante, botón con «text roll» (solo `:hover` en puntero fino; en foco usar subrayado), indicadores numerados `01 02 03` (los usaremos en «Cómo funciona», no en el hero).

### 2.4 Pestañas «píldora» sobre la foto *(medido, /planea-tu-visita/)*
JetTabs `position-left`. **El contenedor de controles tiene la foto como `background-image`** (radio 24 px, fondo crema #FFF7E7, padding 24 px, ancho mínimo 48 %); las pestañas son píldoras (radio 24 px, `align-self:flex-end`, 15 px/500) pegadas al borde inferior de la foto; la activa se rellena (marrón #664E3A) con texto crema y radio 20 px; el panel de la derecha (52 %) cambia con la animación `moveUp` (0,5 s, 25 px). Móvil: se apila.
ARIA: `role="tablist/tab/tabpanel"`, pero usa `aria-expanded` en las pestañas (debería ser `aria-selected`) y sin navegación con flechas.

### 2.5 Carrusel de tarjetas de categoría *(medido, home)*
Elementor `n-carousel` (Swiper): **3 tarjetas** en desktop (hueco 8 px, «peek» de 100 px), 2 en tablet, 1 en móvil (peek 25 px, hueco 12 px). Cada tarjeta: foto 768×900, **píldora con la categoría** arriba («Naturaleza», «Deporte»…), y un **panel crema** con `h3`, párrafo y botón «Descubrir» que sube con `translateY(110%)→0` en 0,4 s al hover y escala la foto 1,05. Debajo: barra de progreso (`swiper-pagination-progressbar`, relleno #7F6149, radio 5 px) + flechas, movidas por un `MutationObserver` a un contenedor `.b-experience-indc` (parche).
**Problema medido:** el panel solo se oculta con `@media (min-width:768px)` — en una tablet táctil de 768+ px **el contenido queda escondido sin hover**. Usar `@media (hover:hover) and (pointer:fine)`.

### 2.6 FAQ con «+» circular *(medido)*
JetAccordion: filas separadas por una línea de 1 px (#7F6149 al 15 %); pregunta 24 px/600 (17 px móvil), contenido 17 px (15 px móvil); icono SVG de **40×40, `rx=19`**, trazo 2 px, con «+» cerrado y «−» abierto; animación `moveUp`; `role="button"`, `aria-expanded`, `aria-controls`, `role="region"` (bien). Sin `FAQPage` en JSON-LD.

### 2.7 Pie redondeado con formas *(medido)*
Contenedor con `border-radius:25px 25px 0 0` (32 px en ≥ 1920), **superpuesto `margin-top:-30px`** sobre la sección anterior, fondo #664E3A, `z-index:10`; las «formas diagonales» son SVG (`Vector.svg`, `Vector-1.svg`) en un `::before` de fondo. Columnas: Sitios de interés · Síguenos · Información · legales. **Antipatrón:** debajo del pie hay un bloque de enlaces a agencias y tours de Santa Marta ajenos al sitio (link farm): no copiar.

### 2.8 Tomar / no tomar

| Tomar | No tomar |
|-------|----------|
| Contenedores muy redondeados (24–32 px), píldoras 999 px, mucho aire entre secciones | Elementor + Jet* + 3 jQuery (1,5 MB de CSS/JS) |
| Tarjeta de texto flotante sobre foto grande | Fondo del hero como `background-image` (no preload, LCP lento) |
| Panel de contenido que sube sobre la tarjeta al hover (con alternativa táctil) | Panel oculto por ancho de pantalla en vez de `(hover:hover)` |
| Pestañas con foto de fondo y píldoras en el borde inferior | `aria-expanded` en pestañas, sin flechas de teclado |
| Barra de progreso + flechas grandes bajo carruseles | Slider auto-rotativo sin pausa; scroll-jacking con jQuery |
| FAQ con círculo +/− de 40 px | Texto de 15–17 px; `font-display:auto`; fuentes *trial* |
| Pie redondeado superpuesto con motivo gráfico propio | Link farm en el pie; header sin estado «scrolled» |

### 2.9 Re-implementación mínima (sin plugin) de lo que sí tomamos

**Tarjeta con panel que sube (CSS puro, táctil-seguro):**
```css
.cat-card { position:relative; overflow:hidden; border-radius:var(--radius-xl); isolation:isolate }
.cat-card img { inline-size:100%; block-size:100%; object-fit:cover; transition:transform var(--dur-reveal) var(--ease-out) }
.cat-card__tag { position:absolute; inset:16px auto auto 16px; padding:6px 14px; border-radius:999px;
                 background:color-mix(in oklch, var(--arena) 92%, transparent); color:var(--tinta); font:600 .9rem/1.2 var(--font-sans) }
.cat-card__panel { background:var(--arena); border-radius:20px; padding:20px; margin:12px }
@media (hover:hover) and (pointer:fine) {
  .cat-card__panel { position:absolute; inset:auto 0 0; transform:translateY(calc(100% + 12px));
                     transition:transform var(--dur-reveal) var(--ease-out) }
  .cat-card:hover .cat-card__panel, .cat-card:focus-within .cat-card__panel { transform:none }
  .cat-card:hover img { transform:scale(1.05) }
}
@media (prefers-reduced-motion:reduce){ .cat-card__panel,.cat-card img{ transition:none } }
```

**Carrusel scroll-snap con barra de progreso ligada al scroll (sin librería):**
```css
.rail-wrap { timeline-scope:--rail }
.rail { display:grid; grid-auto-flow:column; grid-auto-columns:min(86%,380px); gap:16px; overflow-x:auto;
        scroll-snap-type:x mandatory; scroll-padding-inline:16px; scrollbar-width:none; scroll-timeline:--rail inline }
.rail > * { scroll-snap-align:start }
.rail-progress { block-size:6px; border-radius:6px; background:var(--bruma); overflow:hidden }
.rail-progress::after { content:""; display:block; block-size:100%; background:var(--oceano); transform-origin:left;
                        animation:rail-grow linear both; animation-timeline:--rail }
@keyframes rail-grow { from{ transform:scaleX(.15) } to{ transform:scaleX(1) } }
@supports not (animation-timeline: scroll()) { .rail-progress { display:none } }
```
(15 líneas de JS: dos botones `rail.scrollBy({left:±rail.clientWidth*.8, behavior: reduce?'auto':'smooth'})`, deshabilitar en los extremos.)

**Pestañas sobre imagen accesibles (ARIA correcto + flechas):**
```html
<div class="tabs-img" data-tabs>
  <div class="tabs-img__media" style="--img:url(/img/sovialis-tabs.avif)">
    <div role="tablist" aria-label="Tipos de turno">
      <button role="tab" id="t1" aria-selected="true"  aria-controls="p1" tabindex="0">Turno de día</button>
      <button role="tab" id="t2" aria-selected="false" aria-controls="p2" tabindex="-1">Noche</button>
    </div>
  </div>
  <div class="tabs-img__panels">
    <section role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">…</section>
    <section role="tabpanel" id="p2" aria-labelledby="t2" tabindex="0" hidden>…</section>
  </div>
</div>
```
```ts
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach(root => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  const select = (t: HTMLButtonElement, focus = false) => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      root.querySelector<HTMLElement>('#' + x.getAttribute('aria-controls'))!.hidden = !on; });
    if (focus) t.focus();
  };
  root.addEventListener('click', e => { const t = (e.target as Element).closest<HTMLButtonElement>('[role=tab]'); if (t) select(t); });
  root.addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement); if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key as 'ArrowRight'];
    if (next !== undefined) { e.preventDefault(); select(tabs[(next + tabs.length) % tabs.length], true); }
  });
});
```
```css
.tabs-img { display:grid; grid-template-columns:minmax(0,.48fr) minmax(0,.52fr); gap:clamp(24px,4vw,56px); align-items:stretch }
.tabs-img__media { background:var(--img) center/cover, var(--bruma); border-radius:var(--radius-2xl); padding:20px;
                   display:flex; align-items:flex-end; min-block-size:420px }
[role=tablist] { display:flex; flex-wrap:wrap; gap:8px }
[role=tab] { min-block-size:48px; padding:0 20px; border-radius:999px; font:600 1rem var(--font-sans);
             background:color-mix(in oklch, var(--arena) 88%, transparent); color:var(--tinta);
             -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px) }
[role=tab][aria-selected=true] { background:var(--oceano); color:#fff }
[role=tabpanel] { animation:move-up .5s cubic-bezier(.26,.69,.37,.96) }
@keyframes move-up { from{ opacity:0; translate:0 24px } }
@media (max-width:820px){ .tabs-img{ grid-template-columns:1fr } .tabs-img__media{ min-block-size:260px } }
@media (prefers-reduced-motion:reduce){ [role=tabpanel]{ animation:none } }
```
Nota SEO: el contenido de los paneles ocultos con `hidden` está en el DOM y Google lo indexa; aun así el contenido que debe posicionar (precios, qué incluye) va **fuera** de pestañas.

**FAQ con círculo +/− (`<details name>`):** ver §7.4 (acordeón/FAQ), con `::details-content` animado como mejora progresiva.

**Pie redondeado superpuesto:**
```css
.site-footer { margin-block-start:-32px; border-radius:var(--radius-2xl) var(--radius-2xl) 0 0; background:var(--tinta); color:var(--bruma);
               position:relative; z-index:2; overflow:clip }
.site-footer::before { content:""; position:absolute; inset:auto -10% -30% auto; inline-size:60vmax; aspect-ratio:1;
                       background:url(/brand/s-franjas.svg) center/contain no-repeat; opacity:.07; pointer-events:none }
```
(El SVG es la S de tres franjas de la marca, a 7 % de opacidad; no se anima.)

---

## 3. cursosdeconduccionbogota.com (Moviti / Connexis) — comportamiento y código reutilizable

### 3.1 Arquitectura *(medido)*
Astro + Tailwind **4.3.3** (`@layer theme/base/components/utilities`), **Embla** para el hero y los carruseles, **diálogos nativos** (`#mobile-menu`, `#quote-dialog`, `#cookie-dialog`), **`<details name="main-menu">`** como mega menú, prefetch al hover, GTM con *consent mode*, contrato de medición con `data-cta="zona:nombre"`. HTML 70 KB gz; CSS propio 28 KB gz; JS de la home ≈ 12 KB gz (+ Embla). Tokens reales (`:root`):
```css
:root {
--dur-micro:.12s; --dur-state:.2s; --dur-accordion:.3s; --dur-reveal:.4s; --dur-scene:.7s;
--ease-out:cubic-bezier(.05,.7,.1,1); --ease-standard:cubic-bezier(.2,0,0,1); --ease-in-out:cubic-bezier(.4,0,.2,1);
--ease-stamp:linear(0,.3 12%,.75 25%,1.1 45%,.97 65%,1.02 82%,1);
--radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-card:18px; --radius-xl:24px; --radius-pill:999px;
--shadow-card:0 1px 2px #0f16200f,0 10px 30px #0f162014; --shadow-wa:0 8px 24px #25d36659;
--color-cta:#25d366; --color-cta-texto:#0f1620;
}
```
Botón base: `height:3.25–3.5rem`, `font-weight:700`, radio píldora, `font-size:1.0625rem`.

### 3.2 Botón flotante de WhatsApp — cómo funciona exactamente *(medido)*

| Aspecto | Valor real |
|---------|-----------|
| Contenedor | `.fab-stack`: `position:fixed; right:28px; bottom:calc(28px + var(--alto-consentimiento,0px)); z-index:45; display:flex; flex-direction:column; gap:32px; pointer-events:none` (hijos `pointer-events:auto`). Contiene «Volver arriba» (48 px, oscuro, borde blanco 2 px) y WhatsApp. |
| Botón | 56×56 px, círculo, `background:#25d366`, icono SVG 28 px `currentColor` (#fff), `box-shadow:0 8px 24px #25d36659`, `isolation:isolate`. |
| **Umbral de aparición** | `scrollY > 300` ⇒ `.fab-whatsapp.is-visible` (el de «volver arriba» a `> 400`, el header compacto a `> 80`). Un solo listener `scroll` **pasivo** limitado con `requestAnimationFrame`. |
| Estado oculto → visible | `opacity:0; visibility:hidden; transform:translateY(12px)` → `opacity:1; visibility:visible; transform:none`, `transition: transform .2s, opacity .2s` con `ease-out`. (La `visibility` **no** se transiciona: al ocultarse desaparece de golpe.) |
| **Halo pulsante** | 3 `<span class="fab-halo">` absolutos (`inset:0; border-radius:50%; background:#25d366; z-index:-1`), `animation: fab-halo 2.1s var(--ease-out) infinite`, desfases `0 / .7s / 1.4s`. Keyframes: `0%{opacity:0;scale 1} 12%{opacity:.38} 100%{opacity:0;scale 2}`. |
| **Etiqueta píldora oscura** | `<span class="fab-tip" aria-hidden="true">Escríbenos por WhatsApp</span>` dentro del enlace: `position:absolute; top:50%; right:calc(100% + 12px)`; fondo `--color-noche-900` (casi negro azulado), texto blanco `700 13px/18px Montserrat`, `padding:7px 12px`, `border-radius:999px`, sombra de tarjeta. Reposo: `opacity:0; transform:translate(6px,-50%)`. **Solo en `:hover` y `:focus-visible`** del botón: `opacity:1; transform:translateY(-50%)`, `transition: opacity .12s, transform .12s`. (No se auto-muestra.) El nombre accesible lo da `aria-label` del `<a>`. |
| Hover | `transform:scale(1.06)`. |
| `prefers-reduced-motion` | Sin transiciones; **halos estáticos** a `opacity .22/.12/.08` y `scale 1.21/1.57/2`. |
| Móvil `≤ 1023px` | El botón **se oculta** (`display:none`); queda «volver arriba» (44 px) a `bottom:calc(80px + safe-area)` por encima de la barra inferior. |
| Enlace | `https://api.whatsapp.com/send?phone=57…&text=<mensaje>` (`wa.me/57…?text=` es equivalente), `target="_blank" rel="noopener"`, `data-cta="global:flotante"`. Impresión: oculto. |
| Banner de cookies | Un `ResizeObserver` mide el alto del banner y lo publica en `--alto-consentimiento` para que el FAB y la barra inferior se desplacen y no lo tapen. |

**CSS y JS originales (de-minificados, tal como están en producción):**
```css
.fab-stack{ position:fixed; right:28px; bottom:calc(28px + var(--alto-consentimiento,0px)); z-index:45; display:flex; flex-direction:column; align-items:center; gap:32px;
            pointer-events:none; transition:bottom var(--dur-state) var(--ease-out) }
.fab-stack > *{ pointer-events:auto }
.fab-whatsapp{ position:relative; isolation:isolate; display:flex; justify-content:center; align-items:center; width:56px; height:56px; border-radius:50%;
               color:#fff; background:var(--color-cta); box-shadow:var(--shadow-wa);
               opacity:0; visibility:hidden; transform:translateY(12px);
               transition:transform var(--dur-state) var(--ease-out), opacity var(--dur-state) var(--ease-out) }
.fab-whatsapp.is-visible{ visibility:visible; opacity:1; transform:none }
.fab-whatsapp:hover, .fab-whatsapp:focus-visible{ transform:scale(1.06) }
.fab-halo{ position:absolute; inset:0; z-index:-1; border-radius:50%; background:var(--color-cta); opacity:0; animation:fab-halo 2.1s var(--ease-out) infinite }
.fab-halo:nth-child(2){ animation-delay:.7s } .fab-halo:nth-child(3){ animation-delay:1.4s }
@keyframes fab-halo{ 0%{ opacity:0; transform:scale(1) } 12%{ opacity:.38 } to{ opacity:0; transform:scale(2) } }
.fab-tip{ position:absolute; top:50%; right:calc(100% + 12px); transform:translate(6px,-50%); padding:7px 12px; border-radius:var(--radius-pill);
          background:var(--color-noche-900); color:#fff; font:700 13px/18px var(--font-heading); white-space:nowrap; box-shadow:var(--shadow-card);
          opacity:0; pointer-events:none; transition:opacity var(--dur-micro) var(--ease-out), transform var(--dur-micro) var(--ease-out) }
.fab-whatsapp:hover .fab-tip, .fab-whatsapp:focus-visible .fab-tip{ opacity:1; transform:translateY(-50%) }
@media (width <= 1023px){ .fab-whatsapp{ display:none } .fab-stack{ right:16px; bottom:calc(80px + env(safe-area-inset-bottom) + var(--alto-consentimiento,0px)) } }
@media (prefers-reduced-motion:reduce){
  .fab-whatsapp, .fab-top, .fab-tip{ transition:none } .fab-whatsapp:hover, .fab-whatsapp:focus-visible{ transform:none }
  .fab-halo{ opacity:.22; animation:none; transform:scale(1.21) } .fab-halo:nth-child(2){ opacity:.12; transform:scale(1.57) } .fab-halo:nth-child(3){ opacity:.08; transform:scale(2) }
}
```
```js
// BaseLayout (original): un solo listener pasivo + rAF
const update = () => {
  document.querySelector('#site-header')?.classList.toggle('is-compact', scrollY > 80);
  document.querySelector('.fab-whatsapp')?.classList.toggle('is-visible', scrollY > 300);
};
let busy = false;
addEventListener('scroll', () => { if (busy) return; busy = true; requestAnimationFrame(() => { update(); busy = false; }); }, { passive: true });
update();
```

**Versión Sovialis (mejorada).** Cambios: (a) la etiqueta **«sale» desde detrás del círculo hacia la izquierda** (efecto pedido) con `max-inline-size`, (b) **una auto-aparición por sesión** (1,8 s después de que aparece el botón, visible 5,2 s) para descubribilidad sin molestar, (c) `visibility` con retardo para que el desvanecimiento de salida funcione, (d) *safe areas* y desplazamiento por el banner de cookies, (e) etiqueta 16 px (mínimo de legibilidad) y tarjeta de 60 px.

```html
<!-- src/components/WhatsAppFab.astro  (solo ≥ 1024 px; en móvil manda la barra inferior) -->
---
const { phone, message, label = 'Escríbenos por WhatsApp' } = Astro.props; // todo viene de ajustes de EmDash
const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
---
<div class="fab-stack" data-fab-stack>
  <a class="fab-wa" data-fab-wa href={href} target="_blank" rel="noopener" data-cta="global:flotante" aria-label={label}>
    <span class="fab-wa__label" aria-hidden="true"><span>{label}</span></span>
    <span class="fab-wa__btn">
      <span class="fab-halo" aria-hidden="true"></span><span class="fab-halo" aria-hidden="true"></span><span class="fab-halo" aria-hidden="true"></span>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><!-- path de WhatsApp --></svg>
    </span>
  </a>
</div>
```
```css
:root {
  --tinta:#0B2A4E; --wa:#25D366;
  --dur-micro:.12s; --dur-state:.2s; --dur-reveal:.4s; --dur-scene:.7s;
  --ease-out:cubic-bezier(.05,.7,.1,1); --ease-standard:cubic-bezier(.2,0,0,1);
}
.fab-stack{
  position:fixed; z-index:45; display:none; flex-direction:column; align-items:flex-end; gap:16px; pointer-events:none;
  inset-inline-end:max(24px, env(safe-area-inset-right));
  inset-block-end:calc(24px + env(safe-area-inset-bottom) + var(--alto-consentimiento, 0px));
  transition:inset-block-end var(--dur-state) var(--ease-out);
}
.fab-stack > * { pointer-events:auto }
@media (min-width:1024px){ .fab-stack{ display:flex } }

.fab-wa{
  --size:60px; position:relative; display:flex; align-items:center; justify-content:flex-end; text-decoration:none;
  opacity:0; visibility:hidden; transform:translateY(12px);
  transition:opacity var(--dur-state) var(--ease-out), transform var(--dur-state) var(--ease-out), visibility 0s linear var(--dur-state);
}
.fab-wa.is-visible{ opacity:1; visibility:visible; transform:none; transition-delay:0s }

.fab-wa__btn{
  position:relative; z-index:1; isolation:isolate; display:grid; place-items:center;
  inline-size:var(--size); block-size:var(--size); border-radius:50%;
  background:var(--wa); color:var(--tinta);                  /* Tinta sobre #25D366 = 7,3:1 */
  box-shadow:0 8px 24px #25d36659; transition:transform var(--dur-state) var(--ease-out);
}
.fab-wa:is(:hover,:focus-visible) .fab-wa__btn{ transform:scale(1.06) }
.fab-wa:focus-visible{ outline:3px solid var(--tinta); outline-offset:4px; border-radius:999px }

/* Etiqueta: arranca escondida DEBAJO del círculo (margen negativo = media anchura) y se despliega hacia la izquierda */
.fab-wa__label{
  display:flex; justify-content:flex-end; align-items:center; overflow:hidden; white-space:nowrap;
  block-size:48px; max-inline-size:0; opacity:0;
  margin-inline-end:calc(var(--size) / -2); padding-inline:0 calc(var(--size) / 2);
  background:var(--tinta); color:#fff; border-radius:999px; font:600 1rem/1 var(--font-sans);
  box-shadow:0 1px 2px #0f16200f, 0 10px 30px #0f162033;
  transition:max-inline-size .38s var(--ease-out), padding-inline-start .38s var(--ease-out), opacity var(--dur-state) var(--ease-out);
}
.fab-wa:is(:hover,:focus-visible) .fab-wa__label,
.fab-wa.is-tip .fab-wa__label{ max-inline-size:300px; opacity:1; padding-inline-start:22px }

/* Halo: 3 anillos desfasados (idéntico al de CDC Bogotá) */
.fab-halo{ position:absolute; inset:0; z-index:-1; border-radius:50%; background:var(--wa); opacity:0;
           animation:fab-halo 2.1s var(--ease-out) infinite }
.fab-halo:nth-child(2){ animation-delay:.7s } .fab-halo:nth-child(3){ animation-delay:1.4s }
@keyframes fab-halo{ 0%{opacity:0; transform:scale(1)} 12%{opacity:.38} 100%{opacity:0; transform:scale(2)} }

@media (prefers-reduced-motion:reduce){
  .fab-wa, .fab-wa__btn, .fab-wa__label{ transition:none }
  .fab-wa:is(:hover,:focus-visible) .fab-wa__btn{ transform:none }
  .fab-halo{ animation:none; opacity:.22; transform:scale(1.21) }
  .fab-halo:nth-child(2){ opacity:.12; transform:scale(1.57) }
  .fab-halo:nth-child(3){ opacity:.08; transform:scale(2) }
}
@media print{ .fab-stack{ display:none !important } }
```
```ts
// src/scripts/fab.ts — importar una sola vez desde el layout (Astro lo empaqueta como módulo)
const fab = document.querySelector<HTMLElement>('[data-fab-wa]');
if (fab) {
  const SHOW_AFTER = 300;   // px de scroll para mostrar (igual que CDC Bogotá)
  const TIP_DELAY  = 1800;  // ms tras aparecer antes de desplegar la etiqueta
  const TIP_TIME   = 5200;  // ms que permanece desplegada
  let ticking = false, armed = false, tipDone = false;
  try { tipDone = sessionStorage.getItem('sov:fab-tip') === '1'; } catch { /* modo privado */ }

  const sync = () => {
    const show = scrollY > SHOW_AFTER;
    fab.classList.toggle('is-visible', show);
    document.getElementById('site-header')?.classList.toggle('is-compact', scrollY > 80);
    if (show && !tipDone && !armed) {
      armed = true;
      setTimeout(() => {
        if (!fab.classList.contains('is-visible')) { armed = false; return; }
        tipDone = true;
        try { sessionStorage.setItem('sov:fab-tip', '1'); } catch {}
        fab.classList.add('is-tip');
        setTimeout(() => fab.classList.remove('is-tip'), TIP_TIME);
      }, TIP_DELAY);
    }
  };
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { sync(); ticking = false; });
  }, { passive: true });
  sync();
}

// Altura del banner de cookies → variable CSS (para que FAB y barra no lo tapen)
const banner = document.querySelector<HTMLElement>('.cookie-banner');
if (banner) {
  const set = () => document.documentElement.style.setProperty('--alto-consentimiento',
    `${banner.hidden ? 0 : Math.ceil(banner.getBoundingClientRect().height)}px`);
  set();
  new ResizeObserver(set).observe(banner);
  new MutationObserver(set).observe(banner, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
}
```
Notas: (1) Si se quiere un halo menos insistente, usar `animation-iteration-count: 4` y reiniciarlo en `.is-tip`. (2) El botón **no** debe aparecer sobre el formulario/modal: los `<dialog>` modales viven en la capa superior y lo cubren solos. (3) El texto del mensaje prellenado y el teléfono salen de los ajustes del sitio (EmDash), nunca del código.

### 3.3 Header *(medido)*
`#site-header` (`position:sticky; top:0; z-index:60`), fila de **76 px** (66 px compacto, 56 px móvil), transición de altura `.2s`. **Estado compacto** con `scrollY > 80`: `backdrop-filter:blur(16px); background:#fffffff0` + sombra. Desktop: logo · nav (`Cursos ▾`, `Localidades ▾`, Precios, Guías, Nosotros, Contacto) · acciones: botón primario **«Cotiza tu curso»** (abre el modal) + botón fantasma **«WhatsApp»** con icono (se oculta bajo 1200 px). Móvil (≤ 1023 px): se ocultan nav y acciones; quedan **2 iconos circulares de 40 px: cotizar (borde) y WhatsApp (relleno verde, borde 1 px oscuro)** + hamburguesa. Barra superior opcional «trust-bar» (p. ej. «Habilitada ante el RUNT…»).
**Sovialis:** botones con **texto** (no solo icono) en móvil: `Menú` + icono, WhatsApp 48 px; el teléfono como enlace de texto en la barra superior (≥ 18 px); logotipo **sin eslogan** en móvil (regla del manual de marca).

### 3.4 Barra inferior fija en móvil *(medido)* + adaptación
CDC Bogotá: a `≤ 1023 px` siempre visible, `position:fixed; left/right:0; bottom:var(--alto-consentimiento)`, `z-index:40`, `padding:8px 16px calc(8px + safe-area)`, borde superior 1 px y sombra `0 -4px 20px #00000012`; texto «¿Listo para empezar? / Tu licencia, a tu ritmo» + botón verde **«Empieza ahora»**; `body{padding-bottom:calc(64px + safe-area)}`. En ≤ 374 px reduce huecos y tamaños.
**Sovialis:** dos acciones (Llamar 48 px circular + WhatsApp ancho completo), **aparece cuando el CTA del hero sale de pantalla** (en landings con tráfico de pago puede ir siempre visible) y se oculta si el teclado virtual está abierto.
```html
<div class="cta-bar" data-cta-bar role="region" aria-label="Contacto rápido">
  <a class="cta-bar__call" href="tel:+57…" data-cta="global:barra-movil-llamar" aria-label="Llamar a Sovialis"><svg aria-hidden="true">…</svg></a>
  <a class="btn btn-wa" href="https://wa.me/57…?text=…" data-cta="global:barra-movil" target="_blank" rel="noopener">
    <svg aria-hidden="true">…</svg> Empieza ahora por WhatsApp
  </a>
</div>
```
```css
.cta-bar{ display:none }
@media (max-width:1023px){
  body{ padding-block-end:calc(72px + env(safe-area-inset-bottom)) }
  .cta-bar{
    position:fixed; inset:auto 0 var(--alto-consentimiento,0px); z-index:40; display:flex; gap:12px; align-items:center;
    padding:8px 16px calc(8px + env(safe-area-inset-bottom)); background:#fff; border-top:1px solid var(--borde);
    box-shadow:0 -4px 20px #0b2a4e1f; transform:translateY(100%); visibility:hidden;
    transition:transform var(--dur-state) var(--ease-out), visibility 0s linear var(--dur-state);
  }
  .cta-bar.is-visible{ transform:none; visibility:visible; transition-delay:0s }
  .cta-bar__call{ flex:none; display:grid; place-items:center; inline-size:52px; block-size:52px; border-radius:50%;
                  border:2px solid var(--tinta); color:var(--tinta) }
  .cta-bar .btn{ flex:1; block-size:52px; font-size:1.0625rem }
}
@media (prefers-reduced-motion:reduce){ .cta-bar{ transition:none } }
```
```ts
const bar = document.querySelector<HTMLElement>('[data-cta-bar]');
const sentinel = document.querySelector('[data-hero-cta]');
if (bar) {
  if (!sentinel) bar.classList.add('is-visible');                       // landings de Ads: siempre
  else new IntersectionObserver(([e]) => bar.classList.toggle('is-visible', !e.isIntersecting)).observe(sentinel);
  visualViewport?.addEventListener('resize', () => { bar.hidden = visualViewport!.height < innerHeight * 0.75; }); // teclado abierto
}
```
Con `scroll-padding-block-end: 88px` en `html` para que el foco/anclas no queden bajo la barra (WCAG 2.4.11).

### 3.5 Menú móvil a pantalla completa con *drill-down* *(medido)* + código
**Qué hace CDC Bogotá:** `<dialog id="mobile-menu" data-level="main">` a `100dvh`, animación de entrada `mobile-menu-enter .25s` (`opacity 0, translateX(20px)` → normal). Dentro, varias `<section data-menu-level="main|courses|localities">`; solo una visible (`hidden` en las demás). Nivel principal: filas de **56 px** con icono + título + contador a la derecha («**6 cursos**», «**24 zonas**») + chevron; «Precios/Guías/Nosotros/Contacto» son enlaces. Abajo, fijos: botón verde **«Empieza ahora»** (WhatsApp), botón fantasma **«Déjanos tus datos»** (abre el modal) y una línea de confianza. Subnivel «Cursos»: cabecera de 56 px con botón volver + `‹ Menú` + `h2`, lista de **72 px** por ítem con icono 40 px, nombre y **«desde $900.000»**. Subnivel «Localidades»: buscador sin tildes + grupos. Foco: al entrar a un subnivel se enfoca el `h2` (`tabindex=-1`); al volver, el botón que lo abrió. `Esc` en un subnivel vuelve al principal; en el principal cierra. Se cierra al pulsar cualquier enlace. Al cerrar se devuelve el foco al botón y se resetea el nivel.
```ts
// src/scripts/mobile-menu.ts
const menu   = document.querySelector<HTMLDialogElement>('#mobile-menu');
const opener = document.querySelector<HTMLElement>('[data-menu-open]');
if (menu && opener) {
  const levels = [...menu.querySelectorAll<HTMLElement>('[data-menu-level]')];
  let previous = 'main';

  const go = (level: string, moveFocus = true) => {
    previous = menu.dataset.level || 'main';
    menu.dataset.level = level;
    levels.forEach(l => (l.hidden = l.dataset.menuLevel !== level));
    if (!moveFocus) return;
    if (level === 'main') menu.querySelector<HTMLElement>(`[data-menu-next="${previous}"]`)?.focus();
    else menu.querySelector<HTMLElement>(`[data-menu-level="${level}"] h2`)?.focus({ preventScroll: true });
  };

  opener.addEventListener('click', () => { go('main', false); menu.showModal(); opener.setAttribute('aria-expanded', 'true'); });

  menu.addEventListener('click', e => {
    const t = e.target as Element;
    const next = t.closest<HTMLElement>('[data-menu-next]');
    if (next) go(next.dataset.menuNext!);
    if (t.closest('[data-menu-back]')) go('main');
    if (t.closest('[data-menu-close]')) menu.close();
    if (t.closest('a[href]')) menu.close();
  });

  // «Atrás» con Esc: el evento `cancel` solo es cancelable una vez por activación de usuario (Chrome),
  // por eso CDC Bogotá intercepta también keydown.
  menu.addEventListener('cancel', e => { if (menu.dataset.level !== 'main') { e.preventDefault(); go('main'); } });
  menu.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    e.preventDefault(); e.stopPropagation();
    menu.dataset.level === 'main' ? menu.close() : go('main');
  });
  menu.addEventListener('close', () => { go('main', false); opener.setAttribute('aria-expanded', 'false'); opener.focus({ preventScroll: true }); });

  // Si se agranda la ventana a desktop, cerrar
  matchMedia('(min-width:1024px)').addEventListener('change', m => m.matches && menu.open && menu.close());
}
```
```css
.mnav{ inline-size:100%; max-inline-size:none; block-size:100dvh; max-block-size:none; margin:0; padding:0; border:0; inset:0; position:fixed;
       overflow:hidden; overscroll-behavior:contain; background:var(--arena); color:var(--tinta) }
.mnav::backdrop{ background:#0f162099 }
.mnav[open]{ animation:mnav-in .25s var(--ease-out) both }
@keyframes mnav-in{ from{ opacity:0; transform:translateX(20px) } }
.mnav__level{ display:flex; flex-direction:column; block-size:100%; overflow:auto; overscroll-behavior:contain }
.mnav__level[hidden]{ display:none }
.mnav__level:not([hidden]){ animation:mnav-level .22s var(--ease-out) both }          /* deslizamiento entre niveles */
@keyframes mnav-level{ from{ opacity:0; transform:translateX(16px) } }
.mnav__top{ display:flex; align-items:center; justify-content:space-between; block-size:64px; padding-inline:20px 12px }
.mnav__list{ flex:1; padding-inline:20px }
.mnav__list > :is(a,button){ display:flex; align-items:center; gap:14px; inline-size:100%; min-block-size:60px; padding-block:8px;
   border:0; border-block-end:1px solid var(--borde); background:none; text-align:start; text-decoration:none; cursor:pointer; color:inherit }
.mnav__list strong{ font:600 1.1875rem/1.25 var(--font-sans) }
.mnav__list small{ margin-inline-start:auto; font:500 1rem/1.2 var(--font-sans); color:var(--texto-suave) }
.mnav__ctas{ display:grid; gap:12px; padding:16px 20px calc(24px + env(safe-area-inset-bottom)) }
@media (prefers-reduced-motion:reduce){ .mnav[open], .mnav__level:not([hidden]){ animation:none } }
@media (min-width:1024px){ .mnav{ display:none } }
```
Los contadores («7 servicios», «N zonas») se calculan en el servidor desde las colecciones de EmDash (`entries.length`), nunca se escriben a mano. «Servicios» lista icono + nombre + **«desde $…»** (campo `precio_desde` del servicio; si está vacío, no se muestra).

### 3.6 Mega menú desktop con `<details name>` *(medido)*
`<details class="nav-dropdown" name="main-menu"><summary aria-controls="mega-courses">Cursos</summary><div class="mega-courses" id="mega-courses">…</div></details>`. El atributo `name` hace que **solo uno esté abierto** sin JS (Baseline 2024). Panel `position:absolute; top:100%; width:100%; padding:32px 0; max-height:calc(100dvh - 108px); overflow:auto`; subrayado animado en el `summary` (`scaleX(0→1)` `.2s`). Mega «Cursos»: 3 columnas por categoría (icono, **título, descripción y «desde $»**) + una tarjeta de promoción («Combo… AHORRA HASTA $…»). Mega «Localidades»: **buscador** (normaliza `NFD` y quita diacríticos: «Usaquén»/«usaquen») con contador por grupo, mensaje «N zonas encontradas» en `aria-live` y estado vacío.
JS (≈ 25 líneas, solo si `matchMedia('(hover:hover) and (pointer:fine)')`): abrir en `pointerenter`; cerrar 160 ms después de `pointerleave` salvo que el foco esté dentro; `focusout` cierra si el foco sale; `Esc` cierra y devuelve el foco al `summary`; `ArrowDown` en el `summary` abre y enfoca el primer enlace; clic fuera cierra; `toggle` sincroniza `aria-expanded`.
```ts
const dropdowns = [...document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown')];
const hoverable = matchMedia('(hover:hover) and (pointer:fine)');
let timer: number;
const closeOthers = (keep?: HTMLDetailsElement) => dropdowns.forEach(d => d !== keep && (d.open = false));
dropdowns.forEach(d => {
  const summary = d.querySelector('summary')!;
  d.addEventListener('pointerenter', () => { if (!hoverable.matches) return; clearTimeout(timer); closeOthers(d); d.open = true; });
  d.addEventListener('pointerleave', () => { if (!hoverable.matches) return;
    timer = window.setTimeout(() => { if (!d.contains(document.activeElement)) d.open = false; }, 160); });
  d.addEventListener('toggle', () => summary.setAttribute('aria-expanded', String(d.open)));
  d.addEventListener('focusout', () => requestAnimationFrame(() => { if (!d.contains(document.activeElement) && !d.matches(':hover')) d.open = false; }));
  d.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); d.open = false; summary.focus(); }
    if (e.key === 'ArrowDown' && e.target === summary) { e.preventDefault(); closeOthers(d); d.open = true; d.querySelector<HTMLElement>('a,input')?.focus(); }
  });
});
document.addEventListener('click', e => { if (!(e.target as Element).closest('.nav-dropdown')) closeOthers(); });
```
**Sovialis:** mega «Servicios» = 3 columnas (**Por turno**: día 12 h · noche · 24 h/interna · por horas; **Por necesidad**: citas y hospital · postoperatorio · Alzheimer/demencia · auxiliar de enfermería; **Guías**) + tarjeta «Cotiza en 2 minutos». Mega «Zonas» = buscador + lista. Se pinta desde la colección `servicios` (EmDash `MenuItem` no trae icono ni precio).

### 3.7 Modal «Cotiza» *(medido)* + código
**Qué hace CDC Bogotá:** `<dialog class="site-dialog quote-dialog">` de `min(600px, 100% − 32px)`, padding 32 px (24×20 móvil), radio **24 px**, sombra `0 24px 60px -8px #00000059`, `::backdrop` con `blur(5px)` y `#0f16209e`; entrada `dialog-enter .2s` (`translateY(12px) scale(.99)` → normal); cierra con botón circular 40 px, clic en el fondo (comprueba el `getBoundingClientRect`) y `Esc`; `overscroll-behavior:contain`. Cualquier `[data-quote]` lo abre y **prellena** categoría/localidad desde `data-cat/data-loc`. Campos: nombre, **celular (WhatsApp)**, **correo que aparece después** (formulario *progresivo*: `data-paso="1|2|3"`; el paso 2 aparece al tener nombre ≥ 2 y celular ≥ 7 dígitos o al escribir correo; el 3 al tener correo válido o tocar cualquier campo posterior), categoría, localidad, mensaje; **casilla de consentimiento con enlace a la política**; honeypot; botón grande «Recibir mi cotización»; enlace secundario **«o escríbenos por WhatsApp»** que construye el mensaje con lo escrito; línea de confianza; resumen de errores con `role="alert"` y enlaces que enfocan cada campo; envío por `fetch('/api/contacto', {signal: AbortSignal.timeout(20000)})`, éxito → `sessionStorage` + `/gracias/`, error → mensaje + «Continuar por WhatsApp» / correo. Validación del celular: `^(?:57)?3\d{9}$`.
**Cambios para Sovialis:** (1) **etiquetas permanentes arriba del campo** en vez de etiquetas flotantes (más legibles y robustas con autocompletar); (2) correo **opcional**; (3) **ningún campo de salud** y aviso explícito («Evita escribir diagnósticos»), por tratarse de datos sensibles (Ley 1581 de 2012); (4) Turnstile (invisible/managed) **además** del honeypot; (5) versión de consentimiento guardada (`consentVersion`) y origen (`source: location.pathname`); (6) mensaje de éxito que fija expectativa («Te escribimos hoy por WhatsApp entre las X y las Y» — texto editable).
```css
.site-dialog{ border:1px solid var(--borde); max-block-size:calc(100dvh - 32px); inline-size:min(600px, 100% - 32px); margin:auto; padding:32px;
  background:#fff; color:var(--tinta); border-radius:var(--radius-xl); overflow:auto; overscroll-behavior:contain;
  box-shadow:0 24px 60px -8px #0b2a4e59 }
.site-dialog::backdrop{ background:#0b2a4e9e; backdrop-filter:blur(5px) }
.site-dialog[open]{ animation:dialog-in .2s var(--ease-out) }
@keyframes dialog-in{ from{ opacity:0; transform:translateY(12px) scale(.99) } }
.dialog-close{ position:absolute; inset:20px 20px auto auto; inline-size:48px; block-size:48px; border-radius:50%; border:1px solid var(--borde); background:var(--bruma) }
@media (max-width:767px){ .site-dialog{ padding:24px 20px } }
@media (prefers-reduced-motion:reduce){ .site-dialog[open]{ animation:none } }

/* formulario progresivo */
form.is-progressive [data-step]:not(.is-visible){ display:none !important }
form.is-progressive [data-step].is-visible{ animation:field-in var(--dur-state) var(--ease-out) }
@keyframes field-in{ from{ opacity:0; transform:translateY(-6px) } }
.field > label{ display:block; margin-block-end:6px; font:600 1.0625rem/1.3 var(--font-sans) }
.field :is(input,select,textarea){ inline-size:100%; min-block-size:56px; padding:12px 16px; border:2px solid var(--borde-fuerte); border-radius:var(--radius-md); font:inherit; background:#fff }
.field :is(input,select,textarea):focus-visible{ outline:3px solid var(--oceano); outline-offset:2px; border-color:var(--oceano) }
.field [aria-invalid=true]{ border-color:var(--coral-700) }
.field small[data-error]{ display:block; margin-block-start:6px; color:var(--coral-800); font-weight:600 }
@media (prefers-reduced-motion:reduce){ form.is-progressive [data-step].is-visible{ animation:none } }
```
```ts
// src/scripts/quote-dialog.ts
const dlg  = document.querySelector<HTMLDialogElement>('#quote-dialog');
const form = document.querySelector<HTMLFormElement>('#quote-form');
if (dlg && form) {
  const WA = (form.dataset.wa ?? '');                         // número y texto base vienen de ajustes
  const fields = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | null);
  const val = (n: string) => (fields(n)?.value ?? '').trim();
  const MSG: Record<string, string> = {
    nombre: 'Escribe tu nombre.', celular: 'Escribe un celular colombiano de 10 dígitos (3xx xxx xxxx).',
    servicio: 'Elige un servicio.', zona: 'Elige tu zona o barrio.',
    consentimiento: 'Autoriza el tratamiento de tus datos para poder atender tu solicitud.',
  };

  // 1) Abrir desde cualquier [data-quote] y prellenar
  document.addEventListener('click', e => {
    const t = (e.target as Element).closest<HTMLElement>('[data-quote]');
    if (t) {
      document.querySelector<HTMLDialogElement>('#mobile-menu[open]')?.close();
      if (t.dataset.servicio && fields('servicio')) fields('servicio')!.value = t.dataset.servicio;
      if (t.dataset.zona && fields('zona')) fields('zona')!.value = t.dataset.zona;
      dlg.showModal();
    }
    if ((e.target as Element).closest('[data-dialog-close]')) dlg.close();
  });
  // 2) Cerrar al pulsar el fondo
  dlg.addEventListener('click', e => {
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });

  // 3) Revelado progresivo (misma lógica que CDC Bogotá)
  const steps = [...form.querySelectorAll<HTMLElement>('[data-step]')];
  let reached = 1;
  const progress = () => {
    const s1 = val('nombre').length >= 2 && val('celular').replace(/\D/g, '').length >= 7;
    let n = 1; if (s1 || val('correo')) n = 2;
    if ((n >= 2 && /^\S+@\S+\.\S+$/.test(val('correo'))) || val('servicio') || val('zona') || val('mensaje')) n = 3;
    reached = Math.max(reached, n);
    steps.forEach(s => s.classList.toggle('is-visible', Number(s.dataset.step) <= reached));
  };
  form.classList.add('is-progressive'); progress();
  form.addEventListener('input', progress); form.addEventListener('change', progress);

  // 4) Validación + errores accesibles
  const summary = form.querySelector<HTMLElement>('[data-error-summary]')!;
  const invalid = () => {
    const bad: string[] = [];
    if (val('nombre').length < 2) bad.push('nombre');
    if (!/^(?:57)?3\d{9}$/.test(val('celular').replace(/\D/g, ''))) bad.push('celular');
    if (!val('servicio')) bad.push('servicio');
    if (!val('zona')) bad.push('zona');
    if (!(fields('consentimiento') as HTMLInputElement).checked) bad.push('consentimiento');
    return bad;
  };
  const showErrors = (bad: string[]) => {
    summary.querySelector('ul')!.replaceChildren(); form.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
    form.querySelectorAll<HTMLElement>('[data-error]').forEach(x => { x.hidden = true; x.textContent = ''; });
    for (const n of bad) {
      const f = fields(n)!; f.setAttribute('aria-invalid', 'true');
      const slot = form.querySelector<HTMLElement>(`[data-error="${n}"]`); if (slot) { slot.hidden = false; slot.textContent = MSG[n]; }
      const li = document.createElement('li'), a = document.createElement('a'); a.href = `#${f.id}`; a.textContent = MSG[n];
      a.addEventListener('click', ev => { ev.preventDefault(); f.focus(); }); li.append(a); summary.querySelector('ul')!.append(li);
    }
    summary.hidden = bad.length === 0; if (bad.length) summary.focus();
  };

  // 5) WhatsApp con mensaje prellenado (enlace secundario)
  const waHref = () => `https://wa.me/${WA}?text=${encodeURIComponent([
    `Hola, soy ${val('nombre') || ''}. Quiero información sobre el servicio de cuidado.`,
    val('servicio') && `Servicio: ${(fields('servicio') as HTMLSelectElement).selectedOptions[0]?.textContent}`,
    val('zona') && `Zona: ${(fields('zona') as HTMLSelectElement).selectedOptions[0]?.textContent}`,
  ].filter(Boolean).join('\n'))}`;
  form.querySelectorAll<HTMLAnchorElement>('[data-contact-whatsapp]').forEach(a => a.addEventListener('click', () => (a.href = waHref())));

  // 6) Envío al Worker (/api/contacto) con tiempo límite y recuperación por WhatsApp
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!; if (submit.disabled) return;
    const bad = invalid(); if (bad.length) return showErrors(bad); showErrors([]);
    submit.disabled = true; form.setAttribute('aria-busy', 'true');
    const status = form.querySelector<HTMLElement>('[data-status]')!; status.hidden = true;
    try {
      const res = await fetch('/api/contacto', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), consentVersion: '2026-10-04', source: location.pathname }),
        signal: AbortSignal.timeout(20_000) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(res.status === 429 ? 'Has enviado varias solicitudes. Espera un minuto o escríbenos por WhatsApp.' : 'No pudimos enviar tu solicitud. Tus datos siguen aquí; puedes intentarlo de nuevo o continuar por WhatsApp.');
      try { sessionStorage.setItem('sov:receipt', JSON.stringify({ id: data.receipt, at: Date.now() })); } catch {}
      location.assign('/gracias/');
    } catch (err) {
      status.textContent = err instanceof Error && err.name === 'Error' ? err.message : 'No pudimos confirmar el envío. Inténtalo de nuevo o continúa por WhatsApp.';
      status.hidden = false; status.tabIndex = -1; status.focus();
      form.querySelector<HTMLElement>('[data-form-recovery]')?.removeAttribute('hidden');
    } finally { submit.disabled = false; form.removeAttribute('aria-busy'); }
  });
}
```
(Cloudflare Worker: `/api/contacto` valida Turnstile, honeypot, límite por IP (429), guarda en D1 y avisa por correo/WhatsApp Business; el cuerpo no se registra en logs.)

### 3.8 Medición *(medido)*
Convención `data-cta="zona:nombre"` en **todo** CTA (`global:flotante`, `global:barra-movil`, `global:header`, `global:menu-movil`, `modal:formulario`, `pagina:cierre`…); un listener de `click` delegado empuja `whatsapp_click` y `generate_lead_whatsapp` (una vez por combinación y sesión, con `value` configurable y `currency:'COP'`); para `tel:` distingue dispositivo: en móvil/táctil cuenta un lead (`generate_lead_call`, una vez por sesión) y en escritorio solo registra `click_telefono` (no es lead); además emite `open_quote_modal`, `select_locality` y `use_price_calculator` (con *debounce* de 800 ms), y el formulario emite su propio evento. **Reutilizar el contrato tal cual** (mismos nombres) para comparar embudos entre proyectos de Connexis.

### 3.9 Lo que NO copiar tal cual
El verde de WhatsApp como color de **marca** (en Sovialis solo en el botón de WhatsApp); etiquetas flotantes en los campos; correo obligatorio; mensajes con precios fijos en código; la FAB oculta en móvil sin alternativa (aquí la cubre la barra inferior).

---

## 4. cursodeglobosonline.com/blog/globoflexia/ — anatomía del artículo y datos estructurados

### 4.1 Hallazgo clave *(medido)*
El sitio está hecho con **Astro v7.3.4 + EmDash** (medios en `/_emdash/api/media/file/…`, comentarios en `/_emdash/api/comments/…`) + Tailwind (utilidades en el HTML) + diálogos/`<details>` nativos + JS por componente (`StarRating`, `FaqAccordion`, `Header`, `GeoToast`). **Es el mismo stack que Sovialis**: se puede portar casi 1:1. HTML 160 KB sin comprimir; solo una hoja externa (`hotmart.css`), el resto en línea por componente.

### 4.2 Anatomía de arriba abajo *(medido)*
1. **Skip link** «Saltar al contenido» (`sr-only focus:not-sr-only`) → `<main id="main">`.
2. **Header sticky** (`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md`; la clase `is-scrolled` añade sombra al hacer scroll), mega «Cursos», botón WhatsApp «Escríbenos», selector de país, `<dialog id="mobile-menu">` con ítems que entran escalonados (`transition-delay: calc(var(--i) * 40ms)`).
3. **Migas** `<nav aria-label="Migas de pan">`: Inicio / Blog / Categoría (`text-xs`, la categoría enlaza a `/blog/#slug`).
4. **Cabecera del artículo** (`max-w-3xl`): *eyebrow* «Guía completa · {categoría}»; **H1** (`text-[2.1rem] leading-[1.08] sm:text-5xl font-semibold`); bajada (la `description`); línea meta: **autor** (enlace a `/blog/autor/equipo-editorial/`) · «Actualizado el `<time datetime>`» · «11 min de lectura»; **resumen de calificación** (enlace a `#calificar-articulo`, `role="img" aria-label="Calificación 5,0 de 5"`, «5,0 (1)»).
5. **Imagen destacada** 16:9 (2400×1350) con `rounded-3xl shadow-tarjeta`, `loading="eager" fetchpriority="high"`.
6. **Índice móvil** `<details class="toc">` «En esta guía (8 secciones)».
7. **Rejilla** `grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] xl:gap-16`: artículo + `<aside aria-label="Navegación del artículo">` con `<div class="sticky top-28">` y un **TOC** `<ol class="border-l-2">` cuyo enlace activo recibe `aria-current="true"` (borde coral + negrita) — *scroll-spy* con `IntersectionObserver` (`rootMargin:'-20% 0px -70% 0px'`) sobre `.articulo h2[id]`.
8. **Introducción** (2 párrafos) y **caja «En resumen»**: es un `<blockquote>` cuyo primer renglón funciona como título, 5 viñetas y un enlace al artículo hermano.
9. **Cuerpo**: H2 con `id` en *slug* (conserva tildes) + H3; **tablas** `.emdash-table` de 3–4 columnas (comparativas, orden de aprendizaje); **callouts** también como `<blockquote>` con título («Cuánto cuesta empezar (septiembre de 2026)», «Tres vueltas y siempre hacia el mismo lado», «Globos y niños pequeños» = aviso de seguridad); enlaces internos contextuales (texto largo y descriptivo) y externos de autoridad (RAE, Wikipedia, CPSC).
10. **FAQ** `<section>` H2 «Preguntas frecuentes» con 5 `<details class="faq-item" data-question>`; al abrir emite `view_faq` (analítica).
11. **Tarjeta de producto** `<aside class="not-prose … sm:flex">`: imagen 600×600, «Curso online con certificado», título, descripción, botón «Ver el curso · US$25», precio tachado, garantía.
12. **Caja de autor** `<section aria-label="Sobre el autor">` (avatar con iniciales, «Escrito por», enlace, bio).
13. **«¿Te resultó útil esta guía?»** (`#calificar-articulo`): 5 botones `.sr-star` con `aria-label="1 de 5 estrellas: Malo"` … `"5 de 5 estrellas: Excelente"` y `aria-pressed` en el voto propio; estrella SVG con **relleno parcial** (`--fill` 0–1); texto «5,0 de 5 · 1 voto» y pista «Valora el artículo de 1 a 5 estrellas»; voto anónimo con UUID en `localStorage` → `POST /api/blog-ratings`; el voto se puede cambiar; estados `aria-busy`.
14. **Comentarios** `<section class="blog-comments" id="comentarios">`: lista (con hilos y «Responder»), formulario (nombre, correo —«no se mostrará»—, comentario ≤ 5.000 caracteres, *honeypot* `.comment-trap` `website_url`, aviso de privacidad con enlace, «Revisaremos tu comentario antes de publicarlo»); `POST` a `/_emdash/api/comments/blog/{id}` con cabecera `X-EmDash-Request: 1`, `AbortSignal.timeout(20s)`, mensajes para 429, `COMMENTS_CLOSED` y 400; el texto se conserva si falla.
15. **«Sigue leyendo»** `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` de `.post-card`: imagen 16:9 con zoom `1.04` en 700 ms, categoría, H3 con enlace «cubre-tarjeta» (`after:absolute after:inset-0`), extracto, estrellas + fecha + tiempo de lectura; hover `translateY(-6px)` + sombra (`cubic-bezier(.34,1.56,.64,1)`); `:has(a:focus-visible)` dibuja el foco en toda la tarjeta.
16. Footer oscuro (`bg-ciruela-900`), enlaces por columnas (Categorías, Países, Institucional), avisos legales.

**Fragmento reutilizable — estrella con relleno parcial (CSS real simplificado):**
```css
.sr-star { position:relative; display:grid; place-items:center; inline-size:calc(var(--star) + .5rem); block-size:calc(var(--star) + .5rem);
           border-radius:.625rem; cursor:pointer; transition:transform .25s var(--ease-out) }
.sr-empty path { fill:oklch(90% .022 78); stroke:oklch(62% .12 70) }
.sr-full { position:absolute; inset:.25rem auto auto .25rem; inline-size:calc(var(--fill) * var(--star)); block-size:var(--star); overflow:hidden; transition:width .3s }
.sr-full path { fill:oklch(84% .145 85); stroke:oklch(62% .12 70) }
.sr-star:not(:disabled):hover { transform:translateY(-2px) scale(1.12) }
.sr-star:focus-visible { outline:3px solid var(--tinta); outline-offset:0 }
@media (prefers-reduced-motion:reduce){ .sr-star,.sr-full{ transition:none } .sr-star:hover{ transform:none } }
```
(`--fill` por estrella = `clamp(0, promedio − (n−1), 1)`; en el DOM, cada estrella conserva su `aria-label`; el promedio se expone como texto, no solo con color.)

### 4.3 Datos estructurados que emite *(medido)*
Cuatro bloques `application/ld+json`:
1. **`BlogPosting`** — `@id …/#article`, `mainEntityOfPage`, `headline`, `description`, `image[]`, `datePublished`, `dateModified`, `author` (**`Organization`** «Equipo editorial…» con `url` a la página de autor), `publisher` (`@id …/#organization`, logo 512×512), `articleSection`, `keywords`, `inLanguage`, `isPartOf` (`@id …/#website`), `wordCount: 2492`.
2. **`Organization`** — con `parentOrganization` (Sably) y `sameAs`.
3. **`BreadcrumbList`** — 3 niveles (Inicio › Blog › artículo).
4. **`FAQPage`** — 5 `Question/Answer` **idénticas al texto visible**.
Meta: `og:type=article`, `article:published_time/modified_time/author`, `twitter:card=summary_large_image`, `robots … max-image-preview:large`.
**No emite `aggregateRating` ni `Review`** pese a mostrar estrellas: es lo correcto (las valoraciones de un artículo no dan fragmento enriquecido y Google no admite reseñas «autoservidas» de la propia organización en `LocalBusiness/Organization`).

**Para Sovialis:** mantener los 4 bloques; autor como **`Person`** (nombre, `jobTitle`, `url`, `sameAs`) y `reviewedBy` **solo si existe un revisor real**; `FAQPage` solo cuando el FAQ es visible (desde 2023 Google limita el fragmento a sitios gubernamentales/de salud muy reconocidos: el valor es semántico, no esperar *rich result*); en el negocio usar `LocalBusiness` (subtipo genérico) con `areaServed` por zona y `serviceType`, **no** `MedicalBusiness/Hospital/Physician` (Sovialis no es prestador de salud; un competidor bogotano marca su sitio como `Hospital`, error a evitar); las reseñas de Google Business se muestran, **no** se marcan.

### 4.4 Qué adaptar para Sovialis (tema sensible / YMYL)
- **Confianza editorial:** autor con nombre y rol, «Actualizado el…», fuentes externas autorizadas (Ministerio de Salud, OMS/OPS, asociaciones de Alzheimer), y descargo editable: «Esta guía es informativa y no reemplaza la valoración de un profesional de la salud.»
- **CTA contextual:** tarjeta «Cotiza el turno que necesitas» (WhatsApp + modal) en lugar de la tarjeta de curso; un solo CTA en medio del texto y otro al final.
- **«¿Te resultó útil?»** valora el artículo, no a la empresa; sin `aggregateRating`.
- **Comentarios:** moderación previa + aviso «No compartas datos de salud ni teléfonos»; con las API de comentarios de EmDash (`commentsEnabled` en la colección).
- **Utilidad para familias:** botón **«Enviar por WhatsApp»** (`https://wa.me/?text=<título>%20<url>`) y **imprimir/guardar PDF** (hoja `@media print` limpia); muchas familias comparten la guía con hermanos.
- **Lectura:** 18–20 px, medida ≤ 68 ch, H2 con `scroll-margin-top`, tablas en contenedor `role="region" tabindex="0" aria-label` con scroll horizontal en móvil.
- **EmDash:** empezar con la convención del sitio hermano (callouts = `<blockquote>` con título en el primer renglón, tablas `.emdash-table`); los bloques Portable Text personalizados (`resumen`, `callout`, `cta_card`) requieren un *native plugin* en modo confiable, así que se dejan para una segunda fase.

---

## 5. Estudio de competencia e inspiración

> Convención: **stack/H1/schema = medido en HTML**; el resto, *reportado* por el resumen de la página (no verificado visualmente). `403` = el sitio bloquea bots, no analizable.

### 5.1 Cuidado de mayores — internacional

| Sitio | URL | Qué destaca | Adoptar |
|-------|-----|-------------|---------|
| **Home Instead (EE. UU.)** | homeinstead.com *(Next.js + Sanity)* | H1 «In-home senior care that leads with the heart.» con **botón de teléfono dominante** y **formulario de 5 pasos dentro del hero** (¿para quién? → tipo de cuidado → ¿para cuándo? → código postal → contacto + SMS). Confianza: 4,8 en Google (20,9 K reseñas), «60 M de horas», «+100.000 cuidadores», premios. Sin precios. 9 tipos de servicio con icono, FAQ, recursos. | **Un paso por pantalla** («¿Qué necesita tu familiar?» → «¿Para cuándo?» → zona → WhatsApp). Mostrar cifras **solo si son reales**. |
| **Home Instead (RU)** | homeinstead.co.uk | «Home care your way», «Popular services», fila «Regulado por…». | Fila de **respaldo legal real** («Empresa registrada ante la Cámara de Comercio de Bogotá, matrícula N.º …» editable). |
| **Comfort Keepers** | comfortkeepers.com | H1 emocional «In-Home Care that Elevates the Human Spirit»; 4 enlaces `tel:`; **autoevaluación** «¿No sabes qué cuidado necesitas?»; Organization + Breadcrumb. Crítica: servicios repetidos en dos secciones. | Titular emocional + **autoevaluación corta** que termina en WhatsApp. No duplicar secciones. |
| **Bayshore HealthCare** | bayshore.ca | «My life by design.»; servicios organizados **por audiencia y por condición**; «Care Planner»; teléfono 4+ veces. | **Doble taxonomía** en el menú: por turno / por necesidad. |
| **Hometouch** | myhometouch.com | «Expert live-in care… **arranged with one free call**»; credencial del fundador; «Find carer costs» (calculadora que filtra el precio); FAQ en 4 categorías; **alta hospitalaria en 24–72 h** como diferencial. | Enmarcar «**una llamada, sin costo**»; FAQ por etapas (Elegir / Contratar / Pagar / Seguridad); landing de **post-hospitalización**. |
| **Papa** | papa.com | «Hi! We’re Papa.», tipografía grande, fotografía cálida de baja saturación, **dos caminos de CTA** (pagar por uso / beneficio cubierto), casi sin movimiento. | Tono en primera persona y **tipografía grande**; doble camino «Para mí / Para mi familiar». |
| **Honor** | honorcare.com | Hoy es marca corporativa B2B2C/reclutamiento: «Redesigning the Aging Journey», hexágonos, cifras grandes. | Ninguno directo: **evitar** jerga tecnológica. Sí: cifras grandes como pausa visual. |
| **Birdie** | birdie.care | SaaS para agencias (no capta familias): Trustpilot 4,5 (399), «+1000 agencias», ISO 27001, mascota. | Solo patrones de microcopy de «Impacto». No referencia de captación. |
| **Lottie** | lottie.org *(Next.js)* | Comparador: «Free personalised shortlist», «Free expert support», vídeos, testimonios. | «**Te presentamos el perfil ideal, gratis**» como promesa; vídeo corto (si hay material real). |
| **Cera** | ceracare.co.uk *(Next.js + Swiper)* | La home hoy prioriza reclutamiento («Recruiting Care professionals Nationwide»). | **Separar** caminos «Familias» y «Trabaja con nosotros» desde el menú. |
| **Visiting Angels** | visitingangels.com | `403` a bots. | — |
| **Amada** | amadaseniorcare.com *(WP)* | Venta cruzada (seguro de cuidado a largo plazo, residencias). | Nada. |

### 5.2 España (referencia directa del modelo «agencia + cuidadora»)

| Sitio | URL | Qué destaca | Adoptar |
|-------|-----|-------------|---------|
| **Cuideo** | cuideo.com *(WP + Swiper + Lottie; Organization + FAQPage)* | H1 «Soluciones de cuidados para una vida de calidad»; sección de **empatía** «Llega un momento en el que sabes que tu padre o tu madre necesita ayuda»; 7 tarjetas de servicio con escenarios; **13.882 reseñas Trustindex + 12.761 Google**, retención 97 % a 6 meses, logos de aseguradoras; formulario (servicio + teléfono + consentimiento) + teléfono; FAQ de 11 preguntas; mapa de oficinas. | Sección **«Llega un momento…»** (problema → alivio) y tarjetas «¿Qué solución te encaja más?» con escenario de una línea. |
| **Cuidum** | cuidum.com *(WP + video hero)* | Hero con **vídeo** y **formulario** (nombre, teléfono, correo), «Trabaja como cuidadora» como CTA secundario; **4,7/5 en 526 reseñas**; «84.000 familias»; premios; **precio transparente** («1.221 €/mes en 14 pagas, 40 h/semana»); **selección en 4 pasos** (CV → entrevista y pruebas → verificación de credenciales → referencias, «23 % de aceptación»). | **Sección «Cómo seleccionamos»** con pasos reales; precio **«desde»** visible. |
| **Qida** | qida.es *(Next.js + HubSpot; MedicalBusiness)* | «Te llamamos en menos de 24 h» con **horario de atención** (L–V 9–20, fines de semana 9–18); **5 pasos** (Escuchamos, Asesoramos, Valoramos, Seleccionamos, Iniciamos); formulario de **3 campos** (servicio, teléfono, código postal) repetido 5+ veces; mapa «Cerca de ti» + oficinas; sin precios. | **Promesa acotada en el tiempo y con horario** (nunca «24/7» si no es cierto); formulario de 3 campos con **zona**. |
| **Senniors** | senniors.com *(Webflow + LiveChat)* | «Los mejores cuidados en casa»; **3 pasos** (Contáctanos · Conoce a tu cuidador/a · Activa el servicio); barra superior fija con beneficio («hasta 747 €/mes en ayudas»); «+40.000 familias», 4,7 Google; app de seguimiento; mapa «242 ciudades». | Barra superior fija **solo con un beneficio verificable** (p. ej. «Valoración inicial sin costo»); **3 pasos** (titular + 1 línea). |
| **Aiudo (Clece)** | aiudo.es *(WP)* | «La persona mayor es el centro»; objetivos **físico / cognitivo / social**; ODS; «¿Cómo contratar a tu cuidadora?». | Tres columnas «Qué trabajamos con tu familiar» (movilidad, estimulación, compañía) **sin lenguaje clínico**. |
| **Sanitas Mayores** | sanitas.es/mayores | FAQPage, buscador de centros, «Sigue su día a día desde la App». | **Reporte diario por WhatsApp** como módulo visible («Recibes un resumen cada turno»). |

### 5.3 Colombia (competidores directos en Bogotá)

| Sitio | URL | Qué destaca | Lección |
|-------|-----|-------------|---------|
| **CuidarEnCasa** | cuidarencasa.com.co *(sin CMS detectable; LocalBusiness + FAQPage)* | La **más limpia**: «Precios claros desde $90.000»; **3 niveles** (Cuidadora / Auxiliar / Enfermera) × 7 turnos (6 h, 8 h, 12 h día/noche, 24 h) de $90.000 a $450.000; insignia «MÁS SOLICITADO»; WhatsApp 8+ veces, «respuesta en menos de 5 minutos», reporte diario, «cambio de profesional sin costo», «sin recargo dominicales/festivos». Sin reseñas con nombre ni mapa. | **Adoptar:** matriz clara de turnos, insignia de más solicitado, reversión de riesgo. **Evitar:** vender enfermería/IV/catéteres (aquí no se puede) y el canal único. |
| Cuidados Dorothea | cuidadosdorothea.com *(WP + Swiper + Lottie; HTML 600 KB)* | «Enfermería a domicilio», «Terapia física en casa», muy pesada. | Ejemplo de **lo que no hacer** en peso y claridad. |
| Su Enfermera con Amor | suenfermeraconamor.com *(WP; schema `Hospital`)* | H2 «servicio de enfermeras a domicilio precios Bogotá», 10 enlaces WhatsApp, citas médicas. | Marcar el sitio como `Hospital` es engañoso. **No copiar.** |
| Homewatch | cuidadoadultomayor.com *(WP + video hero)* | «Valoración gratuita» en Bogotá/Chía/Cota/Cajicá; H2 con relleno de palabras clave; 12 `tel:`. | **«Valoración gratuita»** (si se ofrece); evitar el *keyword stuffing*. |
| FCD | enfermerasadomicilio.com.co *(WP)* | «Turnos desde 4 hasta 24 horas… ¡Cotiza!». | Genérico. |

**Oportunidad:** los 5 son WordPress, con H1 de «enfermeras a domicilio», diseño de plantilla, sin cobertura por barrio ni «cómo funciona» serio. El hueco «cuidado premium, claro y transparente en el norte de Bogotá» **está vacío**; la web es parte del producto.

### 5.4 Otros nichos (conversión elegante, 2025–2026)

| Sitio | URL | Qué destaca | Adoptar |
|-------|-----|-------------|---------|
| **Alan** (seguro de salud, FR) | alan.com | «Mon devis en 2 min» como CTA principal + demo B2B; **1,1 M de afiliados, 4,9/5**; blanco con acento naranja cálido, esquinas muy redondeadas, mascota; marcos de móvil animados. | Promesa de **«Cotiza en 2 minutos»** atada al modal de 3 pasos; **un acento cálido** (coral) con medida. |
| **Mercury** (fintech) | mercury.com | «Apply online in 10 minutes»; **testimonios con nombre y retrato**; formas circulares fluidas; sin precio en la home («$0/mes»). | Testimonios **con nombre, rol y retrato reales y consentidos**; promesa de tiempo. |
| **Aman** (hospitalidad de lujo) | aman.com | Foto primero, sin venta agresiva; «Reserve» discreto; serif + sans, mucho aire; luz dorada y arquitectura. | **Lujo = calma**: pocos CTA por pantalla, espacio, fotografía consistente. |
| **Oura** (salud/bienestar) | ouraring.com | Monocromo con acento dorado; revelado secuencial de beneficios (sueño → actividad → corazón); testimonios con nombre; reseñas de prensa. | Revelado por beneficio con **scroll-driven CSS** y logos de prensa **cuando existan**. |
| Ro / Hims | ro.co · hims.com | `403` a bots (no analizados). | — |

### 5.5 Patrones transversales → decisiones para Sovialis
1. **Teléfono/WhatsApp arriba y repetido 4–8 veces** (Comfort Keepers, Bayshore, CuidarEnCasa) → header + hero + barra móvil + FAB + cierre.
2. **Una pregunta por pantalla** (Home Instead) y **3 campos** (Qida) → modal progresivo de 3 pasos y hero con atajos.
3. **Promesa acotada** («te llamamos en < 24 h», «una llamada gratis», «cotiza en 2 min») → solo si el equipo la cumple; texto editable con horario.
4. **Precio:** la mayoría lo oculta; **Cuidum y CuidarEnCasa lo muestran** y la búsqueda de precio en Bogotá es intención comercial real → «desde $X» por turno + nota (decisión §0.10).
5. **Selección del personal como diferencial** (Cuidum 4 pasos, Hometouch) → sección «Cómo seleccionamos» con pasos **reales**.
6. **Prueba social cuantificada** (Google 4,7–4,9, miles de familias) → solo cuando existan; mientras tanto, **garantías de proceso** (reemplazo, reporte diario).
7. **Cobertura geográfica visible** (Qida, Senniors) → mapa del norte de Bogotá + lista de zonas.
8. **Imagen:** familias y cuidadoras en hogares reales, luz natural, sin ambiente clínico (todos); **lujo discreto** (Aman) para posicionar «upscale».
9. **Movimiento mínimo** (Papa, Aman): los líderes del nicho casi no animan; los 2026 «de moda» (Alan, Oura) usan revelado por scroll, no *kinetic text*.


---

## 6. Decisión del hero (home y landings)

### 6.1 Comparativa

| Criterio | A · Slider a pantalla completa (tipo VisitValle) | B · **Estático con H1 indexable + atajos de servicio** | C · Dividido con formulario |
|----------|-----|-----|-----|
| Texto indexable | Solo el slide 1 lleva H1; el resto son `h4`/texto en slides ocultos | **H1 + subtítulo + atajos en el HTML inicial** | H1 + campos del formulario en HTML |
| LCP | Imagen grande + JS de carrusel; si la foto es `background-image` (VV) no es descubrible; N imágenes compiten | **1 `<img>` con `priority`/`fetchpriority="high"`** (en móvil el LCP puede ser el H1) | LCP = H1 o imagen pequeña; el más rápido |
| CLS | 100 vh + barra de URL móvil + cambios de slide | **0** con `aspect-ratio` y dimensiones | Riesgo con teclado virtual y validación si no se reserva espacio |
| JS | Librería o jQuery en el camino crítico | **0 KB** | ≈ 4 KB (validación) |
| Accesibilidad | WCAG 2.2.2 exige pausa; foco/teclado complejo | **Óptima** | Buena si hay etiquetas visibles |
| Conversión (home, tráfico orgánico frío) | Estudio de Notre Dame *(reportado)*: ~1 % hace clic en el carrusel y **84 % solo interactúa con el slide 1**; NN/g: el autoavance molesta | **Alta**: una promesa, dos CTA, 6–7 atajos (menos decisiones) | Media: pedir datos antes de entender el servicio baja la confianza |
| Conversión (landing de Ads, intención alta) | Baja | Media-alta | **Alta** (Qida, Cuidum lo usan en la primera pantalla) |
| Móvil (público 40–65) | Foto pesada, texto pequeño sobre imagen | **Texto primero, foto asomando** | Formulario largo = scroll + teclado |
| Edición en CMS | Muchas diapositivas que mantener | **8 campos** | 8 + campos de formulario (ajustes) |
| Tendencia 2026 | En retroceso; sobrevive la **foto grande estática** | **Titulares grandes + narrativa clara + bento** | Frecuente en servicios de intención alta |

### 6.2 Recomendación firme
- **Home → B** con composición dividida (texto izquierda, foto vertical derecha) y **franja de atajos** «¿Qué necesita tu familiar?».
- **Landings de servicio y de campaña (Google Ads) → C**: dividido con **tarjeta de formulario de 3 campos** (nombre, WhatsApp, zona) + botones WhatsApp/Llamar; en móvil el H1, el precio «desde» y los dos CTA van primero, y la tarjeta del formulario aparece justo debajo (no dentro del primer pliegue, para que el teclado no tape el contenido).
- **Páginas de zona →** B con buscador de barrio. **Blog →** H1 primero y la imagen después (migas → H1 → meta → imagen, como en el sitio hermano). **Nosotros →** hero editorial con foto **real** del equipo.
- **Nunca slider.** Si la dirección creativa quiere «más fotos», que sean 3 imágenes estáticas en la sección «Nuestro cuidado» (§7.8).

### 6.3 Especificación del hero de la home
```
DESKTOP ≥ 1024 (contenedor 1240, gutters fluidos)
┌─────────────────────────────────────────────────────────────────────────────┐
│ [barra superior opcional: Atendemos hoy 7 a. m.–9 p. m. · Tel. +57 …]        │
│ Logo     Servicios▾  Zonas▾  Precios  Guías  Nosotros     📞 (WA) [Cotiza]   │ 76 px sticky
├─────────────────────────────────────────────────────────────────────────────┤
│ fondo Arena + degradado Bruma suave                                           │
│  CUIDADO DE ADULTOS MAYORES EN CASA · NORTE DE BOGOTÁ    ┌────────────────┐   │
│  Cuidadoras para adultos mayores                         │  foto 4:5      │   │
│  en casa, en el norte de Bogotá      (Jost 500, 68/1.05) │  radio 32 px   │   │
│  Turnos de día, noche o 24 horas, con personal           │  ┌──────────┐  │   │
│  verificado y reporte diario para tu familia.            │  │tarjeta   │  │   │
│  [ WhatsApp · Empieza ahora ]  [ Cotiza en 2 minutos ]   │  │vidrio 12 │  │   │
│  ✓ Personal verificado  ✓ Reemplazo sin costo  ✓ Reporte │  └──────────┘  │   │
│                                                          └────────────────┘   │
│  ┌ ¿Qué necesita tu familiar? ─────────────────────────────────────────────┐  │
│  │ Día 12 h │ 24 h │ Noche │ Citas y hospital │ Postoperatorio │ Alzheimer │ │ → landings
│  └─────────────────────────────────────────────────────────────────────────┘  │ (solapa −48 px)
└─────────────────────────────────────────────────────────────────────────────┘
MÓVIL 375 (texto primero; la foto asoma al final del primer pliegue)
 [Logo]                       [WA]  [☰ Menú]
 CUIDADO EN CASA · NORTE DE BOGOTÁ
 H1 40/1.1 (4 líneas)
 Subtítulo 18/1.6 (3 líneas)
 [  WhatsApp · Empieza ahora  ] 56 px
 [  Cotiza en 2 minutos       ] 56 px
 ✓ Verificado ✓ Reemplazo ✓ Reporte
 ┌ foto 4:5 (asoma ~100 px) ───────────┐
```
- **H1 y subtítulo son texto de la CMS** (campos `h1`, `subtitulo`); el H1 contiene la palabra clave principal; el eslogan «Vínculos que protegen» va como *eyebrow* o en el pie del hero, no como H1. *(Textos de ejemplo; JP los ajusta; «verificado/reemplazo/reporte» solo se publican si el equipo los cumple.)*
- **Foto:** `<Image image={hero.imagen} priority sizes="(min-width:1024px) 46vw, 92vw" fetchpriority="high" class="hero__img" />` de `emdash/ui` (acepta `priority`; genera `srcset` 640–1920 con el endpoint de Cloudflare Images; salida WebP por defecto y AVIF admitido: **verificar** que el componente pida AVIF o fijarlo). `aspect-ratio:4/5` en el contenedor (CLS 0), LQIP desactivado si hay CSP estricta. Peso objetivo: ≤ 90 KB en móvil. No animar el H1 ni la imagen LCP.
- **Animación del hero:** solo elementos secundarios (sellos, chips) con `reveal-up` 400 ms (§7.4); parallax de la foto ≤ 16 px **solo** puntero fino y `@supports (animation-timeline: view())`.
- **Tarjeta de vidrio** (única en la página): `backdrop-filter: blur(12px)` sobre **fondo opaco al 85 %** (`color-mix(in oklch, var(--arena) 85%, transparent)`); si no hay soporte, color sólido. Contenido: mini «Cómo te atendemos» o dato **real** (nunca «+500 familias» inventado).
- **Atajos:** 6–7 `<a>` de ≥ 64 px con icono, nombre y «desde $…»; en móvil, carril horizontal con `scroll-snap` y máscara de borde. Cada uno enlaza a su landing y lleva `data-cta="home:atajo-<slug>"`.
- **Altura:** el hero **no** usa `100vh`; padding vertical fluido (`clamp(2rem, 6vw, 6rem)`); en pantallas bajas el contenido nunca queda por debajo del pliegue sin pista de scroll.

### 6.4 Especificación del hero de landing de servicio / Ads
```
┌───────────────────────────────────────────────────────────────────────────┐
│ (header reducido en campañas: logo + teléfono + WhatsApp; sin mega menú)    │
├───────────────────────────────────────────────────────────────────────────┤
│ Eyebrow: SERVICIO · TURNO DE DÍA 12 H                ┌─────────────────────┐ │
│ H1: Cuidadora para adultos mayores, turno de día     │ Cotiza tu turno     │ │
│     en [zona/norte de Bogotá]                        │ Nombre              │ │
│ [pill] Desde $___ por turno de 12 h (nota IVA/vigencia)│ WhatsApp           │ │
│ ✓ qué incluye ×3   ✕ qué no incluye (1 línea)        │ Zona ▾              │ │
│ [ WhatsApp ] [ Llamar ]                              │ [Recibir cotización] │ │
│ Imagen 21:9 (franja redondeada) debajo               │ o escríbenos por WA  │ │
└───────────────────────────────────────────────────────┴─────────────────────┘
```
- La **tarjeta del formulario** comparte el módulo del modal (`quote-form`), pero en el hero va **sin** pasos progresivos (3 campos visibles).
- «**Qué incluye / qué no incluye**» es obligatorio por claridad legal: compañía, higiene personal, movilidad, alimentación, recordatorios; **no** incluye procedimientos de enfermería (inyecciones, curaciones, sondas, suero). Texto editable por servicio.
- LCP en landings = H1 (texto) o la franja 21:9 debajo del pliegue.

### 6.5 Tendencias 2026: qué usamos y con qué límites

| Tendencia | Veredicto | Cómo |
|-----------|-----------|------|
| **View Transitions** entre páginas | Sí, como mejora progresiva | `@view-transition { navigation:auto }` (Chrome 126+, Safari 18.2+; Firefox aún no estable: cae a navegación normal). Header con `view-transition-name`. **No** `<ClientRouter/>`. Desactivar con `prefers-reduced-motion`. |
| **Scroll-driven CSS animations** | Sí, solo revelados/progreso | `animation-timeline: view()/scroll()` bajo `@supports`. Chrome 115+, Safari 26+; en Firefox estable sigue tras bandera (fuentes discrepan): el contenido **debe verse sin animación**. |
| **Parallax sutil** | Mínimo | ≤ 16 px, solo hero y puntero fino. Nada de *scroll-jacking* ni suavizado de scroll (Lenis) que desorienta a los mayores. |
| **Bento grids** | Sí | Servicios, «por qué Sovialis», precios. Tarjetas ≥ 18 px de texto; el orden DOM = orden de lectura. |
| **Degradados/mesh** | Con medida | 2 radiales suaves Bruma/Vital sobre Arena con `color-mix(in oklch …)`; sin ruido ni gradientes de texto en párrafos. |
| **Glassmorphism** | 1–2 usos | Header compacto y tarjeta del hero; siempre con fondo ≥ 85 % opaco y contraste verificado. |
| **Tipografía enorme** | Sí | H1 40→68 px (Jost 500). Cifras de precio en Atkinson 600, 32–44 px. |
| **Texto cinético / *word rotators*** | No | Perjudican lectura, LCP y a mayores. Como mucho, subrayado que se dibuja una vez. |
| **Modo oscuro** | Fuera de alcance v1 | Una sola paleta clara (Arena/Bruma); secciones oscuras puntuales en Azul Tinta. |


---

## 7. Sistema de diseño 2026 para este build

### 7.1 Tipografía: Jost (display) + Atkinson Hyperlegible Next (cuerpo)

**Decisión:** Jost 500/600 para H1–H3 **solo ≥ 28 px**; Atkinson Hyperlegible Next (200–800 variable) para todo lo demás: párrafos, navegación, botones, formularios, **precios y teléfonos**. Se descarta Figtree (ya instalado) para no cargar tres familias; Inter se descarta por su similitud con otras webs de salud/SaaS y menor desambiguación de glifos.
- *Por qué no Jost en cuerpo:* tipo Futura, x-height baja y trazos finos: a 16–18 px cansa y confunde `l/I/1`. *Por qué Atkinson:* diseñada por Braille Institute para baja visión; letras como `a g 1 l I 0 O` muy distintas (clave en cifras de dinero); cubre `¿ ¡ ñ` y todos los acentos del español (comprobado en el TTF) e incluye `tnum` (cifras tabulares para precios); licencia OFL. Peso: Jost latin 28 KB + Atkinson latin 36 KB (woff2 variable, **medido en `node_modules`/`npm pack`**), `font-display: swap`.
- **Sin cursivas** en párrafos (menos legibles para mayores): énfasis con peso 600 o color Océano. `font-synthesis: none`.
- **Carga:** `@fontsource-variable/jost/wght.css` y `@fontsource-variable/atkinson-hyperlegible-next/wght.css` (ya resuelto el nombre: `'Jost Variable'`, `'Atkinson Hyperlegible Next Variable'`) **o** Astro Fonts API (verificado en `astro@7.3.5`: `fonts:[{ provider: fontProviders.fontsource(), name, cssVariable, weights, styles, subsets, fallbacks, optimizedFallbacks, display }]` y `<Font cssVariable="--font-sans" preload />`). Con la API se obtienen *preload* automáticos y fallback métrico (menos CLS). Preload solo del subconjunto `latin` normal de ambas.

```css
/* src/styles/global.css  (Tailwind v4) */
@import "tailwindcss";

@theme {
  /* Fuentes */
  --font-display: "Jost Variable", "Century Gothic", "Avenir Next", system-ui, sans-serif;
  --font-sans: "Atkinson Hyperlegible Next Variable", "Segoe UI", system-ui, -apple-system, sans-serif;

  /* Escala fluida: min a 375 px → max a 1280 px (rem + vw: respeta el zoom del usuario) */
  --text-sm: 1rem;                                              /* 16 px: mínimo absoluto (leyendas, metadatos) */
  --text-base: clamp(1.125rem, 1.0732rem + 0.221vw, 1.25rem);   /* 18 → 20 px: cuerpo */
  --text-lead: clamp(1.25rem, 1.1464rem + 0.442vw, 1.5rem);     /* 20 → 24 px: subtítulos */
  --text-h4: clamp(1.375rem, 1.2714rem + 0.442vw, 1.625rem);    /* 22 → 26 px */
  --text-h3: clamp(1.625rem, 1.4178rem + 0.884vw, 2.125rem);    /* 26 → 34 px */
  --text-h2: clamp(2rem, 1.5856rem + 1.768vw, 3rem);            /* 32 → 48 px */
  --text-h1: clamp(2.5rem, 1.7749rem + 3.094vw, 4.25rem);       /* 40 → 68 px */
  --text-display: clamp(3rem, 2.0677rem + 3.978vw, 5.25rem);    /* 48 → 84 px (cifras/portada, uso excepcional) */
  --leading-body: 1.6;  --leading-heading: 1.1;  --leading-tight: 1.05;
  --tracking-display: -0.015em;

  /* Espaciado fluido */
  --spacing-section: clamp(3.5rem, 1.8425rem + 7.072vw, 7.5rem);
  --spacing-gutter: clamp(1rem, 0.3785rem + 2.652vw, 2.5rem);
}
@layer base {
  html { font-family: var(--font-sans); font-size: 100%; line-height: var(--leading-body); color: var(--color-tinta);
         background: var(--color-arena); text-size-adjust: 100%; scroll-padding-block: 96px; font-synthesis: none;
         -webkit-font-smoothing: antialiased }
  body { font-size: var(--text-base) }
  h1,h2,h3 { font-family: var(--font-display); font-weight: 500; line-height: var(--leading-heading);
             letter-spacing: var(--tracking-display); text-wrap: balance }
  h1 { font-size: var(--text-h1); line-height: var(--leading-tight) } h2 { font-size: var(--text-h2) } h3 { font-size: var(--text-h3) }
  p, li { text-wrap: pretty; max-inline-size: 68ch }
  .prose-sov p { font-size: var(--text-base) } .price { font-family: var(--font-sans); font-weight: 600; font-variant-numeric: tabular-nums }
}
```
Moneda: `new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })` → «$ 160.000» (usar espacio fino no separable o `$160.000` de forma consistente en toda la web).

### 7.2 Color (tokens + contrastes calculados)

Tokens (nombres de la marca; `oklch` opcional para degradados, los hex siguen siendo fuente de verdad):
```css
@theme {
  --color-tinta: #0B2A4E;        /* texto principal, fondos profundos (pie, bandas) */
  --color-oceano: #005E9D;       /* acción primaria, enlaces */
  --color-oceano-700: #004E85;   /* hover/activo de primaria y enlaces */
  --color-marea: #0073AA;        /* secundario, iconos, hover de enlaces suaves */
  --color-cian: #008CBB;         /* SOLO gráficos grandes/ilustración (3,8:1) */
  --color-vital: #00A6D6;        /* SOLO decorativo; foco sobre fondos oscuros */
  --color-bruma: #E4F4FA;        /* superficies suaves, chips, bandas */
  --color-arena: #FBF8F3;        /* fondo de página */
  --color-coral: #F08A65;        /* insignias/alertas como FONDO con texto Tinta */
  --color-coral-700: #B4431F;    /* texto/ícono coral sobre claro (5,6:1) */
  --color-coral-800: #9A3412;    /* errores (7,3:1) */
  --color-wa: #25D366;           /* SOLO botones de WhatsApp; texto Tinta */
  --color-texto-suave: #3F5673;  /* texto secundario (7,5:1 s/blanco · 7,1 s/Arena · 6,7 s/Bruma) */
  --color-borde: #C9D8E4;        /* separadores decorativos (NO bordes de controles) */
  --color-borde-fuerte: #6B829A; /* bordes de controles (4,0:1 s/blanco · 3,5 s/Bruma) */
}
```
Alias cortos que usan los fragmentos de este documento (Tailwind v4 publica `--color-*`; los alias evitan repetir el prefijo):
```css
:root {
  --tinta: var(--color-tinta); --oceano: var(--color-oceano); --oceano-700: var(--color-oceano-700); --marea: var(--color-marea);
  --cian: var(--color-cian); --vital: var(--color-vital); --bruma: var(--color-bruma); --arena: var(--color-arena);
  --coral: var(--color-coral); --coral-700: var(--color-coral-700); --coral-800: var(--color-coral-800); --wa: var(--color-wa);
  --texto-suave: var(--color-texto-suave); --borde: var(--color-borde); --borde-fuerte: var(--color-borde-fuerte);
}
```

**Contrastes calculados (WCAG 2.x, sin redondear a favor):**

| Par | Ratio | Uso |
|-----|-------|-----|
| Tinta sobre Arena | **13,6** | Texto principal (AAA) |
| Tinta sobre blanco / Bruma | 14,4 / 12,8 | Texto en tarjetas / chips |
| Blanco sobre Tinta · Bruma sobre Tinta | 14,4 · 12,8 | Pie, bandas CTA oscuras |
| Blanco sobre Océano | **6,8** | Botón primario (AA; AAA solo ≥ 24 px/negrita 18,66) |
| Blanco sobre Océano-700 | 8,65 | Hover/activo (AAA) |
| Océano sobre blanco / Arena / Bruma | 6,8 / 6,4 / 6,0 | Enlaces (siempre subrayados) |
| Marea sobre blanco / Arena / Bruma | 5,2 / 4,9 / 4,6 | Iconos y enlaces secundarios (AA) |
| Texto-suave sobre blanco / Arena / Bruma | 7,5 / 7,1 / 6,7 | Texto secundario |
| Tinta sobre Vital | 5,1 | Chips/etiquetas con fondo Vital |
| Tinta sobre Coral | 5,9 | Insignia «Más solicitado» / avisos |
| Coral-700 sobre blanco / Arena | 5,6 / 5,3 | Texto de alerta |
| Tinta sobre `#25D366` | 7,3 | Botón de WhatsApp (AAA) |
| ~~Blanco sobre `#25D366`~~ | **2,0 ✗** | **Prohibido** |
| ~~Cian sobre blanco~~ | 3,8 ✗ | Solo ≥ 24 px o gráficos (3:1) |
| ~~Vital sobre blanco~~ | 2,8 ✗ | Decorativo |
| ~~Coral sobre blanco~~ | 2,5 ✗ | Nunca como texto |
| Borde de control `#6B829A` | 4,0 / 3,5 | Cumple 1.4.11 (3:1) sobre blanco y Bruma |

Reglas: **anillo de foco** = 3 px Tinta con separación de 2 px blanca (`outline: 3px solid var(--color-tinta); outline-offset: 3px`; sobre fondos oscuros, Vital 5,1:1). Estados nunca solo por color (icono + texto). Éxito = Océano + ✓ (no se usa verde); error = Coral-800 + icono + texto; advertencia = Tinta sobre Coral. Gradiente de página: Arena → Bruma al 40 % (muy sutil). Las secciones oscuras usan Tinta con texto Bruma/blanco.

### 7.3 Forma, sombra, espaciado, layout

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm/md/lg/xl/2xl/pill` | 10 / **14** / 20 / **24** / **32** / 999 px | chips, controles (14), tarjetas (24), hero/pie/modal (32/24), píldoras |
| `--shadow-card` | `0 1px 2px #0b2a4e0f, 0 12px 32px -8px #0b2a4e24` | tarjetas en reposo |
| `--shadow-card-hover` | `0 2px 4px #0b2a4e14, 0 20px 44px -10px #0b2a4e33` | hover/foco |
| `--shadow-pop` | `0 24px 60px -8px #0b2a4e59` | modal |
| Espaciado base | 4 px (4,8,12,16,24,32,48,64,96) | Tailwind `--spacing: 0.25rem` |
| Contenedor | 1240 px (≥ 1280), 1080 px lectura ancha, 720 px artículo (≈ 68 ch a 20 px) | rejilla 12 col, gap 24–32 |
| Altura mínima de controles | 48 px (botones 52–56 px) | Fitts + manos con temblor |
| Iconos | Lucide 1.75 px de trazo, 24/28 px, siempre con texto | `@lucide/astro` |
| Motivo de marca | S de tres franjas / «pulsos» como forma decorativa de fondo (≤ 8 % de opacidad) y divisores ondulados suaves | pie, bandas, tarjetas hero |

```css
@theme {
  --radius-sm: 10px; --radius-md: 14px; --radius-lg: 20px; --radius-xl: 24px; --radius-2xl: 32px; --radius-pill: 999px;
  --shadow-card: 0 1px 2px #0b2a4e0f, 0 12px 32px -8px #0b2a4e24;
  --shadow-card-hover: 0 2px 4px #0b2a4e14, 0 20px 44px -10px #0b2a4e33;
  --shadow-pop: 0 24px 60px -8px #0b2a4e59;
  --container-site: 1240px;
}
```
Botones: primario Océano/blanco; secundario borde 2 px Tinta sobre fondo claro; **WhatsApp** (`--color-wa` + texto Tinta + icono); terciario enlace subrayado. Hover primario = Océano-700 + elevación 1 px; **«text roll» opcional** (del botón de VisitValle) solo en puntero fino.
Tarjetas: fondo blanco sobre Arena, borde 1 px `--color-borde`, radio 24, `--shadow-card`; `hover` eleva 4 px (no 6) y respeta `prefers-reduced-motion`.

### 7.4 Movimiento (tokens, reglas y fragmentos)

```css
:root {
  --dur-micro: 120ms;   /* color, subrayado, hover de enlace */
  --dur-state: 200ms;   /* foco, botón, FAB, diálogo, campo que aparece */
  --dur-reveal: 400ms;  /* tarjetas, paneles, revelado al scroll */
  --dur-scene: 700ms;   /* cambios grandes (imagen del hero, nivel del drawer ≤ 250 ms) */
  --ease-out: cubic-bezier(.05, .7, .1, 1);      /* entradas (decelera fuerte) */
  --ease-standard: cubic-bezier(.2, 0, 0, 1);    /* hover y estados */
  --ease-in-out: cubic-bezier(.4, 0, .2, 1);     /* reubicaciones */
  --ease-stamp: linear(0, .3 12%, .75 25%, 1.1 45%, .97 65%, 1.02 82%, 1); /* solo confirmaciones («Enviado ✓») */
  --dist-reveal: 24px;
}
```
**Reglas:** (1) nada > 700 ms; (2) animar `opacity` y `transform` (compositor), no `height/top`; (3) sin bucles salvo el halo de WhatsApp (finito o estático con `reduce`); (4) no animar el H1 ni la imagen LCP; (5) cada animación define su variante `prefers-reduced-motion` (estado final estático, no desaparecer); (6) sin auto-avance de contenido.

```css
/* Revelado al hacer scroll — mejora progresiva (sin soporte = visible desde el inicio) */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal { animation: reveal-up linear both; animation-timeline: view(); animation-range: entry 0% entry 40%; }
    .reveal-stagger > * { animation: reveal-up linear both; animation-timeline: view(); animation-range: entry 0% entry 45%; }
    .reveal-stagger > :nth-child(2) { animation-range: entry 8% entry 50% }
    .reveal-stagger > :nth-child(3) { animation-range: entry 16% entry 55% }
  }
}
@keyframes reveal-up { from { opacity: 0; translate: 0 var(--dist-reveal) } to { opacity: 1; translate: 0 0 } }

/* Línea de progreso de «Cómo funciona» ligada al scroll */
@supports (animation-timeline: view()) {
  .steps__line { transform-origin: top; animation: grow-y linear both; animation-timeline: view(); animation-range: entry 20% cover 60% }
}
@keyframes grow-y { from { transform: scaleY(0) } to { transform: scaleY(1) } }

/* Transiciones entre páginas (nativas, sin JS) */
@view-transition { navigation: auto; }
::view-transition-old(root), ::view-transition-new(root) { animation-duration: var(--dur-state); animation-timing-function: var(--ease-standard) }
.site-header { view-transition-name: site-header }
@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none } }

/* Red de seguridad global (los componentes definen además su variante estática propia) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important }
}
/* Suavizado de anclas solo si el usuario no pidió menos movimiento */
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }
```
Fallbacks: sin `animation-timeline` el contenido ya es visible; sin `@view-transition` (Firefox estable) navega normal; `prefetch: { defaultStrategy: 'hover' }` de Astro para que la navegación se sienta instantánea.

**Acordeón/FAQ con altura animada (mejora, Chrome-only hoy):**
```css
.faq details { border-block-end: 1px solid var(--color-borde) }
.faq summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; min-block-size: 64px; padding-block: 12px; cursor: pointer;
               font: 600 var(--text-lead)/1.3 var(--font-sans) }
.faq summary::-webkit-details-marker { display: none }
.faq summary::after { content: ""; flex: none; inline-size: 44px; block-size: 44px; border: 2px solid var(--color-oceano); border-radius: 50%;
  background: linear-gradient(var(--color-oceano), var(--color-oceano)) center / 16px 2px no-repeat,
              linear-gradient(var(--color-oceano), var(--color-oceano)) center / 2px 16px no-repeat;
  transition: background-size var(--dur-state) var(--ease-out) }
.faq details[open] summary::after { background-size: 16px 2px, 2px 0 }       /* + → − */
.faq summary:focus-visible { outline: 3px solid var(--color-tinta); outline-offset: 3px; border-radius: 12px }
.faq .faq__body { padding: 0 64px 20px 0; font-size: var(--text-base) }
@supports (interpolate-size: allow-keywords) {
  :root { interpolate-size: allow-keywords }
  .faq details::details-content { block-size: 0; overflow: clip; transition: block-size var(--dur-reveal) var(--ease-out), content-visibility var(--dur-reveal) allow-discrete }
  .faq details[open]::details-content { block-size: auto }
}
@media (prefers-reduced-motion: reduce) { .faq details::details-content, .faq summary::after { transition: none } }
```
(`<details name="faq">` para comportamiento exclusivo; Baseline 2024. `interpolate-size`/`::details-content`: Chrome/Edge 129–131+, no Safari/Firefox estable: sin soporte simplemente abre sin animar.)

### 7.5 Accesibilidad para mayores (lista de verificación)
- **Texto:** cuerpo ≥ 18 px (20 px en lectura larga), nada < 16 px salvo legales ≥ 14; interlineado 1,6; párrafos ≤ 68 caracteres; sin cursivas, sin MAYÚSCULAS largas; enlaces **subrayados** en el cuerpo; lenguaje sencillo (nivel B1), frases ≤ 20 palabras.
- **Contraste:** cuerpo ≥ 7:1 (Tinta 13,6); UI ≥ 4,5:1; bordes de controles ≥ 3:1; nunca color como único indicador.
- **Objetivos:** ≥ 48 px de alto y 8 px de separación (WCAG 2.5.8 AA pide 24 px; 2.5.5 AAA, 44 px; Material 48 px); zonas de toque amplias en iconos (FAB 60 px).
- **Etiquetas permanentes** sobre los campos (no placeholders ni etiquetas flotantes); `autocomplete`, `inputmode`; errores en línea + resumen con `role="alert"`; no borrar lo escrito al fallar.
- **Foco:** visible 3 px, ordenado, sin trampas; `scroll-padding` para que cabecera y barra inferior no tapen el foco (2.4.11); *skip link*; `<dialog>` devuelve el foco al disparador.
- **Sin dependencia de hover** para contenido esencial (`@media (hover:hover)` solo para realces); sin tooltips críticos; sin sliders ni autoavance; vídeo sin autoplay con sonido.
- **Movimiento:** `prefers-reduced-motion` respetado en cada animación; sin parpadeos; sin scroll-jacking.
- **Zoom y reflujo:** usable al 200 % y 400 % sin scroll horizontal (excepto tablas con contenedor de scroll); `rem`/`clamp(rem+vw)`; no bloquear la ampliación (`viewport` sin `maximum-scale`).
- **Estructura:** `lang="es-CO"`, un H1, jerarquía real, landmarks, migas, TOC; texto alternativo útil (no «foto de cuidadora»); `prefers-contrast` y `forced-colors` (bordes visibles con `border` real, no solo sombra).
- **Control de tamaño de letra visible** «A− A A+» en el pie/menú (guarda `localStorage`, cambia `font-size` raíz a 100/112,5/125 %): muchos mayores no saben usar el zoom del navegador *(prioridad P2)*.
- **Teléfono y WhatsApp como texto**, no solo iconos; horario de atención visible; confirmación escrita de cada envío.

### 7.6 Componentes (qué es, cómo se implementa, qué edita la CMS)

| Componente | Comportamiento clave | Implementación (JS) | Campos CMS (EmDash) |
|------------|----------------------|---------------------|---------------------|
| **Barra superior** | Horario + teléfono + aviso corto; cerrable (cookie) | CSS + 0,3 KB | ajustes `contacto`: `telefono`, `horario`, `aviso`, `mostrar` |
| **Header + mega menú** | Sticky 76→66 px (compacto > 80 px), `details[name]`, hover-intent 160 ms, teclado | `<details>` + 1 KB | menú `primary` + colección `servicios` (icono, resumen, `precio_desde`) |
| **Drawer móvil** | `<dialog>` 100 dvh, drill-down 2 niveles, contadores, CTA fijos | 1,2 KB | menú + conteos automáticos + ajustes |
| **Hero home** | §6.3 | 0 KB | bloque `hero`: `eyebrow, h1, subtitulo, cta1, cta2, imagen, sellos[]` |
| **Hero landing** | §6.4 + formulario | 0 + módulo form | en `servicios`: `h1, bajada, bullets[], incluye[], no_incluye, precio_desde, imagen` |
| **Atajos de servicio** | Carril/bento de 6–7 chips con «desde $» | CSS | `servicios.destacado`, `orden` |
| **Tarjetas de servicio (bento)** | Foto + píldora + panel que sube (solo `hover:hover`) | CSS | bloque `servicios_grid`: `coleccion, limite, solo_destacados` |
| **Tarjeta «desde $»** | Precio grande, unidad, nota IVA/vigencia, lista «incluye», CTA | CSS | `precio_desde` (entero COP), `unidad`, `iva_incluido`, `vigencia`, `nota`, `incluye[]` |
| **Cómo funciona** | 3 pasos (01/02/03), línea de progreso scroll-driven, promesa de tiempo | CSS | bloque `pasos`: repeater `{titulo, texto, tiempo, icono}` |
| **Mapa de cobertura** | SVG esquemático + lista + buscador sin tildes + contador `aria-live` | 1,5 KB | colección `zonas`: `nombre, slug, barrios[], path_svg, resumen, seo` |
| **Testimonios** | Carril scroll-snap; **componente protegido**: no se publica sin `consentimiento` y `verificado`; en borrador muestra «EJEMPLO» | CSS + 0,6 KB | colección `testimonios`: `nombre_corto, relacion, texto, foto?, consentimiento, verificado, fecha` |
| **FAQ** | `details[name]` con círculo +/−; agrupado; emite `FAQPage` | CSS | colección `faq`: `pregunta, respuesta (PT), grupo, orden, paginas[]` |
| **Banda CTA** | Fondo Tinta/Bruma, 1 titular + 2 botones | CSS | bloque `cta_band` |
| **Modal «Cotiza»** | §3.7 | 3 KB | ajustes `contacto` + opciones desde `servicios` y `zonas` |
| **Barra móvil fija** | §3.4 | 0,5 KB | ajustes `contacto` |
| **FAB WhatsApp** | §3.2 | 0,8 KB | ajustes `contacto`: `wa_numero, wa_mensaje, wa_etiqueta` |
| **Tarjeta de blog** | Imagen 16:9, categoría, extracto, tiempo de lectura; enlace «cubre-tarjeta» | CSS | `posts` |
| **Artículo** | §4 | 1,2 KB (TOC + estrellas + comentarios) | `posts` + comentarios nativos |
| **Comentarios + estrellas** | «¿Te resultó útil?» (artículo) + comentarios moderados | 2 KB | `commentsEnabled`; endpoint de valoraciones propio (D1/KV) |
| **Pie** | Redondeado (32 px) superpuesto −32 px, 4 columnas, aviso legal, «Imágenes ilustrativas» | CSS | menús `footer-*` + ajustes `legal` (NIT, matrícula, dirección, **aviso «Sovialis no es IPS»**) |
| **Cookies/consentimiento** | Banner + diálogo de preferencias, *consent mode* | 2 KB | ajustes `legal` |
| **Estimador de precio (isla React)** | Zona + turno + días → «desde $…» y CTA; opcional | ≈ 15 KB `client:visible` | `servicios`, `zonas`, tarifas |

### 7.7 Librerías: recomendación que minimiza JS

| Necesidad | Recomendado | Peso/estado | Descartado |
|-----------|-------------|-------------|------------|
| Primitivas de UI | **HTML nativo** (`dialog`, `details[name]`, `popover`) + **shadcn/ui con Base UI** *solo* en las 2 islas (Combobox de zona, selects ricos) | Base UI es el valor por defecto de shadcn desde jul-2026 y trae Combobox/Autocomplete/Drawer; `@base-ui/react` 1.8.0 | Radix en el bundle público (ya hay `radix-ui` 1.6.7 en `package.json`: **dejar solo uno**) |
| Iconos | **`@lucide/astro`** (1.52, SVG en línea, 0 JS) | 0 KB de runtime | `lucide-react` en páginas `.astro` |
| Carruseles | **scroll-snap + progreso CSS** (§2.9); **Embla 8.6** (≈ 7 KB gz) solo si se exige arrastre con inercia/loop/autoplay | 0–7 KB | Swiper (≈ 47 KB; ≥ 20 KB con tree-shaking) |
| Animación | **CSS** (scroll-driven, view transitions, `@starting-style`); si hace falta secuenciar: **Motion 14** `animate` mini (≈ 2,3 KB) / `scroll()` / `inView` (0,5 KB) | 0–3 KB | GSAP (≈ 23 KB), `framer-motion` React, AOS, Lenis (secuestra el scroll), Lottie |
| Fuentes | **Astro Fonts API** + `fontProviders.fontsource()` (o los paquetes `@fontsource-variable/*` ya presentes) | ≈ 64 KB woff2 | Google Fonts remoto |
| Imágenes | `<Image priority>` de `emdash/ui` (srcset 640–1920, endpoint con binding `IMAGES` de Cloudflare, LQIP) | — | CSS `background-image` para fotos LCP |
| Formularios | Constraint API + módulo §3.7 + **Turnstile** | ≈ 3 KB | React Hook Form/Formik en el modal |
| Mapa | **SVG propio** + lista; MapLibre solo bajo demanda (`client:visible`) | 0 KB | Embed de Google Maps en la home |
| Navegación | `@view-transition` + `prefetch` hover | 0 KB | `<ClientRouter/>` (re-inicializar scripts; fricción con SSR de EmDash) |
| Medición | GTM + *consent mode* + `data-cta` | — | píxeles directos sin consentimiento |

**React solo donde aporta:** (1) estimador de precio, (2) combobox/buscador de zonas si la versión nativa no basta. Todo lo demás son componentes `.astro` + scripts de módulo pequeños. Meta: **≤ 60 KB gz de JS hidratado** en la home.

### 7.8 Plantillas de página

**Home (orden):** 1) Hero §6.3 → 2) **Franja de confianza** (3–4 garantías reales: verificación, reemplazo, reporte, sin permanencia) → 3) «¿Qué necesita tu familiar?» (bento de 7 servicios con «desde $») → 4) **Cómo funciona** (3 pasos) → 5) **Zonas** (mapa + buscador) → 6) **Nuestro cuidado** (split foto + 3 compromisos: dignidad, continuidad, comunicación; «Vínculos que protegen») → 7) **Testimonios** (solo si hay; si no, se omite la sección entera) → 8) «Cómo seleccionamos» (pasos reales) → 9) Guías (3 últimas del blog) → 10) FAQ (6–8, `FAQPage`) → 11) Banda CTA final → 12) Pie.
**Landing de servicio:** Hero C → «Cuándo conviene / para quién» (2 columnas) → **Qué incluye · Qué NO incluye** (obligatorio) → Tarjeta(s) **«desde $»** (día/noche/fin de semana) con nota IVA/vigencia → Cómo funciona → Quién cuida (perfil y selección) → Zonas → Testimonios (si hay) → FAQ del servicio → Servicios relacionados → Banda CTA. **Barra móvil siempre visible.**
**Zona (`/cobertura/<zona>/`):** hero B con buscador de barrio → servicios disponibles en la zona → barrios cubiertos (lista) → FAQ local → CTA. (Texto único por zona; nada de páginas puerta.)
**Blog:** §4. **Nosotros:** hero editorial con **foto real del equipo**, historia, proceso de selección, valores, datos legales (NIT, matrícula; editables).

### 7.9 Mapa de edición en EmDash (todo editable)
- **Ajustes del sitio:** `title, tagline, logo, favicon, social` (nativos) + grupos propios `contacto` (teléfono, WhatsApp, mensaje, horario, correo destino de formularios, mensajes de éxito) y `legal` (NIT, matrícula mercantil, dirección, aviso «no es IPS», versión de consentimiento, textos de cookies).
- **Colecciones:** `servicios`, `zonas`, `testimonios`, `faq`, `posts` (con `commentsEnabled`), `pages` (campo `blocks`).
- **`blockTypes` (versionados):** `hero`, `servicios_grid`, `pasos`, `zonas_mapa`, `testimonios_carril`, `faq_lista`, `cta_band`, `confianza_franja`, `nuestro_cuidado`. Los bloques **no admiten `reference` ni bloques anidados**: se alimentan con `coleccion` + `limite` + `solo_destacados`, y los datos viven en las colecciones.
- **Reglas de publicación:** `testimonios.consentimiento && verificado` (si no, no se renderiza); precios con `vigencia` (al vencer, la tarjeta muestra «consulta tu cotización» en lugar del número); cualquier texto con «enfermera/enfermería/inyección/curación/sonda/suero» dispara advertencia en el editor (validación del plugin o lista de palabras en `pre-publish`).
- **Caché:** páginas SSR con `Astro.cache.set(cacheHint)` en cada consulta (`getMenuWithCacheHint`, etc.) y `s-maxage` + `stale-while-revalidate` en Cloudflare para que la home sirva desde el borde.


---

## 8. Dirección de imagen: 14 briefs fotográficos

**Criterio:** *realismo aspiracional* (proceso `imagenes-ultrarrealistas` de JP): foto real pero deseable —hogares cuidados del norte de Bogotá, luz de día agradable, nada de miseria, óxido ni escenas tristes—; documental, no «catálogo». Las personas mayores son **protagonistas con agencia** (deciden, participan, ríen), nunca objeto de lástima; no se infantiliza. Sin clichés: apretón de manos, manos arrugadas en primer plano como único recurso, anciano mirando por la ventana con tristeza, estetoscopios, cruces de farmacia.
**Reglas legales/visuales:** **ningún acto de enfermería** (nada de jeringas, sueros, curaciones, tensiómetros, guantes, camas hospitalarias); uniforme de cuidadora **azul suave y blanco**, sin logos ni credencial legible; sin texto en pantalla ni papeles legibles (la IA escribe mal: papeles, relojes y pantallas fuera de foco o de canto); nada de marcas. Las fotos IA se publican como **«Imágenes ilustrativas»** (nota en el pie y en la ficha de la imagen), con metadato IPTC `DigitalSourceType: trainedAlgorithmicMedia`. **Nunca** usar rostros IA como «nuestro equipo» ni como «testimonios».
**Proceso por foto:** 8–15 referencias reales con licencia libre (Wikimedia Commons: Usaquén, Parque de la 93, Cerros Orientales, arquitectura de ladrillo de Bogotá; Unsplash/Pexels para interiores) **solo como referencia interna**, tapando rostros y letreros; 2 candidatos (Nano Banana Pro + Nano Banana 2, 2K), editar defectos locales, **juez escéptico** (realismo ≥ 8, cero texto/logos/anatomía rota), recorte exacto al hueco, JPG 90–92. EmDash/Astro genera AVIF/WebP y `srcset`. Mostrar a JP una hoja antes/después antes de publicar.
**Aspectos soportados por el generador:** 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9.

**Bloque base (se antepone a todos los prompts; en inglés porque rinde mejor):**
> *Reference images are for context only (place, light, materials). Do not copy any person, sign or lettering; create a completely new photograph.* Candid documentary photograph, Fujifilm X-T5, natural available light, eye level, subtle film grain, true-to-life skin with pores and fine lines, natural hands with knuckles, relaxed unposed expressions. Colombian (Latin American) people of varied skin tones. Setting: a tasteful, upscale apartment in north Bogotá — exposed red-brick details, light wood parquet, cream walls, large windows with soft overcast daylight and a hazy view of the green eastern hills, wool throws, ceramic mugs, a few houseplants. Gentle, slightly desaturated colour grade with cool-neutral shadows and warm skin highlights; palette of soft blues, warm off-white and natural wood. Caregivers wear a plain soft-blue short-sleeved tunic with white piping and white trousers, no logos, no readable badge. Older adults wear layers (knit cardigans, light jackets), look dignified and are active participants, never pitied.

**Cierre fijo (se añade al final de todos):**
> *No text, no letters, no numbers, no logos, no brand emblems, no readable signs or license plates, no watermarks, no HDR, no oversaturation, no plastic skin, no stock-photo smiles, nobody looking at the camera, no medical equipment, no syringes, no stethoscopes, no IV poles, no gloves, no hospital beds, no wheelchairs unless stated.*

| # | Uso | Generar en | Recortes en el sitio |
|---|-----|-----------|----------------------|
| 01 | Hero de la home | **4:5** | 4:5 (desktop/móvil), 1:1 (tarjeta compartida) |
| 02 | Landing «Cuidadora turno de día 12 h» | **3:2** | 21:9 (franja), 4:5 (tarjeta), 1:1 |
| 03 | «24 h / interna» | 3:2 | 21:9, 4:5, 1:1 |
| 04 | «Turno nocturno» | 3:2 | 21:9, 4:5, 1:1 |
| 05 | «Acompañamiento a citas y hospital» | 3:2 | 21:9, 4:5, 1:1 |
| 06 | «Postoperatorio en casa» | 3:2 | 21:9, 4:5, 1:1 |
| 07 | «Alzheimer / demencia» | 3:2 | 21:9, 4:5, 1:1 |
| 08 | «Auxiliar de enfermería» (formación) | 3:2 | 21:9, 4:5, 1:1 |
| 09 | Nosotros / equipo (**provisional**) | 3:2 | 16:9, 1:1 |
| 10 | Cómo funciona (3 pasos) | **1:1 ×3** | 4:5 móvil |
| 11 | Cobertura: 11a Usaquén · 11b Chicó | **16:9** | 21:9, 3:2 |
| 12 | Blog por defecto / OG | **16:9** | 1.91:1 (OG 1200×630), 3:2 |
| 13 | Banda CTA «Tu familia, tranquila» | 3:2 | 16:9 (con espacio para texto), 1:1 |
| 14 | «Nuestro cuidado» (split de la home) | **4:5** | 4:5, 3:4 |

**Composición para recortes:** en los 3:2 mantener a los sujetos entre el 25 % y el 75 % de la altura y dentro del 60 % central del ancho (para que el recorte 21:9 conserve caras y manos); dejar «aire» tranquilo (pared, ventana difuminada) en el tercio superior izquierdo para texto o tarjeta.

---

### 01 · Hero de la home — 4:5
**Alt sugerido:** «Cuidadora y adulto mayor jugando parqués en una sala luminosa mientras su hija los observa desde la puerta».
**Prompt:** *[base]* Late-morning in a bright living room. A caregiver in her late 30s (mestiza, hair tied back, soft-blue tunic) sits beside an elderly man of about 80 (silver hair, round glasses, grey cardigan) at a wooden table by a large window; they are playing parqués, he is tapping a coloured piece and laughing quietly, she leans in with relaxed amusement. In the soft-focus background, in a doorway, his daughter (late 40s, casual linen shirt) holds a coffee mug and watches with a calm, relieved smile, not looking at the camera. Shot on a 35mm lens at f/4, eye level, shallow depth of field; window shows blurred red-brick buildings and green hills. Subjects in the upper-right two thirds; the lower-left corner stays calm (table surface and floor) for an overlay card. *[cierre]*
**Evitar:** sonrisas a cámara, bandeja de pastillas, tablets visibles, lujo ostentoso (mármol brillante, lámparas excesivas).

### 02 · Cuidadora turno de día 12 h — 3:2
**Alt:** «Cuidadora y adulta mayor preparando el desayuno juntas en una cocina luminosa».
**Prompt:** *[base]* Morning in a bright kitchen with white cabinets and a small brick wall. An elderly woman of about 78 (short grey hair, light knit cardigan, thin scarf) is seated at the counter cutting papaya with a dull knife, taking part; the caregiver (mid-30s, soft-blue tunic) stands beside her sliding arepas onto a plate and saying something that makes them both smile. A ceramic mug of coffee and a glass pitcher of juice on the counter; sunlight through the window. 35mm lens at f/4, eye level, documentary framing, subjects centred, calm top third. *[cierre]*
**Evitar:** cuchillos afilados protagonistas, manos haciendo el trabajo de la mayor; ella participa.

### 03 · 24 h / interna — 3:2
**Alt:** «Cuidadora y adulta mayor miran juntas un álbum de fotos en el sofá al atardecer».
**Prompt:** *[base]* Early evening in a living room, warm table-lamp light mixing with the cool blue dusk in the window. A live-in caregiver in her 50s (soft-blue tunic with a light beige cardigan over it, reading glasses on her head) sits on a sofa beside an elderly woman of 82 wrapped in a wool throw; they look at an old photo album open on their knees, the elderly woman pointing and telling a story, the caregiver listening with a gentle smile. Two glass cups of herbal tea (aromática) on a low wooden table, a plant, brick wall softly out of focus. 35mm lens at f/2.8, handheld feel, gentle grain. *[cierre]*
**Evitar:** cama o dormitorio de cuidadora a la vista, iluminación fría de oficina, fotos del álbum legibles.

### 04 · Turno nocturno — 3:2
**Alt:** «Cuidadora lee con una lámpara tenue junto a la puerta entreabierta de un dormitorio mientras una persona mayor duerme».
**Prompt:** *[base]* Night, quiet apartment hallway lit only by a small warm bedside lamp. A night-shift caregiver in her 40s (soft-blue tunic with a dark knit shawl) sits in an armchair beside a half-open bedroom door, reading a paperback with a calm, attentive expression; through the doorway, softly out of focus, an elderly person sleeps peacefully under a duvet. Warm low light, deep blue shadows, tea mug on a side table, no screens. 35mm lens at f/2, ISO-grain subtle, steady composition, subjects within the central band. *[cierre]*
**Evitar:** aspecto de vigilancia, monitores/cámaras, sombras amenazantes, linternas, dormitorio hospitalario.

### 05 · Acompañamiento a citas y hospital — 3:2
**Alt:** «Cuidadora acompaña del brazo a una adulta mayor por una acera arbolada hacia la entrada de una clínica moderna».
**Prompt:** *[base — exterior]* Mid-morning on a clean, tree-lined street in the Chicó area of Bogotá, plane trees, brick façades, a modern glass-and-brick medical building with no visible signage in the background. A caregiver (mid-30s, soft-blue tunic under a light navy jacket) walks slowly beside an elderly woman of 80 (grey bob, camel coat, silk scarf, using a slim walking stick), offering a light supportive arm; the caregiver carries a plain cardboard folder and the elderly woman’s handbag. They talk, unhurried. Soft overcast daylight. 50mm lens at f/4, eye level, subjects walking toward the right with space ahead of them. *[cierre]*
**Evitar:** señales «Clínica», cruces rojas, ambulancias, silla de ruedas, carpetas legibles.

### 06 · Postoperatorio en casa — 3:2
**Alt:** «Persona mayor da pasos con un andador en un pasillo luminoso acompañada por una cuidadora».
**Prompt:** *[base]* Bright hallway of an apartment, late morning. An elderly man of 76 (white moustache, polo shirt, soft trousers, comfortable shoes) stands behind a lightweight aluminium walker and takes a deliberate step, concentrating, with a small proud smile; beside him a caregiver in her 40s (soft-blue tunic) walks at his side with one hand hovering near his elbow without gripping, encouraging calmly. At the end of the hallway an armchair with a folded wool blanket and a footstool. No bandages, no scars, no hospital items. 35mm lens at f/4, eye level, subjects in the central band. *[cierre; el andador es la única ayuda técnica permitida]*
**Evitar:** apósitos, muletas dramáticas, cara de dolor, cama, bata de hospital.

### 07 · Alzheimer / demencia — 3:2
**Alt:** «Cuidadora y adulta mayor doblan toallas juntas en una mesa tranquila».
**Prompt:** *[base]* Calm, uncluttered dining room, plain pale wall, soft morning light. An elderly woman of 84 (white hair, cardigan, a thin gold chain) smiles with quiet recognition as she folds a warm towel on the table; the caregiver (late 30s, soft-blue tunic) sits at eye level beside her, folding another towel, her free hand resting on the table near but not on the elderly woman’s hand, patient and warm. A bowl of tangerines and a glass of water on the table. No clocks, no calendars, no screens. 50mm lens at f/2.8, eye level, soft contrast, gentle grain. *[cierre]*
**Evitar:** gesto de desorientación, miedo, sujetar o conducir a la persona, juguetes infantiles, rompecabezas de niños.

### 08 · Auxiliar de enfermería (personal con formación) — 3:2
**Alt:** «Cuidadora con experiencia ayuda con seguridad a un adulto mayor a levantarse de una butaca».
**Prompt:** *[base]* Living room, daylight. An experienced caregiver in her early 50s (short practical hairstyle, soft-blue tunic with navy piping, plain lanyard with a blank card) stands in front of an elderly man of 79 seated in an armchair, offering a stable forearm and a calm verbal cue so that he can stand up safely; he is placing his hands on the armrests, determined. Her stance is balanced and professional, the mood trusting. Soft side light from a window, brick wall, a wool throw on the arm of the chair. 35mm lens at f/4, eye level. *[cierre]*
**Evitar:** instrumentos médicos, batas blancas, gorros de enfermera, credenciales con texto.

### 09 · Nosotros / equipo — 3:2 *(PROVISIONAL: sustituir por foto real)*
**Alt:** «Equipo de cuidadoras y coordinación de Sovialis conversando en una oficina luminosa».
**Prompt:** *[base]* Five colleagues of mixed ages (28–55), four caregivers in soft-blue tunics and one coordinator in smart-casual clothes (linen blazer), standing around a long wooden table in a bright loft-style office with a brick wall and plants, laughing at something off-camera while one of them pours coffee; unposed, mid-conversation, nobody looking at the camera. Natural window light, 35mm lens at f/4, eye level, slight wide framing. *[cierre]*
**Uso:** solo como marcador visual durante el desarrollo; **antes del lanzamiento** se reemplaza por sesión real (guion: 3 retratos de cuerpo medio, 1 grupal, 1 de manos/rutina, 1 de la oficina; consentimiento por escrito y uso del uniforme real).

### 10 · Cómo funciona — 3 imágenes 1:1
**Alt:** (a) «Hija escribe un mensaje desde su oficina»; (b) «Familia recibe a la cuidadora en la puerta del apartamento»; (c) «Cuidadora y adulto mayor regando plantas en el balcón».
- **10a — Cuéntanos.** *[base]* A woman in her late 40s (smart-casual, silver earrings) sits at a café table in a Bogotá business district, brick wall and large window behind her, typing on her phone with a thoughtful, slightly relieved expression; a coffee and a closed notebook on the table; the phone screen is not visible. 50mm lens at f/2.8, square composition, soft overcast light. *[cierre]*
- **10b — Conoce a tu cuidadora.** *[base]* Entrance hall of an apartment: the caregiver (mid-30s, soft-blue tunic under a light jacket, small backpack) is being welcomed at the open door by a woman in her late 40s and an elderly woman with a cane, handshake-free, warm greeting with a light touch on the arm, everyone looking at each other. 35mm at f/4, square, natural window light. *[cierre]*
- **10c — Empieza el cuidado.** *[base]* A sunny apartment balcony with brick buildings and green hills out of focus; the caregiver and an elderly man (78, flat cap, cardigan) water a row of pots together, he holds the watering can, she steadies a plant. 35mm at f/4, square, morning light. *[cierre]*
**Consistencia:** mismo tratamiento de color en las tres; la misma cuidadora puede aparecer en b y c (usar una referencia de rostro generada en 10b para c).

### 11a · Cobertura — Usaquén — 16:9
**Alt:** «Plaza de Usaquén con su iglesia colonial blanca y los cerros al fondo».
**Prompt:** *No people references copied.* Documentary wide photograph of the cobbled colonial plaza of Usaquén in Bogotá on a calm weekend morning: whitewashed colonial church (no signage), plane trees, low terracotta-roofed houses, café terraces with a few people walking away from camera, a clean cobblestone surface, soft overcast light with a patch of sun, green eastern hills hazy behind. 35mm lens at f/8, eye level, slightly low horizon, calm and dignified. *[cierre]* **Evitar:** letreros, puestos con carteles, vehículos con placa legible.

### 11b · Cobertura — Chicó / Parque de la 93 — 16:9
**Alt:** «Calle arbolada de Chicó con edificios de ladrillo y los cerros orientales al fondo».
**Prompt:** Documentary wide photograph of a leafy residential street near Parque de la 93 in Bogotá, mid-morning: tall plane trees, neat brick apartment buildings with balconies, a clean pavement, one person jogging and a dog walker seen from behind, the green eastern hills in soft haze under bright overcast sky. 35mm lens at f/8, eye level. *[cierre]* **Evitar:** tráfico denso, vallas publicitarias, cables enredados, fachadas descuidadas.

### 12 · Blog por defecto / Open Graph — 16:9
**Alt:** «Mesa junto a la ventana con una taza de aromática, gafas de lectura y un cuaderno».
**Prompt:** Still life, no people: a light wooden table by a large window, a ceramic mug with herbal tea, reading glasses, a closed linen-bound notebook and a small plant, a wool throw on a chair, brick wall softly out of focus, calm morning light. 50mm lens at f/2.8, shallow depth of field, soft cool-neutral grade with warm highlights; leave the right third calm for a title in the OG version. *[cierre]*

### 13 · Banda CTA «Tu familia, tranquila» — 3:2
**Alt:** «Tres generaciones almuerzan juntas en un comedor luminoso».
**Prompt:** *[base]* Sunday lunch in a bright dining room: a grandmother of 80, her daughter (late 40s) and a granddaughter (12) share bowls of ajiaco around a wooden table, laughing in the middle of a story, relaxed, hands passing a basket of bread, window light on one side, brick wall and plants behind. No caregiver in the shot. 35mm lens at f/4, eye level; subjects occupy the right two thirds, left third calm for text over a dark overlay. *[cierre]*

### 14 · «Nuestro cuidado» (split de la home) — 4:5
**Alt:** «Cuidadora y adulta mayor conversan en el balcón entre plantas».
**Prompt:** *[base]* A sunny apartment balcony in north Bogotá with ceramic pots, a small table, brick buildings and green hills softly out of focus; an elderly woman of 81 (silver hair in a low bun, lilac cardigan) sits with a cup of coffee, in charge of the conversation, while the caregiver (mid-30s, soft-blue tunic) leans on the railing beside her listening with a smile. Warm morning sun from the left. 50mm lens at f/2.8, portrait orientation, subjects in the central band. *[cierre]*

**Lote y costo:** 14 fotos × 2 candidatos + retoques ≈ 40–55 llamadas de imagen; priorizar **01, 02, 03, 07, 11a, 12** (home + 2 landings + zona + blog) y dejar 04, 05, 06, 08 para la segunda ronda de landings.

---

## 9. Antipatrones y lista de verificación de lanzamiento

**Antipatrones (de lo visto):**
1. Slider en el hero (VV): LCP, 84 % solo ve el slide 1, WCAG 2.2.2.
2. Fotos LCP como `background-image` (VV): no descubribles, sin `fetchpriority`.
3. Contenido esencial solo en hover o solo por ancho de pantalla (VV).
4. Plantillas WordPress/Elementor con 1,5 MB de CSS/JS y tres jQuery (VV); 600 KB de HTML (Dorothea).
5. Marcar el negocio como `Hospital/MedicalBusiness` (competidores): engaña y es riesgo legal.
6. Promesas de «24/7», «5 minutos» o cifras de familias sin respaldo.
7. Etiquetas flotantes y placeholders como etiqueta (accesibilidad en mayores).
8. Texto < 16 px (15–17 px en VV) y cursivas largas.
9. Link farm en el pie (VV).
10. Vender «enfermería» o procedimientos en una web de cuidado no sanitario.

**Checklist previa al lanzamiento:**
- [ ] Un H1 por página, con palabra clave; texto en HTML inicial (ver con `curl`/«ver código fuente»).
- [ ] LCP < 2,5 s en móvil 4G (p75) con foto `priority`; CLS < 0,1; INP < 200 ms; JS hidratado ≤ 60 KB gz.
- [ ] Contraste verificado (§7.2); foco visible; navegación completa con teclado; 200 %/400 % de zoom sin pérdida.
- [ ] `prefers-reduced-motion` probado en: halo del FAB, drawer, revelados, view transitions, parallax.
- [ ] Barra móvil, FAB y banner de cookies no se tapan entre sí (`--alto-consentimiento`); `scroll-padding` correcto.
- [ ] Modal: foco atrapado y devuelto, `Esc`, clic en fondo, errores con `role="alert"`, éxito con confirmación escrita, honeypot + Turnstile, política enlazada, **sin datos de salud**.
- [ ] JSON-LD: `BlogPosting`, `BreadcrumbList`, `FAQPage` (solo FAQ visibles), `LocalBusiness` con `areaServed`; **sin `aggregateRating`**.
- [ ] Todas las cifras, garantías, horarios y precios salen de la CMS y están marcados «verificado»; ningún testimonio sin consentimiento.
- [ ] Aviso «Sovialis no presta servicios de salud ni procedimientos de enfermería» (texto validado por abogado) en pie y en landings.
- [ ] «Imágenes ilustrativas» donde haya fotos IA; equipo real en «Nosotros».
- [ ] `data-cta` en todos los CTA y eventos en GTM con *consent mode*.

---

## 10. Fuentes consultadas

**Leídas en HTML/CSS/JS (curl):** visitvalle.travel (home y /planea-tu-visita/, 30 CSS + 24 JS), cursosdeconduccionbogota.com (home + bundles `/_astro/*`), cursodeglobosonline.com/blog/globoflexia/, y la home de ~25 sitios de competencia/inspiración (Home Instead US/UK, Comfort Keepers, Bayshore, Hometouch, Papa, Honor, Birdie, Lottie, Cera, Amada, Cuideo, Cuidum, Qida, Senniors, Aiudo, Sanitas Mayores, CuidarEnCasa, Cuidados Dorothea, Su Enfermera con Amor, Homewatch, FCD, Alan, Mercury, Aman, Oura). Visiting Angels, Right at Home, Ro y Hims respondieron `403` a bots.
**Archivos del proyecto:** `web/package.json`, `web/.agents/skills/building-emdash-site/*`, `web/node_modules/emdash` (componentes `Image`/`EmDashImage`), `web/node_modules/astro` (Fonts API), `brand-claude/fonts`, memorias `sovialis-*`, `research/keyword-research-claude/output/*`, skill `imagenes-ultrarrealistas`.
**Búsquedas web (2026-10-04):**
- Scroll-driven animations y soporte de navegadores: https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/ · https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026
- Cross-document view transitions: https://css-tricks.com/cross-document-view-transitions-part-1/ · https://www.testmuai.com/learning-hub/cross-document-view-transitions-browser-support/
- `interpolate-size` / `::details-content`: https://developer.chrome.com/docs/css-ui/animate-to-height-auto · https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size
- shadcn/ui + Base UI por defecto: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- Atkinson Hyperlegible Next (Fontsource): https://fontsource.org/fonts/atkinson-hyperlegible-next · Braille Institute: https://www.brailleinstitute.org/freefont/
- Astro 7: https://astro.build/blog/astro-710/ · https://docs.astro.build/en/guides/view-transitions/
- Embla vs Swiper (tamaños): https://www.pkgpulse.com/guides/embla-carousel-vs-swiper-vs-splide-2026 · Motion (tamaños): https://motion.dev/docs/gsap-vs-motion · https://motion.dev/docs/scroll
- Carruseles (Notre Dame, NN/g): https://www.orbitmedia.com/blog/rotating-sliders-hurt-website/ · https://vwo.com/blog/image-slider-alternatives/
- LCP/`fetchpriority`/fondos CSS: https://almanac.httparchive.org/en/2025/performance · https://www.corewebvitals.io/pagespeed/background-images-are-evil
- WCAG 2.2 tamaño de objetivo: https://www.webability.io/glossary/target-size · https://testparty.ai/blog/wcag-target-size-guide
- Mercado Bogotá (competidores y precios): https://cuidarencasa.com.co/precios · https://www.cuidadosdorothea.com/ · https://suenfermeraconamor.com/ · https://cuidadoadultomayor.com/
- España: https://cuideo.com/ · https://www.cuidum.com/ · https://www.qida.es/ · https://www.senniors.com/

*(Los datos marcados «reportado» provienen de resúmenes automáticos de página y deben verificarse visualmente antes de citarlos externamente. Los precios y cifras de competidores son de referencia interna.)*
