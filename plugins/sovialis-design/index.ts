/**
 * sovialis-design — Sistema de diseño editable desde el panel (colores, tipografías, escala,
 * redondeo, sombras, movimiento). Inyecta las variables en `<head>` de cada página pública.
 */
import { definePlugin } from "emdash";
import { isAdminPath } from "../_shared/text";
import { DEFAULT_TOKENS, PRESETS, tokensToCss, validateTokens, withDefaults, type DesignTokens } from "./model";

export function createPlugin() {
	return definePlugin({
		id: "sovialis-design",
		version: "1.0.0",
		capabilities: ["hooks.page-fragments:register"],
		admin: { pages: [{ path: "/diseno", label: "Diseño y marca", icon: "palette" }] },
		routes: {
			tokens: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async (ctx) => ({
					tokens: withDefaults(await ctx.settings.get<Partial<DesignTokens>>("tokens")),
					defaults: DEFAULT_TOKENS,
					presets: PRESETS,
				}),
			},
			save: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 32_768 },
				handler: async (ctx) => {
					const tokens = validateTokens(ctx.input);
					await ctx.settings.set("tokens", tokens);
					await ctx.settings.set("css", tokensToCss(tokens));
					return { tokens };
				},
			},
			reset: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 1024 },
				handler: async (ctx) => {
					await ctx.settings.delete("tokens");
					await ctx.settings.delete("css");
					return { tokens: DEFAULT_TOKENS };
				},
			},
		},
		hooks: {
			"page:fragments": async ({ page }, ctx) => {
				if (isAdminPath(page.path)) return null;
				const css = await ctx.settings.get<string>("css");
				if (!css) return null;
				return [{ kind: "html", placement: "head", key: "sovialis-design-tokens", html: `<style id="sv-tokens">${css.replace(/</g, "")}</style>` }];
			},
		},
	});
}
