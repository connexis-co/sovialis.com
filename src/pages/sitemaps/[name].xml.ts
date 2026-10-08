import type { APIRoute } from "astro";
import { sitemapFor, SITEMAPS, type SitemapName } from "../../../plugins/sovialis-seo/public";

export const GET: APIRoute = async ({ params, site, url }) => {
	const name = params.name as SitemapName;
	if (!(name in SITEMAPS)) return new Response("No encontrado", { status: 404 });
	const { xml } = await sitemapFor(name, (site ?? url).origin);
	return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};
