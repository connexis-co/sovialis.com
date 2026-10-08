# Guía de contenido de sovialis.com (v1)

Esta guía define **cómo se escribe y se entrega el contenido** del sitio. Todo el contenido vive en `content/` como archivos Markdown con *frontmatter* YAML; `npm run content:sync` lo carga en EmDash (crea o actualiza por slug, sube imágenes y publica). Después todo se edita en el panel.

Fuentes obligatorias antes de escribir una página:

1. `docs/research/sitemap.json` → ficha de la URL (title, meta, H1, H2, keywords, FAQs, enlaces internos, CTA).
2. `docs/research/arquitectura-seo.md` → §2 reglas legales, §6 canibalización, §8 fichas, §9 zonas, §10 guía editorial, §12 GEO.
3. `docs/research/diseno-referencias.md` → §6–§7 (qué muestra cada plantilla) y §8 (imágenes).
4. Esta guía (formato, estilo y validación).

---

## 1. Archivos y formato

| Colección | Carpeta | URL | Campo que recibe el cuerpo Markdown |
|---|---|---|---|
| Páginas | `content/pages/<slug>.md` | `/<slug>/` (el slug `inicio` es `/`) | `body` |
| Servicios | `content/services/<slug>.md` | `/servicios/<slug>/` | `body` |
| Zonas | `content/zones/<slug>.md` | `/zonas/<slug>/` (plano; el barrio indica su localidad en `parent`) | `intro` |
| Blog | `content/posts/<slug>.md` | `/blog/<slug>/` | `content` |
| Ajustes del sitio | `content/site.md` | — | (sin cuerpo) |

Estructura de un archivo:

```markdown
---
slug: cuidado-nocturno
status: published            # published | draft
title: Cuidado nocturno para adultos mayores en casa   # = H1 visible
seo:
  title: Cuidado nocturno de adultos mayores en Bogotá | Sovialis   # ≤ 60 caracteres
  description: Cuidadora de noche para tu familiar en el norte de Bogotá… # 120–155 caracteres
focus_keyword: cuidado nocturno de personas mayores
# …campos propios de la colección (ver §2)…
faqs:
  - question: ¿Qué hace una cuidadora durante la noche?
    answer: Acompaña el descanso… (40–80 palabras, la respuesta va en la primera frase)
layout:                      # secciones (bloques) en orden, ver §3
  - _type: media_text
    title: …
---

Texto largo en Markdown (## H2, ### H3, listas, **negritas**, [enlaces](/servicios/…/), tablas GFM).
```

Reglas de formato:

- YAML válido: comillas dobles si el texto tiene `:` o `#`. Bloques de texto largo con `|`.
- **Imágenes**: `{ media: "<clave>", alt: "<texto alternativo>" }`. Las claves están en §6. El alt describe la escena (no «imagen de…») y, si cae natural, incluye la keyword o el lugar.
- **Enlaces internos** siempre relativos y con barra final: `/servicios/cuidado-nocturno/`.
- **No escribas el teléfono, el WhatsApp ni el correo** en el texto: los botones y el pie los toman de los ajustes. Si hace falta, di «escríbenos por WhatsApp» y usa un botón (acción `whatsapp`).
- Markdown del cuerpo: un solo nivel de títulos `##` y `###` (el H1 lo pone la plantilla). Sin HTML.

## 2. Campos por colección

**Páginas** (`pages`): `title`, `summary` (texto bajo el H1 y meta de respaldo), `layout` (bloques), cuerpo → `body`, `faqs`, `focus_keyword`.
La home (`inicio`), `servicios`, `precios`, `como-funciona`, `nosotros`, `trabaja-con-nosotros`, `contacto`, `zonas` y `blog` (hubs) se construyen **con bloques**. Las legales usan solo `body`.

