/**
 * Rutas públicas por colección. Única fuente de verdad para el tema, el SEO (sitemaps, JSON-LD,
 * llms.txt) y los plugins. Si cambia un patrón, cambiar también `urlPattern` en scripts/seed/schema.mjs.
 */
export const HOME_SLUG = "inicio";

export const ROUTES = {
	pages: (slug: string) => (slug === HOME_SLUG ? "/" : `/${slug}/`),
	services: (slug: string) => `/servicios/${slug}/`,
	/** Zonas planas (/zonas/cedritos/); la jerarquía localidad → barrio vive en migas y menús. */
	zones: (slug: string, _parent?: string | null) => `/zonas/${slug}/`,
	posts: (slug: string) => `/blog/${slug}/`,
	// Las categorías del blog no tienen URL propia: son filtros dentro de /blog/ (#tema-<slug>).
	// Las antiguas /blog/categoria/<slug>/ responden 410 para que Google las retire.
	author: (slug: string) => `/autores/${slug}/`,
} as const;

export const HUBS = {
	services: "/servicios/",
	zones: "/zonas/",
	blog: "/blog/",
	prices: "/precios/",
	contact: "/contacto/",
	thanks: "/gracias/",
} as const;

export type RoutableCollection = "pages" | "services" | "zones" | "posts";

export function urlFor(collection: string, slug: string, parent?: string | null): string {
	if (collection === "zones") return ROUTES.zones(slug, parent);
	const route = (ROUTES as Record<string, (s: string) => string>)[collection];
	return route ? route(slug) : `/${slug}/`;
}

export function absolute(path: string, origin = "https://sovialis.com"): string {
	return new URL(path, origin).toString();
}
