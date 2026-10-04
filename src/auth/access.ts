/**
 * Autenticación del panel de EmDash con Cloudflare Access.
 *
 * - Personas: Access (código al correo, política «Equipo Sovialis») firma un JWT; aquí se valida
 *   contra las llaves públicas del equipo y se entrega un usuario administrador con ese correo.
 * - Automatización: los scripts de sincronización de contenido envían `X-Sovialis-Automation` con un
 *   secreto del Worker (`SOVIALIS_AUTOMATION_TOKEN`); también se acepta un token de servicio de Access.
 * - Desarrollo local (`SOVIALIS_ENV=development`): acceso directo como administrador.
 *
 * Las rutas públicas (comentarios, envío de leads, estrellas, medios) no pasan por Access:
 * para ellas este módulo lanza un error y EmDash las atiende como visitante anónimo.
 */
import { env } from "cloudflare:workers";
import { createRemoteJWKSet, jwtVerify } from "jose";

interface AccessEnv {
	SOVIALIS_ENV?: string;
	CF_ACCESS_AUDIENCE?: string;
	CF_ACCESS_TEAM_DOMAIN?: string;
	CF_ACCESS_AUTOMATION_CLIENT_ID?: string;
	SOVIALIS_AUTOMATION_TOKEN?: string;
	ADMIN_EMAILS?: string;
}

const AUTOMATION_USER = { email: "automatizacion@sovialis.com", name: "Automatización", role: 50, subject: "sovialis-automation" };

async function sameSecret(a: string, b: string): Promise<boolean> {
	const enc = new TextEncoder();
	const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
	const x = new Uint8Array(ha);
	const y = new Uint8Array(hb);
	let diff = 0;
	for (let i = 0; i < x.length; i++) diff |= x[i]! ^ y[i]!;
	return diff === 0;
}

const ADMIN = 50;
const jwksByDomain = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwks(teamDomain: string) {
	let set = jwksByDomain.get(teamDomain);
	if (!set) {
		set = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
		jwksByDomain.set(teamDomain, set);
	}
	return set;
}

function readJwt(request: Request): string | null {
	const header = request.headers.get("Cf-Access-Jwt-Assertion");
	if (header) return header;
	return (request.headers.get("Cookie") ?? "").match(/CF_Authorization=([^;]+)/)?.[1] ?? null;
}

export async function authenticate(request: Request) {
	const e = env as unknown as AccessEnv;

	const host = new URL(request.url).hostname;
	if (e.SOVIALIS_ENV === "development" && (host === "localhost" || host === "127.0.0.1")) {
		return { email: "dev@sovialis.com", name: "Desarrollo local", role: ADMIN, subject: "sovialis-dev" };
	}

	const automation = request.headers.get("X-Sovialis-Automation");
	if (automation && e.SOVIALIS_AUTOMATION_TOKEN && automation.length >= 32 && (await sameSecret(automation, e.SOVIALIS_AUTOMATION_TOKEN))) {
		return AUTOMATION_USER;
	}

	const teamDomain = e.CF_ACCESS_TEAM_DOMAIN;
	const audience = e.CF_ACCESS_AUDIENCE;
	if (!teamDomain || !audience) throw new Error("Cloudflare Access no está configurado");

	const jwt = readJwt(request);
	if (!jwt) throw new Error("Sin sesión de Cloudflare Access");

	const { payload } = await jwtVerify(jwt, jwks(teamDomain), {
		issuer: `https://${teamDomain}`,
		audience: audience.split(",").map((a) => a.trim()).filter(Boolean),
		clockTolerance: 60,
	});

	const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
	if (email) {
		const allowed = (e.ADMIN_EMAILS ?? "").split(",").map((a) => a.trim().toLowerCase()).filter(Boolean);
		if (allowed.length && !allowed.includes(email)) throw new Error("Correo sin permiso de administración");
		return { email, name: email.split("@")[0] ?? email, role: ADMIN, subject: String(payload.sub ?? email) };
	}

	const commonName = typeof payload.common_name === "string" ? payload.common_name : "";
	if (commonName && commonName === e.CF_ACCESS_AUTOMATION_CLIENT_ID) {
		return { ...AUTOMATION_USER, subject: commonName };
	}

	throw new Error("Identidad de Access no reconocida");
}
