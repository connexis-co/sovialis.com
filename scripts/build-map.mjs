#!/usr/bin/env node
/**
 * Genera src/data/bogota-map.json: límites reales de las localidades urbanas de Bogotá y sus
 * avenidas principales, simplificados y proyectados a SVG (norte arriba, escala real en ambos ejes).
 *
 *   node scripts/build-map.mjs                  # descarga y compacta
 *   node scripts/build-map.mjs --solo-compactar # solo compacta el JSON actual (sin red)
 *
 * Fuente: OpenStreetMap (© colaboradores de OpenStreetMap, ODbL) vía Nominatim y Overpass.
 * Solo hace falta volver a ejecutarlo si cambian la ventana del mapa o las avenidas.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./lib/content.mjs";
import { compactMap } from "./lib/map-compact.mjs";

const UA = "sovialis-web-map-builder/1.0 (contacto@sovialis.com)";
// Ventana del mapa (grados). Norte y occidente cercano completos; el resto de la ciudad queda recortado.
const BOX = { west: -74.205, east: -73.995, south: 4.575, north: 4.84 };
const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LNG = 111.32 * Math.cos(((BOX.north + BOX.south) / 2) * (Math.PI / 180));
const W = 600;
const H = Math.round((W * ((BOX.north - BOX.south) * KM_PER_DEG_LAT)) / ((BOX.east - BOX.west) * KM_PER_DEG_LNG));

const LOCALIDADES = [
	"Usaquén", "Chapinero", "Santa Fe", "San Cristóbal", "Usme", "Tunjuelito", "Bosa", "Kennedy", "Fontibón", "Engativá",
	"Suba", "Barrios Unidos", "Teusaquillo", "Los Mártires", "Antonio Nariño", "Puente Aranda", "La Candelaria",
	"Rafael Uribe Uribe", "Ciudad Bolívar",
];
// Nombres tal como están en OpenStreetMap (nomenclatura numérica) → etiqueta común.
const ROADS = [
	{ label: "Autopista Norte", re: "^Avenida Carrera 45$" },
	{ label: "Carrera Séptima", re: "^Avenida Carrera 7$" },
	{ label: "Av. Boyacá", re: "^Avenida Carrera 72$" },
	{ label: "Av. 68", re: "^Avenida Carrera 68$" },
	{ label: "NQS", re: "^Avenida Carrera 30$" },
	{ label: "Av. Ciudad de Cali", re: "^Avenida Carrera 86$" },
	{ label: "Calle 80", re: "^Avenida Calle 80$" },
	{ label: "Calle 26", re: "^Avenida Calle 26$" },
	{ label: "Calle 100", re: "^Avenida Calle 100$" },
	{ label: "Calle 170", re: "^Avenida Calle 170$" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const px = ([lng, lat]) => [((lng - BOX.west) / (BOX.east - BOX.west)) * W, ((BOX.north - lat) / (BOX.north - BOX.south)) * H];
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Douglas-Peucker sobre puntos ya proyectados (tolerancia en px). */
function simplify(points, tol) {
	if (points.length < 3) return points;
	const keep = new Uint8Array(points.length);
	keep[0] = keep[points.length - 1] = 1;
	const stack = [[0, points.length - 1]];
	while (stack.length) {
		const [a, b] = stack.pop();
		const [ax, ay] = points[a], [bx, by] = points[b];
		const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
		let max = 0, idx = -1;
		for (let i = a + 1; i < b; i++) {
			const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len;
			if (d > max) (max = d), (idx = i);
		}
		if (max > tol && idx > 0) {
			keep[idx] = 1;
			stack.push([a, idx], [idx, b]);
		}
	}
	return points.filter((_, i) => keep[i]);
}
/** Anillo cerrado: se parte en dos mitades para que Douglas-Peucker no colapse (inicio = fin). */
function simplifyRing(ring, tol) {
	const open = ring.slice(0, -1);
	const mid = Math.floor(open.length / 2);
	return [...simplify(open.slice(0, mid + 1), tol).slice(0, -1), ...simplify([...open.slice(mid), open[0]], tol).slice(0, -1)];
}
const toPath = (rings, close) =>
	rings
		.map((ring) => ring.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + (close ? "Z" : ""))
		.join("");

