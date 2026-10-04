# Sovialis · Reporte de fotografía generada (v1)

> **Fecha:** 4 de octubre de 2026 · **Proceso:** skill `imagenes-ultrarrealistas` (prompt documental → 2 candidatos → juez escéptico → recorte → export) · **Briefs:** `diseno-referencias.md` §8 y `CONTENT-GUIDE.md` §6.
> **Entregado:** 37/37 claves de `content/media/manifest.json` en WebP + imagen Open Graph por defecto `public/og/sovialis-og.jpg`.

## 1. Bake-off de modelos (OpenAI Images API, calidad `high`)

Mismos 2 prompts (hero de la home 1024×1536 y escena de servicio en cocina 1536×1024) en 4 modelos, un candidato por modelo. Revisión a resolución completa con recortes de caras, manos y objetos.

| Modelo | Piel / caras | Manos | Objetos locales | Sensación general |
|---|---|---|---|---|
| `gpt-image-2.5-flare` | Natural, poros y arrugas creíbles; algo pulida | Correctas | Tablero tipo «ludo» genérico | Limpia, un punto «catálogo» |
| `gpt-image-2.5-sunburst` | La textura más marcada; arrugas algo sobreafiladas | Correctas | Parqués mezclado con dado; cocina muy cargada | Muy real, a veces recargada |
| **`gpt-image-2`** | Natural, luz suave de ventana, sin plástico | Correctas (nudillos, uñas) | **Parqués más verosímil**, arepas con marcas de parrilla | **La más documental**: gestos no posados, encuadre de reportaje |
| `chatgpt-image-latest` | Buena textura; sonrisas más «de stock» | Correctas | Correctos | Correcta; además solo admite 1024/1536 px |

**Elección: `gpt-image-2`** (snapshot `gpt-image-2-2026-04-21`). Los cuatro quedaron cerca, sin artefactos duros. Ganó por el tono documental y los objetos locales verosímiles. Además acepta cualquier tamaño múltiplo de 16 hasta 3840 px de lado, así que se generó directamente en la proporción de cada hueco (1600×2000, 1920×1280, 2048×1152, 1280×1280) y solo se reduce, nunca se amplía. Segundo lugar: `sunburst`. No hizo falta recurrir a él: ninguna clave falló dos veces.

## 2. Método y cifras

- **84 imágenes generadas:** 8 del bake-off, 74 de la ronda 1 (2 candidatos × 37 claves) y 2 de la ronda 2 (Usaquén).
- **Prompt base** (bloque base + escena + cierre fijo del brief §8), con dos ajustes de dirección de arte: la cuidadora viste **ropa cotidiana azul suave y blanca, nunca scrubs ni uniforme** (también por el vocabulario del Decreto 0581), y las zonas usan un bloque de exterior sin caras en primer plano. El prompt final exacto de cada clave está en `manifest.json → items.<clave>.prompt`.
- **Juez escéptico:** se revisaron los dos candidatos de cada clave a resolución completa, con recortes de caras, manos, objetos, fondos, texto y placas. Correcciones aplicadas:
  - `zona-usaquen`: la ronda 1 mostraba una plaza enorme y empedrada, más parecida a Villa de Leyva. Se regeneró como un parque arbolado con la iglesia blanca y los cerros, que es la escala real de Usaquén.
  - `servicio-24-horas`: se descartó el candidato 1 porque el chocolate salía por el borde equivocado de la chocolatera (error físico).
  - `home-hero`: se eligió el candidato con la esquina inferior izquierda despejada para la tarjeta superpuesta.
  - `zona-cedritos`: se difuminaron la placa y el emblema de un carro lejano (difuminado gaussiano de 2 px, invisible a tamaño normal).
