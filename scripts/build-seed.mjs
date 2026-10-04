#!/usr/bin/env node
/**
 * Genera seed/seed.json (estructura del CMS) a partir de scripts/seed/schema.mjs y content/structure.mjs.
 * El contenido editorial NO va en el seed: lo carga `npm run content:sync` vía la API REST.
 *
 *   node scripts/build-seed.mjs
 */
import { writeFile } from "node:fs/promises";
import { blockTypes, collections, taxonomies } from "./seed/schema.mjs";
import { bylines, categories, menus, settings } from "../content/structure.mjs";

const seed = {
	$schema: "https://emdashcms.com/seed.schema.json",
	version: "1",
	meta: {
		name: "Sovialis",
		description: "Cuidado del adulto mayor a domicilio en Bogotá — sitio público sobre EmDash.",
		author: "Connexis",
	},
	settings,
	blockTypes,
	collections,
	taxonomies: taxonomies.map((t) => (t.name === "category" ? { ...t, terms: categories } : { ...t, terms: [] })),
	menus,
	bylines,
	content: {},
};

await writeFile(new URL("../seed/seed.json", import.meta.url), `${JSON.stringify(seed, null, "\t")}\n`);
console.log(
	`seed/seed.json: ${blockTypes.length} bloques, ${collections.length} colecciones, ${menus.length} menús, ${categories.length} categorías.`,
);
