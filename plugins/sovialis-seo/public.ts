/**
 * Funciones que usan las rutas del tema (sitemap.xml, sitemaps/*.xml, llms.txt, llms-full.txt,
 * robots.txt, clave de IndexNow) con los ajustes del plugin y el contenido publicado.
 */
import { getEmDashCollection, getPluginSetting, getSiteSettings, getTaxonomyTerms } from "emdash";
import { ROUTES, urlFor } from "../../src/lib/routes";
import { buildRobots, withDefaults, type SeoSettings } from "./model";
import { collectFaqs } from "./schema";

export async function getSeoSettings(): Promise<SeoSettings> {
	return withDefaults(await getPluginSetting<Partial<SeoSettings>>("sovialis-seo", "settings").catch(() => undefined));
}

export async function robotsTxt(origin: string): Promise<string> {
	const [settings, site] = await Promise.all([getSeoSettings(), getSiteSettings().catch(() => ({}))]);
	const custom = (site as { seo?: { robotsTxt?: string } }).seo?.robotsTxt;
	if (custom?.trim()) return `${custom.trim()}\n`;
	return buildRobots(settings, origin);
}

type Entry = { id: string; data: Record<string, any> };
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : typeof v === "string" ? new Date(v).toISOString() : undefined);

async function published(collection: string): Promise<Entry[]> {
	const out: Entry[] = [];
	let cursor: string | undefined;
	do {
		const page = await getEmDashCollection(collection, { status: "published", limit: 100, ...(cursor ? { cursor } : {}) }).catch(() => ({ entries: [], nextCursor: undefined }));
		out.push(...(page.entries as Entry[]));
		cursor = page.nextCursor;
	} while (cursor && out.length < 2000);
	return out;
}

export const SITEMAPS = {
	paginas: "Páginas",
	servicios: "Servicios",
	zonas: "Zonas",
	blog: "Blog",
} as const;
export type SitemapName = keyof typeof SITEMAPS;

