import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, sessionDrivers } from "astro/config";
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

/**
 * El panel de EmDash trae catálogos de 31 idiomas (~2 MB comprimidos) que dejan el Worker por encima
 * del límite de 3 MB del plan gratuito. Se conservan español e inglés; los demás idiomas reutilizan el
 * catálogo en español de Latinoamérica.
 */
function trimAdminLocales(keep = ["es-419", "es-ES", "en"], fallback = "es-419") {
	const dist = join(dirname(fileURLToPath(import.meta.resolve("@emdash-cms/admin"))));
	const loader = readdirSync(dist).find((f) => /^loadMessages-.*\.js$/.test(f));
	const map = new Map();
	if (loader) {
		const src = readFileSync(join(dist, loader), "utf8");
		for (const [, locale, file] of src.matchAll(/"\.\/([\w-]+)\/messages\.mjs": \(\) => import\("\.\/(messages-[\w-]+\.js)"\)/g)) map.set(file, locale);
	}
	const fallbackFile = [...map].find(([, l]) => l === fallback)?.[0];
	return {
		name: "sovialis-trim-admin-locales",
		enforce: "pre",
		load(id) {
			const file = id.split("?")[0].split("/").pop();
			const locale = map.get(file);
			if (!locale || keep.includes(locale) || !fallbackFile || !id.includes("@emdash-cms/admin")) return null;
			return `export { messages } from ${JSON.stringify(join(dist, fallbackFile))};`;
		},
	};
}

export default defineConfig({
	site,
	output: "server",
	// Sesiones en R2 en vez de KV: el plan gratuito de KV solo admite 1.000 escrituras al día y cada
	// inicio de sesión del panel o de la automatización escribe una.
	session: { driver: sessionDrivers.cloudflareR2Binding({ binding: "SESSION" }) },
	trailingSlash: "ignore",
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
		plugins: [tailwindcss(), trimAdminLocales()],
	},
	build: { inlineStylesheets: "auto" },
	devToolbar: { enabled: false },
	server: { port: Number(process.env.PORT) || 4321 },
});
