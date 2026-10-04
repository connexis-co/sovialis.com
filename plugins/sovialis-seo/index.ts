/**
 * sovialis-seo — Lo esencial de Rank Math, adaptado a EmDash:
 *  - Grafo JSON-LD por página (Organization, LocalBusiness, WebSite, WebPage, BreadcrumbList, Service con
 *    precios, FAQPage, BlogPosting con valoraciones, ProfilePage) vía `page:metadata`.
 *  - Ajustes de la entidad del negocio (NAP, horario, zonas, perfiles) editables en el panel.
 *  - robots.txt para buscadores e IA, llms.txt / llms-full.txt y sitemaps (los sirve el tema con estos datos).
 *  - IndexNow (Bing, Yandex, Seznam…) al publicar, y envío manual de todas las URLs.
 *  - Monitor de errores 404 y análisis SEO de cada página (longitudes, keyword, FAQ, noindex).
 */
import { definePlugin, getEmDashCollection, getEmDashEntry, getPluginSetting } from "emdash";
import { isAdminPath } from "../_shared/text";
import { urlFor } from "../../src/lib/routes";
import { DEFAULT_SEO, validateSeo, withDefaults, type SeoSettings } from "./model";
import { buildGraph, collectFaqs } from "./schema";

async function sha256Hex(text: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const newKey = () => crypto.randomUUID().replace(/-/g, "");

async function getSettings(ctx: { settings: { get<T>(k: string): Promise<T | null>; set(k: string, v: unknown): Promise<void> } }) {
	const s = withDefaults(await ctx.settings.get<Partial<SeoSettings>>("settings"));
	if (!s.indexNowKey) {
		s.indexNowKey = newKey();
		await ctx.settings.set("settings", s);
	}
	return s;
}

const COLLECTIONS = ["pages", "services", "zones", "posts"] as const;

export function createPlugin() {
	return definePlugin({
		id: "sovialis-seo",
		version: "1.0.0",
		capabilities: ["content:read", "network:request"],
		allowedHosts: ["api.indexnow.org", "www.bing.com"],
		storage: { notfound: { indexes: ["count", "lastAt"] } },
		admin: { pages: [{ path: "/seo", label: "SEO", icon: "search" }] },
		hooks: {
			"page:metadata": async ({ page }, ctx) => {
				if (isAdminPath(page.path)) return null;
				const settings = await getSettings(ctx);
				const origin = page.siteUrl || new URL(page.url).origin;
				const url = page.canonical || `${origin}${page.path}`;
				let data: Record<string, any> | null = null;
				let author: { name: string; slug: string; bio?: string | null; isTeam: boolean } | null = null;
				let rating: { average: number; count: number } | null = null;
				const collection = page.content?.collection;
				if (collection && page.content?.slug) {
					const { entry } = await getEmDashEntry(collection, page.content.slug).catch(() => ({ entry: null }));
					data = (entry?.data as Record<string, any>) ?? null;
				}
				if (collection === "posts" && data) {
					const by = data.byline as { displayName?: string; slug?: string; bio?: string | null } | null;
					if (by?.slug) author = { name: by.displayName ?? "Sovialis", slug: by.slug, bio: by.bio, isTeam: by.slug === "equipo-sovialis" };
				}
				// Valoraciones reales de los visitantes (plugin sovialis-ratings), solo con el mínimo de votos configurado.
				if (settings.ratingsInSchema && data?.id && collection && ["posts", "services", "zones", "pages"].includes(collection)) {
					const agg = await getPluginSetting<{ average: number; count: number }>("sovialis-ratings", `agg:${collection}:${data.id}`).catch(() => undefined);
					if (agg && agg.count >= settings.ratingsMinVotes) rating = { average: agg.average, count: agg.count };
				}
				let items: Array<{ name: string; url: string }> | undefined;
				if (page.pageType === "collection") {
					const target = page.path.startsWith("/servicios") ? "services" : page.path.startsWith("/zonas") ? "zones" : page.path.startsWith("/blog") ? "posts" : null;
					if (target) {
						const { entries } = await getEmDashCollection(target, { status: "published", limit: 50 }).catch(() => ({ entries: [] as any[] }));
						items = entries.map((e: any) => ({ name: String(e.data.short_title || e.data.title), url: urlFor(target, e.id) }));
					}
				}
				const toIso = (v: unknown) => (v instanceof Date ? v.toISOString() : typeof v === "string" ? v : null);
				const graph = buildGraph({
					origin,
					url,
					pageType: page.pageType,
					title: page.pageTitle ?? page.title ?? settings.business.name,
					description: page.seo?.ogDescription || page.description || settings.business.description,
					image: page.seo?.ogImage || page.image,
					breadcrumbs: page.breadcrumbs?.map((c) => ({ name: c.name, url: c.url })),
					business: settings.business,
					data,
					collection,
					published: page.articleMeta?.publishedTime ?? toIso(data?.publishedAt),
					modified: page.articleMeta?.modifiedTime ?? toIso(data?.updatedAt),
					author,
					rating,
					items,
					product: settings.productSchema,
				});
				return [{ kind: "jsonld", id: "primary", graph }];
			},

			"content:afterPublish": async (event, ctx) => {
				const settings = await getSettings(ctx);
				if (!settings.indexNowEnabled || !ctx.http) return;
				const content = (event as { content?: { slug?: string; data?: Record<string, unknown> } }).content;
				const collection = (event as { collection?: string }).collection ?? "";
				const slug = content?.slug ?? (content?.data?.slug as string | undefined);
				if (!slug || !COLLECTIONS.includes(collection as never)) return;
				const host = "sovialis.com";
				const url = `https://${host}${urlFor(collection, slug)}`;
				try {
					await ctx.http.fetch("https://api.indexnow.org/indexnow", {
						method: "POST",
						headers: { "Content-Type": "application/json; charset=utf-8" },
						body: JSON.stringify({ host, key: settings.indexNowKey, keyLocation: `https://${host}/${settings.indexNowKey}.txt`, urlList: [url] }),
					});
					ctx.log.info("IndexNow enviado", { url });
				} catch (error) {
					ctx.log.warn("IndexNow falló", { url, error: error instanceof Error ? error.message : String(error) });
				}
			},
		},
		routes: {
			settings: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async (ctx) => ({ settings: await getSettings(ctx), defaults: DEFAULT_SEO }),
			},
			save: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 65_536 },
				handler: async (ctx) => {
					const current = await getSettings(ctx);
					const next = validateSeo(ctx.input);
					next.indexNowKey = next.indexNowKey || current.indexNowKey;
					await ctx.settings.set("settings", next);
					return { settings: next };
				},
			},
			analysis: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async () => {
					const rows: Array<Record<string, unknown>> = [];
					for (const collection of COLLECTIONS) {
						const { entries } = await getEmDashCollection(collection, { limit: 100 }).catch(() => ({ entries: [] as any[] }));
						for (const e of entries as any[]) {
							const d = e.data as Record<string, any>;
							if (collection === "pages" && d.slug === "general") continue;
							const seo = (d.seo ?? {}) as { title?: string; description?: string; noIndex?: boolean };
							const title = seo.title || d.title || "";
							const description = seo.description || d.summary || d.excerpt || "";
							const kw = String(d.focus_keyword ?? "").toLowerCase();
							const norm = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
							const kwIn = (x: string) => !!kw && norm(x).includes(norm(kw).split(" ").slice(0, 3).join(" "));
							const issues: string[] = [];
							if (!seo.title) issues.push("Sin título SEO propio");
							if (title.length > 60) issues.push(`Título largo (${title.length})`);
							if (!description) issues.push("Sin meta descripción");
							else if (description.length > 160) issues.push(`Descripción larga (${description.length})`);
							else if (description.length < 110) issues.push(`Descripción corta (${description.length})`);
							if (!kw) issues.push("Sin palabra clave principal");
							else {
								if (!kwIn(title)) issues.push("Keyword ausente del título");
								if (!kwIn(String(d.title ?? ""))) issues.push("Keyword ausente del H1");
								if (!kwIn(description)) issues.push("Keyword ausente de la descripción");
							}
							if (collection !== "pages" && collectFaqs(d).length < 3) issues.push("Menos de 3 preguntas frecuentes");
							const img = d.hero_image ?? d.featured_image;
							if ((collection === "services" || collection === "posts") && !img) issues.push("Sin imagen principal");
							if (img && !img.alt) issues.push("Imagen sin texto alternativo");
							if (e.data.status && e.data.status !== "published") issues.push("No publicado");
							const score = Math.max(0, 100 - issues.length * 12);
							rows.push({ collection, slug: e.id, url: urlFor(collection, e.id), title, description, keyword: kw, noIndex: !!seo.noIndex, issues, score });
						}
					}
					rows.sort((a, b) => (a.score as number) - (b.score as number));
					return { rows };
				},
			},
			log404: {
				public: true,
				methods: ["POST"],
				request: { body: "json", maxBytes: 2048 },
				handler: async (ctx) => {
					const settings = await getSettings(ctx);
					if (!settings.log404) return { ok: true };
					const v = (ctx.input ?? {}) as { path?: unknown; referrer?: unknown };
					const path = typeof v.path === "string" ? v.path.slice(0, 300) : "";
					if (!path.startsWith("/") || path.startsWith("/_emdash")) return { ok: false };
					const id = (await sha256Hex(path)).slice(0, 32);
					const current = (await ctx.storage.notfound.get(id)) as { path: string; count: number; firstAt: string; lastAt: string; referrers: string[] } | null;
					const referrer = typeof v.referrer === "string" ? v.referrer.slice(0, 300) : "";
					const now = new Date().toISOString();
					await ctx.storage.notfound.put(id, {
						path,
						count: (current?.count ?? 0) + 1,
						firstAt: current?.firstAt ?? now,
						lastAt: now,
						referrers: [...new Set([referrer, ...(current?.referrers ?? [])].filter(Boolean))].slice(0, 5),
					});
					return { ok: true };
				},
			},
			notfound: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async (ctx) => {
					const r = await ctx.storage.notfound.query({ orderBy: { count: "desc" }, limit: 100 });
					return { items: r.items.map((i) => ({ id: i.id, ...(i.data as object) })) };
				},
			},
			clear404: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 1024 },
				handler: async (ctx) => {
					const v = (ctx.input ?? {}) as { id?: string };
					if (v.id) return { deleted: await ctx.storage.notfound.delete(v.id) };
					const r = await ctx.storage.notfound.query({ limit: 100 });
					return { deleted: await ctx.storage.notfound.deleteMany(r.items.map((i) => i.id)) };
				},
			},
			indexnowAll: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 1024 },
				handler: async (ctx) => {
					const settings = await getSettings(ctx);
					if (!ctx.http) throw new Error("Sin acceso a red.");
					const host = "sovialis.com";
					const urlList: string[] = [`https://${host}/`];
					for (const collection of COLLECTIONS) {
						const { entries } = await getEmDashCollection(collection, { status: "published", limit: 200 }).catch(() => ({ entries: [] as any[] }));
						for (const e of entries as any[]) if (!(e.data.seo?.noIndex) && e.id !== "general") urlList.push(`https://${host}${urlFor(collection, e.id)}`);
					}
					const res = await ctx.http.fetch("https://api.indexnow.org/indexnow", {
						method: "POST",
						headers: { "Content-Type": "application/json; charset=utf-8" },
						body: JSON.stringify({ host, key: settings.indexNowKey, keyLocation: `https://${host}/${settings.indexNowKey}.txt`, urlList: [...new Set(urlList)] }),
					});
					return { status: res.status, submitted: urlList.length };
				},
			},
		},
	});
}
