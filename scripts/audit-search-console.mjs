#!/usr/bin/env node
/**
 * Auditoría de Sovialis: inspección INDEXADA de Google + marcado LIVE del sitio.
 * No solicita indexación, no añade reseñas y nunca guarda credenciales en el informe.
 * GSC_SERVICE_ACCOUNT=/ruta/sa.json node scripts/audit-search-console.mjs
 * Opciones: --output archivo.json, --submit-sitemap (sitemap, no solicitud de rastreo).
 */
import { createSign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SITE = "https://sovialis.com";
const PROPERTY = "sc-domain:sovialis.com";
const SITEMAP = `${SITE}/sitemap.xml`;
const args = process.argv.slice(2);
const outputAt = args.indexOf("--output");
const output = outputAt >= 0 ? args[outputAt + 1] : undefined;
if (outputAt >= 0 && (!output || output.startsWith("--"))) throw Error("--output necesita una ruta");

async function request(url, options = {}) {
	const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60_000) });
	if (!response.ok)
		throw Error(`HTTP ${response.status} al consultar ${new URL(url).hostname}${new URL(url).pathname}`);
	return response;
}
const saPath = process.env.GSC_SERVICE_ACCOUNT || join(homedir(), ".config/connexis/connexis-sa.json");
const sa = JSON.parse(readFileSync(saPath, "utf8"));
const now = Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
	iss: sa.client_email,
	scope: "https://www.googleapis.com/auth/webmasters",
	aud: "https://oauth2.googleapis.com/token",
	iat: now,
	exp: now + 3600,
})}`;
const tokenResponse = await request("https://oauth2.googleapis.com/token", {
	method: "POST",
	body: new URLSearchParams({
		grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
		assertion: `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url")}`,
	}),
});
const { access_token } = await tokenResponse.json();
if (!access_token) throw Error("OAuth no devolvió un token");
const headers = { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" };
const sites = await (await request("https://www.googleapis.com/webmasters/v3/sites", { headers })).json();
const site = sites.siteEntry?.find((s) => s.siteUrl === PROPERTY);
if (!site) throw Error(`La cuenta de servicio no tiene acceso a ${PROPERTY}`);
console.log(`${PROPERTY}: ${site.permissionLevel}`);
const api = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/sitemaps`;
if (args.includes("--submit-sitemap")) {
	await request(`${api}/${encodeURIComponent(SITEMAP)}`, { method: "PUT", headers });
	console.log("Sitemap enviado a Google (no equivale a solicitar indexación).");
}
const sitemaps = await (await request(api, { headers })).json();
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
const children = locs(await (await request(SITEMAP)).text());
for (const child of children) if (new URL(child).origin !== SITE) throw Error("Sitemap externo inesperado");
const urls = [
	...new Set(
		(await Promise.all(children.map(async (child) => locs(await (await request(child)).text())))).flat(),
	),
];
const report = {
	date: new Date().toISOString(),
	site: PROPERTY,
	permission: site.permissionLevel,
	sitemaps,
	urls: [],
};
let cursor = 0;
await Promise.all(
	Array.from({ length: 3 }, async () => {
		while (cursor < urls.length) {
			const url = urls[cursor++];
			if (new URL(url).origin !== SITE) throw Error("URL externa inesperada");
			try {
				const indexed = await (
					await request("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
						method: "POST",
						headers,
						body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY, languageCode: "es-CO" }),
					})
				).json();
				const response = await request(url);
				const html = await response.text();
				const nodes = [
					...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
				].flatMap((m) => {
					try {
						const j = JSON.parse(m[1]);
						return j["@graph"] ?? [j];
					} catch {
						return [{ parseError: true }];
					}
				});
				const liveIssues = nodes.filter((n) => n.parseError).map(() => "JSON-LD inválido");
				const ratings = nodes
					.filter((n) => n.aggregateRating)
					.map((n) => ({ type: n["@type"], name: n.name ?? n.headline, rating: n.aggregateRating }));
				// En este sitio solo Product es elegible para fragmentos de reseñas de Google.
				for (const rating of ratings)
					if (rating.type !== "Product") liveIssues.push(`aggregateRating no elegible en ${rating.type}`);
				const ogImage = html.match(/property="og:image" content="([^"]+)/)?.[1];
				if (!ogImage) liveIssues.push("Falta og:image");
				const inspection = indexed.inspectionResult;
				if (!inspection) throw Error("Google no devolvió inspectionResult");
				const row = {
					url,
					http: response.status,
					inspection,
					live: { ratings, types: nodes.map((n) => n["@type"]), ogImage, issues: liveIssues },
				};
				report.urls.push(row);
				console.log(
					`${inspection.indexStatusResult?.coverageState ?? "Sin estado"} | ${url} | live: ${liveIssues.length} incidencias`,
				);
			} catch (error) {
				report.urls.push({ url, error: error.message });
				console.error(`No se completó: ${url}: ${error.message}`);
			}
		}
	}),
);
report.urls.sort((a, b) => a.url.localeCompare(b.url));
const states = {};
let indexedErrors = 0,
	indexedWarnings = 0,
	liveIssues = 0;
for (const row of report.urls) {
	const state = row.inspection?.indexStatusResult?.coverageState ?? "Error de consulta";
	states[state] = (states[state] ?? 0) + 1;
	for (const group of row.inspection?.richResultsResult?.detectedItems ?? [])
		for (const item of group.items ?? [])
			for (const issue of item.issues ?? []) {
				if (issue.severity === "ERROR") indexedErrors++;
				if (issue.severity === "WARNING") indexedWarnings++;
			}
	liveIssues += row.live?.issues.length ?? 0;
}
report.summary = {
	urls: report.urls.length,
	states,
	indexedErrors,
	indexedWarnings,
	liveIssues,
	queryErrors: report.urls.filter((r) => r.error).length,
};
console.log(JSON.stringify(report.summary, null, 2));
console.log(
	"La inspección de Google es histórica: el marcado live puede estar corregido antes del siguiente rastreo.",
);
if (output) writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
if (liveIssues || report.summary.queryErrors) process.exitCode = 1;
