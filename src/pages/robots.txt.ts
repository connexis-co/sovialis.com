import type { APIRoute } from "astro";
import { robotsTxt } from "../../plugins/sovialis-seo/public";

export const GET: APIRoute = async ({ site, url }) =>
	new Response(await robotsTxt((site ?? url).origin), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
