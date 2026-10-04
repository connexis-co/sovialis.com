/**
 * sovialis-whatsapp — Botón flotante de WhatsApp y enlaces contextuales, configurables en el panel.
 *
 * - Aparece al hacer scroll (o tras una espera), con entrada elástica, halo que pulsa y una
 *   etiqueta tipo píldora que se despliega a su lado.
 * - Reglas por servicio, zona, ruta y fechas (número y mensaje propios); horario de atención.
 * - Reescribe todos los enlaces `a[data-wa]` del tema con el mismo número y un mensaje contextual
 *   (`data-wa-text` permite uno propio). La medición de clics la hace el tema (contrato data-cta).
 */
import { definePlugin, getEmDashCollection } from "emdash";
import { escapeHtml, isAdminPath } from "../_shared/text";
import { DEFAULT_SETTINGS, resolveWhatsApp, validateSettings, withDefaults, type WhatsAppSettings } from "./model";

const ICON =
	"M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.94 12.94 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.62c-2 0-3.95-.54-5.65-1.55l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.86 4.77-10.63 10.64-10.63 5.86 0 10.6 4.77 10.6 10.63 0 5.87-4.76 10.62-10.6 10.62Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.6 9.6 0 0 1-1.78-2.2c-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.2 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.25 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z";

const CSS = `.sv-fab{position:fixed;z-index:45;display:flex;flex-direction:column;align-items:flex-end;pointer-events:none;inset-block-end:calc(var(--wa-y) + env(safe-area-inset-bottom,0px) + var(--alto-consentimiento,0px));transition:inset-block-end .2s cubic-bezier(.05,.7,.1,1)}.sv-fab[data-side=right]{inset-inline-end:max(var(--wa-x),env(safe-area-inset-right))}.sv-fab[data-side=left]{inset-inline-start:max(var(--wa-x),env(safe-area-inset-left));align-items:flex-start}.sv-fab>*{pointer-events:auto}.sv-fab__wa{--size:60px;position:relative;display:flex;align-items:center;justify-content:flex-end;text-decoration:none;opacity:0;visibility:hidden;transform:translateY(12px);transition:opacity .2s cubic-bezier(.05,.7,.1,1),transform .2s cubic-bezier(.05,.7,.1,1),visibility 0s linear .2s}.sv-fab[data-side=left] .sv-fab__wa{flex-direction:row-reverse}.sv-fab__wa.is-visible{opacity:1;visibility:visible;transform:none;transition-delay:0s}.sv-fab__btn{position:relative;z-index:1;isolation:isolate;display:grid;place-items:center;inline-size:var(--size);block-size:var(--size);border-radius:50%;background:var(--wa-color);color:#0b2a4e;box-shadow:0 8px 24px color-mix(in srgb,var(--wa-color) 35%,transparent);transition:transform .2s cubic-bezier(.05,.7,.1,1)}.sv-fab__btn svg{width:30px;height:30px;fill:currentColor}.sv-fab__wa:is(:hover,:focus-visible) .sv-fab__btn{transform:scale(1.06)}.sv-fab__wa:focus-visible{outline:3px solid #0b2a4e;outline-offset:4px;border-radius:999px}.sv-fab__label{display:flex;flex-direction:column;justify-content:center;align-items:flex-end;overflow:hidden;white-space:nowrap;block-size:48px;max-inline-size:0;opacity:0;margin-inline-end:calc(var(--size)/-2);padding-inline:0 calc(var(--size)/2 + 6px);background:#0b2a4e;color:#fff;border-radius:999px;font:600 1rem/1.15 var(--sv-font-body,system-ui,sans-serif);box-shadow:0 1px 2px #0f16200f,0 10px 30px #0f162033;transition:max-inline-size .38s cubic-bezier(.05,.7,.1,1),padding-inline-start .38s cubic-bezier(.05,.7,.1,1),opacity .2s cubic-bezier(.05,.7,.1,1)}.sv-fab[data-side=left] .sv-fab__label{margin-inline:calc(var(--size)/-2) 0;padding-inline:calc(var(--size)/2 + 6px) 0;align-items:flex-start}.sv-fab__label small{font-size:.75rem;font-weight:500;opacity:.78}.sv-fab__wa:is(:hover,:focus-visible) .sv-fab__label,.sv-fab__wa.is-tip .sv-fab__label,.sv-fab[data-label=always] .sv-fab__wa.is-visible .sv-fab__label{max-inline-size:320px;opacity:1;padding-inline-start:22px}.sv-fab[data-side=left] .sv-fab__wa:is(:hover,:focus-visible) .sv-fab__label,.sv-fab[data-side=left] .sv-fab__wa.is-tip .sv-fab__label,.sv-fab[data-side=left][data-label=always] .sv-fab__wa.is-visible .sv-fab__label{padding-inline-end:22px}.sv-fab[data-label=never] .sv-fab__label{display:none}.sv-fab__halo{position:absolute;inset:0;z-index:-1;border-radius:50%;background:var(--wa-color);opacity:0}.sv-fab[data-animate=true] .sv-fab__halo{animation:sv-fab-halo 2.1s cubic-bezier(.05,.7,.1,1) infinite}.sv-fab__halo:nth-child(2){animation-delay:.7s}.sv-fab__halo:nth-child(3){animation-delay:1.4s}@keyframes sv-fab-halo{0%{opacity:0;transform:scale(1)}12%{opacity:.38}100%{opacity:0;transform:scale(2)}}@media (max-width:1023px){.sv-fab[data-mobile=false]{display:none}.sv-fab{--wa-y:16px}html.has-sticky-cta .sv-fab{inset-block-end:calc(var(--sv-sticky-cta-h,72px) + 12px + env(safe-area-inset-bottom,0px) + var(--alto-consentimiento,0px))}.sv-fab__wa{--size:56px}}@media (min-width:1024px){.sv-fab[data-desktop=false]{display:none}}@media (prefers-reduced-motion:reduce){.sv-fab__wa,.sv-fab__btn,.sv-fab__label{transition:none}.sv-fab__wa:is(:hover,:focus-visible) .sv-fab__btn{transform:none}.sv-fab[data-animate=true] .sv-fab__halo{animation:none;opacity:.22;transform:scale(1.21)}.sv-fab[data-animate=true] .sv-fab__halo:nth-child(2){opacity:.12;transform:scale(1.57)}.sv-fab[data-animate=true] .sv-fab__halo:nth-child(3){opacity:.08;transform:scale(2)}}@media print{.sv-fab{display:none!important}}`;

