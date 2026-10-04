# Auditoría UX/UI, CRO y SEO on-page — sovialis.com

> **Fecha:** 4 de octubre de 2026 · **Alcance:** 14 URL (inicio, hub de servicios, 3 servicios, precios, cómo funciona, nosotros, hub de zonas, 2 zonas, blog, 1 guía, contacto) en móvil y escritorio.
> **Público de referencia:** hijos e hijas de 35–60 años que buscan cuidado para su mamá o su papá, mayoritariamente desde el celular; Sovialis **no es IPS**.
> **Método:**
> - HTML de producción descargado con `curl` y analizado (títulos, H1–H4, JSON-LD, enlaces, imágenes, formularios, `data-cta`).
> - Lighthouse 12 (móvil por defecto y `--preset=desktop`), dos tandas: 07:16–07:23 y 07:36–07:38 (hora de Bogotá).
> - Capturas con Chrome headless (390×844 y 1440×900) y capturas de página completa de Lighthouse (412 px).
> - Medición de alturas, posiciones de CTA y comportamiento (menú móvil, modal, botón flotante) en un navegador a 375×812.
> - Lectura del tema (`src/components/blocks/`, `src/pages/`, `src/lib/`, `src/styles/`, `src/worker.ts`, plugins) y de `docs/CONTENT-GUIDE.md`, `docs/research/diseno-referencias.md` y `docs/research/arquitectura-seo.md`.
>
> **Nota:** durante la auditoría se desplegaron los commits `4caee02` (hero de servicios) y `dcb2707` (37 imágenes nuevas) a las 07:29. El hero de servicios, las imágenes y Lighthouse se volvieron a medir después de ese despliegue; los hallazgos de este documento corresponden al estado posterior. No se envió ningún formulario ni se votó en ningún widget.

---

## 1. Resumen ejecutivo

**La base es buena.** La arquitectura SEO está bien pensada y se respeta:
- cada URL tiene su keyword en el title y el H1;
- 74 preguntas frecuentes, ninguna repetida entre páginas;
- JSON-LD completo (`Service` + `Offer`, `FAQPage`, `BreadcrumbList`, `BlogPosting`);
- vocabulario legal sin infracciones en las páginas transaccionales (solo «paciente» en un extracto de guía y «salario mínimo» como índice de ajuste, ambos aceptables).

El sistema visual es coherente: paleta Océano, Jost + Atkinson, radios 14/24/32 y una sola familia de sombras. En escritorio el resultado es pulido. Lighthouse marca 96–100 en accesibilidad, CLS 0 y TBT ≤ 10 ms en todas las páginas.

**El problema principal es el móvil, que es donde está el público:**

1. **El primer pliegue no convierte.** En 9 de las 14 páginas, el primer botón de acción queda por debajo de los 812 px de pantalla: entre 873 y 986 px en el inicio, los servicios y las zonas. La foto del hero (229–343 px) se interpone entre el H1 y los botones. Tampoco hay una barra de acción fija: el WhatsApp flotante solo aparece después de 300 px de scroll.
2. **Las páginas son muy largas.**
   - Inicio: 22.560 px (28 pantallas).
   - Zonas: 20.300–20.600 px, con 4.650 px de texto corrido seguido.
   - Precios: 17.800 px. El primer precio aparece a 1.320 px.
   - Los grids de servicios con foto ocupan 4.000–5.000 px.
   El texto que sostiene el SEO puede quedarse, pero hay que plegarlo y compactarlo.
3. **La confianza tiene un punto débil grave.** Hay un widget de estrellas que cualquiera puede votar en el hero de servicios y zonas, y ya muestra «5,0 de 5 · 1 valoración» en `/servicios/cuidado-24-horas/` y `/zonas/engativa/`. Además, ese widget alimenta un `aggregateRating`. Esto contradice la decisión #11 del brief y la regla «nada inventado». A eso se suman:
   - faltan razón social, NIT y personas reales (el sitio lo sabe: `site.md` tiene esos campos vacíos);
   - las fotos muestran uniforme clínico con logo, lo que puede leerse como «enfermería» o «dotación».
4. **El rendimiento en móvil es bajo para tráfico de Ads.** En laboratorio, el LCP va de 3,0 a 7,7 s. Las causas:
   - fotos de 1.200–1.600 px sin `srcset` en huecos de 343 px;
   - GA4 se carga dos veces (`gtag.js` 176 KB + `gtm.js` 125 KB);
   - el HTML solo se guarda 120 s en el borde, así que cada página que se enfría tarda 0,7–1,4 s en el primer byte.
5. **Hay errores visibles de arreglo inmediato:**
   - 5 iconos rotos en todo el sitio (calendario, correo y otros);
   - textos de plantilla en minúscula y agramaticales («Prestamos alzheimer y demencia en estas zonas»);
   - el manifest devuelve 404.

**Puntuación media: 6,6/10.** Con los P0 (≈ 3–4 días de código, casi todo de esfuerzo S) el sitio debería subir a ~7,5. Con los P1 de contenido y los componentes de precio y selector, a ~8,5.

---

## 2. Datos medidos

### 2.1 Lighthouse (móvil, simulación 4G; se dan las dos tandas cuando hay dos)

| Página | Rend. | Acces. | BP | SEO | LCP móvil | Escritorio (Rend. / LCP) |
|---|---|---|---|---|---|---|
| `/` | 83 → 90 | 100 | 96 | 92 | 4,1 → 3,0 s | 99 / 0,7 s |
| `/servicios/` | 75 | 100 | 96 | 92 | 5,9 s | — |
| `/servicios/cuidadora-adulto-mayor/` | 88 → 78 | 97 | 96 | 92 | 3,8 → 5,3 s | — |
| `/servicios/cuidado-24-horas/` | 75 → 74 | 97 | 96 | 92 | 5,7 → 6,7 s | 96 → 91 / 1,0–1,1 s |
| `/servicios/cuidado-alzheimer-demencia/` | 75 | 97 | 96 | 92 | 5,7 s | — |
| `/precios/` | 85 → 96 | 100 | 96 | 92 | 4,1 → 2,0 s | 99 / 0,5 s |
| `/como-funciona/` | 86 | 96 | 96 | 92 | 4,0 s | — |
| `/nosotros/` | 82 | 100 | 96 | 92 | 4,6 s | — |
| `/zonas/` | 71 | 100 | 96 | 92 | 7,7 s | — |
| `/zonas/usaquen/` | 72 → 81 | 100 | 96 | 92 | 7,1 → 4,4 s | 94 / 1,2 s |
| `/zonas/engativa/` | 90 | 100 | 96 | 92 | 3,2 s | — |
| `/blog/` | 97 | 100 | 96 | 92 | 2,0 s | — |
| `/blog/hogar-geriatrico-o-cuidado-en-casa/` | 78 | 100 | 96 | 92 | 5,4 s | — |
| `/contacto/` | 88 | 100 | 96 | 92 | 3,7 s | 97 / 0,9 s |

- **CLS 0 y TBT 0–10 ms en todas las páginas.** El problema no es el JavaScript propio: `site.ts` pesa 5,4 KB y el hilo principal trabaja 0,5 s.
- **SEO 92 en todas las páginas por un único fallo:** el enlace «Más información» del aviso de cookies no es descriptivo.
- **BP 96 en todas las páginas** por los errores de consola del manifest (404).
- **Accesibilidad 96–97:**
  - en los servicios, `.guide__num` usa Vital sobre blanco (2,6–2,8:1);
  - en Cómo funciona, el texto queda atenuado por la animación `.reveal` en el momento de la medición.
