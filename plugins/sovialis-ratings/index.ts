/**
 * sovialis-ratings — Valoraciones con estrellas (1–5) para artículos del blog y otras entradas.
 *
 * - Ruta pública `rate`: un voto por persona y entrada (huella diaria anónima: hash de IP + navegador),
 *   que puede cambiar su voto. Agregado en ajustes del plugin (`agg:<colección>:<id>`), legible por el
 *   tema con `getPluginSetting()` para pintar el resumen y el `aggregateRating` del JSON-LD.
 * - Ruta pública `summary` con caché corta para refrescar el widget sin recargar.
 */
import { definePlugin } from "emdash";

export interface RatingAggregate {
	count: number;
	sum: number;
	average: number;
	updatedAt: string;
}

interface Vote {
	target: string;
	voter: string;
	value: number;
	createdAt: string;
	updatedAt: string;
}

const TARGET = /^(posts|services|pages|zones):[A-Za-z0-9_-]{6,40}$/;

async function sha256Hex(text: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const aggregateKey = (target: string) => `agg:${target}`;

function emptyAggregate(): RatingAggregate {
	return { count: 0, sum: 0, average: 0, updatedAt: "" };
}

export function createPlugin() {
	return definePlugin({
		id: "sovialis-ratings",
		version: "1.0.0",
		capabilities: [],
		storage: {
			votes: { indexes: ["target", "createdAt"], uniqueIndexes: [["target", "voter"]] },
		},
		routes: {
			rate: {
				public: true,
				methods: ["POST"],
				request: { body: "json", maxBytes: 1024 },
				handler: async (ctx) => {
					const v = (ctx.input ?? {}) as { target?: unknown; value?: unknown };
					const target = typeof v.target === "string" ? v.target : "";
					const value = Number(v.value);
					if (!TARGET.test(target) || !Number.isInteger(value) || value < 1 || value > 5) {
						return { ok: false, error: "Valoración inválida." };
					}
					const ip = ctx.requestMeta?.ip ?? "";
					const ua = ctx.requestMeta?.userAgent ?? "";
					const salt = (await ctx.kv.get<string>("salt")) ?? crypto.randomUUID();
					await ctx.kv.set("salt", salt);
					const voter = (await sha256Hex(`${salt}:${ip}:${ua}`)).slice(0, 32);
					const id = (await sha256Hex(`${target}:${voter}`)).slice(0, 40);
					const now = new Date().toISOString();

					const previous = (await ctx.storage.votes.get(id)) as Vote | null;
					await ctx.storage.votes.put(id, {
						target,
						voter,
						value,
						createdAt: previous?.createdAt ?? now,
						updatedAt: now,
					} satisfies Vote);

					const key = aggregateKey(target);
					const agg = (await ctx.settings.get<RatingAggregate>(key)) ?? emptyAggregate();
					if (previous) agg.sum += value - previous.value;
					else {
						agg.count += 1;
						agg.sum += value;
					}
					agg.average = agg.count ? Math.round((agg.sum / agg.count) * 10) / 10 : 0;
					agg.updatedAt = now;
					await ctx.settings.set(key, agg);
					return { ok: true, aggregate: agg, yourVote: value, changed: Boolean(previous) };
				},
			},
			summary: {
				public: true,
				methods: ["GET"],
				request: { body: "none" },
				cacheControl: "public, max-age=30, stale-while-revalidate=300",
				handler: async (ctx) => {
					const q = (ctx.input ?? {}) as Record<string, string>;
					const target = q.target ?? "";
					if (!TARGET.test(target)) return { ok: false, error: "Entrada inválida." };
					return { ok: true, aggregate: (await ctx.settings.get<RatingAggregate>(aggregateKey(target))) ?? emptyAggregate() };
				},
			},
			reset: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 1024 },
				handler: async (ctx) => {
					const v = (ctx.input ?? {}) as { target?: string };
					if (!v.target || !TARGET.test(v.target)) throw new Error("Entrada inválida.");
					await ctx.settings.delete(aggregateKey(v.target));
					return { ok: true };
				},
			},
		},
	});
}
