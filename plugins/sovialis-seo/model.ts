/**
 * Ajustes del plugin SEO de Sovialis («lo esencial de Rank Math» adaptado a EmDash).
 * El título, la descripción, la imagen social, el canonical y el noindex de cada entrada son
 * NATIVOS de EmDash (panel SEO de cada contenido); también lo son el separador de títulos, la
 * imagen OG por defecto y las verificaciones de Google/Bing (Ajustes → SEO). Este plugin agrega
 * el resto: entidad del negocio y grafo JSON-LD, sitemaps, robots para IA, llms.txt, IndexNow,
 * monitor de 404 y análisis de páginas.
 */

export interface BusinessSettings {
	name: string;
	legalName: string;
	description: string;
	slogan: string;
	logo: string;
	image: string;
	telephone: string;
	email: string;
	streetAddress: string;
	locality: string;
	region: string;
	postalCode: string;
	country: string;
	lat: number | null;
	lng: number | null;
	openingHours: string;
	priceRange: string;
	areaServed: string[];
	knowsAbout: string[];
	sameAs: string[];
	verified: boolean;
}

export interface SeoSettings {
	business: BusinessSettings;
	/** Promedio de los servicios, solo en el nodo Product elegible para Google. */
	ratingsInSchema: boolean;
	/** Además de Service, marca cada servicio como Product (schema.org: «cualquier producto o servicio ofrecido»): precio desde y valoraciones; Google decide la apariencia del resultado. */
	productSchema: boolean;
	ratingsMinVotes: number;
	llmsIntro: string;
	llmsNotes: string;
	robotsAiAllowed: boolean;
	robotsExtra: string;
	sitemapExclude: string[];
	indexNowEnabled: boolean;
	indexNowKey: string;
	log404: boolean;
}

export const CANONICAL_PHRASE =
	"Sovialis es una empresa de Bogotá que presta cuidado no sanitario a domicilio para personas mayores, con cuidadoras y personal con formación de auxiliar de enfermería.";

export const DEFAULT_SEO: SeoSettings = {
	business: {
		name: "Sovialis",
		legalName: "",
		description: CANONICAL_PHRASE,
		slogan: "Vínculos que protegen",
		logo: "/brand/sovialis-logo-1600.png",
		image: "/og/sovialis-og.jpg",
		telephone: "+573117598641",
		email: "contacto@sovialis.com",
		streetAddress: "",
		locality: "Bogotá",
		region: "Bogotá D.C.",
		postalCode: "",
		country: "CO",
		lat: 4.7016,
		lng: -74.0466,
		openingHours: "Mo-Su 07:00-20:00",
		priceRange: "$$",
		areaServed: ["Bogotá", "Usaquén", "Santa Bárbara", "Cedritos", "Calle 170", "Chapinero", "El Chicó", "Suba", "Niza", "Colina Campestre", "Teusaquillo", "Barrios Unidos", "Engativá", "Fontibón"],
		knowsAbout: [
			"Cuidado del adulto mayor a domicilio",
			"Cuidadoras de adulto mayor",
			"Acompañamiento a citas médicas",
			"Cuidado de personas con Alzheimer y demencia",
			"Cuidado postoperatorio en casa",
		],
		sameAs: [],
		verified: false,
	},
	ratingsInSchema: true,
	productSchema: true,
	ratingsMinVotes: 3,
	llmsIntro:
		"Sovialis es una empresa de Bogotá (Colombia) que presta cuidado no sanitario a domicilio para personas mayores: cuidadoras y personal con formación de auxiliar de enfermería, por horas, en turnos de día o de noche y 24 horas con relevos, además de acompañamiento a citas médicas y en clínica. Atiende principalmente el norte y el noroccidente de Bogotá. No es una IPS: no presta servicios de salud ni procedimientos (inyecciones, insulina, curaciones, sondas, oxígeno); para eso orienta a las familias hacia su EPS o una IPS habilitada.",
	llmsNotes:
		"Precios finales (IVA incluido), lunes a viernes: cuidadora desde $20.000 por hora (mínimo 4 horas), $120.000 por 8 h de día, $160.000 por 12 h de día, $190.000 por 12 h de noche y $300.000 por 24 h. Personal con formación de auxiliar de enfermería desde $25.000 por hora, $180.000 por 12 h de día, $215.000 por 12 h de noche y $340.000 por 24 h. Domingos y festivos tienen tarifa diferente.\nPago anticipado; cancelación sin costo con 24 h de anticipación; reemplazo en el plazo acordado sin cobro del tiempo no prestado.",
	robotsAiAllowed: true,
	robotsExtra: "",
	sitemapExclude: ["/gracias/"],
	indexNowEnabled: true,
	indexNowKey: "",
	log404: true,
};