**Servicios** (`services`): `title` (H1), `short_title` (menús, ≤ 32 caracteres), `menu_group` (`turno` | `necesidad`), `icon` (§4), `excerpt` (tarjetas, 140–200 caracteres), `price_from` (entero COP), `price_unit` («por turno de 12 h», «por hora (mínimo 4 h)»…), `hero_eyebrow`, `hero_subtitle`, `hero_image`, `highlights` (3–5 líneas, una por renglón: lo que incluye), `layout`, cuerpo → `body`, `faqs`, `service_type` (para schema, p. ej. «Cuidado de personas mayores en casa»), `order`, `featured` (true en los 6 del inicio), `focus_keyword`.

La plantilla de servicio pinta automáticamente: **hero dividido** (eyebrow, H1, subtítulo, chip «Desde $…», botones WhatsApp + Cotizar, 3 viñetas de `highlights`, formulario corto de 3 campos), luego tus **bloques** (`layout`), luego el **cuerpo** (`body`), luego **FAQ** (`faqs`), luego **servicios relacionados**, **zonas** y un **cierre** con CTA. No repitas en bloques lo que ya pinta la plantilla.

**Zonas** (`zones`): `title` (H1), `short_title`, `kind` (`localidad` | `barrio` | `sector` | `municipio`), `parent` (slug de la localidad si es barrio: `usaquen`, `chapinero`, `suba`; solo para migas y menús, no cambia la URL), `locality`, `neighborhoods` (barrios cubiertos, separados por coma), `excerpt`, `hero_image`, cuerpo → `intro`, `landmarks` (clínicas y referencias reales: `{ name, kind: clinica|hospital|parque|centro-comercial|otro, note }`), `layout`, `faqs`, `lat`, `lng` (centro aproximado, 4 decimales), `order`, `focus_keyword`.
La plantilla pinta: hero con H1 + `excerpt` + botones, el `intro`, una sección «Clínicas y lugares de referencia» con `landmarks`, tus bloques, los **servicios** (automático), el **mapa** con la zona resaltada, FAQ y cierre.

**Blog** (`posts`): `title` (H1), `excerpt` (120–160 caracteres), `featured_image`, `key_takeaways` («En resumen», 3–5 líneas, cada una una frase completa con un dato útil), cuerpo → `content`, `faqs`, `cta_service` (slug del servicio relacionado), `reading_minutes`, `focus_keyword`, `category` (slug de categoría, §7), `tags` (lista de slugs en minúscula), `published_at` (AAAA-MM-DD).
La plantilla pinta: migas → H1 → autor/fecha/lectura/estrellas → imagen → índice (de tus `##`) → «En resumen» → contenido → tarjeta CTA del servicio → FAQ → autor → «¿Te resultó útil?» (estrellas) → comentarios → relacionados.

**Ajustes del sitio** (`content/site.md`, slug `general`): ver el propio archivo.

## 3. Bloques (`layout`)

Cada bloque lleva `_type` y sus campos. Los campos marcados `md` aceptan Markdown (se convierten a texto enriquecido). CTA = trío `*_label`, `*_action` (`cotizar` | `whatsapp` | `llamar` | `enlace`) y `*_url` (solo para `enlace`).