export function sitemapIndex(origin: string, lastmod: Record<string, string | undefined>): string {
	const items = (Object.keys(SITEMAPS) as SitemapName[])
		.map((name) => `  <sitemap><loc>${origin}/sitemaps/${name}.xml</loc>${lastmod[name] ? `<lastmod>${lastmod[name]}</lastmod>` : ""}</sitemap>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

interface UrlItem {
	loc: string;
	lastmod?: string;
	images: Array<{ loc: string; title?: string }>;
}

function urlset(items: UrlItem[]): string {
	const body = items
		.map(
			(u) =>
				`  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}${u.images
					.map((i) => `<image:image><image:loc>${esc(i.loc)}</image:loc>${i.title ? `<image:title>${esc(i.title)}</image:title>` : ""}</image:image>`)
					.join("")}</url>`,
		)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

function imagesOf(origin: string, d: Record<string, any>): UrlItem["images"] {
	const imgs: UrlItem["images"] = [];
	for (const img of [d.hero_image, d.featured_image, ...(Array.isArray(d.layout) ? d.layout.map((b: any) => b?.image) : [])]) {
		if (img?.src) imgs.push({ loc: new URL(img.src, origin).toString(), title: img.alt });
	}
	return imgs.slice(0, 5);
}

/** Construye un sitemap por colección (sin entradas noindex ni rutas excluidas). Devuelve XML y el lastmod más reciente. */
export async function sitemapFor(name: SitemapName, origin: string): Promise<{ xml: string; lastmod?: string }> {
	const settings = await getSeoSettings();
	const excluded = new Set(settings.sitemapExclude.map((p) => (p.endsWith("/") ? p : `${p}/`)));
	const items: UrlItem[] = [];
	const push = (path: string, d: Record<string, any> | null) => {
		if (excluded.has(path)) return;
		if (d?.seo?.noIndex) return;
		items.push({ loc: `${origin}${path}`, lastmod: iso(d?.updatedAt ?? d?.publishedAt), images: d ? imagesOf(origin, d) : [] });
	};
	if (name === "paginas") {
		for (const e of await published("pages")) push(urlFor("pages", e.id), e.data);
	} else if (name === "servicios") {
		for (const e of await published("services")) push(urlFor("services", e.id), e.data);
	} else if (name === "zonas") {
		for (const e of await published("zones")) push(urlFor("zones", e.id), e.data);
	} else if (name === "blog") {
		const posts = await published("posts");
		for (const e of posts) push(urlFor("posts", e.id), e.data);
		const terms = await getTaxonomyTerms("category").catch(() => [] as any[]);
		for (const t of terms as Array<{ slug: string; count?: number }>) {
			const count = posts.filter((p) => (p.data.terms?.category ?? []).some((c: any) => c.slug === t.slug)).length;
			if (count >= 4) items.push({ loc: `${origin}${ROUTES.category(t.slug)}`, images: [] });
		}
	}
	const lastmod = items.map((i) => i.lastmod).filter(Boolean).sort().at(-1);
	return { xml: urlset(items), lastmod };
}

/** llms.txt (resumen) y llms-full.txt (texto completo con FAQ), arquitectura SEO §12. */
export async function llmsTxt(origin: string, full = false): Promise<string> {
	const settings = await getSeoSettings();
	const b = settings.business;
	const [pages, services, zones, posts] = await Promise.all([published("pages"), published("services"), published("zones"), published("posts")]);
	const date = new Date().toISOString().slice(0, 10);
	const line = (title: string, path: string, desc?: string) => `- [${title}](${origin}${path})${desc ? `: ${desc}` : ""}`;
	const out: string[] = [
		`# ${b.name}`,
		"",
		`> ${settings.llmsIntro}`,
		"",
		`Datos clave (actualizados el ${date}):`,
		`- Nombre: ${b.name}${b.legalName ? ` · Razón social: ${b.legalName}` : ""} · Lema: «${b.slogan}»`,
		`- Contacto: ${[b.telephone && `teléfono y WhatsApp ${b.telephone}`, b.email].filter(Boolean).join(" · ")} · ${b.locality}, Colombia`,
		...settings.llmsNotes.split("\n").filter(Boolean).map((l) => `- ${l}`),
		`- Fuente de precios: ${origin}/precios/`,
		"",
		"## Servicios",
		...services.map((e) => line(String(e.data.short_title || e.data.title), urlFor("services", e.id), String(e.data.excerpt ?? ""))),
		"",
		"## Cómo funciona y condiciones",
		...pages.filter((p) => ["precios", "como-funciona", "terminos-y-condiciones"].includes(p.id)).map((p) => line(String(p.data.title), urlFor("pages", p.id))),
		"",
		"## Zonas",
		line("Norte de Bogotá", "/zonas/"),
		...zones.map((e) => line(String(e.data.short_title || e.data.title), urlFor("zones", e.id))),
		"",
		"## Guías",
		...posts.map((e) => line(String(e.data.title), urlFor("posts", e.id), String(e.data.excerpt ?? ""))),
		"",
		"## Optional",
		...pages.filter((p) => ["nosotros", "trabaja-con-nosotros", "contacto", "politica-de-tratamiento-de-datos"].includes(p.id)).map((p) => line(String(p.data.title), urlFor("pages", p.id))),
		full ? "" : `- Versión completa en texto: ${origin}/llms-full.txt`,
	];
	if (full) {
		const plain = (pt: unknown) =>
			Array.isArray(pt)
				? pt
						.map((block: any) => {
							const text = (block.children ?? []).map((c: any) => c.text ?? "").join("");
							if (!text) return "";
							if (block.style === "h2") return `\n### ${text}`;
							if (block.style === "h3") return `\n#### ${text}`;
							return block.listItem ? `- ${text}` : text;
						})
						.filter(Boolean)
						.join("\n")
				: "";
		const section = (title: string, path: string, d: Record<string, any>, bodyField: string) => {
			const faqs = collectFaqs(d);
			return [
				`\n## ${title}`,
				`URL: ${origin}${path}`,
				d.excerpt || d.summary ? `\n${d.excerpt || d.summary}` : "",
				plain(d[bodyField]),
				faqs.length ? `\nPreguntas frecuentes:\n${faqs.map((f) => `- **${f.question}** ${f.answer}`).join("\n")}` : "",
			]
				.filter(Boolean)
				.join("\n");
		};
		out.push("\n---\n# Contenido completo");
		for (const e of services) out.push(section(String(e.data.title), urlFor("services", e.id), e.data, "body"));
		for (const e of zones) out.push(section(String(e.data.title), urlFor("zones", e.id), e.data, "intro"));
		for (const e of pages.filter((p) => ["inicio", "precios", "como-funciona", "nosotros", "contacto"].includes(p.id))) out.push(section(String(e.data.title), urlFor("pages", e.id), e.data, "body"));
		for (const e of posts) out.push(section(String(e.data.title), urlFor("posts", e.id), e.data, "content"));
	}
	return `${out.join("\n").replace(/\n{3,}/g, "\n\n").slice(0, 190_000)}\n`;
}
