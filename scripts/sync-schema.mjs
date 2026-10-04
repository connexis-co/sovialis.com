#!/usr/bin/env node
/**
 * Lleva el esquema de scripts/seed/schema.mjs a una instalación existente de EmDash (el seed solo se
 * aplica en una base vacía): crea tipos de bloque nuevos, actualiza los existentes (cambios aditivos
 * en el mismo versionado; con --breaking crea versión nueva), agrega campos nuevos a las colecciones y
 * actualiza los tipos de bloque permitidos en los campos «blocks». Nunca borra campos ni datos.
 *
 *   SYNC_URL=http://localhost:4321 node scripts/sync-schema.mjs
 *   SYNC_URL=https://sovialis.com node scripts/sync-schema.mjs [--breaking] [--dry]
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { blockTypes, collections } from "./seed/schema.mjs";

const BASE = (process.env.SYNC_URL || "http://localhost:4321").replace(/\/$/, "");
const DRY = process.argv.includes("--dry");
const BREAKING = process.argv.includes("--breaking");
const isLocal = /localhost|127\.0\.0\.1/.test(BASE);

async function secret(name) {
	if (process.env[name]) return process.env[name];
	const file = join(homedir(), ".config/sovialis/web-secrets.env");
	if (!existsSync(file)) return "";
	const line = (await readFile(file, "utf8")).split("\n").find((l) => l.startsWith(`${name}=`));
	return line ? line.slice(name.length + 1).trim() : "";
}

const headers = { Origin: BASE, "X-EmDash-Request": "1" };
if (isLocal) {
	const res = await fetch(`${BASE}/_emdash/api/setup/dev-bypass?redirect=/`, { redirect: "manual" });
	headers.Cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
} else {
	const token = await secret("SOVIALIS_AUTOMATION_TOKEN");
	if (!token) throw new Error("Falta SOVIALIS_AUTOMATION_TOKEN");
	headers["X-Sovialis-Automation"] = token;
}

async function api(path, { method = "GET", json } = {}) {
	const res = await fetch(BASE + path, { method, headers: { ...headers, ...(json ? { "Content-Type": "application/json" } : {}) }, body: json ? JSON.stringify(json) : undefined });
	const body = await res.json().catch(() => ({}));
	if (res.status === 404) return null;
	if (!res.ok || body?.success === false) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(body?.error ?? body).slice(0, 500)}`);
	return body?.data ?? body;
}

/** Comparación estable (el servidor reordena las claves de los subcampos). */
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const write = async (label, path, opts) => {
	if (DRY) return console.log(`  (dry) ${label}`);
	await api(path, opts);
	console.log(`  ✓ ${label}`);
};

console.log(`Esquema → ${BASE}`);
for (const bt of blockTypes) {
	const fields = bt.versions.at(-1).fields;
	const current = (await api(`/_emdash/api/schema/block-types/${bt.slug}`))?.item;
	if (!current) {
		await write(`bloque nuevo «${bt.slug}»`, "/_emdash/api/schema/block-types", { method: "POST", json: { slug: bt.slug, label: bt.label, fields } });
		continue;
	}
	const active = current.versions.find((v) => v.active) ?? current.versions.at(-1);
	if (same(active.fields, fields) && current.label === bt.label) continue;
	await write(`bloque «${bt.slug}» actualizado`, `/_emdash/api/schema/block-types/${bt.slug}`, {
		method: "PUT",
		json: { expectedFingerprint: active.fingerprint, label: bt.label, fields, ...(BREAKING ? { breaking: true } : {}) },
	});
}

for (const col of collections) {
	const current = await api(`/_emdash/api/schema/collections/${col.slug}?includeFields=true`);
	const item = current?.item ?? current;
	if (!item?.fields) {
		console.log(`  · colección «${col.slug}» no existe; se omite (créala con el seed)`);
		continue;
	}
	const have = new Map(item.fields.map((f) => [f.slug, f]));
	for (const [i, field] of col.fields.entries()) {
		const existing = have.get(field.slug);
		if (!existing) {
			const { slug, label, type, required, validation, options, searchable } = field;
			await write(`campo nuevo ${col.slug}.${slug}`, `/_emdash/api/schema/collections/${col.slug}/fields`, {
				method: "POST",
				json: { slug, label, type, required, validation: validation ?? null, options, searchable, sortOrder: i },
			});
		} else if (field.type !== "blocks" && (existing.label !== field.label || !same(existing.validation ?? null, field.validation ?? null))) {
			await write(`campo ${col.slug}.${field.slug} actualizado`, `/_emdash/api/schema/collections/${col.slug}/fields/${field.slug}`, {
				method: "PUT",
				json: { label: field.label, validation: field.validation ?? null },
			});
		} else if (field.type === "blocks") {
			const wanted = { ...existing.validation, ...field.validation, retiredTypes: existing.validation?.retiredTypes ?? [] };
			if (!same([...(existing.validation?.allowedTypes ?? [])].sort(), [...(field.validation?.allowedTypes ?? [])].sort())) {
				await write(`tipos permitidos en ${col.slug}.${field.slug}`, `/_emdash/api/schema/collections/${col.slug}/fields/${field.slug}`, {
					method: "PUT",
					json: { validation: wanted },
				});
			}
		}
	}
}
console.log("Listo.");
