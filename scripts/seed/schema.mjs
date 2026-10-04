/**
 * Esquema de contenido de Sovialis para EmDash: tipos de bloque (secciones editables),
 * colecciones, taxonomías, menús y ajustes. `scripts/build-seed.mjs` lo combina con el contenido.
 */

const f = (slug, label, type, extra = {}) => ({ slug, label, type, ...extra });
const select = (slug, label, options, extra = {}) => f(slug, label, "select", { validation: { options }, ...extra });
/** Select dentro de un repetidor: EmDash espera `options` en el subcampo, no en `validation`. */
const subSelect = (slug, label, options) => ({ slug, label, type: "select", options });

export const ICONS = [
	"corazon", "escudo", "reloj", "luna", "sol", "casa", "hospital", "calendario", "usuarios", "usuario",
	"estrella", "check", "telefono", "whatsapp", "ubicacion", "cerebro", "venda", "manos", "cama", "silla-ruedas",
	"documento", "chat", "sparkles", "medalla", "familia", "cafe", "pastillas", "brujula",
];
export const ACTIONS = ["cotizar", "whatsapp", "enlace", "llamar"];

const eyebrowTitle = [f("eyebrow", "Antetítulo", "string"), f("title", "Título", "string", { required: true }), f("highlight", "Palabras destacadas del título", "string")];
const cta = (prefix, label) => [
	f(`${prefix}_label`, `${label}: texto`, "string"),
	select(`${prefix}_action`, `${label}: acción`, ACTIONS),
	f(`${prefix}_url`, `${label}: enlace (si la acción es «enlace»)`, "string"),
];