- **Export:** WebP con `method=6` y **sin metadatos** (EXIF, ICC y XMP quitados y verificados por chunks). Calidad 78 en interiores. En 5 zonas y en `blog-default` se aplicó un desenfoque de 0,5 px antes de codificar, porque el grano del follaje inflaba el archivo; así se llega a calidad 70–78 sin pasar de 220 KB. El peso total es de **4,5 MB** para 37 archivos.
- **Originales PNG** en el scratchpad de la sesión (`…/scratchpad/img/raw`, 282 MB; bake-off en `…/img/bake`), fuera del proyecto. **Ese directorio es temporal:** si quieres conservarlos, cópialos a un archivo propio.
- **Desviaciones del skill:**
  1. Solo se usó OpenAI (Nano Banana no estaba en el encargo).
  2. **No se usaron fotos de referencia reales** porque el encargo pedía `/images/generations`. Para las zonas, unas referencias CC de Wikimedia (con `/images/edits`) darían más fidelidad local.

## 3. Estado por clave

| Clave | Proporción | KB | Candidato | Estado | Nota del juez |
|---|---|---|---|---|---|
| `home-hero` | 4:5 | 120 | r1-1 | ok | Caras luminosas y naturales, manos correctas; esquina inferior izquierda tranquila (mesa) para la tarjeta superpuesta; tablero de parqués algo confuso pero fuera de foco |
| `nuestro-cuidado` | 4:5 | 148 | r1-2 | ok | Balcón con sol cálido; ella lleva la conversación con su café; la señora se ve delgada pero digna |
| `servicio-cuidadora` | 3:2 | 138 | r1-2 | ok | Cocina con papaya y arepas; manos y cuchillo correctos; ambos sonríen |
| `servicio-auxiliar` | 3:2 | 90 | r1-1 | ok | Andador en pasillo luminoso, mano de la cuidadora cerca sin sujetar; cerros al fondo |
| `servicio-por-horas` | 3:2 | 174 | r1-1 | ok | Paseo del brazo en parque arbolado; carros grises desenfocados al fondo, sin placas legibles |
| `servicio-nocturno` | 3:2 | 83 | r1-1 | ok | Lámpara cálida, persona dormida al fondo en cama de casa; sin pantallas |
| `servicio-24-horas` | 3:2 | 132 | r1-2 | ok | Chocolatera con chorro coherente (el candidato 1 vertía desde el borde equivocado); arepa, queso, papaya |
| `servicio-citas` | 3:2 | 116 | r1-2 | ok | Sala de espera con listones de madera, sin letreros; acompañante con chaqueta azul marino |
| `servicio-hospitalario` | 3:2 | 133 | r1-2 | ok | Habitación privada sin equipos médicos; cama tipo hotel |
| `servicio-postoperatorio` | 3:2 | 131 | r1-1 | ok | Sofá, manta y vaso de agua; sin vendajes |
| `servicio-alzheimer` | 3:2 | 114 | r1-2 | ok | Álbum de fotos, fotos ilegibles |
| `como-funciona-1` | 1:1 | 54 | r1-2 | ok | Llamada, gesto de alivio |
| `como-funciona-2` | 1:1 | 77 | r1-2 | ok | Visita de valoración, tres personas |
| `cta-familia` | 3:2 | 111 | r1-2 | ok | Abrazo hija-madre; tercio izquierdo libre |
| `nosotros-equipo` | 3:2 | 98 | r1-1 | **provisional** | Coordinación revisando agenda; PROVISIONAL: reemplazar por foto real |
| `trabaja-con-nosotros` | 3:2 | 111 | r1-1 | ok | Cuidadora camino a su servicio, calle de ladrillo y cerros |
| `como-funciona-3` | 1:1 | 102 | r1-1 | ok | Balcón regando plantas, torres de ladrillo |
| `zona-norte` | 16:9 | 194 | r1-2 | ok | Panorámica ladrillo + vidrio con cerros |
| `zona-usaquen` | 16:9 | 212 | r2-1 | ok | Ronda 2: plaza arbolada con iglesia blanca y cerros; la ronda 1 parecía una plaza grande tipo Villa de Leyva |
| `zona-cedritos` | 16:9 | 211 | r1-2 | ok | Placa y emblema del carro lejano difuminados; Calle arbolada con conjuntos de ladrillo |
| `zona-chapinero` | 16:9 | 194 | r1-1 | ok | Casas de ladrillo estilo inglés, cerros muy cerca |
| `zona-chico` | 16:9 | 191 | r1-1 | ok | Parque con prado y edificios de ladrillo |
| `zona-suba` | 16:9 | 199 | r1-1 | ok | Humedal con garza, cerro de Suba con antenas |
| `zona-niza` | 16:9 | 219 | r1-2 | ok | Avenida con separador arbolado y ciclorruta |
| `blog-default` | 16:9 | 47 | r1-1 | ok | Bodegón: aromática, gafas, cuaderno; tercio derecho libre |
| `blog-cuanto-cobra-una-enfermera-a-domicilio` | 16:9 | 142 | r1-1 | ok | Pareja hace cuentas con calculadora; madre lee al fondo |
| `blog-como-contratar-una-cuidadora` | 16:9 | 103 | r1-1 | ok | Entrevista en la sala con el papá participando |
| `blog-enfermera-o-cuidadora-a-domicilio` | 16:9 | 130 | r1-1 | ok | Cuidadora ayuda a ponerse el saco; ella elige la ropa |
| `blog-hogar-geriatrico-o-cuidado-en-casa` | 16:9 | 116 | r1-2 | ok | Señor en su sillón entre sus libros y discos |
| `blog-eps-cuidador-en-casa` | 16:9 | 68 | r1-1 | ok | Hijo organiza papeles al teléfono; madre al fondo |
| `blog-que-es-un-acompanante-permanente` | 16:9 | 99 | r1-2 | ok | Ajedrez junto a la ventana |
| `blog-cuidados-postoperatorios-en-casa` | 16:9 | 105 | r1-2 | ok | Sillón reclinable, pierna en alto, bandeja con sopa |
| `blog-cuidar-adulto-mayor-con-alzheimer-en-casa` | 16:9 | 112 | r1-2 | ok | Doblar toallas juntas |
| `blog-inyectologia-a-domicilio-bogota` | 16:9 | 60 | r1-1 | ok | Profesional llega a la puerta con maletín; ningún procedimiento |
| `blog-actividades-para-adultos-mayores` | 16:9 | 93 | r1-1 | ok | Acuarela de flores |
| `blog-ejercicios-para-adultos-mayores-en-casa` | 16:9 | 119 | r1-1 | ok | Banda elástica sentadas |
| `blog-leyes-y-derechos-del-adulto-mayor` | 16:9 | 86 | r1-1 | ok | Padre e hija leen documentos (ilegibles) |

