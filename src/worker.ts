/**
 * Punto de entrada del Worker: redirecciones de host y barra final, caché en el borde, cabeceras de
 * seguridad y el handler de EmDash.
 */
import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

const CANONICAL_HOST = "sovialis.com";

const SECURITY_HEADERS: Record<string, string> = {
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
	"X-Frame-Options": "SAMEORIGIN",
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

/** Parámetros de campaña que no cambian el contenido: no fragmentan la caché. */
const TRACKING_PARAMS = /^(utm_[a-z]+|gclid|gbraid|wbraid|fbclid|msclkid|_gl)$/;
const MEDIA_PREFIX = "/_emdash/api/media/file/";
const HTML_TTL = 600;
const TEXT_TTL = 3600;

function withSecurityHeaders(response: Response): Response {
	const res = new Response(response.body, response);
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) if (!res.headers.has(key)) res.headers.set(key, value);
	return res;
}

/** Decide si la petición se puede servir desde la caché del borde y con qué clave y TTL. */
function cachePlan(request: Request, url: URL): { key: Request; ttl: number; immutable: boolean } | null {
	if (request.method !== "GET") return null;
	const cookie = request.headers.get("Cookie") ?? "";
	if (url.pathname.startsWith(MEDIA_PREFIX)) {
		return { key: new Request(`${url.origin}${url.pathname}`), ttl: 31_536_000, immutable: true };
	}
	if (url.pathname.startsWith("/_emdash") || url.pathname.startsWith("/_image")) return null;
	// Sesiones del panel o de Access: siempre fresco (barra de edición, borradores).
	if (/CF_Authorization|astro-session|emdash/i.test(cookie)) return null;
	const params = [...url.searchParams.keys()];
	if (params.some((p) => !TRACKING_PARAMS.test(p))) return null;
	const isText = /\.(xml|txt)$/.test(url.pathname);
	return { key: new Request(`${url.origin}${url.pathname}`), ttl: isText ? TEXT_TTL : HTML_TTL, immutable: false };
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
			!/\.[a-z0-9]{2,12}$/i.test(url.pathname)
		) {
			url.pathname += "/";
			return Response.redirect(url.toString(), 301);
		}
		if (!handler.fetch) return new Response("Aplicación no disponible", { status: 503 });

		const plan = cachePlan(request, url);
		const cache = (caches as unknown as { default: Cache }).default;
		if (plan) {
			const hit = await cache.match(plan.key);
			if (hit) {
				const res = new Response(hit.body, hit);
				res.headers.set("X-Sovialis-Cache", "HIT");
				if (!plan.immutable) res.headers.set("Cache-Control", `public, max-age=0, s-maxage=${plan.ttl}, must-revalidate`);
				return res;
			}
		}

		const response = withSecurityHeaders(await handler.fetch(request, env, ctx));
		if (plan && response.status === 200 && !response.headers.has("Set-Cookie")) {
			const browserTtl = plan.immutable ? plan.ttl : 0;
			response.headers.set(
				"Cache-Control",
				plan.immutable ? `public, max-age=${browserTtl}, immutable` : `public, max-age=0, s-maxage=${plan.ttl}, must-revalidate`,
			);
			response.headers.set("X-Sovialis-Cache", "MISS");
			const toStore = response.clone();
			toStore.headers.set("Cache-Control", `public, max-age=${plan.ttl}`);
			ctx.waitUntil(cache.put(plan.key, toStore));
		}
		return response;
	},
	scheduled: createScheduledHandler(),
} satisfies ExportedHandler<Env>;