const text = (v: unknown, max: number, name: string) => {
	if (v === undefined || v === null) return "";
	if (typeof v !== "string" || v.length > max) throw new Error(`${name}: texto inválido (máx. ${max}).`);
	return v.trim();
};
const list = (v: unknown, name: string) => {
	if (v === undefined) return [];
	if (!Array.isArray(v) || v.length > 200) throw new Error(`${name}: lista inválida.`);
	return [...new Set(v.map((x) => text(x, 300, name)).filter(Boolean))];
};
const num = (v: unknown) => (v === null || v === "" || v === undefined ? null : Number.isFinite(Number(v)) ? Number(v) : null);

export function validateSeo(input: unknown): SeoSettings {
	if (!input || typeof input !== "object") throw new Error("Ajustes inválidos.");
	const v = input as Record<string, any>;
	const b = (v.business ?? {}) as Record<string, unknown>;
	const business: BusinessSettings = {
		name: text(b.name, 120, "Nombre") || DEFAULT_SEO.business.name,
		legalName: text(b.legalName, 200, "Razón social"),
		description: text(b.description, 600, "Descripción"),
		slogan: text(b.slogan, 120, "Eslogan"),
		logo: text(b.logo, 500, "Logo"),
		image: text(b.image, 500, "Imagen"),
		telephone: text(b.telephone, 30, "Teléfono"),
		email: text(b.email, 190, "Correo"),
		streetAddress: text(b.streetAddress, 200, "Dirección"),
		locality: text(b.locality, 120, "Ciudad"),
		region: text(b.region, 120, "Departamento"),
		postalCode: text(b.postalCode, 20, "Código postal"),
		country: text(b.country, 2, "País") || "CO",
		lat: num(b.lat),
		lng: num(b.lng),
		openingHours: text(b.openingHours, 200, "Horario"),
		priceRange: text(b.priceRange, 20, "Rango de precios"),
		areaServed: list(b.areaServed, "Zonas atendidas"),
		knowsAbout: list(b.knowsAbout, "Especialidades"),
		sameAs: list(b.sameAs, "Perfiles oficiales").filter((u) => /^https:\/\//.test(u)),
		verified: b.verified === true,
	};
	const min = Number(v.ratingsMinVotes);
	return {
		business,
		ratingsInSchema: v.ratingsInSchema !== false,
		productSchema: v.productSchema !== false,
		ratingsMinVotes: Number.isInteger(min) && min >= 1 && min <= 100 ? min : 3,
		llmsIntro: text(v.llmsIntro, 3000, "Introducción de llms.txt"),
		llmsNotes: text(v.llmsNotes, 6000, "Datos clave de llms.txt"),
		robotsAiAllowed: v.robotsAiAllowed !== false,
		robotsExtra: text(v.robotsExtra, 4000, "Reglas adicionales de robots"),
		sitemapExclude: list(v.sitemapExclude, "Excluir del sitemap"),
		indexNowEnabled: v.indexNowEnabled !== false,
		indexNowKey: /^[a-f0-9]{32}$/.test(String(v.indexNowKey ?? "")) ? String(v.indexNowKey) : "",
		log404: v.log404 !== false,
	};
}

export function withDefaults(stored: Partial<SeoSettings> | null | undefined): SeoSettings {
	return {
		...DEFAULT_SEO,
		...(stored ?? {}),
		business: { ...DEFAULT_SEO.business, ...(stored?.business ?? {}) },
	};
}

const AI_BOTS = [
	"Googlebot", "Bingbot", "Applebot", "Google-Extended", "Applebot-Extended", "OAI-SearchBot", "ChatGPT-User", "GPTBot",
	"PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "DuckAssistBot", "Amazonbot",
	"meta-externalagent", "MistralAI-User", "CCBot",
];
// /cdn-cgi/image/ son las fotos del srcset (AVIF/WebP de Cloudflare): Googlebot las necesita para renderizar
// la página y para Google Imágenes. El resto de /cdn-cgi/ (scripts y avisos internos) sigue bloqueado.
const RULES = ["Allow: /", "Allow: /_emdash/api/media/file/", "Allow: /cdn-cgi/image/", "Disallow: /_emdash/", "Disallow: /api/", "Disallow: /cdn-cgi/"];

/** robots.txt de la arquitectura SEO (§12.5): visibilidad máxima en buscadores y asistentes de IA. */
export function buildRobots(settings: SeoSettings, origin: string): string {
	const lines = [
		`# robots.txt — ${origin}`,
		"# Política: visibilidad máxima en buscadores y asistentes de IA.",
		"",
		"User-agent: *",
		...RULES,
		"",
	];
	if (settings.robotsAiAllowed) {
		lines.push("# Buscadores y asistentes de IA (permitidos de forma explícita)", ...AI_BOTS.map((b) => `User-agent: ${b}`), ...RULES, "");
	} else {
		lines.push("# Entrenamiento de modelos bloqueado", ...["GPTBot", "CCBot", "Google-Extended", "Applebot-Extended"].map((b) => `User-agent: ${b}`), "Disallow: /", "");
	}
	if (settings.robotsExtra) lines.push(settings.robotsExtra.trim(), "");
	lines.push(`Sitemap: ${origin}/sitemap.xml`);
	return `${lines.join("\n")}\n`;
}
