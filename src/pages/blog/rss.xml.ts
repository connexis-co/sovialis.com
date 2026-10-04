import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ site, url }) => {
	const origin = (site ?? url).origin;
	const { entries } = await getEmDashCollection("posts", { status: "published", limit: 30, orderBy: { published_at: "desc" } });
	const items = (entries as any[])
		.map((p) => {
			const link = `${origin}/blog/${p.id}/`;
			return `<item><title>${esc(p.data.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid>${p.data.publishedAt ? `<pubDate>${new Date(p.data.publishedAt).toUTCString()}</pubDate>` : ""}<description>${esc(p.data.excerpt ?? "")}</description></item>`;
		})
		.join("");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Guías de Sovialis</title><link>${origin}/blog/</link><atom:link href="${origin}/blog/rss.xml" rel="self" type="application/rss+xml"/><language>es-co</language><description>Guías para familias que cuidan a un adulto mayor en Bogotá.</description>${items}</channel></rss>`,
		{ headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
	);
};