- **La variación entre tandas se explica por el TTFB** (70 ms en caliente frente a 0,7–1,4 s en frío) y por cuánto tardan en descargarse las imágenes.

### 2.2 Móvil (375×812): longitud y posición del primer CTA

| Página | Alto total | Pantallas | Primer CTA del hero (px) | ¿CTA en el primer pliegue? |
|---|---|---|---|---|
| `/` | 22.559 | 27,8 | 954 | No |
| `/servicios/` | 18.627 | 22,9 | 873 | No |
| `/servicios/cuidadora-adulto-mayor/` | 14.283 | 17,6 | 973 | No |
| `/servicios/cuidado-24-horas/` | 12.680 | 15,6 | 979 (precio a 881, estrellas a 826) | No |
| `/servicios/cuidado-alzheimer-demencia/` | 11.203 | 13,8 | 986 | No |
| `/precios/` | 17.815 | 21,9 | 608 (primer precio a 1.320) | Sí, pero sin precio |
| `/como-funciona/` | 14.747 | 18,2 | 443 | Sí |
| `/nosotros/` | 13.352 | 16,4 | 701 | Sí (justo) |
| `/zonas/` | 18.126 | 22,3 | 918 | No |
| `/zonas/usaquen/` | 20.624 | 25,4 | 894 | No |
| `/zonas/engativa/` | 20.347 | 25,1 | 889 | No |
| `/blog/` | 9.990 | 12,3 | — | — |
| `/blog/hogar-geriatrico-o-cuidado-en-casa/` | 23.177 | 28,5 | CTA de servicio a 17.314 | No |
| `/contacto/` | 8.194 | 10,1 | 472 (formulario a 1.304, 972 px de alto) | Sí |

**Las secciones que más pesan en móvil:**

| Página | Sección | Alto |
|---|---|---|
| Inicio | Servicios | 4.082 px |
| Inicio | Zonas | 2.369 px |
| Inicio | Guías | 1.841 px |
| Inicio | «Por qué Sovialis» | 1.837 px |
| Precios | Tarjetas | 4.074 px |
| Precios | Tabla apilada | 4.210 px |
| Usaquén | Intro | 4.707 px |
| Usaquén | Servicios | 3.950 px |
| Usaquén | Zonas cercanas | 2.200 px |
| Engativá | Intro | 4.650 px |

### 2.3 SEO on-page por página

| Página | Title (car.) | ¿H1 igual al title? | Palabras en `main` | Enlaces internos únicos en `main` | JSON-LD propio de la página |
|---|---|---|---|---|---|
| `/` | 57 | Sí (idéntico) | 1.805 (guía 900–1.300) | 29 | WebPage, FAQPage (+ Organization, LocalBusiness, WebSite globales) |
| `/servicios/` | 60 | No | 1.754 | 11 | CollectionPage, ItemList, BreadcrumbList, FAQPage |
| Cuidadora | 58 | No | 1.957 (guía 1.100–1.600) | 27 | WebPage, Service + Offer, BreadcrumbList, FAQPage |
| 24 horas | 57 | No | 1.858 | 26 | ídem |
| Alzheimer | 56 | No | 1.831 | 25 | ídem |
| `/precios/` | **67** | Sí | 1.833 | **6** | WebPage, BreadcrumbList, FAQPage (sin ofertas) |
| `/como-funciona/` | 37, sin keyword | Sí | 1.325 | 6 | WebPage, BreadcrumbList, FAQPage |
| `/nosotros/` | 31 | Sí | 1.223 | **4** | AboutPage, BreadcrumbList, FAQPage |
| `/zonas/` | 57 | No | 1.500 | 22 | CollectionPage, ItemList, BreadcrumbList, FAQPage |
| Usaquén | 54 | No | 1.994 (guía 700–1.000) | 25 | WebPage (about AdministrativeArea), Service, BreadcrumbList, FAQPage |
| Engativá | 55 | No | 1.946 | 25 | ídem |
| `/blog/` | 54 | No | 714 | 18 | CollectionPage, ItemList, BreadcrumbList |
| Guía «hogar geriátrico» | **69** | Casi | 2.881 | 10 | BlogPosting, BreadcrumbList, FAQPage |
| `/contacto/` | 34 | Sí | 861 | 4 | ContactPage, BreadcrumbList, FAQPage |

- **Todas las imágenes tienen `alt`, `width` y `height`.** La imagen LCP lleva `fetchpriority="high"` y el resto, `loading="lazy"`.
- **Canonical, `lang="es-CO"`, migas y landmarks** están presentes en todas las páginas, y las `nav` tienen `aria-label`.

---

## 3. Puntuación por página (1–10)

| Página | Nota | Lo mejor | Lo que más resta |
|---|---|---|---|
| `/` | **7** | H1 con keyword, franja de confianza, comparativa honesta, mapa de cobertura y FAQ útil | CTA fuera del primer pliegue en móvil; 28 pantallas; atajos sin Alzheimer ni postoperatorio; FAQ después del cierre |
| `/servicios/` | **6,5** | Guía «Cómo elegir según la situación» y tabla de tarifas por perfil | Las 6 situaciones no enlazan a nada; 9 tarjetas de ~600 px; atajos que duplican el catálogo; el enlace «Ver todos» apunta a la propia página |
| `/servicios/cuidadora-adulto-mayor/` | **7** | Qué hace y qué no, plan de cuidado, FAQ sin precio (respeta la matriz) | Precio y CTA bajo el pliegue; estrellas en el hero; guía en pestañas difícil de descubrir en móvil |
| `/servicios/cuidado-24-horas/` | **7,5** | La mejor estructurada: acordeón «para quién», comparativa con la interna, pestañas incluye/no incluye | Mismos problemas de hero; estrellas con 1 voto visibles; comparativa cortada en móvil |
| `/servicios/cuidado-alzheimer-demencia/` | **7** | Contenido por etapas, tono digno y sin diagnósticos | «Todo sobre alzheimer…», «Prestamos alzheimer y demencia en estas zonas»; H1 de 5 líneas en móvil; no recibe enlaces desde la home |
| `/precios/` | **6** | Transparencia total, IVA incluido, recargos explicados | Ningún precio en el primer pliegue; 22 pantallas; «Calcula y cotiza» no calcula; 6 enlaces internos; title de 67 caracteres |
| `/como-funciona/` | **7** | Cinco pasos claros, plan de cuidado en acordeón, condiciones en lenguaje claro | Tarjetas que no dan el dato («Forma de pago: cómo y cuándo se paga»); title sin keyword; sin línea de tiempo |
| `/nosotros/` | **5,5** | Vínculos y compromisos bien escritos; selección del personal en 4 pasos | Sin personas, razón social, NIT ni dirección; foto ilustrativa con alt que la presenta como el equipo real; 4 enlaces internos |
| `/zonas/` | **6,5** | Mapa SVG propio con buscador sin tildes; proceso de confirmación de cobertura | Lista de 13 zonas en filas altas; H1 de 5 líneas; mucho texto antes del mapa |
| `/zonas/usaquen/` | **6** | Contenido local real (clínicas, ciclovía, mercado de pulgas, pendientes de los cerros) | Muro de 4.700 px; sección de clínicas duplicada; H2 de servicios que repite el H1; estrellas |
| `/zonas/engativa/` | **6** | Foto local nueva y referencias reales (Calle 80, Jardín Botánico, Shaio) | Igual que Usaquén; «Normandía» pertenece a otra URL futura (§6.2); estrellas con 1 voto |
| `/blog/` | **6,5** | Chips de categoría y tarjetas limpias con fecha y tiempo de lectura | No hay «Empieza aquí» ni buscador; la primera imagen va con carga diferida |
| Guía «hogar geriátrico» | **8** | Modelo de guía YMYL: «En resumen», índice, tablas que se apilan en móvil, fuentes y FAQ | Autor genérico; CTA recién al 75 %; 1 solo relacionado; comentarios vacíos; title de 69 caracteres; icono de fecha roto |
| `/contacto/` | **6** | Botones WhatsApp y Llamar arriba; PQRS bien explicado | Los datos de contacto no se ven como texto; formulario de 8 campos (972 px); sin dirección ni NIT |

