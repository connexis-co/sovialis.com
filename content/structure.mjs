/**
 * Estructura editable del CMS que va en el seed: ajustes del sitio, menús, categorías y autores.
 * (Los servicios, zonas, páginas y artículos se cargan con `npm run content:sync`.)
 */

export const settings = {
	title: "Sovialis",
	tagline: "Vínculos que protegen",
	timezone: "America/Bogota",
};

export const categories = [
	{ slug: "contratar-cuidado", label: "Contratar cuidado", description: "Cómo elegir el perfil, contratar con seguridad y organizar el cuidado de una persona mayor en casa." },
	{ slug: "costos-y-alternativas", label: "Costos y alternativas", description: "Cuánto cuesta cuidar a un adulto mayor y cómo se compara con hogares geriátricos y centros día." },
	{ slug: "cuidados-y-salud-en-casa", label: "Cuidados y salud en casa", description: "Guías prácticas de cuidado diario, recuperación y condiciones como el Alzheimer, explicadas para familias." },
	{ slug: "eps-derechos-y-tramites", label: "EPS, derechos y trámites", description: "Atención domiciliaria por EPS, tutela, derechos de las personas mayores y cómo pedir servicios de salud en casa." },
	{ slug: "bienestar-y-cuidador-familiar", label: "Bienestar y cuidador familiar", description: "Actividades, ejercicio y vida social de las personas mayores, y apoyo para quien cuida." },
];

export const bylines = [
	{
		id: "byline-equipo",
		slug: "equipo-sovialis",
		displayName: "Equipo editorial de Sovialis",
		bio: "Coordinación de cuidado de Sovialis. Escribimos guías prácticas para familias que cuidan a un adulto mayor en Bogotá.",
	},
];

const item = (label, url) => ({ type: "custom", label, url });

export const menus = [
	{
		name: "primary",
		label: "Menú principal",
		items: [
			item("Servicios", "/servicios/"),
			item("Zonas", "/zonas/"),
			item("Precios", "/precios/"),
			item("Cómo funciona", "/como-funciona/"),
			item("Guías", "/blog/"),
			item("Nosotros", "/nosotros/"),
		],
	},
	{
		name: "footer_empresa",
		label: "Pie: Sovialis",
		items: [
			item("Nosotros", "/nosotros/"),
			item("Cómo funciona", "/como-funciona/"),
			item("Precios", "/precios/"),
			item("Guías para familias", "/blog/"),
			item("Trabaja con nosotros", "/trabaja-con-nosotros/"),
			item("Contacto", "/contacto/"),
		],
	},
	{
		name: "footer_legal",
		label: "Pie: legal",
		items: [
			item("Política de tratamiento de datos", "/politica-de-tratamiento-de-datos/"),
			item("Términos y condiciones", "/terminos-y-condiciones/"),
			item("Política de cookies", "/politica-de-cookies/"),
		],
	},
];