## 4. Debilidades: qué conviene reemplazar por fotografía real

1. **`nosotros-equipo` (obligatorio).** Es provisional. Según la regla 11 del brief, el equipo de «Nosotros» debe ser real. Reemplazar antes del lanzamiento por la sesión real descrita en el brief 09 (retratos, foto grupal, rutina y oficina, con consentimiento escrito).
2. **`trabaja-con-nosotros` y `como-funciona-2`.** Muestran a «una cuidadora» y a «una coordinadora» que el visitante puede leer como personal de Sovialis. Mientras sean IA, no deben ir con nombres ni presentarse como «nuestro equipo». Lo ideal es reemplazarlas por fotos reales de la sesión del punto 1.
3. **Zonas (`zona-*`).** Son recreaciones verosímiles pero genéricas, no lugares exactos. Usaquén y Chapinero Alto se reconocen por el estilo, pero un bogotano puede notar que no es «su» calle. Para SEO local y credibilidad, valdría la pena sustituirlas con el tiempo por fotos propias o con licencia CC (Wikimedia) de cada zona.
4. **Detalles menores aceptados:**
   - el tablero de parqués del hero es algo confuso, pero está fuera de foco;
   - la señora de `nuestro-cuidado` se ve delgada (digna, no frágil);
   - en `servicio-hospitalario` la cama parece de hotel, sin equipos (intencional por la regla legal);
   - en `servicio-24-horas` la camisa de la cuidadora tiene cuello y botones, ropa cotidiana y no uniforme.

## 5. Pendientes legales y de implementación

