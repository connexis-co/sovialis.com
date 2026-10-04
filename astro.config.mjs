// @ts-check
import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

const site = process.env.SITE_URL || "https://sovialis.com";
const local = (path) => fileURLToPath(new URL(path, import.meta.url));

/**
 * Plugins propios de Sovialis. Todos son nativos (de confianza): la cuenta usa el plan
 * gratuito de Workers, sin Worker Loader para el sandbox. Cada uno vive en /plugins/<id>.
 */
const plugin = (id, { admin = false, pages = [] } = {}) => ({
	id,
	version: "1.0.0",
	entrypoint: local(`./plugins/${id}/index.ts`),
	...(admin ? { adminEntry: local(`./plugins/${id}/admin.tsx`), adminPages: pages } : {}),
});

export default defineConfig({
	site,
	output: "server",
	trailingSlash: "always",
	adapter: cloudflare({ imageService: "passthrough" }),
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			siteUrl: site,
			auth: {
				type: "sovialis-access",
				entrypoint: local("./src/auth/access.ts"),
				config: { autoProvision: true, syncRoles: true },
			},
			plugins: [
				plugin("sovialis-design", { admin: true, pages: [{ path: "/diseno", label: "Diseño y marca", icon: "palette" }] }),
				plugin("sovialis-whatsapp", { admin: true, pages: [{ path: "/whatsapp", label: "WhatsApp", icon: "message-circle" }] }),
				plugin("sovialis-leads", { admin: true, pages: [{ path: "/leads", label: "Leads y solicitudes", icon: "inbox" }] }),
				plugin("sovialis-seo", { admin: true, pages: [{ path: "/seo", label: "SEO", icon: "search" }] }),
				plugin("sovialis-analytics"),
				plugin("sovialis-email"),
				plugin("sovialis-ratings"),
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
	build: { inlineStylesheets: "auto" },
	devToolbar: { enabled: false },
	server: { port: Number(process.env.PORT) || 4321 },
});