---

## 4. Hallazgos priorizados

- **Prioridad:**
  - **P0:** esta semana (alto impacto o error visible, casi siempre esfuerzo S).
  - **P1:** próximas 2–4 semanas.
  - **P2:** backlog.
- **Esfuerzo:** S < 1 día · M 1–3 días · L > 3 días.
- **Tipo:**
  - **Código:** cambio en el tema, los plugins o el worker.
  - **Contenido:** cambio editable desde el panel o en `content/`.

| # | Prior. | Página / sección | Problema | Recomendación concreta | Esf. | Impacto | Tipo |
|---|---|---|---|---|---|---|---|
| 1 | **P0** | Inicio, servicios, zonas · hero móvil | El CTA principal queda a 873–986 px con una pantalla de 812 px. La foto (`grid-template-areas: "head" "media" "body"` en `Hero.astro`) se mete entre el H1 y los botones. En servicios, tampoco el precio entra en el primer pliegue. | En pantallas menores de 640 px, ordenar: eyebrow → H1 → subtítulo (máx. 3 líneas, `line-clamp` con «Ver más» o un subtítulo corto propio) → chip «Desde $» → botón WhatsApp a ancho completo → «Cotiza» → foto. Si se quiere conservar la foto tras el título (decisión de `058cf4f`), limitarla a `aspect-[16/9]` y `max-height: 30svh`. Meta: CTA ≤ 650 px. | S | CRO alto · UX alto | Código |
| 2 | **P0** | Global móvil | No hay barra de acción fija. El FAB de WhatsApp aparece tras 300 px y no hay «Llamar» ni «Cotizar» persistentes, aunque la decisión #7 del brief los pide. `data-hero-cta` existe en `Cta.astro` pero ningún script lo usa. | Barra inferior de 64 px (Llamar · WhatsApp · Cotizar) que aparece cuando el CTA del hero sale de pantalla (`IntersectionObserver` sobre `[data-hero-cta]`). En móvil sustituye al FAB y respeta `env(safe-area-inset-bottom)`. Reservar `padding-bottom` con `--sv-sticky-cta-h`, que ya existe. Medir con `data-cta="global:barra-movil-*"`. | M | CRO alto | Código |
| 3 | **P0** | Servicios y zonas · hero | Widget de estrellas abierto («Califica este servicio») junto al H1. Hoy muestra «5,0 de 5 · 1 valoración» en 24 horas y Engativá. Cualquier visitante, cliente o no, puede votar una vez al día. El agregado alimenta `aggregateRating` (`plugins/sovialis-seo/index.ts`, `ratingsInSchema`). Contradice la decisión #11 y la regla «nada inventado», y Google trata las reseñas autoatribuidas como no aptas. | Quitar `StarRating` de `servicios/[slug].astro` y `zonas/[slug].astro`. Dejar las valoraciones solo en guías («¿Te resultó útil?»). Desactivar `ratingsInSchema` para `services`, `zones` y `pages`, y reiniciar los agregados. La prueba social real llegará con el Perfil de Empresa de Google y con testimonios verificados (ver C-10). | S | Confianza · CRO · SEO | Código |
| 4 | **P0** | Global · iconos | `icon()` en `src/lib/icons.ts` borra `width` y `height` de todo el SVG, incluidos los `<rect>` internos. Se rompen calendario, correo, venda, maletín y lista. Se ve en el pie (correo), en los pasos («Acordamos el plan», «Calculamos con el calendario»), en el mega menú («Acompañamiento a citas»), en la fecha del blog y en «Ciclovía en la Séptima». | Aplicar el regex solo a la etiqueta raíz: `svg.replace(/<svg([^>]*)>/, (m, a) => '<svg' + a.replace(/\s(width\|height)="\d+"/g, '') + '>')`. Añadir una prueba visual de los 44 iconos del mapa. | S | Calidad percibida | Código |
| 5 | **P0** | Rendimiento móvil (todas) | LCP de laboratorio de 3,0 a 7,7 s. Hay tres causas. (a) `Img.astro` no genera `srcset` porque `PUBLIC_CF_IMAGES` está apagado, así que se sirven fotos de 1.200–1.600 px y 90–220 KB a huecos de 343 px; Lighthouse estima 120–600 KB de ahorro por página. (b) GA4 entra dos veces: `gtag/js` (176 KB) y `gtm.js` (125 KB), y además puede duplicar `page_view`. (c) El HTML se guarda solo 120 s en el borde (`HTML_TTL`), así que el TTFB en frío es de 0,7–1,4 s. | (a) Activar Image Transformations en la zona y `PUBLIC_CF_IMAGES=on`; el componente ya produce `srcset` 480–1920 con `format=auto` (AVIF/WebP). (b) Un solo contenedor: GTM con la etiqueta GA4 dentro, o solo gtag. Cargarlo tras `load` o la primera interacción, o vía Zaraz. Mantener el Consent Mode v2, que ya funciona (`gcs=G100`). (c) Subir `HTML_TTL` a 1–24 h, purgar al publicar (hook de EmDash) y servir contenido viejo mientras se revalida con `ctx.waitUntil`. | M | SEO (CWV) · CRO (calidad de la página de destino en Ads) | Código |
| 6 | P1 | `/precios/` | El primer precio aparece a 1.320 px. La página mide 22 pantallas: 6 tarjetas de ~590 px más una tabla apilada de 4.210 px. «Calcula y cotiza» abre el formulario, no calcula. | Franja de precios clave en el hero (Hora $20.000 · 12 h día $160.000 · Noche $190.000 · 24 h $300.000, leída del CMS). Un conmutador «Cuidadora / Formación de auxiliar» y pestañas «Por horas · Día · Noche · 24 h» en lugar de 6 tarjetas. Tabla completa en `<details>` o con pestañas «Lun–vie / Sáb, dom y festivos» (sigue en el HTML). CTA «Cotiza tu caso» hasta que exista el estimador (C-1). | M | CRO alto · UX alto | Código + Contenido |
| 7 | P1 | `/precios/` · enlazado | Solo 6 enlaces internos en `main`; las tarjetas de plan no enlazan a la landing que posee esa familia de búsqueda. | Añadir `url` a `plans[]` del bloque `pricing` y un enlace «Ver servicio» por plan (nocturno, 24 h, por horas, citas, hospitalario). Enlazar la guía de costos («hogar geriátrico o cuidado en casa») y, cuando exista, la de costo mensual. | S | SEO medio · CRO | Código + Contenido |
| 8 | P1 | Zonas (Usaquén, Engativá…) · intro | Muro de texto: ~650 palabras seguidas (4.650–4.700 px en móvil, casi 6 pantallas) antes del primer componente. La zona suma ~1.950 palabras, frente a las 700–1.000 de la guía. | Poner arriba una «ficha rápida de la zona» (C-7) con barrios, clínicas cercanas, nota de llegada y servicios más pedidos. Intro visible de 120–180 palabras. Cada H2 del cuerpo en un acordeón `<details>`; el texto sigue en el HTML y Google lo indexa. Servicios en estilo `lista-compacta`. | M | UX alto · SEO neutro | Código + Contenido |
| 9 | P1 | Zonas · duplicados | El cuerpo trae el H2 «Clínicas y hospitales de referencia cerca de X» y la plantilla añade un aside «Clínicas y lugares de referencia en X» con las mismas instituciones. El H2 de cuerpo «Servicios disponibles en X» convive con el de plantilla «Cuidado del adulto mayor en X», casi igual al H1. | Quitar la sección de clínicas del cuerpo (los datos ya están en `landmarks`). Renombrar el H2 de plantilla (`ServicesGrid` en `zonas/[slug].astro`) a «Servicios disponibles en {zona}» y quitar ese H2 del cuerpo. | S | SEO (repetición) · UX | Código + Contenido |
| 10 | P1 | Servicios · títulos generados | `String(name).toLowerCase()` produce «Todo sobre alzheimer y demencia», «Dudas sobre alzheimer y demencia» y «Prestamos alzheimer y demencia en estas zonas de Bogotá», que es agramatical y pone «Alzheimer» en minúscula. | Campos opcionales `guide_title`, `faq_title` y `zones_title` en la colección, con respaldo. No convertir a minúscula: usar `service_noun` («cuidado de personas con Alzheimer») o la frase «Atendemos este servicio en estas zonas». | S | Calidad · SEO | Código |
| 11 | P1 | Inicio · atajos y enlazado | `catalog.services.slice(0, 7)` deja fuera Alzheimer y postoperatorio de «¿Qué necesita tu familiar?». En `main`, la home no enlaza a esas dos landings. | Mostrar los 9 en el carril con scroll-snap, o filtrar por `featured` + `order`. Marcar Alzheimer como destacado, porque es una búsqueda de alto valor. | S | SEO · CRO | Código + Contenido |
| 12 | P1 | Inicio, servicios, zonas · grids de servicios | En móvil, cada tarjeta con foto mide ~600 px: 4.082 px en la home, ~3.950 en zonas y ~5.000 en `/servicios/`. | Por debajo de 640 px, usar un carril horizontal (85 % de ancho, scroll-snap, indicador «1/6») o el estilo `lista-compacta` existente (icono + nombre + «desde $»). Tarjetas con foto desde 768 px. | S | UX alto | Código |
| 13 | P1 | `/servicios/` · guía rápida | Las 6 tarjetas de «Cómo elegir según la situación» no enlazan a nada: son el mejor puente al servicio correcto y no reciben clics. «Ir directo a un servicio» duplica el catálogo y «Ver todos los servicios» apunta a la misma página. | Añadir `url` + `link_label` a los `items` de `feature_grid` (esquema + bloque) y enlazar cada situación con su servicio. En el hub, quitar los atajos y ocultar «Ver todos». | S | CRO · SEO | Código + Contenido |
| 14 | P1 | Formularios (modal, hero y contacto) | (a) Las etiquetas flotantes se truncan con «…» y bajan a 12,8 px; el brief pide etiquetas permanentes para un público mayor. (b) En el modal, la zona es obligatoria pero está oculta en el paso 1 y no hay indicador de pasos. (c) `/contacto/` tiene 8 campos (972 px). | Etiqueta permanente de 16 px encima del campo, con el ejemplo como ayuda debajo. Indicador «Paso 1 de 2» en el modal; si falta la zona, mostrarla con un mensaje amable, no como error. En contacto, nombre, WhatsApp y zona, más «Agregar detalles (opcional)» plegado. | M | CRO · Accesibilidad | Código |
| 15 | P1 | `/contacto/` | La sección «Teléfono, correo y horario» dice que los números están en los botones y no los muestra. El hero ocupa ~550 px sin datos. | Tarjetas de canal con el dato visible (`telLink`, `waLink` y `mailto` leídos de los ajustes) y su botón. En escritorio, hero compacto con el formulario al lado (2 columnas). | S | CRO · Confianza | Código |
| 16 | P1 | `/nosotros/` y global · confianza | Sin personas, razón social, NIT ni dirección (`site.md` tiene `legal_name`, `nit` y `address` vacíos). La foto de cabecera es ilustrativa y su alt dice «Dos coordinadoras de Sovialis revisan la agenda», como si fuera el equipo real. | Ya: alt neutro («Imagen ilustrativa: coordinación revisando la agenda de servicios»). Cuando JP tenga los datos: foto real, nombre y rol de la coordinación, razón social, NIT y ciudad en el pie y en Nosotros, y en JSON-LD (`legalName`, `taxID`, `address`, `sameAs` hacia el Perfil de Empresa). | S / M | Confianza · E-E-A-T | Contenido |
| 17 | P1 | Imágenes · vestuario | Las 37 imágenes nuevas (`dcb2707`) visten a las cuidadoras con uniforme antifluido tipo *scrub* con logo. Visualmente comunica «personal clínico» y «uniforme/dotación», justo el vocabulario que la guía evita por no ser IPS y por el Decreto 0581 (§9 de la guía). | Validar con el asesor legal antes de invertir en más piezas. Alternativa: ropa cómoda no clínica, sin logo bordado (como mucho, un distintivo discreto), conservando el aviso «Imágenes ilustrativas». | M | Legal · Marca | Contenido |
| 18 | P1 | Accesibilidad · foco | `:focus-visible` usa `--sv-secondary` (#00A6D6): 2,83:1 sobre blanco y 2,67:1 sobre arena. No cumple WCAG 1.4.11 (3:1). | `outline: 3px solid var(--sv-deep); outline-offset: 3px`, según §7.2 del brief. En `.on-dark`, Vital. | S | Accesibilidad | Código |
| 19 | P1 | Bloque `comparison` | Las celdas «Sí/No» son solo SVG con `aria-hidden`, así que el lector de pantalla lee una celda vacía. En móvil, `min-w-[40rem]` deja la tabla con scroll lateral, columnas cortadas y sin pista. | Agregar `<span class="sr-only">Sí</span>` / `No`. Por debajo de 640 px: conmutador de columna («vs. contratación directa / vs. hogar geriátrico», C-5) o filas apiladas, con la primera columna fija. | S / M | Accesibilidad · UX | Código |
| 20 | P1 | Guía (artículo) · CTA | En móvil, el único CTA contextual está a 17.314 px de 23.177 (75 %) y el lateral se oculta. | Tarjeta CTA corta tras «En resumen» y tras la primera tabla de precios («¿Quieres el costo para tu caso? Escríbenos»), sin interrumpir el índice. | S | CRO | Código |
| 21 | P1 | Blog · E-E-A-T (YMYL) | Autor «Equipo editorial de Sovialis» (Organization) en temas de salud, dinero y derechos, sin revisor. | Autor con nombre real y perfil en `/autores/`. Cuando exista, «Revisado por» con un perfil profesional verificable y fecha de revisión; en JSON-LD, `Person` y `reviewedBy`. No publicar credenciales que no se puedan comprobar. | M | SEO (YMYL) · Confianza | Contenido |
| 22 | P1 | Inicio · orden y longitud | 28 pantallas y 1.805 palabras (guía: 900–1.300). La FAQ va después de la banda de cierre. `blog_latest` muestra las 3 últimas guías, no las que ayudan a decidir. | Fusionar «Cuidado en casa para tu familiar…» y «Qué hace y qué no» en un bloque `tabs_media`. Plegar la comparativa o dejarla solo en `/servicios/`. FAQ antes del cierre. `blog_latest` con `category: contratar-cuidado`. | M | UX · CRO | Contenido |
| 23 | P1 | Pestañas en móvil (`TabsMedia`, `GuideTabs`) | Las pestañas horizontales se cortan sin pista («Relevos» queda a medias; la guía tiene 6 pestañas de hasta 17 rem). Muchos usuarios no ven que hay más. | Por debajo de 768 px, convertirlas en acordeón `<details name>` (se mantiene `hidden="until-found"` y la indexación), o añadir un degradado de desborde y un contador «2 de 6». | M | UX | Código |
| 24 | P1 | `/como-funciona/` | Las tarjetas del paso 2 no dan el dato: «Forma de pago: Cómo y cuándo se paga el servicio.», «Plazo de reemplazo: En cuánto tiempo enviamos…». La respuesta aparece varias secciones más abajo. | Escribir el dato en cada tarjeta (anticipado, cancelación sin costo con 24 h, vigencia de 15 días…) o fusionar con «Contrato, pagos y cancelaciones». Pasar los 5 pasos a una línea de tiempo (C-4). | S | UX · Confianza | Contenido |
| 25 | P1 | Datos estructurados | (a) `aggregateRating` (ver #3). (b) `BlogPosting.keywords` filtra la etiqueta interna «Mofu». (c) `LocalBusiness` sin `streetAddress`, `legalName`, `taxID` ni `sameAs`. (d) `/precios/` no declara ofertas. | (a) Ver #3. (b) Excluir de `keywords` las etiquetas de embudo (ToFu/MoFu/BoFu). (c) Completar cuando existan los datos. (d) En `/precios/`, `OfferCatalog` o una lista de `Offer` con `UnitPriceSpecification` por modalidad, leída del CMS. | S | SEO | Código + Contenido |
| 26 | P2 | Titles y H1 | `/precios/` tiene 67 caracteres y la guía 69 (máximo 60). El H1 es idéntico al title en home, precios, cómo funciona, nosotros y contacto (§5.3 de la guía pide que sean distintos). El title de `/como-funciona/` no tiene keyword y el de `/nosotros/` tiene 31 caracteres. La meta de nosotros tiene 159 caracteres. | Por ejemplo: «Precios de cuidadora de adulto mayor 2026 en Bogotá \| Sovialis» (≤ 60); «Cómo contratar cuidado del adulto mayor con Sovialis»; «Quiénes somos: cuidado no sanitario en Bogotá \| Sovialis». | S | SEO | Contenido |
| 27 | P2 | Manifest | `/site.webmanifest` redirige a `/site.webmanifest/` y da 404, porque el regex de extensión de `src/worker.ts` solo acepta 2–5 caracteres. Genera errores de consola (BP 96). | Usar `/\.[a-z0-9]{2,12}$/i` o una lista explícita de extensiones. | S | Calidad · PWA | Código |
| 28 | P2 | Aviso de cookies | El enlace «Más información» no es descriptivo y es el único fallo SEO de Lighthouse. «Aceptar» se ve más fuerte que «Rechazar». | «Más información sobre cookies» y botones del mismo peso (plugin `sovialis-analytics`). | S | SEO · Ética | Código |
| 29 | P2 | Anuncio superior | Repite el H1 («Cuidado del adulto mayor a domicilio en Bogotá») y en móvil gasta 40 px del primer pliegue. | Algo accionable («Respuesta el mismo día · 7 a. m.–8 p. m.») o quitarlo en móvil cuando exista la barra fija (#2). | S | UX | Contenido |
| 30 | P2 | Espaciado de secciones | `.section` usa `clamp(4rem…7.5rem)`: 128 px entre secciones en móvil, que suman ~1.500 px en la home. Cada sección repite eyebrow + H2 + subtítulo centrados. | En móvil, `padding-block: 3rem`. Alternar alineación (izquierda / centrado) y omitir el subtítulo cuando el H2 ya se explica solo. | S | UX | Código |
| 31 | P2 | Tipografía pequeña | `.eyebrow` mide 13 px, en mayúsculas y con 0,14 em de tracking (se parte en 2 líneas en móvil). `.chip` y «desde» miden 14 px; `mega-heading`, 12,8 px. | Eyebrow ≥ 15 px con tracking de 0,08 em. Nada por debajo de 16 px en contenido (§7.5 del brief). | S | Accesibilidad (público mayor) | Código |
| 32 | P2 | Contraste puntual | `.guide__num` usa Vital sobre blanco o bruma (2,6–2,8:1). El final del degradado `.hl` es #00A6D6 (2,8:1) en titulares grandes. Los checks verdes (`text-success`) contradicen «sin verde salvo WhatsApp». | `.guide__num` en Océano. Terminar el degradado de `.hl` en Marea (#0073AA, 5,2:1). Checks en Océano. | S | Accesibilidad · Marca | Código |
| 33 | P2 | Animación `.reveal` | Se aplica a párrafos y listas: el texto queda atenuado mientras entra en pantalla (Lighthouse midió 2,1–2,7:1 en Cómo funciona). | Usar `reveal` solo en tarjetas e imágenes, nunca en prosa. | S | Accesibilidad | Código |
| 34 | P2 | IDs duplicados | El logo SVG en línea repite 11 ids de degradado (`lgp-*`) en cada página. El índice del artículo repite `toc-title`. | IDs con sufijo por instancia, o `<symbol>` + `<use>`. | S | Accesibilidad · Validez | Código |
| 35 | P2 | Cifras | Atkinson Hyperlegible Next dibuja el cero con barra: «$3ØØ.ØØØ» en chips, tablas y fechas. Es legible, pero en precios se ve técnico. | Precios destacados en Jost (como en las tarjetas). Revisar si la fuente trae alternativa de cero; no es bloqueante. | S | UX | Código |
| 36 | P2 | Pie en móvil | Listas completas de 9 servicios, 13 zonas y 6 enlaces (~1.500 px). | Acordeones por columna en pantallas menores de 768 px. | S | UX | Código |
| 37 | P2 | `/blog/` | No hay «Empieza aquí» ni buscador, y la primera imagen va con `loading="lazy"`. | Destacar 3 guías clave (contratar, costos, enfermera o cuidadora), prioridad en la primera tarjeta y buscador (`LiveSearch` de EmDash). | S / M | UX · SEO | Código + Contenido |
| 38 | P2 | Guía · cierre | «Sigue leyendo» muestra 1 artículo. La sección de comentarios está vacía y su formulario es largo (pide correo) en un tema YMYL. El H2 «Dudas frecuentes sobre este tema» es genérico. | 3 relacionados por categoría y etiquetas. Comentarios plegados (o desactivados hasta tener moderación activa). H2 con keyword. | S | UX · SEO | Código + Contenido |
| 39 | P2 | Engativá · topónimos | Usa «Normandía» en title, meta, H2, FAQ y alt, un topónimo asignado a la futura `/zonas/salitre-y-modelia/` (§6.2). | Actualizar la matriz de topónimos (Engativá no estaba en la v1) o ceder Normandía. | S | SEO (canibalización futura) | Contenido |
| 40 | P2 | Bloque `testimonials` | Solo filtra por `quote`; no hay control de `verificado` ni `consentimiento` como pide el brief. | Dos booleanos obligatorios en el bloque; si faltan, no se pinta. | S | Confianza · Legal | Código |
| 41 | P2 | FAB y mensaje de WhatsApp | Icono blanco sobre #25D366 (1,98:1). El mensaje prellenado incluye la URL completa: «Hola, quiero información sobre Cuidado del adulto mayor a domicilio en Bogotá. Lo vi en https://…». | Icono en Tinta, como los botones. Mensaje más humano por regla («Hola, busco cuidado para mi mamá/papá en {zona}…»); la atribución ya va en el lead. | S | CRO | Contenido (plugin) |
| 42 | P2 | Tarjetas-enlace | El `<a>` envuelve título, extracto, precio y «Ver servicio», así que el nombre accesible es muy largo. | Enlace solo en el H3, con `::after` para que toda la tarjeta sea clicable. | S | Accesibilidad | Código |
| 43 | P2 | Control de texto | Muchos mayores no usan el zoom del navegador (§7.5 del brief). | Control «A− A A+» en el menú y el pie, que cambie `--sv-font-scale` (ya existe el token) y lo guarde en `localStorage`. | S | Accesibilidad | Código |

---

## 5. Análisis por sección y equilibrio SEO ↔ UX

### 5.1 Qué dejar visible y qué plegar (regla general)

| Siempre visible (primer pliegue o primera sección) | Plegado en el HTML (acordeón o pestaña con `hidden="until-found"`) | Carril o carrusel en móvil |
|---|---|---|
| H1 con keyword, subtítulo de máximo 3 líneas, chip «Desde $», CTA WhatsApp y Cotizar, 3 garantías | Cuerpo largo de la guía del servicio (ya en pestañas: en móvil, acordeón) | Servicios relacionados y destacados |
| Primer párrafo con la keyword en las primeras 100 palabras (ya se cumple) | Detalle de procesos (selección, relevos, pagos) | Guías del blog |
| «Qué incluye / qué no incluye» en dos listas cortas (por claridad legal, no en pestañas) | Tabla completa de tarifas (sáb./dom./festivos) | Zonas cercanas (chips) |
| Preguntas de la FAQ (las respuestas pueden ir plegadas) | Respuestas de la FAQ (ya en `<details>`) | Atajos «¿Qué necesita tu familiar?» |
| En zonas: ficha rápida (barrios, clínicas, llegada) | En zonas: rutinas locales, vivienda, hogar geriátrico | — |

Google indexa con peso completo el contenido plegado que está en el HTML (indexación *mobile-first*). Lo que no conviene es esconder texto que solo carga con JS, o el H1 y el primer párrafo.

### 5.2 Inicio (`/`)
- **Hero:** buena promesa y badges correctos («Reemplazo en el plazo acordado», «Sin permanencia mínima»). En móvil los CTA quedan a 954 px (#1). El anuncio superior repite el H1 (#29).
- **Franja de confianza → servicios:** 6 tarjetas con foto que suman 4.082 px; pasarlas a carril (#12). Los atajos de arriba omiten Alzheimer y postoperatorio (#11).
- **Dos `media_text` seguidos:** «Cuidado en casa…» y «Qué hace y qué no» se pueden fusionar en un solo bloque con pestañas o columnas (#22).
- **Cómo funciona:** 4 pasos en tarjetas con número; bien. Sería mejor como línea de tiempo con tiempos reales (C-4).
- **Por qué Sovialis:** 5 tarjetas que suman 1.837 px. Pasar a lista de 2 columnas con iconos o a bento compacto.
- **Comparativa:** valiosa para decidir; en móvil necesita conmutador de columna (#19 / C-5).
- **Cobertura:** buscador + 13 filas + mapa = 2.369 px. Dejar buscador, chips y mapa, con «Ver las 13 zonas» (#12).
- **Precios → guías → cierre → FAQ:** mover la FAQ antes del cierre y filtrar las guías por la categoría que ayuda a decidir (#22).

### 5.3 Hub de servicios (`/servicios/`)
- El H1 y el subtítulo funcionan. Los atajos duplican el catálogo que viene justo debajo (#13).
- «Cómo elegir según la situación» es el componente con más potencial de conversión de todo el sitio, pero no tiene enlaces. Con `url` en cada tarjeta, o como selector interactivo (C-2), sería el camino principal.
- Las tres secciones de prosa («Elige por perfil / horario / necesidad») son buen texto SEO. Plegarlas en acordeón o dejar un párrafo visible por H2.
- La tabla comparativa de tarifas (5 filas × 2 perfiles) es clara. En móvil, mostrar las dos columnas sin scroll: caben en una tarjeta por fila.

### 5.4 Landings de servicio (cuidadora, 24 horas, Alzheimer)
- **Orden:** hero → acordeón «para quién» → comparativa / incluye-no incluye → guía en pestañas → FAQ → relacionados → zonas → cierre. Es correcto y coincide con §7.8 del brief.
- **Hero:**
  - escritorio: mejoró tras `4caee02` (H1 a tamaño H1, foto 5:4, puntos clave sobre la foto);
  - móvil: precio a 881 px y CTA a 979 px (#1);
  - las estrellas ocupan la fila que debería llevar precio y garantía (#3).
- **Cuidadora:** la lista de lo que hace y no hace es clara. Las FAQ no tienen preguntas de precio, lo que respeta la matriz §6.1.
- **24 horas:** la comparativa «relevos vs. interna» responde la objeción principal. Muy bien.
- **Alzheimer:** el contenido por etapas es excelente. Hay que arreglar los textos de plantilla (#10). Además, el H1 «Cuidadores a domicilio para personas con Alzheimer y otras demencias» ocupa 5 líneas en móvil; valorar «Cuidadores a domicilio para Alzheimer y demencia».
- **Prueba social sin inventar:** cada landing debería cerrar con un bloque «Cómo verificamos a quien cuida». El contenido ya existe en Nosotros (4 pasos) y en la matriz de confianza.

### 5.5 Precios (`/precios/`)
- La página resuelve la intención («cuánto cobra una cuidadora») pero no en el primer pliegue (#6).
- Las 6 tarjetas repiten «Cotizar X»; un solo CTA por bloque basta.
- La tabla de 6 modalidades × 4 filas apilada en móvil mide 4.210 px; con pestañas por perfil y por tipo de día se reduce a ~900 px.
- «Qué hace variar el precio» está como tabla con scroll lateral. Mejor como lista de factores con icono.
- La sección «Calcula tu cotización» (pasos) promete un cálculo que no ocurre. Es el lugar natural del estimador (C-1).

### 5.6 Cómo funciona
- Es la página más clara en móvil: el CTA está a 443 px y los pasos numerados tienen subtítulos.
- Las tarjetas sin dato (#24) y el title sin keyword (#26) son los arreglos.
- Una línea de tiempo vertical con hitos («Hoy: nos escribes» → «Mismo día: cotización por escrito» → «Antes del inicio: plan de cuidado» → «Primer día: presentación» → «Cada semana: seguimiento») convertiría mejor. Los tiempos los pone JP según la operación real.

### 5.7 Nosotros
- El texto es honesto y cálido, pero sin personas reales la página no cumple su función: «¿quién está detrás?» (#16).
- Hasta que haya fotos reales, usar una sección «Datos de la empresa» con los campos que JP vaya completando (razón social, NIT, ciudad, canal de PQRS).

### 5.8 Zonas (hub y localidades)
- El hub tiene lo más útil: buscador sin tildes, mapa SVG propio y la nota «sin recargo por desplazamiento dentro de la cobertura».
- Las páginas de localidad tienen contenido local único y valioso (ciclovía de la Séptima, pendientes de Santa Ana, la Calle 80 en hora pico), pero presentado como artículo. Pasarlo a ficha más acordeones (#8) y quitar duplicados (#9).
- Las FAQ locales son excelentes y únicas.

### 5.9 Blog y guía
- La guía «hogar geriátrico» es la mejor página del sitio: «En resumen» con datos, índice, tablas que se apilan en móvil, fuentes y fechas, y FAQ.
- Pendientes: autor (#21), CTA temprano (#20), relacionados y comentarios (#38) y el icono de fecha roto (#4).
- En el hub del blog, los chips de categoría están bien; falta curaduría (#37).

### 5.10 Contacto
- WhatsApp y Llamar arriba están bien.
- Los datos tienen que verse como texto (#15) y el formulario necesita adelgazar (#14).
- La sección PQRS (plazos de 2 y 15 días hábiles) suma confianza.

---

## 6. Sistema de diseño, estados y accesibilidad

### 6.1 Consistencia del sistema

| Aspecto | Estado | Observación |
|---|---|---|
| Tokens (`tokens.css`, editables desde el panel) | Bien | Paleta Océano, radios 14/24/32/píldora y sombras teñidas de Tinta, aplicados de forma uniforme. `--sv-sticky-cta-h` existe pero no se usa (#2). |
| Tipografías | Bien, con matices | Jost en titulares y Atkinson en cuerpo, como dice el brief. Hay cero con barra en cifras (#35) y tamaños por debajo de 16 px en eyebrow, chips y metadatos (#31). |
| Fondo de página | Desvío menor | El brief pedía Arena (#FBF8F3) como fondo general; hoy es blanco y Arena se usa por secciones. Es aceptable y más limpio, pero hay que documentarlo. |
| Jerarquía de botones | Inconsistente | Inicio: WhatsApp sólido + Cotiza contorno. Servicios: Cotiza sólido + WhatsApp contorno. Precios: «Calcula» sólido + WhatsApp contorno. Contacto: WhatsApp sólido + Llamar contorno. **Regla propuesta:** WhatsApp siempre verde (#25D366 con texto Tinta) cuando la acción es WhatsApp; primario = WhatsApp en landings y zonas; primario = Cotizar en hubs y precios; Llamar siempre terciario o contorno. |
| Iconografía | Error | Lucide de 2 px, coherente, pero con 5 iconos rotos (#4). |
| Estados hover / activo | Bien | `translateY(-2px)` con variante para movimiento reducido (`--sv-motion`). Hay un `hover:scale` en las fotos de las tarjetas, irrelevante en táctil. |
| Foco | Falla | Vital en lugar de Tinta (#18). Las estrellas usan otro anillo (2 px Océano). Unificar. |
| Ritmo de secciones | Mejorable | Todas las secciones usan el mismo patrón centrado (eyebrow + H2 + subtítulo) y el mismo padding (#30). En páginas de 15–28 pantallas cansa. |
| Movimiento | Bien | CSS primero, `animation-timeline` bajo `@supports`, `prefers-reduced-motion` respetado y sin auto-avance. Solo falta excluir la prosa de `.reveal` (#33). |

### 6.2 Contrastes calculados (WCAG 2.x)

| Par | Ratio | Uso actual | Veredicto |
|---|---|---|---|
| Vital #00A6D6 sobre blanco | 2,83 | Anillo de foco, `.guide__num`, final de `.hl` | Falla (foco y texto) |
| Vital sobre arena | 2,67 | Foco en secciones arena | Falla |
| Blanco sobre #25D366 | 1,98 | Icono del FAB | Falla 1.4.11 (patrón de marca conocido) |
| Estrella #E8A33D sobre blanco | 2,16 | Estrellas | Falla, pero el widget debe salir (#3) |
| Texto suave #3E4754 sobre blanco | 9,40 | Párrafos secundarios | AAA |
| Océano sobre bruma | 6,26 | Enlaces en secciones bruma | AA |
| Tinta sobre #25D366 | 7,28 | Botones WhatsApp | AAA |
| Coral-700 sobre blanco | 5,58 | Errores | AA |

### 6.3 Lo que ya está bien en accesibilidad
- Hay enlace «Saltar al contenido», `main#contenido`, `nav` con etiqueta y migas.
- El menú móvil es un `<dialog>` con niveles y filas de 56 px. Los botones del header en móvil miden 44 px; los botones generales, 52–58 px.
- Errores en línea con `aria-invalid`, resumen con `role="alert"` y lo escrito se conserva si falla el envío.
- La consigna «evita escribir diagnósticos» está en el formulario.
- Las tablas del contenido se convierten en tarjetas con `data-label` en móvil (`PtTable`).

---

## 7. SEO on-page: notas adicionales

- **Canibalización:** se respeta la matriz §6.1.
  - La home es la única con «cuidado del adulto mayor a domicilio en Bogotá».
  - `/zonas/` es dueña de «norte de Bogotá».
  - Las FAQ de precio solo están en `/precios/`.
  - «Enfermera a domicilio» e «inyectología» solo aparecen en guías.
  - Los riesgos son tres: el H2 de plantilla de zonas que repite el H1 (#9), «Normandía» (#39) y que la home y `/zonas/` comparten la estructura «Cuidado del adulto mayor en…». Vigilar en Search Console (§6.3, punto 5).
- **FAQ:** 74 preguntas únicas. El marcado `FAQPage` ya no genera resultados enriquecidos para sitios que no son de gobierno o salud: sirve para IA y GEO, no para el snippet. Seguir priorizando la utilidad.
- **Enlazado:**
  - `/precios/` (6), `/nosotros/` (4) y `/contacto/` (4) reciben y emiten pocos enlaces internos.
  - La home no enlaza Alzheimer ni postoperatorio desde el contenido.
  - Las landings de servicio enlazan bien (25–27 enlaces únicos).
- **Rendimiento:** ver #5. Con `srcset` y un solo GA, el objetivo realista es LCP ≤ 2,5 s en móvil en las landings. CLS e INP ya están en verde.
- **`LocalBusiness` global:** se repite con 14 `Place` en cada URL. Es válido, pero bastaría en home y contacto; en el resto, una referencia por `@id`.
- **Imágenes:** todas con alt descriptivo y local («Plaza fundacional de Usaquén…», «Calle residencial de Normandía…»). Corregir el alt de Nosotros (#16).

---

## 8. Componentes modernos que faltan (realistas para EmDash)

| # | Componente | Dónde | Cómo (técnica · peso) | Campos en el CMS | Impacto |
|---|---|---|---|---|---|
| C-1 | **Estimador de presupuesto** («¿Cuánto costaría al mes?») | `/precios/` (arriba), landings bajo el hero, guías de costo | Isla React `client:visible` (≈ 10–15 KB): perfil, modalidad, días por semana, ¿incluye fines de semana o festivos? → «desde $X a la semana · $Y al mes, IVA incluido» + CTA de WhatsApp con el resumen en el mensaje. Sin datos de salud. | Tarifas por perfil, modalidad y tipo de día (las de §10 de la guía) en una colección o en los ajustes; nota de vigencia e IVA. | CRO muy alto · GEO (respuesta citable) |
| C-2 | **Selector «¿Qué necesita tu familiar?»** | Home (tras el hero), `/servicios/` | 3 preguntas de sí o no (¿puede quedarse solo? ¿necesita ayuda de noche? ¿hay hospitalización o demencia?) que recomiendan un servicio con su «desde $». JS local de unos 2 KB, sin enviar datos. | Reglas pregunta → servicio en un bloque `selector` (o `feature_grid` con `url`, #13). | CRO alto |
| C-3 | **Barra de acción fija en móvil** | Global | Ver #2: `IntersectionObserver` + `--sv-sticky-cta-h`. | Etiquetas en los ajustes de contacto. | CRO alto |
| C-4 | **Línea de tiempo vertical** | `/como-funciona/`, home | Línea de progreso ligada al scroll (ya especificada en §7.4 del brief), con hitos y tiempos. | Campo `tiempo` en `steps.items`. | Confianza |
| C-5 | **Comparador con conmutador de columna** | Home, 24 horas, guías | En móvil, control segmentado «Sovialis vs. contratación directa / vs. hogar geriátrico»; tabla completa en escritorio. | Los mismos del bloque `comparison`. | UX |
| C-6 | **Índice fijo «En esta página»** | Servicios, zonas, precios | Chips horizontales bajo el header compacto en móvil y columna lateral en escritorio (reutiliza `Toc.astro`). | Automático a partir de los H2. | UX · SEO (anclas) |
| C-7 | **Ficha rápida de zona** | Zonas | Tarjeta en 2 columnas: barrios, clínicas cercanas (de `landmarks`), nota de llegada y servicios más pedidos. | `neighborhoods` y `landmarks` ya existen; añadir `arrival_note`. | UX alto |
| C-8 | **«¿Llegan a mi barrio?» en el hero** | Home, `/zonas/` | Reutiliza el buscador del mega menú: resultado inmediato con enlace a la zona y CTA «Confirmar cobertura». | Automático desde la colección de zonas. | CRO |
| C-9 | **«Incluye / no incluye» en dos columnas** | Servicios | Visible, no en pestañas, por claridad legal. | Campos `includes` y `excludes`. | Legal · Confianza |
| C-10 | **Prueba social verificable** | Home, servicios | Cuando exista: reseñas del Perfil de Empresa de Google (enlace y conteo reales) o testimonios con `verificado + consentimiento` (#40). Mientras tanto, bloque «Cómo verificamos» con los 4 pasos reales. | Colección `testimonios` con los dos booleanos. | Confianza |
| C-11 | **Tarifa con conmutadores** | `/precios/`, landings | Control segmentado «Cuidadora / Auxiliar» y «Lun–vie / Sáb, dom y festivos»; el precio cambia sin recargar. | Tarifas del CMS (las mismas de C-1). | CRO · UX |
| C-12 | **«Prefiero que me llamen» con franja horaria** | Cierre, contacto | Formulario de 2 campos (nombre, celular) más franja (mañana, tarde o noche). | Franjas en los ajustes. | CRO |
| C-13 | **Control de tamaño de texto** | Menú y pie | Ver #43. | — | Accesibilidad |
| C-14 | **Blog: «Empieza aquí» y búsqueda** | `/blog/` | 3 guías fijadas y `LiveSearch`. | Campo `pinned` en posts. | UX · SEO |

**No se proponen:** testimonios, cifras de familias atendidas, años de experiencia, calificaciones ni sellos que hoy no existan. La prueba social de v1 es el **proceso**:
- verificación de identidad, referencias y antecedentes;
- ReTHUS en el perfil auxiliar;
- precio final por escrito con IVA;
- reemplazo en el plazo acordado sin cobro del tiempo no prestado;
- sin permanencia;
- PQRS con plazos;
- aviso «no somos IPS».

---

## 9. Plan sugerido

**Sprint 1 (P0, ≈ 3–4 días de código):**
- #4 iconos;
- #3 quitar estrellas y `aggregateRating` de servicios y zonas;
- #1 orden del hero en móvil;
- #2 barra fija;
- #5 imágenes con `srcset`, un solo GA y TTL de HTML;
- #27 manifest;
- #18 foco.

Medir antes y después con Lighthouse móvil y GA4 (clics en `data-cta` de hero y barra).

**Sprint 2 (P1 de código, ≈ 1 semana):**
- #6 y #7 precios;
- #10 títulos de plantilla;
- #11 atajos;
- #12 grids en carril;
- #13 `feature_grid` con url;
- #14 formularios;
- #15 contacto;
- #19 comparativa;
- #20 CTA del artículo;
- #23 pestañas en acordeón;
- #25 datos estructurados.

**Sprint 3 (contenido y componentes):**
- #8 y #9 zonas (ficha y acordeones);
- #16 y #21 datos de empresa y autoría (cuando JP los tenga);
- #17 validar vestuario;
- #22 home;
- #24 cómo funciona;
- #26 titles;
- C-1 estimador;
- C-2 selector;
- C-4 línea de tiempo.

**Después:** P2 y componentes C-5 a C-14.

---

## Anexo: archivos del tema citados

- `src/components/blocks/Hero.astro`: orden móvil (`.hero-grid`), `catalog.services.slice(0, 7)`, `StarRating` en `context.rating`.
- `src/pages/servicios/[slug].astro` y `src/pages/zonas/[slug].astro`: títulos generados con `toLowerCase()`, valoraciones en el hero, H2 de `ServicesGrid` y aside de `landmarks`.
- `src/lib/icons.ts`: regex de `icon()`.
- `src/components/ui/Img.astro`: `srcset` condicionado a `PUBLIC_CF_IMAGES`.
- `src/worker.ts`: `HTML_TTL = 120` y regex de extensión de la barra final.
- `src/styles/global.css` y `src/styles/tokens.css`: `:focus-visible`, `.eyebrow`, `.section`, `.fl-field`, `.reveal`.
- `src/components/forms/QuoteForm.astro` y `src/scripts/site.ts`: pasos del modal y zona obligatoria.
- `src/components/blocks/Comparison.astro`, `Testimonials.astro`, `ServicesGrid.astro`, `src/components/page/GuideTabs.astro` y `src/components/ui/StarRating.astro`.
- `plugins/sovialis-seo/index.ts` (`ratingsInSchema`), `plugins/sovialis-ratings/index.ts` (voto diario anónimo), `plugins/sovialis-analytics/index.ts` (aviso de cookies) y `plugins/sovialis-whatsapp/model.ts` (mensaje y colores del FAB).
- `content/site.md`: `legal_name`, `nit` y `address` vacíos; anuncio superior.
