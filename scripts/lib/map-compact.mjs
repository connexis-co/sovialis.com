/**
 * Compacta el mapa de src/data/bogota-map.json para que pese poco dentro del HTML:
 *  - localidades recortadas al recuadro visible (lo que cae fuera no se dibuja),
 *  - avenidas unidas en polilíneas continuas (OpenStreetMap las parte en cientos de tramos),
 *  - Douglas-Peucker y coordenadas enteras con comandos relativos (el SVG mide 600 de ancho:
 *    un entero equivale a menos de un píxel en pantalla).
 */

const parse = (d) =>
	d
		.split(/(?=M)/)
		.map((part) => [...part.matchAll(/(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g)].map((m) => [+m[1], +m[2]]))
		.filter((pts) => pts.length > 1);

/** Douglas-Peucker (tolerancia en unidades del SVG). */
export function simplify(points, tol) {
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

/** Anillo cerrado: se simplifica en dos mitades para que no colapse (inicio = fin). */
function simplifyRing(ring, tol) {
	if (ring.length < 8) return ring;
	const mid = Math.floor(ring.length / 2);
	return [...simplify(ring.slice(0, mid + 1), tol).slice(0, -1), ...simplify([...ring.slice(mid), ring[0]], tol).slice(0, -1)];
}

/** Sutherland-Hodgman contra un rectángulo. */
function clipRing(ring, { x0, y0, x1, y1 }) {
	const edges = [
		[(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
		[(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
		[(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
		[(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
	];
	let out = ring;
	for (const [inside, cut] of edges) {
		const input = out;
		out = [];
		for (let i = 0; i < input.length; i++) {
			const cur = input[i], prev = input[(i + input.length - 1) % input.length];
			if (inside(cur)) {
				if (!inside(prev)) out.push(cut(prev, cur));
				out.push(cur);
			} else if (inside(prev)) out.push(cut(prev, cur));
		}
		if (!out.length) break;
	}
	return out;
}

/** Une tramos que comparten extremo en polilíneas largas. */
function chain(lines) {
	const key = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
	const ends = new Map();
	const add = (k, i) => (ends.get(k) ?? ends.set(k, []).get(k)).push(i);
	lines.forEach((l, i) => (add(key(l[0]), i), add(key(l.at(-1)), i)));
	const used = new Uint8Array(lines.length);
	const take = (pt) => {
		const i = (ends.get(key(pt)) ?? []).find((j) => !used[j]);
		if (i === undefined) return null;
		used[i] = 1;
		return key(lines[i][0]) === key(pt) ? lines[i] : [...lines[i]].reverse();
	};
	const out = [];
	for (let i = 0; i < lines.length; i++) {
		if (used[i]) continue;
		used[i] = 1;
		let line = [...lines[i]];
		for (let next = take(line.at(-1)); next; next = take(line.at(-1))) line.push(...next.slice(1));
		for (let prev = take(line[0]); prev; prev = take(line[0])) line = [...prev.reverse(), ...line.slice(1)];
		out.push(line);
	}
	return out;
}

/** Puntos enteros con comandos relativos: «M422 436l26 6 42 21…». Quita puntos repetidos. */
function encode(lines, close) {
	return lines
		.map((pts) => {
			const r = [];
			for (const [x, y] of pts.map(([x, y]) => [Math.round(x), Math.round(y)])) {
				const last = r.at(-1);
				if (!last || last[0] !== x || last[1] !== y) r.push([x, y]);
			}
			if (r.length < (close ? 3 : 2)) return "";
			let s = `M${r[0][0]} ${r[0][1]}l`;
			for (let i = 1; i < r.length; i++) {
				const dx = r[i][0] - r[i - 1][0], dy = r[i][1] - r[i - 1][1];
				s += `${i > 1 && dx >= 0 ? " " : ""}${dx}${dy >= 0 ? " " : ""}${dy}`;
			}
			return s + (close ? "z" : "");
		})
		.join("");
}

export function compactMap(map, { margin = 6, ringTol = 0.7, roadTol = 0.9 } = {}) {
	// Ya compactado (comandos relativos): no se vuelve a procesar.
	if (map.localidades.some((l) => l.d.includes("l"))) return map;
	const rect = { x0: -margin, y0: -margin, x1: map.width + margin, y1: map.height + margin };
	const localidades = map.localidades.map((l) => {
		const rings = parse(l.d)
			.map((ring) => clipRing(ring, rect))
			.filter((ring) => ring.length > 2)
			.map((ring) => simplifyRing(ring, ringTol));
		return { ...l, d: encode(rings, true) };
	}).filter((l) => l.d);
	const roads = map.roads.map((r) => ({ ...r, d: encode(chain(parse(r.d)).map((l) => simplify(l, roadTol)), false) }));
	return { ...map, localidades, roads };
}