- Publicar con la nota **«Imágenes ilustrativas»** (pie de página y ficha de imagen), como exige el brief §8.
- El brief pide el metadato IPTC `DigitalSourceType: trainedAlgorithmicMedia`, pero el encargo pedía quitar todos los metadatos y por eso los WebP no lo llevan. Si se quiere cumplir el brief, se puede añadir un XMP mínimo en el pipeline de build (cuesta pocos bytes) o declarar el origen en el JSON-LD de la imagen.
- `blog-inyectologia-a-domicilio-bogota` muestra solo la **llegada** de una profesional con maletín liso a la puerta, sin ningún procedimiento. Esto cumple la restricción legal de que Sovialis no es IPS.

## 6. Open Graph por defecto

- **Archivo:** `public/og/sovialis-og.jpg`, 1200×630, JPEG calidad 82, progresivo, 89 KB.
- **Base:** la foto de `cta-familia` (hija abrazando a su madre), recortada a 1,91:1.
- **Degradado:** `#0B2A4E` con opacidad 0,85 a la izquierda, constante hasta 300 px y luego un desvanecimiento suave (smoothstep) hasta 0 a los 730 px. Así el logo se lee bien y las caras quedan sin tinte.
- **Logo:** `sovialis-logo-completo-negativo.svg`, renderizado con `resvg` a **420 px** (no 460) para no tapar el hombro de la hija. Margen izquierdo de 64 px y centrado vertical. Sin otro texto.

## 7. v2 — uniformes de marca y zonas (4 de octubre de 2026)

> **Estado:** completo. Las 46 claves del manifest tienen archivo.
> - Se regeneraron 37 claves con **Gemini (`gemini-3-pro-image`)**.
> - Se mantienen 3 claves v2 de `gpt-image-2`: `servicio-citas`, `trabaja-con-nosotros` y `blog-que-es-un-acompanante-permanente`.
> - Quedan 6 claves v1 sin personal: `como-funciona-1`, `cta-familia`, `blog-default`, `blog-cuanto-cobra-una-enfermera-a-domicilio`, `blog-eps-cuidador-en-casa` y `blog-leyes-y-derechos-del-adulto-mayor`.
> - Se agregaron 9 claves nuevas: `tab-incluye`, `tab-no-incluye` y las 7 zonas nuevas.
>
> **Cronología.** La primera tanda se hizo con OpenAI `gpt-image-2` y entregó 17 claves. La cuenta de OpenAI de Sovialis se quedó sin saldo (`credit_balance_exhausted`). JP autorizó entonces Gemini (cuenta Connexis), que superó a gpt-image-2 en realismo y reemplazó casi todo.

### 7.1 Dirección de arte

