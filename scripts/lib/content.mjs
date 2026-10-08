/** Lectura de content/**.md (frontmatter YAML + cuerpo Markdown), compartida por validate y sync. */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parse } from "yaml";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const CONTENT = join(ROOT, "content");
export const COLLECTIONS = { pages: "body", services: "body", zones: "intro", posts: "content" };

export function splitFrontmatter(raw) {
	const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) throw new Error("Falta el frontmatter (--- … ---)");
	return { data: parse(m[1]) ?? {}, body: m[2].trim() };
}

export async function loadCollection(name) {
	const dir = join(CONTENT, name);
	const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".md")).sort();
	const out = [];
	for (const file of files) {
		const raw = await readFile(join(dir, file), "utf8");
		try {
			const { data, body } = splitFrontmatter(raw);
			out.push({ file: `${name}/${file}`, slug: data.slug || file.replace(/\.md$/, ""), data, body });
		} catch (error) {
			out.push({ file: `${name}/${file}`, slug: file.replace(/\.md$/, ""), error: error.message });
		}
	}
	return out;
}

export async function loadAll(only) {
	const result = {};
	for (const name of Object.keys(COLLECTIONS)) if (!only || only === name) result[name] = await loadCollection(name);
	return result;
}

export function urlOf(collection, entry) {
	const { slug, data } = entry;
	if (collection === "pages") return slug === "inicio" ? "/" : `/${slug}/`;
	if (collection === "services") return `/servicios/${slug}/`;
	if (collection === "zones") return `/zonas/${slug}/`;
	if (collection === "posts") return `/blog/${slug}/`;
	return `/${slug}/`;
}

/** Texto plano de una página (frontmatter + bloques + cuerpo) para conteos y búsquedas. */
export function plainText(entry) {
	const parts = [];
	const walk = (v) => {
		if (typeof v === "string") parts.push(v);
		else if (Array.isArray(v)) v.forEach(walk);
		else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["_type", "media", "slug", "icon", "variant", "status"].includes(k)) walk(x);
	};
	walk(entry.data);
	parts.push(entry.body ?? "");
	return parts.join("\n");
}
