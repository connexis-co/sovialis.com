#!/usr/bin/env node
/**
 * Carga content/** en EmDash por la API REST: sube imágenes a la biblioteca de medios, convierte
 * Markdown (incluidas tablas) a Portable Text, crea o actualiza cada entrada por slug y la publica.
 * Es idempotente: se puede repetir en cada iteración sin duplicar nada.
 *
 *   SYNC_URL=http://localhost:4321 node scripts/sync-content.mjs            # local (acceso de desarrollo)
 *   SYNC_URL=https://sovialis.com node scripts/sync-content.mjs             # producción (token de automatización)
 *   node scripts/sync-content.mjs services cuidado-nocturno                 # solo una colección / un slug
 *
 * Producción lee SOVIALIS_AUTOMATION_TOKEN de ~/.config/sovialis/web-secrets.env (nunca del repo).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { markdownToPortableText } from "emdash/client";
import { CONTENT, ROOT, loadCollection, splitFrontmatter } from "./lib/content.mjs";
import { blockTypes, collections } from "./seed/schema.mjs";

const BASE = (process.env.SYNC_URL || "http://localhost:4321").replace(/\/$/, "");
const [onlyCollection, onlySlug] = process.argv.slice(2);

async function loadSecrets() {
	const file = join(homedir(), ".config/sovialis/web-secrets.env");
	if (!existsSync(file)) return {};
	const out = {};
	for (const line of (await readFile(file, "utf8")).split("\n")) {
		const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
		if (m) out[m[1]] = m[2].trim();
	}
	return out;
}
const secrets = await loadSecrets();
const token = process.env.SOVIALIS_AUTOMATION_TOKEN || secrets.SOVIALIS_AUTOMATION_TOKEN || "";
const isLocal = /localhost|127\.0\.0\.1/.test(BASE);
if (!isLocal && !token) throw new Error("Falta SOVIALIS_AUTOMATION_TOKEN para sincronizar con producción.");

const headers = { Origin: BASE, "X-EmDash-Request": "1", ...(token && !isLocal ? { "X-Sovialis-Automation": token } : {}) };

// En desarrollo, EmDash usa su acceso de desarrollo: se obtiene una cookie de sesión de administrador.
if (isLocal) {
	const res = await fetch(`${BASE}/_emdash/api/setup/dev-bypass?redirect=/`, { redirect: "manual" });
	const cookies = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
	if (!cookies) throw new Error(`No se obtuvo sesión de desarrollo (HTTP ${res.status}).`);
	headers.Cookie = cookies;
}

async function api(path, { method = "GET", json, form } = {}) {
	const res = await fetch(BASE + path, {
		method,
		headers: { ...headers, ...(json ? { "Content-Type": "application/json" } : {}) },
		body: json ? JSON.stringify(json) : form,
		signal: AbortSignal.timeout(120_000),
	});
	const text = await res.text();
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		body = { raw: text.slice(0, 300) };
	}
	if (!res.ok || body?.success === false) {
		const error = new Error(`${method} ${path} → ${res.status} ${JSON.stringify(body?.error ?? body).slice(0, 400)}`);
		error.status = res.status;
		throw error;
	}
	return body?.data ?? body;
}

/* ── Portable Text ──────────────────────────────────────────────────────────────────── */
let keySeq = 0;
const key = (p = "k") => `${p}${(keySeq++).toString(36)}`;

function inline(text) {
	const blocks = markdownToPortableText(text || " ");
	const block = blocks[0] ?? { children: [{ _type: "span", text }], markDefs: [] };
	return { spans: (block.children ?? []).map((c) => ({ _type: "span", _key: key("s"), text: c.text ?? "", marks: c.marks ?? [] })), markDefs: block.markDefs ?? [] };
}

function tableBlock(lines) {
	const rows = lines
		.filter((l) => !/^\s*\|?\s*:?-{2,}/.test(l))
		.map((l) =>
			l
				.trim()
				.replace(/^\|/, "")
				.replace(/\|$/, "")
				.split("|")
				.map((c) => c.trim()),
		);
	return {
		_type: "table",
		_key: key("t"),
		hasHeaderRow: true,
		rows: rows.map((cells, r) => ({
			_type: "tableRow",
			_key: key("r"),
			cells: cells.map((cell) => {
				const { spans, markDefs } = inline(cell);
				return { _type: "tableCell", _key: key("c"), isHeader: r === 0, content: spans, markDefs };
			}),
		})),
	};
}

