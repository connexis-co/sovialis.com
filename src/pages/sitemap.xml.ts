import type { APIRoute } from "astro";
import { sitemapFor, sitemapIndex, SITEMAPS, type SitemapName } from "../../plugins/sovialis-seo/public";

/** Índice de sitemaps (reemplaza el /sitemap.xml nativo de EmDash). */
export const GET: APIRoute = async ({ site, url }) => {
	const origin = (site ?? url).origin;
	const lastmod: Record<string, string | undefined> = {};
	for (const name of Object.keys(SITEMAPS) as SitemapName[]) lastmod[name] = (await sitemapFor(name, origin)).lastmod;
	return new Response(sitemapIndex(origin, lastmod), {
		headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
};
