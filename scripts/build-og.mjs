#!/usr/bin/env node
/**
 * Tarjetas Open Graph (1200×630 JPEG) para compartir en WhatsApp y redes: foto de la página,
 * degradado de marca, título, píldora con el precio «desde» (servicios) y el logo.
 *
 *   node scripts/build-og.mjs            → lee títulos, precios y fotos actuales del panel (producción)
 *   OG_SOURCE=local node scripts/build-og.mjs → usa content/** (sin red)
 *
 * Salida: public/og/gen/<colección>/<slug>.jpg + src/data/og-manifest.json (ignorados en git).
 * El despliegue lo ejecuta antes de compilar, así el precio editado en el panel sale en la tarjeta.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { CONTENT, ROOT, loadCollection } from "./lib/content.mjs";

const SITE = "https://sovialis.com";
const W = 1200;
const H = 630;
const OUT = join(ROOT, "public/og/gen");
const FONTS = ["jost-latin-600-normal", "jost-latin-500-normal", "atkinson-hyperlegible-next-latin-500-normal", "atkinson-hyperlegible-next-latin-700-normal"].map((f) =>
	join(ROOT, `scripts/og/fonts/${f}.ttf`),
);
const DIR = { services: "servicios", zones: "zonas", posts: "blog", pages: "paginas" };

async function secret(name) {
	if (process.env[name]) return process.env[name];
	const file = join(homedir(), ".config/sovialis/web-secrets.env");
	if (!existsSync(file)) return "";
	const line = (await readFile(file, "utf8")).split("\n").find((l) => l.startsWith(`${name}=`));
	return line ? line.slice(name.length + 1).trim() : "";
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const cop = (n) => `$${Math.round(n).toLocaleString("es-CO").replace(/,/g, ".")}`;

/** Corte de líneas aproximado por ancho medio de carácter de la fuente. */
function wrap(text, size, maxWidth, maxLines) {
	const perLine = Math.floor(maxWidth / (size * 0.5));
	const lines = [];
	let line = "";
	for (const word of String(text).split(/\s+/)) {
		if ((line + " " + word).trim().length > perLine && line) {
			lines.push(line);
			line = word;
		} else line = (line + " " + word).trim();
	}
	if (line) lines.push(line);
	if (lines.length > maxLines) {
		lines.length = maxLines;
		lines[maxLines - 1] = lines[maxLines - 1].replace(/\s+\S*$/, "") + "…";
	}
	return lines;
}

async function photoDataUri(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`foto ${res.status} ${url}`);
	const input = Buffer.from(await res.arrayBuffer());
	const { width = 1, height = 1 } = await sharp(input).metadata();
	// En fotos verticales el recorte toma la parte superior (caras); en horizontales, la zona de interés.
	const jpg = await sharp(input).resize(W, H, { fit: "cover", position: height > width ? "north" : "attention" }).jpeg({ quality: 88 }).toBuffer();
	return `data:image/jpeg;base64,${jpg.toString("base64")}`;
}

const logo = `data:image/svg+xml;base64,${(await readFile(join(ROOT, "public/brand/sovialis-logo-completo-negativo.svg"))).toString("base64")}`;

