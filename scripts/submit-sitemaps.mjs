#!/usr/bin/env node
/**
 * Envía el sitemap y las URLs públicas a Bing Webmaster Tools y, si la service account tiene acceso a la
 * propiedad, también a Google Search Console. IndexNow lo dispara el plugin SEO al publicar.
 *
 *   npm run sitemap:submit              → sitemap a Bing + lote de URLs + sitemap a GSC
 *   npm run sitemap:submit -- --quota   → solo muestra la cuota diaria de Bing
 *
 * Credenciales fuera del repo:
 *   BING_WMT_API_KEY o ~/.config/connexis/bing-wmt-apikey
 *   GSC_SERVICE_ACCOUNT o ~/.config/connexis/connexis-sa.json (necesita ser propietaria de sc-domain:sovialis.com)
 */
import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SITE = "https://sovialis.com/";
const SITEMAP = `${SITE}sitemap.xml`;
const GSC_PROPERTY = "sc-domain:sovialis.com";

const readSecret = (envName, file) => process.env[envName] || (existsSync(file) ? readFileSync(file, "utf8").trim() : "");
const bingKey = readSecret("BING_WMT_API_KEY", join(homedir(), ".config/connexis/bing-wmt-apikey"));
const saPath = process.env.GSC_SERVICE_ACCOUNT || join(homedir(), ".config/connexis/connexis-sa.json");

async function bing(method, body) {
	const url = `https://ssl.bing.com/webmaster/api.svc/json/${method}?${body ? "" : `siteUrl=${encodeURIComponent(SITE)}&`}apikey=${bingKey}`;
	const res = await fetch(url, {
		method: body ? "POST" : "GET",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body: body ? JSON.stringify(body) : undefined,
	});
	const text = await res.text();
	console.log(`Bing ${method}: HTTP ${res.status} ${text.slice(0, 200)}`);
	if (!res.ok) process.exitCode = 1;
	return text;
}

async function sitemapUrls() {
	const index = await (await fetch(SITEMAP)).text();
	const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
	const urls = [];
	for (const child of children) {
		const xml = await (await fetch(child)).text();
		for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
	}
	return [...new Set(urls)];
}

/** Token OAuth de la service account (JWT firmado con RS256, sin dependencias). */
async function googleToken() {
	if (!existsSync(saPath)) return null;
	const sa = JSON.parse(readFileSync(saPath, "utf8"));
	const now = Math.floor(Date.now() / 1000);
	const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
	const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
		iss: sa.client_email,
		scope: "https://www.googleapis.com/auth/webmasters",
		aud: "https://oauth2.googleapis.com/token",
		iat: now,
		exp: now + 3600,
	})}`;
	const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
	const res = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
	});
	return res.ok ? (await res.json()).access_token : null;
}

async function submitToGoogle() {
	const token = await googleToken();
	if (!token) return console.log("GSC: sin service account, se omite.");
	const property = encodeURIComponent(GSC_PROPERTY);
	const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${property}/sitemaps/${encodeURIComponent(SITEMAP)}`, {
		method: "PUT",
		headers: { Authorization: `Bearer ${token}` },
	});
	if (res.status === 403) {
		console.log(`GSC: la service account no tiene acceso a ${GSC_PROPERTY}. Agrégala como propietaria en Search Console.`);
		return;
	}
	console.log(`GSC sitemaps.submit: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
}

if (!bingKey) throw new Error("Falta BING_WMT_API_KEY");

if (process.argv.includes("--quota")) {
	await bing("GetUrlSubmissionQuota");
} else {
	await bing("SubmitFeed", { siteUrl: SITE, feedUrl: SITEMAP });
	const urls = await sitemapUrls();
	console.log(`${urls.length} URLs en el sitemap`);
	for (let i = 0; i < urls.length; i += 100) await bing("SubmitUrlbatch", { siteUrl: SITE, urlList: urls.slice(i, i + 100) });
	await submitToGoogle();
}