| `_type` | Uso | Campos |
|---|---|---|
| `hero` | Portada (solo páginas, el primero es el H1) | `variant` (`dividido` \| `foto-completa` \| `centrado`), `eyebrow`, `title`, `highlight` (palabras del título que van en degradado), `subtitle`, `image`, CTA `primary_*`, CTA `secondary_*`, `badges` (líneas), `card_title`, `card_text` (tarjeta flotante sobre la foto), `shortcuts_title` (con texto, muestra atajos a los servicios), `show_form` (bool) |
| `trust_bar` | Franja de garantías | `items: [{ icon, text }]` |
| `services_grid` | Servicios automáticos | `eyebrow`, `title`, `highlight`, `subtitle`, `mode` (`todos` \| `destacados`), `limit`, `style` (`tarjetas-foto` \| `lista-compacta`) |
| `card_carousel` | Carrusel de tarjetas con foto | `eyebrow`, `title`, `highlight`, `subtitle`, `items: [{ tag, title, text, image, url, link_label }]` |
| `steps` | Pasos numerados | `eyebrow`, `title`, `highlight`, `subtitle`, `items: [{ icon, title, text }]`, CTA `cta_*` |
| `feature_grid` | Beneficios | `eyebrow`, `title`, `highlight`, `subtitle`, `layout` (`bento` \| `cuadricula` \| `lista`), `tone` (`claro` \| `arena` \| `bruma` \| `oscuro`), `image` (bento), `items: [{ icon, title, text }]` |
| `media_text` | Imagen + texto | `eyebrow`, `title`, `highlight`, `body` (md), `image`, `image_side` (`derecha` \| `izquierda`), `tone`, `bullets` (líneas), CTA `cta_*` |
| `tabs_media` | Pestañas sobre una foto | `eyebrow`, `title`, `highlight`, `subtitle`, `image`, `tabs: [{ label, title, body }]` (en `body`, viñetas con `- `) |
| `pricing` | Precios «desde» | `eyebrow`, `title`, `highlight`, `subtitle`, `note`, `plans: [{ name, price, unit, description, features (líneas), cta_label, highlighted }]` |
| `zones_grid` | Zonas automáticas + mapa | `eyebrow`, `title`, `highlight`, `subtitle`, `note` |
| `comparison` | Tabla comparativa | `eyebrow`, `title`, `highlight`, `subtitle`, `col_a` (Sovialis), `col_b`, `col_c`, `rows: [{ feature, a, b, c }]` («Sí» / «No» se pintan como iconos) |
| `testimonials` | Testimonios **reales** | No usar en v1 (no hay testimonios verificados). |
| `stats` | Cifras **reales** | No usar en v1 salvo datos verificables (p. ej. «7 días a la semana»). |
| `faq` | FAQ dentro del cuerpo | `eyebrow`, `title`, `highlight`, `subtitle`, `items: [{ question, answer }]` (normalmente usa el campo `faqs` y no este bloque) |
| `cta_band` | Cierre / llamado | `variant` (`oscuro` \| `claro` \| `imagen`), `eyebrow`, `title`, `highlight`, `text`, `image`, CTA `primary_*`, CTA `secondary_*` |
| `lead_form` | Formulario en la página | `eyebrow`, `title`, `highlight`, `text`, `bullets`, `service` (slug), `image` |
| `blog_latest` | Últimas guías | `eyebrow`, `title`, `highlight`, `limit`, `category` |
| `rich_text` | Texto libre | `body` (md), `width` (`lectura` \| `amplio`) |

## 4. Iconos permitidos

`corazon, escudo, reloj, luna, sol, casa, hospital, calendario, usuarios, usuario, estrella, check, telefono, whatsapp, ubicacion, cerebro, venda, manos, cama, silla-ruedas, documento, chat, sparkles, medalla, familia, cafe, pastillas, brujula`.

## 5. SEO on-page (obligatorio en cada URL)

1. **Title** (`seo.title`) ≤ 60 caracteres, keyword principal al inicio, marca al final («| Sovialis») si cabe. Copia el de `sitemap.json` salvo que lo mejores sin perder la keyword.
2. **Meta description** (`seo.description`) 120–155 caracteres: keyword + beneficio concreto + llamada («Cotiza hoy por WhatsApp»).
3. **H1** (`title`): contiene la keyword principal o su variante natural; distinto del title (no copia exacta).
4. **Primeras 100 palabras**: la keyword principal aparece una vez, en una frase que responde la intención (respuesta primero).
5. **H2**: sigue el esquema de `sitemap.json` (`h2`); al menos uno contiene la keyword o una secundaria. Nada de H2 genéricos («Introducción», «Conclusión»).
6. **Secundarias**: cada una aparece 1–2 veces donde encaje de verdad (H2, H3, párrafos, alt, FAQ). Densidad de la principal ≈ 0,8–1,5 %; nunca la repitas en frases seguidas.
7. **Canibalización**: no uses como foco keywords que pertenecen a otra URL (matriz §6 de la arquitectura). Si las mencionas, enlaza a su dueña con el ancla indicada.
8. **Enlaces internos**: incluye todos los de `internalLinks` de la ficha con su ancla (puedes variar ligeramente el ancla para que suene natural). 3–8 enlaces contextuales por página.
9. **FAQ**: usa exactamente las preguntas de la ficha (`faqs[].q`); amplía su `a_brief` a 40–80 palabras, respuesta directa en la primera frase. Ninguna pregunta se repite en otra página.
10. **GEO / IA**: párrafos que se puedan citar solos («Una cuidadora de turno nocturno en Bogotá cuesta desde $190.000 por 12 horas…»), definiciones claras, listas y tablas con datos concretos, entidades consistentes (Sovialis, Bogotá, norte de Bogotá, nombres de clínicas y barrios bien escritos).
11. **Longitud orientativa**: servicio 1.100–1.600 palabras sumando bloques y cuerpo; zona 700–1.000 (con contenido local único); guía cornerstone 1.800–2.800; guía de apoyo 1.200–1.800; home 900–1.300.

