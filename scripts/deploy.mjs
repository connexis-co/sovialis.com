#!/usr/bin/env node
/**
 * Compila y despliega el Worker de producción.
 *   node scripts/deploy.mjs            # build + deploy
 *   node scripts/deploy.mjs --secrets  # además sube los secretos desde ~/.config/sovialis/web-secrets.env
 * Credenciales de Cloudflare: ~/.config/sovialis/cloudflare.env (fuera del repo).
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/%20/g, " ");
const run = (cmd, input) => execSync(cmd, { cwd: root, stdio: input ? ["pipe", "inherit", "inherit"] : "inherit", input, env: process.env });
const loadEnv = (file) => {
	if (!existsSync(file)) return {};
	return Object.fromEntries(
		readFileSync(file, "utf8")
			.split("\n")
			.map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/))
			.filter(Boolean)
			.map((m) => [m[1], m[2].trim()]),
	);
};
Object.assign(process.env, loadEnv(join(homedir(), ".config/sovialis/cloudflare.env")));
if (!process.env.CLOUDFLARE_API_TOKEN) throw new Error("Falta CLOUDFLARE_API_TOKEN (~/.config/sovialis/cloudflare.env).");

run("npm run seed:build");
rmSync(join(root, "dist"), { recursive: true, force: true });
run("npx astro build");
// El adaptador copia .dev.vars al build: jamás debe subirse a producción.
rmSync(join(root, "dist/server/.dev.vars"), { force: true });

if (process.argv.includes("--secrets")) {
	const secrets = loadEnv(join(homedir(), ".config/sovialis/web-secrets.env"));
	run("npx wrangler secret bulk --config dist/server/wrangler.json", JSON.stringify(secrets));
}
run("npx wrangler deploy --config dist/server/wrangler.json");