async function getConfig(ctx: { settings: { get<T>(k: string): Promise<T | null> } }): Promise<WhatsAppSettings> {
	return withDefaults(await ctx.settings.get<Partial<WhatsAppSettings>>("config"));
}

export function createPlugin() {
	return definePlugin({
		id: "sovialis-whatsapp",
		version: "1.0.0",
		capabilities: ["hooks.page-fragments:register"],
		admin: { pages: [{ path: "/whatsapp", label: "WhatsApp", icon: "message-circle" }] },
		routes: {
			config: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async (ctx) => ({ config: await getConfig(ctx), defaults: DEFAULT_SETTINGS }),
			},
			save: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 131_072 },
				handler: async (ctx) => {
					const config = validateSettings(ctx.input);
					await ctx.settings.set("config", config);
					return { config };
				},
			},
			choices: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async () => {
					const [services, zones] = await Promise.all([
						getEmDashCollection("services", { limit: 100 }),
						getEmDashCollection("zones", { limit: 100 }),
					]);
					return {
						services: services.entries.map((e) => ({ id: e.id, label: String((e.data as { title?: string }).title ?? e.id) })),
						zones: zones.entries.map((e) => ({ id: e.id, label: String((e.data as { title?: string }).title ?? e.id) })),
					};
				},
			},
		},
		hooks: {
			"page:fragments": async ({ page }, ctx) => {
				if (isAdminPath(page.path)) return null;
				const config = await getConfig(ctx);
				const collection = page.content?.collection;
				const slug = page.content?.slug ?? "";
				const title = page.pageTitle ?? page.title ?? "";
				const origin = (() => {
					try {
						return new URL(page.url).origin;
					} catch {
						return "https://sovialis.com";
					}
				})();
				const resolved = resolveWhatsApp(config, {
					path: page.path,
					title,
					service: collection === "services" ? slug : "",
					serviceName: collection === "services" ? title : "",
					zone: collection === "zones" ? slug : "",
					zoneName: collection === "zones" ? title : "",
					url: origin + page.path,
				});
				if (!resolved) return null;

				const note = !resolved.open && config.offHours === "note" && config.offHoursNote ? `<small>${escapeHtml(config.offHoursNote)}</small>` : "";
				const style = `--wa-x:${config.x}px;--wa-y:${config.y}px;--wa-color:${config.color}`;
				const html = `<style>${CSS}</style><div class="sv-fab" data-side="${config.position}" data-label="${config.labelMode}" data-mobile="${config.mobile}" data-desktop="${config.desktop}" data-animate="${config.animate}" style="${style}"><a class="sv-fab__wa" data-wa-float href="${escapeHtml(resolved.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(resolved.label)}" data-cta="global:flotante" data-rule="${escapeHtml(resolved.rule)}"><span class="sv-fab__label" aria-hidden="true"><span>${escapeHtml(resolved.label)}</span>${note}</span><span class="sv-fab__btn"><span class="sv-fab__halo" aria-hidden="true"></span><span class="sv-fab__halo" aria-hidden="true"></span><span class="sv-fab__halo" aria-hidden="true"></span><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="${ICON}"/></svg></span></a></div>`;

				const data = JSON.stringify({ number: resolved.number, message: resolved.message, url: resolved.url, rule: resolved.rule, open: resolved.open });
				const script = `(()=>{const C=${data};window.svWhatsApp=C;const link=(t)=>'https://wa.me/'+C.number+'?text='+encodeURIComponent(t||C.message);document.querySelectorAll('a[data-wa]').forEach(a=>{a.href=link(a.dataset.waText);a.target='_blank';a.rel='noopener'});const fab=document.querySelector('[data-wa-float]');if(!fab)return;const box=fab.parentElement,mode=box.dataset.label,AFTER=${config.showAfterScroll},DELAY=${config.delay * 1000},TIP_DELAY=1800,TIP_TIME=${config.labelSeconds * 1000};let ready=DELAY===0,ticking=false,armed=false,tipDone=false;try{tipDone=sessionStorage.getItem('sv:fab-tip')==='1'}catch(e){}const sync=()=>{const show=ready&&(scrollY>AFTER||document.documentElement.scrollHeight<=innerHeight+AFTER);fab.classList.toggle('is-visible',show);if(show&&mode==='intro'&&!tipDone&&!armed){armed=true;setTimeout(()=>{if(!fab.classList.contains('is-visible')){armed=false;return}tipDone=true;try{sessionStorage.setItem('sv:fab-tip','1')}catch(e){}fab.classList.add('is-tip');setTimeout(()=>fab.classList.remove('is-tip'),TIP_TIME)},TIP_DELAY)}};if(DELAY)setTimeout(()=>{ready=true;sync()},DELAY);addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{sync();ticking=false})},{passive:true});sync();})();`;

				return [
					{ kind: "html", placement: "body:end", key: "sovialis-whatsapp", html },
					{ kind: "inline-script", placement: "body:end", key: "sovialis-whatsapp-js", code: script },
				];
			},
		},
	});
}