- **Cuidadora:** mujer joven colombiana (24–35 años) con conjunto tipo scrub **vino tinto (#7A1F3D)** de tela antifluido mate, camiseta blanca de manga larga debajo, tenis cerrados y el logo pequeño en el pecho izquierdo. Sin cofia, estetoscopio, guantes ni escarapela.
- **Personal con formación de auxiliar:** el mismo corte en **azul oscuro (#0B2A4E)**. Se usa en `servicio-auxiliar`.
- **Coordinación:** chaqueta sastre azul oscuro con el logo pequeño (`tab-no-incluye`, `nosotros-equipo`).
- Las personas mayores nunca visten vino tinto ni azul oscuro, para que el uniforme se lea solo en quien cuida.
- **Zonas:** cuidadora vino tinto y persona mayor de paseo, en plano medio-general, con el sector reconocible (ladrillo, cerros, parque o avenida típicos). No hay paisajes vacíos.
- **Escenas alineadas con el `alt` del front matter que las cita:**
  - `como-funciona-2`: la familia recibe en la puerta a la cuidadora, que está afuera.
  - `blog-que-es-un-acompanante-permanente`: clínica.
  - `blog-como-contratar-una-cuidadora`: cocina.
  - `blog-enfermera-o-cuidadora-a-domicilio`: levantarse del sillón.
  - `blog-hogar-geriatrico-o-cuidado-en-casa`: madre e hija, sin cuidadora.
  - `blog-inyectologia-a-domicilio-bogota`: madre e hija revisan una orden médica. No aparece personal con logo, porque Sovialis no aplica inyecciones.
  - `blog-actividades-para-adultos-mayores`: balcón.
  - `blog-ejercicios-para-adultos-mayores-en-casa`: levantarse de la silla.
  - `blog-cuidar-adulto-mayor-con-alzheimer-en-casa`: señor con álbum.

### 7.2 Logo con imagen de referencia

**Imagen de referencia**
- Se usó `sovialis-logotipo-negativo.svg` (S azul claro + OVIALIS en blanco, sin lema), renderizado con `resvg` sobre una muestra de 1024 px del color de la tela: `v2/logo/ref-vino.png` o `ref-navy.png`.
- Se envía en la misma petición que el prompt.

**OpenAI (`gpt-image-2`)**
- Endpoint `/v1/images/edits`.
- **No acepta `input_fidelity`**: devuelve `400 invalid_input_fidelity_model`. Sin ese parámetro funciona.

**Gemini (`gemini-3-pro-image`)**
- Endpoint `generateContent`, con el PNG como `inline_data` y `imageSize: 2K`.
- Tamaños de salida: 2528×1696 (3:2), 1856×2304 (4:5), 2048×2048 (1:1) y 2752×1536 (16:9). Se recorta a la proporción exacta y siempre se reduce.

**Resultado**
- El logo sale legible y pequeño en todas las fotos. Gemini suele apilarlo (S encima y SOVIALIS debajo) en lugar de la versión horizontal. Es fiel en forma y color, y aceptable.
- Defectos que se corrigieron:
  - `servicio-nocturno` g1: S deformada como «§». Se repitió una vez (g2), con el logo correcto.
  - `servicio-auxiliar`: Gemini inventó una plaquita de nombre con letras. Se borró clonando la tela de al lado: es un retoque local de unos 30×20 px, sin nueva llamada.
- **Limitación:** el logo se ve más como estampado o transfer que como bordado con relieve.
- La palabra «uniforme» no aparece en los `alt` porque `validate-content.mjs` la prohíbe.

### 7.3 Método Gemini (ahorro de créditos)

**Prompt**
- Plantilla corta (`promptsg.py`), de unos 2.200 caracteres frente a los ~3.800 de la versión OpenAI.
- Se arma con estos bloques: cabecera fotográfica, nota del logo, lugar, escena concreta, vestuario y lista de «evitar».

**Orden de trabajo**
1. Una prueba (`servicio-cuidadora`) revisada a resolución completa.
2. Ajuste del prompt para el orden horizontal del logo.
3. Lote de servicios.
4. Prueba de una zona (`zona-teusaquillo`).
5. Lote de zonas, blog y `nosotros-equipo`.

**Llamadas**
- **42 llamadas a `gemini-3-pro-image`, todas exitosas** (registro en `…/scratchpad/img/calls-gemini.log`).
- Reparto:

  | Uso | Llamadas |
  |---|---|
  | Prueba inicial | 1 |
  | Servicios y pestañas | 15 |
  | Repeticiones | 3 |
  | Prueba de zona | 1 |
  | Lote final | 22 |

- Las 3 repeticiones fueron por defectos reales:
  - `home-hero`: la cuidadora salió de pie y el tablero de damas no era parqués.
  - `servicio-por-horas`: apareció una segunda cuidadora duplicada.
  - `servicio-nocturno`: logo deforme.

**Placas y emblemas**
- Las placas amarillas legibles y los emblemas de carros (Chevrolet, Renault) se difuminaron con desenfoque gaussiano de 7 px en el PNG antes de exportar, en estas zonas: `zona-cedritos`, `zona-chapinero`, `zona-chico`, `zona-suba`, `zona-niza`, `zona-fontibon` y `zona-santa-barbara`.

**Export**
- Igual que en v1: `method=6`, sin metadatos (verificado por chunks), calidad 70–78 y ≤220 KB. En 4 zonas se aplicó un desenfoque de 0,5 px por el follaje.
- Las 46 claves pesan 5,9 MB en total.

**Respaldos y originales**
- Respaldos: `…/scratchpad/img/v2/backup-v1/` (antes de v2) y `…/v2/backup-pre-gemini/` (WebP y manifest antes de Gemini).
- PNG originales: `…/raw-v2/` (OpenAI) y `…/raw-v2g/` (Gemini).

### 7.4 Estado por clave (v2)

| Clave | Modelo | Toma | KB | Nota del juez |
|---|---|---|---|---|
| `home-hero` | Gemini | g2 | 87 | Parqués de madera con fichas; ella ríe y dirige el juego; las dos sentadas; logo apilado. Sustituye a la versión gpt, más «plástica» |
| `nuestro-cuidado` | Gemini | g1 | 104 | Galería con plantas y cerros; ella cuenta la historia con la mano; piel muy real (se ve mayor, pero activa) |
| `servicio-cuidadora` | Gemini | g1 | 109 | La mejor del lote: risa espontánea, tinto, rompecabezas, ventanal con torres de ladrillo y cerros |
| `servicio-auxiliar` | Gemini | g1 + retoque | 81 | Azul oscuro; andador; mano cerca sin sujetar; plaquita de nombre borrada |
| `servicio-por-horas` | Gemini | g2 | 216 | Parque con eucaliptos, torres y cerros; plano más abierto; ella señala |
| `servicio-nocturno` | Gemini | g2 | 104 | Noche con ciudad iluminada por la ventana; lámpara; logo correcto en la segunda toma |
| `servicio-24-horas` | Gemini | g1 | 100 | Chorro de chocolate coherente; arepa con mantequilla, queso y papaya |
| `servicio-citas` | gpt-image-2 | r1-2 | 175 | **Se conserva:** en la versión Gemini la cuidadora estira el brazo hacia la carpeta en un gesto forzado |
| `servicio-hospitalario` | Gemini | g1 | 106 | Habitación cálida, sin equipos. La señora se ve de unos 70 |
| `servicio-postoperatorio` | Gemini | g1 | 110 | Vaso de agua y manta; manos correctas |
| `servicio-alzheimer` | Gemini | g1 | 130 | Foto antigua en la mano y álbum; la cuidadora un poco más apartada que en la versión gpt |
| `como-funciona-2` | Gemini | g1 | 68 | **Resuelve la reserva v2:** la cuidadora está afuera sobre el tapete; la hija abre y la mamá se acerca con bastón |
| `como-funciona-3` | Gemini | g1 | 105 | Riego de geranios en el balcón con torres y cerros |
| `trabaja-con-nosotros` | gpt-image-2 | r1-2 | 108 | **Se conserva:** en la versión Gemini camina por la mitad de la calzada |
| `tab-incluye` | Gemini | g1 | 69 | Del brazo con bastón, sala-pasillo con ventanal |
| `tab-no-incluye` | Gemini | g1 | 97 | Coordinadora con chaqueta y logo; hija leyendo el plan (texto ilegible) |
| `nosotros-equipo` | Gemini | g1 | 93 | Dos coordinadoras con chaqueta azul oscuro y logo. **Sigue siendo PROVISIONAL**: reemplazar por foto real |
| `zona-norte` | Gemini | g1 | 219 | Calle con andén de ladrillo, torres y cerros; él señala |
| `zona-usaquen` | Gemini | g1 | 205 | Plaza con la iglesia blanca de una torre, casas de balcón verde y cerros; escala correcta |
| `zona-cedritos` | Gemini | g1 | 176 | Conjuntos de ladrillo y cerros; plano medio más cercano que en las demás zonas; placa y emblemas difuminados |
| `zona-chapinero` | Gemini | g1 | 211 | Casas de ladrillo estilo inglés con hiedra y cerros con niebla; placa difuminada |
| `zona-chico` | Gemini | g1 | 193 | Calle arborizada con edificios de balcones y plantas; placas difuminadas |
| `zona-suba` | Gemini | g1 | 205 | Casas de ladrillo, zona verde y cerros de Suba; placas difuminadas |
| `zona-niza` | Gemini | g1 | 192 | Casas de dos pisos con antejardín y separador arborizado; placas difuminadas |
| `zona-teusaquillo` (nueva) | Gemini | g1 | 213 | Park Way con eucaliptos y casas inglesas a ambos lados; muy reconocible |
| `zona-barrios-unidos` (nueva) | Gemini | g1 | 178 | Lago del Parque de los Novios con patos y edificios de ladrillo |
| `zona-engativa` (nueva) | Gemini | g1 | 198 | Parque de barrio con sendero y bancas entre conjuntos de ladrillo |
| `zona-fontibon` (nueva) | Gemini | g1 | 216 | Avenida con ciclorruta roja, separador y conjuntos (Modelia); plano medio; placa difuminada |
| `zona-santa-barbara` (nueva) | Gemini | g1 | 217 | Edificios de ladrillo con jardineras y los cerros encima; placas y emblemas difuminados |
| `zona-colina-campestre` (nueva) | Gemini | g1 | 195 | Conjuntos nuevos, sendero y cerros de Suba con eucaliptos |
| `zona-calle-170` (nueva) | Gemini | g1 | 108 | Avenida amplia con separador, conjuntos y cerros |
| `blog-como-contratar-una-cuidadora` | Gemini | g1 | 81 | Cocina: la hija explica y el padre escucha con su café |
| `blog-enfermera-o-cuidadora-a-domicilio` | Gemini | g1 | 80 | Se levanta del sillón impulsándose ella misma |
| `blog-hogar-geriatrico-o-cuidado-en-casa` | Gemini | g1 | 87 | Madre e hija con folletos ilegibles |
| `blog-cuidados-postoperatorios-en-casa` | Gemini | g1 | 89 | Sofá, vaso de agua y manta |
| `blog-cuidar-adulto-mayor-con-alzheimer-en-casa` | Gemini | g1 | 99 | Señor con álbum junto a la cuidadora |
| `blog-inyectologia-a-domicilio-bogota` | Gemini | g1 | 63 | Madre e hija con una orden médica (texto ilegible) y bolsa blanca lisa; sin personal ni procedimientos |
| `blog-actividades-para-adultos-mayores` | Gemini | g1 | 127 | Balcón, riego; cuidadora afrocolombiana |
| `blog-ejercicios-para-adultos-mayores-en-casa` | Gemini | g1 | 96 | Se levanta de la silla apoyado en el brazo; la cuidadora lo acompaña |
| `blog-que-es-un-acompanante-permanente` | gpt-image-2 | r1-2 | 95 | Clínica (no estaba en el encargo Gemini) |

**Detalles menores aceptados**
- En algunas fotos aparece una etiqueta diminuta de prenda en la manga o el bolsillo (unos pocos px a tamaño web).
- `zona-cedritos` y `zona-fontibon` encuadran a la pareja más cerca que el resto de zonas, pero sin primer plano extremo.
- Los parches de difuminado sobre emblemas de carros se notan apenas como una mancha a tamaño completo.

### 7.5 Avisos

- **Sincronizador.** `scripts/sync-content.mjs` cachea los medios por clave en `scripts/.cache/media-*.json` y no compara el contenido del archivo. Por eso **no volverá a subir los WebP sobrescritos** mientras la clave siga en la caché. Antes de sincronizar hay que borrar de la caché las entradas de las claves regeneradas, o cambiar el script para que use un hash.
- **Legal (Decreto 0581).** El validador prohíbe «uniforme» y «dotación» por la presunción de laboralidad. Las fotos con uniforme de marca son una decisión explícita del cliente, pero conviene que el abogado lo tenga presente en el modelo OPS.
- **`alt` del front matter que no coinciden con imágenes que no se tocaron:**
  - `como-funciona-1`: el `alt` dice «mensaje en un café»; la foto es una llamada en casa.
  - `blog-leyes-y-derechos-del-adulto-mayor`: el `alt` dice «señora con su hijo»; la foto es un señor con su hija.
  - `blog-eps-cuidador-en-casa`: el `alt` dice «padre»; en la foto es la madre.
