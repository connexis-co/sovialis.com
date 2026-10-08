import type { APIRoute } from "astro";
import { llmsTxt } from "../../plugins/sovialis-seo/public";

export const GET: APIRoute = async ({ site, url }) =>
	new Response(await llmsTxt((site ?? url).origin, true), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
