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