function centroid(ring) {
	let a = 0, cx = 0, cy = 0;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
		a += f;
		cx += (ring[j][0] + ring[i][0]) * f;
		cy += (ring[j][1] + ring[i][1]) * f;
	}
	return a ? [cx / (3 * a), cy / (3 * a)] : ring[0];
}

async function localidad(name) {
	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.search = new URLSearchParams({ q: `Localidad ${name}, Bogotá, Colombia`, format: "geojson", polygon_geojson: "1", polygon_threshold: "0.0002", limit: "5" }).toString();
	const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "es" } });
	const data = await res.json();
	const feature = data.features.find((f) => /Polygon/.test(f.geometry.type) && f.properties.category === "boundary") ?? data.features.find((f) => /Polygon/.test(f.geometry.type));
	if (!feature) throw new Error(`Sin polígono para ${name}`);
	const polys = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
	const rings = polys.map((p) => simplifyRing(p[0].map(px), 0.6)).filter((r) => r.length > 3);
	const largest = rings.reduce((m, r) => (r.length > m.length ? r : m), rings[0]);
	const [cx, cy] = centroid(largest);
	return { name, slug: slug(name), d: toPath(rings, true), cx: +cx.toFixed(1), cy: +cy.toFixed(1) };
}

async function roads() {
	const bbox = `${BOX.south},${BOX.west},${BOX.north},${BOX.east}`;
	const names = ROADS.map((r) => `(${r.re})`).join("|");
	const query = `[out:json][timeout:60];way["highway"~"^(motorway|trunk|primary)$"]["name"~"${names}"](${bbox});out geom;`;
	let data;
	// Overpass limita la tasa: se reintenta con espera creciente.
	for (let attempt = 1; !data; attempt++) {
		const res = await fetch("https://overpass-api.de/api/interpreter", {
			method: "POST",
			headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ data: query }),
		});
		if (res.ok) data = await res.json();
		else if (attempt >= 4) throw new Error(`Overpass respondió ${res.status}`);
		else await sleep(attempt * 10_000);
	}
	return ROADS.map((road) => {
		const re = new RegExp(road.re);
		const lines = data.elements
			.filter((e) => re.test(e.tags?.name ?? ""))
			.map((e) => simplify(e.geometry.map((g) => px([g.lon, g.lat])), 0.8))
			.filter((l) => l.length > 1);
		return { label: road.label, d: toPath(lines, false), count: lines.length };
	}).filter((r) => r.count);
}

const target = join(ROOT, "src/data/bogota-map.json");
if (process.argv.includes("--solo-compactar")) {
	const before = await readFile(target, "utf8");
	const after = JSON.stringify(compactMap(JSON.parse(before)));
	await writeFile(target, after);
	console.log(`OK: ${before.length} → ${after.length} bytes`);
	process.exit(0);
}

const cacheFile = join(ROOT, "scripts/.cache/map-localidades.json");
const cached = existsSync(cacheFile) ? JSON.parse(await readFile(cacheFile, "utf8")) : null;
const out = { source: "© colaboradores de OpenStreetMap (ODbL)", box: BOX, width: W, height: H, kmPx: W / ((BOX.east - BOX.west) * KM_PER_DEG_LNG), localidades: [], roads: [] };
if (cached?.length === LOCALIDADES.length) out.localidades = cached;
else {
	for (const name of LOCALIDADES) {
		out.localidades.push(await localidad(name));
		process.stdout.write(`· ${name}\n`);
		await sleep(1100);
	}
	await mkdir(join(ROOT, "scripts/.cache"), { recursive: true });
	await writeFile(cacheFile, JSON.stringify(out.localidades));
}
out.roads = (await roads()).map(({ count, ...r }) => r);
await mkdir(join(ROOT, "src/data"), { recursive: true });
await writeFile(target, JSON.stringify(compactMap(out)));
console.log(`OK: ${out.localidades.length} localidades, ${out.roads.length} avenidas, ${W}×${H}`);