## 6. Imágenes disponibles (claves `media`)

| Clave | Escena | Proporción |
|---|---|---|
| `home-hero` | Cuidadora y señora mayor en apartamento luminoso del norte de Bogotá | 4:5 |
| `nuestro-cuidado` | Momento cotidiano cálido (lectura, té, conversación) | 4:5 |
| `servicio-cuidadora` | Turno de día: cuidadora acompaña a un señor mayor en casa | 3:2 |
| `servicio-auxiliar` | Persona con formación de auxiliar ayudando a caminar con andador | 3:2 |
| `servicio-por-horas` | Paseo corto / compañía por la tarde | 3:2 |
| `servicio-nocturno` | Habitación en penumbra, lámpara cálida, acompañamiento nocturno | 3:2 |
| `servicio-24-horas` | Rutina de mañana en casa (desayuno) con cuidadora interna | 3:2 |
| `servicio-citas` | Acompañamiento a cita médica, sala de espera moderna | 3:2 |
| `servicio-hospitalario` | Acompañante junto a la cama en habitación de clínica | 3:2 |
| `servicio-postoperatorio` | Señora en recuperación en sofá, cuidadora con manta y agua | 3:2 |
| `servicio-alzheimer` | Actividad con álbum de fotos / estimulación cognitiva | 3:2 |
| `como-funciona-1`, `como-funciona-2`, `como-funciona-3` | Llamada inicial · visita de valoración · inicio del servicio | 1:1 |
| `nosotros-equipo` | Coordinación revisando agenda (provisional, se reemplaza por foto real) | 3:2 |
| `cta-familia` | Hija adulta abrazando a su madre mayor, tranquilidad | 3:2 |
| `zona-usaquen`, `zona-cedritos`, `zona-chapinero`, `zona-chico`, `zona-suba`, `zona-niza`, `zona-norte` | Calles/parques reconocibles de cada zona (sin marcas) | 16:9 |
| `trabaja-con-nosotros` | Cuidadora sonriente lista para su servicio | 3:2 |
| `blog-<slug-del-articulo>` | Imagen destacada de cada guía (una por artículo v1) | 16:9 |
| `blog-default` | Imagen genérica de guías | 16:9 |

## 7. Categorías y etiquetas del blog

`contratar-cuidado`, `costos-y-alternativas`, `cuidados-y-salud-en-casa`, `eps-derechos-y-tramites`, `bienestar-y-cuidador-familiar`. Etiquetas: minúsculas, 2–5 por artículo, reutilízalas entre artículos.

## 8. Voz y naturalidad (español de Bogotá)