function toPortableText(markdown) {
	if (!markdown || typeof markdown !== "string") return markdown;
	const out = [];
	let buffer = [];
	let table = [];
	const flush = () => {
		if (buffer.length) out.push(...markdownToPortableText(buffer.join("\n")));
		buffer = [];
	};
	for (const line of markdown.split("\n")) {
		if (/^\s*\|.*\|\s*$/.test(line)) {
			if (!table.length) flush();
			table.push(line);
		} else {
			if (table.length) {
				out.push(tableBlock(table));
				table = [];
			}
			buffer.push(line);
		}
	}
	if (table.length) out.push(tableBlock(table));
	flush();
	return out;
}

/* ── Medios ─────────────────────────────────────────────────────────────────────────── */
const manifest = JSON.parse(await readFile(join(CONTENT, "media/manifest.json"), "utf8"));
const cacheDir = join(ROOT, "scripts/.cache");
await mkdir(cacheDir, { recursive: true });
const cacheFile = join(cacheDir, `media-${new URL(BASE).host.replace(/[^a-z0-9]/gi, "_")}.json`);
const mediaCache = existsSync(cacheFile) ? JSON.parse(await readFile(cacheFile, "utf8")) : {};

async function uploadMedia(mediaKey, alt) {
	const meta = manifest.items?.[mediaKey];
	const file = meta?.file ?? `${mediaKey}.webp`;
	const path = join(CONTENT, "media", file);
	if (!existsSync(path)) {
		console.warn(`  ⚠ imagen «${mediaKey}» no existe todavía (${file}); se omite`);
		return null;
	}
	let item = mediaCache[mediaKey];
	if (!item) {
		const bytes = await readFile(path);
		const form = new FormData();
		form.set("file", new Blob([bytes], { type: file.endsWith(".webp") ? "image/webp" : file.endsWith(".png") ? "image/png" : "image/jpeg" }), `sovialis-${file}`);
		form.set("deduplicate", "true");
		const res = await api("/_emdash/api/media", { method: "POST", form });
		item = res.item;
		mediaCache[mediaKey] = item;
		await writeFile(cacheFile, JSON.stringify(mediaCache, null, 2));
		console.log(`  ↑ ${mediaKey} → ${item.id}`);
	}
	const finalAlt = alt || meta?.alt || "";
	if (finalAlt && item.alt !== finalAlt) {
		await api(`/_emdash/api/media/${item.id}`, { method: "PUT", json: { alt: finalAlt } }).catch(() => {});
		item.alt = finalAlt;
	}
	return {
		provider: "local",
		id: item.id,
		filename: item.filename,
		mimeType: item.mimeType,
		width: item.width ?? meta?.width,
		height: item.height ?? meta?.height,
		alt: finalAlt,
		...(item.blurhash ? { blurhash: item.blurhash } : {}),
		...(item.dominantColor ? { dominantColor: item.dominantColor } : {}),
		meta: { storageKey: item.storageKey },
	};
}

/* ── Conversión de campos según el esquema ──────────────────────────────────────────── */
const blockFields = new Map(blockTypes.map((b) => [b.slug, b.versions[0].fields]));

async function convertValue(field, value) {
	if (value === undefined || value === null) return undefined;
	switch (field.type) {
		case "portableText":
			return toPortableText(value);
		case "image":
			return typeof value === "object" && value.media ? uploadMedia(value.media, value.alt) : value;
		case "repeater": {
			const subs = field.validation?.subFields ?? [];
			const rows = [];
			for (const row of value ?? []) {
				const out = {};
				for (const sub of subs) {
					if (row[sub.slug] === undefined) continue;
					out[sub.slug] = sub.type === "image" ? await convertValue(sub, row[sub.slug]) : row[sub.slug];
				}
				rows.push(out);
			}
			return rows;
		}
		case "blocks": {
			const list = [];
			for (const [i, block] of (value ?? []).entries()) {
				const fields = blockFields.get(block._type);
				if (!fields) throw new Error(`Bloque desconocido: ${block._type}`);
				const out = { _type: block._type, _version: 1 };
				for (const f of fields) {
					const converted = await convertValue(f, block[f.slug]);
					if (converted !== undefined) out[f.slug] = converted;
				}
				list.push(out);
			}
			return list;
		}
		case "integer":
		case "number":
			return typeof value === "number" ? value : Number(value);
		case "boolean":
			return Boolean(value);
		case "text":
		case "string":
			return Array.isArray(value) ? value.join("\n") : String(value);
		default:
			return value;
	}
}

async function buildData(collectionSlug, entry, bodyField) {
	const schema = collections.find((c) => c.slug === collectionSlug);
	const data = {};
	for (const field of schema.fields) {
		const raw = field.slug === bodyField && entry.body ? entry.body : entry.data[field.slug];
		const converted = await convertValue(field, raw);
		if (converted !== undefined) data[field.slug] = converted;
	}
	return data;
}

