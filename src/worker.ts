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
/**
 * Stale-while-revalidate: la caché del borde es por centro de datos y el sitio tiene poco tráfico, así
 * que con un TTL de 10 min casi todas las visitas encontraban la página «fría» (0,5-1,5 s de respuesta).
 * Ahora la copia se guarda una semana: si tiene más de HTML_TTL se sirve igual al instante y se renueva
 * en segundo plano (los cambios del panel aparecen en la visita siguiente pasados los 10 min).
 */
const STALE_TTL = 7 * 86_400;
const STORED_AT = "X-Sovialis-Stored";
const YEAR = 31_536_000;
/** Archivos públicos sin hash en el nombre (íconos, fuentes, tarjetas OG): una semana en el navegador. */
const STATIC_FILE = /\.(woff2?|png|jpe?g|webp|avif|svg|ico|webmanifest)$/i;

function withSecurityHeaders(response: Response): Response {
	const res = new Response(response.body, response);
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) if (!res.headers.has(key)) res.headers.set(key, value);
	return res;
}

interface CachePlan {
	key: Request;
	/** Segundos que la copia del borde se considera fresca. */
	ttl: number;
	/** Segundos que se conserva para servirla vencida mientras se renueva. */
	stale: number;
	/** Cache-Control para el navegador. */
	browser: string;
}

/** Decide si la petición se puede servir desde la caché del borde, con qué clave y qué cabeceras. */
function cachePlan(request: Request, url: URL): CachePlan | null {
	if (request.method !== "GET") return null;
	const cookie = request.headers.get("Cookie") ?? "";
	const key = new Request(`${url.origin}${url.pathname}`);
	// Medios y archivos con hash: inmutables. Antes recibían la política del HTML (max-age=0) y el
	// navegador los volvía a validar en cada página.
	if (url.pathname.startsWith(MEDIA_PREFIX) || url.pathname.startsWith("/_astro/")) {
		return { key, ttl: YEAR, stale: YEAR, browser: `public, max-age=${YEAR}, immutable` };
	}
	if (STATIC_FILE.test(url.pathname) && !url.pathname.startsWith("/_emdash")) {
		return { key, ttl: 86_400, stale: 86_400, browser: "public, max-age=604800, stale-while-revalidate=86400" };
	}
	if (url.pathname.startsWith("/_emdash") || url.pathname.startsWith("/_image")) return null;
	// Sesiones del panel o de Access: siempre fresco (barra de edición, borradores).
	if (/CF_Authorization|astro-session|emdash/i.test(cookie)) return null;
	const params = [...url.searchParams.keys()];
	if (params.some((p) => !TRACKING_PARAMS.test(p))) return null;
	const ttl = /\.(xml|txt)$/.test(url.pathname) ? TEXT_TTL : HTML_TTL;
	return { key, ttl, stale: STALE_TTL, browser: `public, max-age=0, s-maxage=${ttl}, must-revalidate` };
}

/** Genera la respuesta con EmDash y, si es cacheable, la guarda en el borde con su hora. */
async function renderAndStore(request: Request<unknown, IncomingRequestCfProperties>, env: Env, ctx: ExecutionContext, plan: CachePlan | null, cache: Cache): Promise<Response> {
	const response = withSecurityHeaders(await handler.fetch!(request, env, ctx));
	if (plan && response.status === 200 && !response.headers.has("Set-Cookie")) {
		response.headers.set("Cache-Control", plan.browser);
		response.headers.set("X-Sovialis-Cache", "MISS");
		const toStore = response.clone();
		toStore.headers.set("Cache-Control", `public, max-age=${plan.stale}`);
		toStore.headers.set(STORED_AT, String(Date.now()));
		ctx.waitUntil(cache.put(plan.key, toStore));
	}
	return response;
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
				const storedAt = Number(hit.headers.get(STORED_AT) || 0);
				const stale = storedAt > 0 && Date.now() - storedAt > plan.ttl * 1000;
				// Vencida: se entrega igual y se renueva en segundo plano (GET sin cookies de sesión).
				if (stale) ctx.waitUntil(renderAndStore(request, env, ctx, plan, cache).then((r) => r.body?.cancel()));
				const res = new Response(hit.body, hit);
				res.headers.delete(STORED_AT);
				res.headers.set("X-Sovialis-Cache", stale ? "STALE" : "HIT");
				res.headers.set("Cache-Control", plan.browser);
				return res;
			}
		}

		return renderAndStore(request, env, ctx, plan, cache);
	},
	scheduled: createScheduledHandler(),
} satisfies ExportedHandler<Env>;
