/**
 * Punto de entrada del Worker: redirecciones de host, cabeceras de seguridad y el handler de EmDash.
 */
import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

const CANONICAL_HOST = "sovialis.com";

const SECURITY_HEADERS: Record<string, string> = {
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
	"X-Frame-Options": "SAMEORIGIN",
};

function withSecurityHeaders(response: Response): Response {
	const res = new Response(response.body, response);
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
		if (!res.headers.has(key)) res.headers.set(key, value);
	}
	res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	return res;
}

export default {
	...handler,
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (url.hostname === `www.${CANONICAL_HOST}`) {
			url.hostname = CANONICAL_HOST;
			return Response.redirect(url.toString(), 301);
		}
		// Barra final canónica en páginas públicas (Astro usa trailingSlash "ignore" porque la API de EmDash
		// no lleva barra). Se excluyen el CMS, la API y cualquier archivo con extensión.
		if (
			(request.method === "GET" || request.method === "HEAD") &&
			url.pathname !== "/" &&
			!url.pathname.endsWith("/") &&
			!url.pathname.startsWith("/_emdash") &&
			!url.pathname.startsWith("/_astro") &&
			!url.pathname.startsWith("/cdn-cgi") &&
			!/\.[a-z0-9]{2,5}$/i.test(url.pathname)
		) {
			url.pathname += "/";
			return Response.redirect(url.toString(), 301);
		}
		if (!handler.fetch) return new Response("Aplicación no disponible", { status: 503 });
		const response = await handler.fetch(request, env, ctx);
		return withSecurityHeaders(response);
	},
	scheduled: createScheduledHandler(),
} satisfies ExportedHandler<Env>;