function card({ title, eyebrow, pill, pillSmall, photo }) {
	const size = title.length > 58 ? 50 : title.length > 40 ? 56 : 62;
	const lines = wrap(title, size, 680, 3);
	const titleY = 210 - (lines.length - 1) * (size * 0.55);
	const tspans = lines.map((l, i) => `<tspan x="72" dy="${i ? size * 1.1 : 0}">${esc(l)}</tspan>`).join("");
	const pillW = Math.max(240, Math.min(620, 40 + pill.length * 20 + (pillSmall ? pillSmall.length * 11 + 14 : 0)));
	const pillY = titleY + (lines.length - 1) * size * 1.1 + 52;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<defs>
		<linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
			<stop offset="0" stop-color="#0B2A4E" stop-opacity=".97"/>
			<stop offset=".46" stop-color="#0B2A4E" stop-opacity=".88"/>
			<stop offset=".72" stop-color="#0B2A4E" stop-opacity=".25"/>
			<stop offset="1" stop-color="#0B2A4E" stop-opacity="0"/>
		</linearGradient>
		<linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#005E9D"/><stop offset="1" stop-color="#00A6D6"/></linearGradient>
	</defs>
	${photo ? `<image href="${photo}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="${W}" height="${H}" fill="#0B2A4E"/>`}
	<rect width="${W}" height="${H}" fill="url(#fade)"/>
	<rect x="0" y="${H - 10}" width="${W}" height="10" fill="url(#bar)"/>
	<text x="72" y="96" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="22" letter-spacing="3.5" fill="#8FD8F2">${esc(eyebrow.toUpperCase())}</text>
	<text x="72" y="${titleY}" font-family="Jost" font-weight="600" font-size="${size}" fill="#FFFFFF">${tspans}</text>
	<rect x="72" y="${pillY}" width="${pillW}" height="60" rx="30" fill="#F08A65"/>
	<text x="98" y="${pillY + 40}" font-family="Jost" font-weight="600" font-size="30" fill="#0B2A4E">${esc(pill)}${pillSmall ? `<tspan font-family="Atkinson Hyperlegible Next" font-weight="500" font-size="21" dx="12">${esc(pillSmall)}</tspan>` : ""}</text>
	<image href="${logo}" x="72" y="${H - 112}" width="200" height="62" preserveAspectRatio="xMinYMid meet"/>
	<text x="296" y="${H - 72}" font-family="Atkinson Hyperlegible Next" font-weight="500" font-size="21" fill="#FFFFFF" fill-opacity=".86">sovialis.com · WhatsApp 311 759 8641</text>
</svg>`;
}

async function render(svg) {
	const png = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Atkinson Hyperlegible Next" }, fitTo: { mode: "width", value: W } }).render().asPng();
	return sharp(png).jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
}

/* ── Datos: panel en producción (por defecto) o archivos locales ──────────────────── */
const local = process.env.OG_SOURCE === "local";
const token = local ? "" : await secret("SOVIALIS_AUTOMATION_TOKEN");
const headers = { Origin: SITE, "X-EmDash-Request": "1", ...(token ? { "X-Sovialis-Automation": token } : {}) };
const mediaUrl = (img) => {
	const key = img?.meta?.storageKey;
	return key ? `${SITE}/_emdash/api/media/file/${key}` : null;
};

async function entries(collection) {
	if (token) {
		const res = await fetch(`${SITE}/_emdash/api/content/${collection}?limit=100&status=published`, { headers });
		if (res.ok) {
			const body = await res.json();
			const items = body?.data?.items ?? body?.items ?? [];
			return items.filter((i) => i.status === "published" || !i.status).map((i) => ({ slug: i.slug, ...i.data }));
		}
		console.warn(`  ⚠ API ${collection}: HTTP ${res.status}; uso archivos locales`);
	}
	return (await loadCollection(collection)).filter((e) => !e.error).map((e) => ({ slug: e.slug, ...e.data, _localImage: e.data.hero_image?.media || e.data.featured_image?.media }));
}

async function localPhoto(key) {
	const file = join(CONTENT, "media", `${key}.webp`);
	if (!key || !existsSync(file)) return null;
	const jpg = await sharp(file).resize(W, H, { fit: "cover", position: "attention" }).jpeg({ quality: 88 }).toBuffer();
	return `data:image/jpeg;base64,${jpg.toString("base64")}`;
}

const [services] = await Promise.all([entries("services")]);
const minPrice = Math.min(...services.map((s) => Number(s.price_from) || Infinity).filter(Number.isFinite));
const jobs = [];
for (const s of services) {
	jobs.push({
		collection: "services",
		slug: s.slug,
		title: s.title,
		eyebrow: "Sovialis · Cuidado en casa · Bogotá",
		pill: s.price_from ? `Desde ${cop(s.price_from)}` : "Cotiza por WhatsApp",
		pillSmall: s.price_from ? s.price_unit || "" : "",
		image: s.hero_image,
		local: s._localImage,
		alt: `${s.title}: desde ${s.price_from ? cop(s.price_from) : ""} ${s.price_unit || ""}`.trim(),
	});
}
for (const z of await entries("zones")) {
	jobs.push({
		collection: "zones",
		slug: z.slug,
		title: z.title,
		eyebrow: "Sovialis · Cuidadoras verificadas",
		pill: Number.isFinite(minPrice) ? `Desde ${cop(minPrice)}` : "Cobertura confirmada",
		pillSmall: Number.isFinite(minPrice) ? "por hora" : "",
		image: z.hero_image,
		local: z._localImage,
		alt: `${z.title} con Sovialis`,
	});
}
for (const p of await entries("posts")) {
	jobs.push({ collection: "posts", slug: p.slug, title: p.title, eyebrow: "Guías Sovialis para familias", pill: "Guía gratuita", pillSmall: "", image: p.featured_image, local: p._localImage, alt: p.title });
}
const featured = services.find((s) => s.slug === "cuidadora-adulto-mayor") ?? services[0];
jobs.push({
	collection: "pages",
	slug: "default",
	title: "Cuidado del adulto mayor a domicilio en Bogotá",
	eyebrow: "Sovialis · Vínculos que protegen",
	pill: Number.isFinite(minPrice) ? `Desde ${cop(minPrice)}` : "Cotiza por WhatsApp",
	pillSmall: Number.isFinite(minPrice) ? "por hora" : "",
	image: featured?.hero_image,
	local: featured?._localImage ?? "servicio-cuidadora",
	alt: "Sovialis: cuidado del adulto mayor a domicilio en Bogotá",
});

const manifest = {};
let done = 0;
for (const job of jobs) {
	const version = createHash("sha1").update(JSON.stringify([job.title, job.pill, job.pillSmall, job.image?.meta?.storageKey ?? job.local])).digest("hex").slice(0, 10);
	const rel = `/og/gen/${DIR[job.collection]}/${job.slug}.jpg`;
	try {
		const photo = (!local && mediaUrl(job.image) ? await photoDataUri(mediaUrl(job.image)) : null) ?? (await localPhoto(job.local));
		const jpg = await render(card({ ...job, photo }));
		await mkdir(join(OUT, DIR[job.collection]), { recursive: true });
		await writeFile(join(ROOT, "public", rel), jpg);
		manifest[`${job.collection}/${job.slug}`] = { src: `${rel}?v=${version}`, alt: job.alt, width: W, height: H };
		done++;
	} catch (e) {
		console.warn(`  ✖ ${job.collection}/${job.slug}: ${e.message}`);
	}
}
await mkdir(join(ROOT, "src/data"), { recursive: true });
await writeFile(join(ROOT, "src/data/og-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`OG: ${done}/${jobs.length} tarjetas en public/og/gen`);
