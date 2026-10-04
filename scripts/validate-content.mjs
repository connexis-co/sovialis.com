#!/usr/bin/env node
/**
 * Valida el contenido de content/ contra la guía (docs/CONTENT-GUIDE.md) y la arquitectura SEO.
 *   node scripts/validate-content.mjs [coleccion]
 * Sale con código 1 si hay errores.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONTENT, ROOT, loadAll, plainText, urlOf } from "./lib/content.mjs";

const only = process.argv[2];
const all = await loadAll(only);
const everything = only ? await loadAll() : all;
const sitemap = JSON.parse(await readFile(join(ROOT, "docs/research/sitemap.json"), "utf8"));
const spec = new Map(sitemap.pages.map((p) => [p.url, p]));
const media = new Set(
	JSON.parse(await readFile(join(CONTENT, "media/manifest.json"), "utf8").catch(() => "{}")).keys ?? [],
);

const ICONS = new Set("corazon escudo reloj luna sol casa hospital calendario usuarios usuario estrella check telefono whatsapp ubicacion cerebro venda manos cama silla-ruedas documento chat sparkles medalla familia cafe pastillas brujula".split(" "));
const BLOCKS = new Set("hero trust_bar services_grid card_carousel steps feature_grid media_text tabs_media pricing zones_grid comparison testimonials stats faq cta_band lead_form blog_latest rich_text".split(" "));
const BANNED_TRANSACTIONAL = [
	/enfermeras? a domicilio/i, /servicios? de enfermer[ií]a/i, /enfermer[ií]a domiciliaria/i, /home care/i, /inyectolog/i,
	/inyecci[oó]n/i, /insulina/i, /sueros?\b/i, /curaciones/i, /\bsondas?\b/i, /ox[ií]geno/i, /toma de muestras/i, /signos vitales/i,
];
const BANNED_ANYWHERE = [
	/nuestras empleadas/i, /turnos asignados/i, /supervisamos/i, /\buniforme/i, /dotaci[oó]n/i, /garant[ií]a de reemplazo/i,
	/las mejores cuidadoras/i, /\b100 ?%/, /en el mundo actual/i, /es importante destacar/i, /sin lugar a dudas/i, /brindar una atenci[oó]n de calidad/i,
	/bienestar integral/i, /\bsumerg/i, /\bnavegar\b/i,
];
const BANNED_RECRUITING = [/\bempleo\b/i, /\bsalario/i, /\bjornada/i, /\bvacantes?\b/i];
const TRANSACTIONAL = new Set(["services", "zones"]);
const TRANSACTIONAL_PAGES = new Set(["inicio", "servicios", "precios", "como-funciona", "zonas", "contacto", "nosotros"]);

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`✖ ${f}: ${m}`);
const warn = (f, m) => warnings.push(`⚠ ${f}: ${m}`);

const knownUrls = new Set(["/", "/blog/", "/servicios/", "/zonas/", "/precios/", "/contacto/", "/gracias/", ...sitemap.pages.map((p) => p.url)]);
for (const [col, entries] of Object.entries(everything)) for (const e of entries) if (!e.error) knownUrls.add(urlOf(col, e));

const faqOwner = new Map();
for (const [col, entries] of Object.entries(everything)) {
	for (const e of entries) {
		if (e.error) continue;
		for (const q of [...(e.data.faqs ?? []), ...(e.data.layout ?? []).filter((b) => b._type === "faq").flatMap((b) => b.items ?? [])]) {
			const key = String(q.question ?? "").toLowerCase().replace(/[¿?¡!.,]/g, "").trim();
			if (!key) continue;
			if (faqOwner.has(key) && faqOwner.get(key) !== e.file) err(e.file, `FAQ repetida con ${faqOwner.get(key)}: «${q.question}»`);
			faqOwner.set(key, e.file);
		}
	}
}

for (const [col, entries] of Object.entries(all)) {
	for (const e of entries) {
		const f = e.file;
		if (e.error) {
			err(f, `YAML inválido: ${e.error}`);
			continue;
		}
		const d = e.data;
		const url = urlOf(col, e);
		const s = spec.get(url);
		if (!s && col !== "pages") warn(f, `la URL ${url} no está en sitemap.json`);
		if (!d.title) err(f, "falta title (H1)");
		const legal = col === "pages" && /politica|terminos/.test(e.slug);
		if (!legal) {
			if (!d.seo?.title) err(f, "falta seo.title");
			else if (d.seo.title.length > 60) err(f, `seo.title con ${d.seo.title.length} caracteres (máx. 60)`);
			if (!d.seo?.description) err(f, "falta seo.description");
			else if (d.seo.description.length > 160 || d.seo.description.length < 110) warn(f, `seo.description con ${d.seo.description.length} caracteres (ideal 120–155)`);
		}
		const kw = String(d.focus_keyword ?? s?.primaryKeyword ?? "").toLowerCase();
		const text = plainText(e);
		const lower = text.toLowerCase();
		const norm = (x) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
		if (kw && !legal) {
			const kwWords = norm(kw).split(/\s+/).filter((w) => w.length > 3);
			const has = (str) => kwWords.every((w) => norm(str).includes(w));
			if (d.seo?.title && !has(d.seo.title)) warn(f, `el title no contiene todas las palabras de «${kw}»`);
			if (!has(d.title)) warn(f, `el H1 no contiene todas las palabras de «${kw}»`);
			const first = norm((e.body || d.summary || d.excerpt || d.hero_subtitle || "").slice(0, 900));
			if (!kwWords.every((w) => first.includes(w)) && !has(String(d.hero_subtitle ?? "") + String(d.excerpt ?? "") + String(d.summary ?? ""))) warn(f, `la keyword «${kw}» no aparece al inicio del texto`);
		}
		const words = text.split(/\s+/).filter(Boolean).length;
		const min = { services: 1000, zones: 650, posts: 1200 }[col] ?? 0;
		if (min && words < min) warn(f, `${words} palabras (mínimo orientativo ${min})`);
		const isTransactional = TRANSACTIONAL.has(col) || (col === "pages" && TRANSACTIONAL_PAGES.has(e.slug));
		if (isTransactional) {
			const critical = [d.title, d.seo?.title, d.seo?.description, ...(e.body.match(/^##.*$/gm) ?? []), ...(d.layout ?? []).map((b) => b.title)].join("\n");
			for (const re of BANNED_TRANSACTIONAL) if (re.test(critical)) err(f, `término prohibido en title/H1/meta/H2: ${re}`);
			const enf = (lower.match(/enfermer/g) ?? []).length;
			if (enf > 6) warn(f, `«enfermer…» aparece ${enf} veces; úsalo solo como «formación de auxiliar de enfermería»`);
		}
		for (const re of BANNED_ANYWHERE) if (re.test(text)) err(f, `expresión prohibida o de IA: ${re}`);
		if (e.slug === "trabaja-con-nosotros") for (const re of BANNED_RECRUITING) if (re.test(text)) err(f, `vocabulario laboral prohibido: ${re}`);
		if (/\+?57\s?3\d{2}\s?\d{3}\s?\d{4}|300 892 1144|wa\.me/.test(text)) err(f, "no escribas teléfonos ni enlaces de WhatsApp en el contenido");

		const checkImage = (img, where) => {
			if (!img) return;
			if (typeof img !== "object" || !img.media) return err(f, `${where}: imagen sin «media»`);
			if (media.size && !media.has(img.media)) warn(f, `${where}: la clave de imagen «${img.media}» aún no existe en content/media/manifest.json`);
			if (!img.alt || img.alt.length < 15) err(f, `${where}: alt ausente o muy corto`);
		};
		for (const key of ["hero_image", "featured_image"]) checkImage(d[key], key);
		(d.layout ?? []).forEach((b, i) => {
			if (!BLOCKS.has(b._type)) err(f, `bloque ${i + 1}: _type desconocido «${b._type}»`);
			if (b._type === "testimonials") err(f, "no uses testimonios en v1 (no hay testimonios verificados)");
			checkImage(b.image, `bloque ${i + 1} (${b._type})`);
			for (const list of [b.items, b.steps, b.tabs, b.plans].filter(Array.isArray)) list.forEach((it, j) => {
				if (it.icon && !ICONS.has(it.icon)) err(f, `bloque ${i + 1} elemento ${j + 1}: icono «${it.icon}» no permitido`);
				checkImage(it.image, `bloque ${i + 1} elemento ${j + 1}`);
			});
		});
		if (d.icon && !ICONS.has(d.icon)) err(f, `icono «${d.icon}» no permitido`);

		for (const [, href] of text.matchAll(/\]\((\/[^)\s#]*)/g)) {
			const clean = href.endsWith("/") ? href : `${href}/`;
			if (!href.endsWith("/")) warn(f, `enlace sin barra final: ${href}`);
			if (!knownUrls.has(clean)) warn(f, `enlace interno a URL desconocida: ${href}`);
		}
		const faqs = d.faqs ?? [];
		if (!legal && col !== "pages" && faqs.length < 4) warn(f, `solo ${faqs.length} FAQs`);
		for (const q of faqs) {
			const n = String(q.answer ?? "").split(/\s+/).length;
			if (n < 25 || n > 110) warn(f, `FAQ «${String(q.question).slice(0, 50)}…» con ${n} palabras (ideal 40–80)`);
		}
		if (col === "posts") {
			if (!d.category) err(f, "falta category");
			if (!d.key_takeaways) warn(f, "falta key_takeaways («En resumen»)");
			if (!d.featured_image) err(f, "falta featured_image");
		}
	}
}

console.log(warnings.join("\n"));
console.log(errors.join("\n"));
const total = Object.values(all).reduce((n, list) => n + list.length, 0);
console.log(`\n${total} archivos · ${errors.length} errores · ${warnings.length} avisos`);
process.exit(errors.length ? 1 : 0);