/** Tipos de bloque: cada uno es una sección que el editor agrega, ordena y edita en cualquier página. */
export const blockTypes = [
	{
		slug: "hero",
		label: "Portada (hero)",
		fields: [
			select("variant", "Diseño", ["foto-completa", "dividido", "centrado"]),
			...eyebrowTitle,
			f("subtitle", "Subtítulo", "text"),
			f("image", "Imagen", "image"),
			...cta("primary", "Botón principal"),
			...cta("secondary", "Botón secundario"),
			f("badges", "Insignias (una por línea)", "text"),
			f("card_title", "Tarjeta flotante: título", "string"),
			f("card_text", "Tarjeta flotante: texto", "text"),
			f("shortcuts_title", "Atajos de servicios: título (vacío = sin atajos)", "string"),
			f("show_form", "Mostrar formulario corto (landings)", "boolean"),
		],
	},
	{
		slug: "trust_bar",
		label: "Franja de confianza",
		fields: [f("items", "Elementos", "repeater", { validation: { subFields: [subSelect("icon", "Icono", ICONS), f("text", "Texto", "string", { required: true })] } })],
	},
	{
		slug: "services_grid",
		label: "Servicios (automático)",
		fields: [...eyebrowTitle, f("subtitle", "Subtítulo", "text"), select("mode", "Mostrar", ["todos", "destacados"]), f("limit", "Máximo", "integer"), select("style", "Estilo", ["tarjetas-foto", "lista-compacta"])],
	},
	{
		slug: "card_carousel",
		label: "Carrusel de tarjetas con foto",
		fields: [
			...eyebrowTitle,
			f("subtitle", "Subtítulo", "text"),
			f("items", "Tarjetas", "repeater", {
				validation: {
					subFields: [f("tag", "Etiqueta", "string"), f("title", "Título", "string", { required: true }), f("text", "Texto", "text"), f("image", "Imagen", "image"), f("url", "Enlace", "string"), f("link_label", "Texto del enlace", "string")],
				},
			}),
		],
	},
	{
		slug: "steps",
		label: "Pasos (cómo funciona)",
		fields: [...eyebrowTitle, f("subtitle", "Subtítulo", "text"), f("items", "Pasos", "repeater", { validation: { subFields: [subSelect("icon", "Icono", ICONS), f("title", "Título", "string", { required: true }), f("text", "Texto", "text")] } }), ...cta("cta", "Botón")],
	},
	{
		slug: "feature_grid",
		label: "Beneficios (cuadrícula)",
		fields: [
			...eyebrowTitle,
			f("subtitle", "Subtítulo", "text"),
			select("layout", "Diseño", ["bento", "cuadricula", "lista"]),
			select("tone", "Fondo", ["claro", "arena", "bruma", "oscuro"]),
			f("image", "Imagen (bento)", "image"),
			f("items", "Elementos", "repeater", { validation: { subFields: [subSelect("icon", "Icono", ICONS), f("title", "Título", "string", { required: true }), f("text", "Texto", "text")] } }),
		],
	},
	{
		slug: "media_text",
		label: "Imagen + texto",
		fields: [
			...eyebrowTitle,
			f("body", "Texto", "portableText"),
			f("image", "Imagen", "image"),
			select("image_side", "Imagen a la", ["derecha", "izquierda"]),
			select("tone", "Fondo", ["claro", "arena", "bruma", "oscuro"]),
			f("bullets", "Viñetas (una por línea)", "text"),
			...cta("cta", "Botón"),
		],
	},
	{
		slug: "tabs_media",
		label: "Pestañas sobre imagen",
		fields: [
			...eyebrowTitle,
			f("subtitle", "Subtítulo", "text"),
			f("image", "Imagen", "image"),
			f("tabs", "Pestañas", "repeater", { validation: { subFields: [f("label", "Pestaña", "string", { required: true }), f("title", "Título", "string"), f("body", "Texto (viñetas con «- »)", "text")] } }),
		],
	},
	{
		slug: "pricing",
		label: "Precios desde",
		fields: [
			...eyebrowTitle,
			f("subtitle", "Subtítulo", "text"),
			f("note", "Nota al pie", "text"),
			f("plans", "Planes", "repeater", {
				validation: {
					subFields: [
						f("name", "Nombre", "string", { required: true }),
						f("price", "Precio desde (COP)", "integer"),
						f("unit", "Unidad (por turno, por hora…)", "string"),
						f("description", "Descripción", "text"),
						f("features", "Incluye (una por línea)", "text"),
						f("cta_label", "Texto del botón", "string"),
						f("highlighted", "Destacado", "boolean"),
					],
				},
			}),
		],
	},
	{
		slug: "zones_grid",
		label: "Zonas de cobertura (automático)",
		fields: [...eyebrowTitle, f("subtitle", "Subtítulo", "text"), f("note", "Nota", "text")],
	},
	{
		slug: "comparison",
		label: "Tabla comparativa",
		fields: [
			...eyebrowTitle,
			f("subtitle", "Subtítulo", "text"),
			f("col_a", "Columna A (destacada)", "string"),
			f("col_b", "Columna B", "string"),
			f("col_c", "Columna C", "string"),
			f("rows", "Filas", "repeater", { validation: { subFields: [f("feature", "Aspecto", "string", { required: true }), f("a", "A", "string"), f("b", "B", "string"), f("c", "C", "string")] } }),
		],
	},
	{
		slug: "testimonials",
		label: "Testimonios",
		fields: [
			...eyebrowTitle,
			f("items", "Testimonios", "repeater", {
				validation: { subFields: [f("quote", "Testimonio", "text", { required: true }), f("author", "Nombre", "string"), f("relation", "Relación (hija de…)", "string"), f("zone", "Barrio o zona", "string"), f("rating", "Estrellas (1–5)", "integer")] },
			}),
		],
	},
	{
		slug: "stats",
		label: "Cifras",
		fields: [f("items", "Cifras", "repeater", { validation: { subFields: [f("value", "Valor", "string", { required: true }), f("label", "Descripción", "string")] } })],
	},
	{
		slug: "faq",
		label: "Preguntas frecuentes",
		fields: [...eyebrowTitle, f("subtitle", "Subtítulo", "text"), f("items", "Preguntas", "repeater", { validation: { subFields: [f("question", "Pregunta", "string", { required: true }), f("answer", "Respuesta", "text", { required: true })] } })],
	},
	{
		slug: "cta_band",
		label: "Llamado a la acción",
		fields: [select("variant", "Estilo", ["oscuro", "claro", "imagen"]), ...eyebrowTitle, f("text", "Texto", "text"), f("image", "Imagen", "image"), ...cta("primary", "Botón principal"), ...cta("secondary", "Botón secundario")],
	},
	{
		slug: "lead_form",
		label: "Formulario en la página",
		fields: [...eyebrowTitle, f("text", "Texto", "text"), f("bullets", "Viñetas (una por línea)", "text"), f("service", "Servicio preseleccionado (slug)", "string"), f("image", "Imagen", "image")],
	},
	{
		slug: "blog_latest",
		label: "Últimos artículos del blog",
		fields: [...eyebrowTitle, f("limit", "Cantidad", "integer"), f("category", "Categoría (slug, opcional)", "string")],
	},
	{
		slug: "rich_text",
		label: "Texto libre",
		fields: [f("body", "Contenido", "portableText"), select("width", "Ancho", ["lectura", "amplio"])],
	},
].map(({ slug, label, fields }) => ({ slug, label, currentVersion: 1, versions: [{ version: 1, fields }] }));