/* ── Upsert ─────────────────────────────────────────────────────────────────────────── */
let bylineId = null;
async function getBylineId() {
	if (bylineId !== null) return bylineId;
	const res = await api("/_emdash/api/admin/bylines?limit=50").catch(() => null);
	const items = res?.items ?? res ?? [];
	bylineId = (Array.isArray(items) ? items : []).find((b) => b.slug === "equipo-sovialis")?.id ?? "";
	return bylineId;
}

const knownTags = new Set();
async function ensureTags(tags) {
	if (!knownTags.size) {
		const res = await api("/_emdash/api/taxonomies/tag/terms?limit=500").catch(() => null);
		for (const t of res?.items ?? res?.terms ?? res ?? []) if (t?.slug) knownTags.add(t.slug);
	}
	for (const slug of tags) {
		if (knownTags.has(slug)) continue;
		const label = slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
		await api("/_emdash/api/taxonomies/tag/terms", { method: "POST", json: { slug, label } }).catch((e) => console.warn(`  ⚠ etiqueta ${slug}: ${e.message}`));
		knownTags.add(slug);
	}
}

async function upsert(collection, slug, data, extras = {}) {
	let existing = null;
	try {
		existing = await api(`/_emdash/api/content/${collection}/${encodeURIComponent(slug)}`);
	} catch (e) {
		if (e.status !== 404) throw e;
	}
	const item = existing?.item ?? existing;
	let id = item?.id;
	if (id) {
		await api(`/_emdash/api/content/${collection}/${id}`, {
			method: "PUT",
			json: { data, ...extras, _rev: existing?._rev ?? item?._rev, replaceBlocks: true, overrideLock: true },
		});
	} else {
		const created = await api(`/_emdash/api/content/${collection}`, { method: "POST", json: { slug, data, ...extras, replaceBlocks: true } });
		id = (created?.item ?? created)?.id;
	}
	if (extras.status !== "draft") {
		const fresh = await api(`/_emdash/api/content/${collection}/${id}`);
		await api(`/_emdash/api/content/${collection}/${id}/publish`, { method: "POST", json: { _rev: fresh?._rev ?? fresh?.item?._rev } });
	}
	return id;
}

const ORDER = ["services", "zones", "posts", "pages"];
const BODY = { pages: "body", services: "body", zones: "intro", posts: "content" };
let ok = 0;
let failed = 0;

// Ajustes del sitio (singleton «general» de la colección site).
if (!onlyCollection || onlyCollection === "site") {
	const sitePath = join(CONTENT, "site.md");
	if (existsSync(sitePath)) {
		const { data } = splitFrontmatter(await readFile(sitePath, "utf8"));
		try {
			const built = await buildData("site", { data, body: "" }, null);
			await upsert("site", "general", built);
			console.log("✓ site/general");
			ok++;
		} catch (e) {
			console.error(`✖ site/general: ${e.message}`);
			failed++;
		}
	}
}

for (const collection of ORDER) {
	if (onlyCollection && onlyCollection !== collection) continue;
	for (const entry of await loadCollection(collection)) {
		if (onlySlug && entry.slug !== onlySlug) continue;
		if (entry.error) {
			console.error(`✖ ${entry.file}: ${entry.error}`);
			failed++;
			continue;
		}
		try {
			const data = await buildData(collection, entry, BODY[collection]);
			const d = entry.data;
			const extras = {
				status: d.status === "draft" ? "draft" : undefined,
				seo: d.seo || d.noindex ? { title: d.seo?.title ?? null, description: d.seo?.description ?? null, noIndex: Boolean(d.noindex) } : undefined,
			};
			if (collection === "posts") {
				const tags = Array.isArray(d.tags) ? d.tags : [];
				await ensureTags(tags);
				extras.taxonomies = { category: d.category ? [d.category] : [], tag: tags };
				const byline = await getBylineId();
				if (byline) extras.bylines = [{ bylineId: byline }];
				if (d.published_at) extras.publishedAt = new Date(`${d.published_at}T08:00:00-05:00`).toISOString();
			}
			for (const k of Object.keys(extras)) if (extras[k] === undefined) delete extras[k];
			await upsert(collection, entry.slug, data, extras);
			console.log(`✓ ${collection}/${entry.slug}`);
			ok++;
		} catch (e) {
			console.error(`✖ ${collection}/${entry.slug}: ${e.message}`);
			failed++;
		}
	}
}

console.log(`\n${ok} entradas sincronizadas · ${failed} con error · destino ${BASE}`);
process.exit(failed ? 1 : 0);