- **Tú** cercano y respetuoso con la familia («tu mamá», «tu familiar»); la persona mayor es protagonista con dignidad: nunca «abuelito», «viejito», «paciente» (salvo contexto clínico de la guía).
- Frases cortas y variadas; voz activa; verbos concretos. Un dato concreto vale más que tres adjetivos.
- Detalle local real: localidades, barrios, clínicas (Fundación Santa Fe, Clínica del Country, Clínica Reina Sofía, Fundación Cardioinfantil, Clínica Colsanitas Universitaria, Clínica de Marly, Hospital Simón Bolívar…), vías (Autopista Norte, Séptima, Calle 100, Boyacá), clima de Bogotá, distancias reales.
- Formato colombiano: `$160.000`, `12 h`, `7:00 a. m.`, «comillas latinas», fechas «4 de octubre de 2026».
- **Evita frases de IA**: «En el mundo actual», «Es importante destacar», «Sin lugar a dudas», «En resumen,» al inicio de párrafo, «Además,» encadenado, «garantizar el bienestar integral», «brindar una atención de calidad», «navegar», «sumergirse», «un viaje», «en definitiva», listas de tres adjetivos, preguntas retóricas en cada H2, guiones largos en exceso. Nada de emojis.
- Lee en voz alta: si suena a folleto, reescribe con un ejemplo concreto de una familia (sin inventar casos reales: «Si tu papá vive en Cedritos y tiene cita en la Santa Fe a las 7:00 a. m.…»).

## 9. Límites legales (no negociables)

Sovialis **no es IPS**. Resumen de §2 de la arquitectura:

- Prohibido en title, H1, meta, H2 y CTAs de páginas transaccionales (servicios, zonas, home, precios): «enfermera/enfermeras a domicilio», «servicio de enfermería», «enfermería domiciliaria», «home care», «inyectología», «inyecciones», «insulina», «sueros», «curaciones», «sondas», «oxígeno», «toma de muestras», «signos vitales», «procedimientos».
- Fórmula permitida: «cuidado por **personal con formación de auxiliar de enfermería**»; «auxiliar de enfermería» como perfil.
- Procedimientos de salud solo en «qué no incluye» y en guías: «los realiza tu EPS o una IPS habilitada, con la que contratas directamente».
- Vocabulario (Decreto 0581): no «nuestras empleadas», «turnos asignados», «supervisamos», «jefe», «uniforme», «dotación». Sí: «personas verificadas», «relevos coordinados», «seguimiento del servicio con la familia», «plan de cuidado», «cuidadoras independientes que coordinamos».
- Reclutamiento: «servicios», «honorarios», «disponibilidad», «postúlate»; nunca «empleo», «salario», «jornada», «vacante».
- Garantías: «reemplazo en el plazo acordado y sin cobro del tiempo no prestado». Nunca «garantía de reemplazo», «las mejores cuidadoras», «100 %».
- **Nada inventado**: ni testimonios, ni cifras de familias, ni años de experiencia, ni calificaciones, ni certificaciones, ni premios. Si una ficha pide prueba social, escribe el proceso (selección, verificación de referencias y antecedentes) en lugar de números.
- Zonas: solo norte, noroccidente y Sabana; nunca menciones el sur ni zonas «peligrosas». «Confirmamos la cobertura de tu dirección.»
- Datos de salud: el formulario no los pide; en los textos invita a contar el caso por WhatsApp «sin diagnósticos».

## 10. Precios (finales, IVA incluido, «desde»; fuente: herramienta → tarifas)

| Servicio | Cuidadora | Auxiliar (formación de auxiliar de enfermería) |
|---|---|---|
| Por horas (mínimo 4 h) | $20.000 por hora | $25.000 por hora |
| Turno de 8 h de día | $120.000 | $135.000 |
| Turno de 12 h de día | $160.000 | $180.000 |
| Turno de 12 h de noche | $190.000 | $215.000 |
| 24 h (interna) | $300.000 | $340.000 |

Domingos y festivos tienen recargo. Siempre: «Precios de referencia 2026, IVA incluido. El valor final depende del horario, los días y las necesidades de tu familiar; te lo confirmamos por escrito antes de empezar.»

## 11. Validación

```bash
node scripts/validate-content.mjs            # todo el contenido
node scripts/validate-content.mjs services   # una colección
```

Revisa longitudes de title/meta, keyword en title/H1/primer párrafo, términos prohibidos, FAQs duplicadas en el sitio, imágenes con alt, enlaces internos a URLs existentes y YAML válido. Corrige todos los errores; los avisos se revisan con criterio.