const ALL_BLOCKS = blockTypes.map((b) => b.slug);
const faqs = f("faqs", "Preguntas frecuentes", "repeater", {
	validation: { subFields: [f("question", "Pregunta", "string", { required: true }), f("answer", "Respuesta", "text", { required: true })] },
});
const focus = f("focus_keyword", "Palabra clave principal (SEO)", "string");
const layout = f("layout", "Secciones", "blocks", { validation: { allowedTypes: ALL_BLOCKS, maxItems: 30 } });

export const collections = [
	{
		slug: "pages",
		label: "Páginas",
		icon: "file-text",
		sortOrder: 1,
		urlPattern: "/{slug}/",
		labelSingular: "Página",
		supports: ["drafts", "revisions", "preview", "search", "seo"],
		fields: [
			f("title", "Título (H1)", "string", { required: true, searchable: true }),
			f("summary", "Resumen", "text", { searchable: true }),
			layout,
			f("body", "Contenido", "portableText", { searchable: true }),
			faqs,
			focus,
		],
	},
	{
		slug: "services",
		label: "Servicios",
		icon: "heart-handshake",
		sortOrder: 2,
		urlPattern: "/servicios/{slug}/",
		admin: { listColumns: ["short_title", "price_from", "order"] },
		labelSingular: "Servicio",
		supports: ["drafts", "revisions", "preview", "search", "seo"],
		fields: [
			f("title", "Título (H1)", "string", { required: true, searchable: true }),
			f("short_title", "Nombre corto (menús y tarjetas)", "string"),
			select("menu_group", "Grupo en el menú", ["turno", "necesidad"]),
			select("icon", "Icono", ICONS),
			f("excerpt", "Resumen (tarjetas)", "text", { searchable: true }),
			f("price_from", "Precio desde (COP)", "integer"),
			f("price_unit", "Unidad del precio", "string"),
			f("hero_eyebrow", "Antetítulo de la portada", "string"),
			f("hero_subtitle", "Subtítulo de la portada", "text"),
			f("hero_image", "Imagen de portada", "image"),
			f("highlights", "Puntos clave (uno por línea)", "text"),
			layout,
			f("body", "Contenido adicional", "portableText", { searchable: true }),
			faqs,
			f("service_type", "Tipo de servicio (schema)", "string"),
			f("order", "Orden", "integer"),
			f("featured", "Destacado en el inicio", "boolean"),
			focus,
		],
	},
	{
		slug: "zones",
		label: "Zonas",
		icon: "map-pin",
		sortOrder: 3,
		urlPattern: "/zonas/{slug}/",
		admin: { listColumns: ["kind", "parent", "order"] },
		labelSingular: "Zona",
		supports: ["drafts", "revisions", "preview", "search", "seo"],
		fields: [
			f("title", "Título (H1)", "string", { required: true, searchable: true }),
			f("short_title", "Nombre de la zona", "string"),
			select("kind", "Tipo de zona", ["localidad", "barrio", "sector", "municipio"]),
			f("parent", "Zona padre (slug de la localidad, solo para barrios)", "string"),
			f("locality", "Localidad", "string"),
			f("neighborhoods", "Barrios que cubrimos (separados por coma)", "text", { searchable: true }),
			f("excerpt", "Resumen", "text"),
			f("hero_image", "Imagen", "image"),
			f("intro", "Introducción", "portableText", { searchable: true }),
			f("landmarks", "Clínicas y referencias cercanas", "repeater", {
				validation: { subFields: [f("name", "Nombre", "string", { required: true }), subSelect("kind", "Tipo", ["clinica", "hospital", "parque", "centro-comercial", "otro"]), f("note", "Nota", "string")] },
			}),
			layout,
			faqs,
			f("lat", "Latitud", "number"),
			f("lng", "Longitud", "number"),
			f("order", "Orden", "integer"),
			focus,
		],
	},
	{
		slug: "posts",
		label: "Blog",
		icon: "newspaper",
		sortOrder: 4,
		urlPattern: "/blog/{slug}/",
		labelSingular: "Artículo",
		supports: ["drafts", "revisions", "preview", "scheduling", "search", "seo"],
		commentsEnabled: true,
		fields: [
			f("title", "Título (H1)", "string", { required: true, searchable: true }),
			f("excerpt", "Resumen", "text", { searchable: true }),
			f("featured_image", "Imagen destacada", "image"),
			f("key_takeaways", "En resumen (una idea por línea)", "text"),
			f("content", "Contenido", "portableText", { searchable: true }),
			faqs,
			f("cta_service", "Servicio relacionado (slug)", "string"),
			f("reading_minutes", "Minutos de lectura", "integer"),
			focus,
		],
	},
	{
		slug: "site",
		label: "Ajustes del sitio",
		icon: "settings",
		sortOrder: 9,
		routable: false,
		admin: { quickCreate: false },
		labelSingular: "Ajustes",
		supports: ["revisions"],
		fields: [
			f("title", "Nombre interno", "string", { required: true }),
			f("legal_name", "Razón social", "string"),
			f("nit", "NIT", "string"),
			f("phone_display", "Teléfono visible", "string"),
			f("phone_e164", "Teléfono para llamar (+57…)", "string"),
			f("whatsapp_display", "WhatsApp visible", "string"),
			f("email", "Correo de contacto", "string"),
			f("address", "Dirección", "string"),
			f("city", "Ciudad", "string"),
			f("hours", "Horario de atención", "string"),
			f("coverage", "Cobertura (texto corto)", "string"),
			f("announcement", "Barra superior: texto", "string"),
			f("announcement_url", "Barra superior: enlace", "string"),
			f("header_cta", "Cabecera: texto del botón de cotizar", "string"),
			f("sticky_title", "Barra fija en móvil: título", "string"),
			f("sticky_text", "Barra fija en móvil: texto", "string"),
			f("footer_about", "Pie: texto de la marca", "text"),
			f("footer_legal", "Pie: nota legal", "text"),
			f("lead_title", "Formulario emergente: título", "string"),
			f("lead_eyebrow", "Formulario emergente: antetítulo", "string"),
			f("lead_text", "Formulario emergente: texto", "text"),
			f("lead_schedules", "Opciones de turno (una por línea)", "text"),
			f("lead_relations", "Opciones «para quién» (una por línea)", "text"),
			f("social", "Redes sociales", "repeater", { validation: { subFields: [f("name", "Red", "string", { required: true }), f("url", "Enlace", "string", { required: true })] } }),
			f("trust", "Garantías (se repiten en el sitio)", "repeater", { validation: { subFields: [subSelect("icon", "Icono", ICONS), f("text", "Texto", "string", { required: true })] } }),
		],
	},
];

export const taxonomies = [
	{ name: "category", label: "Categorías", labelSingular: "Categoría", hierarchical: true, collections: ["posts"] },
	{ name: "tag", label: "Etiquetas", labelSingular: "Etiqueta", hierarchical: false, collections: ["posts"] },
];
