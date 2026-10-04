/**
 * sovialis-analytics — Google Tag Manager, GA4, Microsoft Clarity y Meta Pixel editables desde el panel.
 *
 * Inyecta los fragmentos en las páginas públicas (nunca en /_emdash), con Consent Mode v2 y un aviso
 * de cookies propio. Los eventos de conversión (lead_submit, whatsapp_click, phone_click,
 * lead_modal_open) los empuja el tema al dataLayer; GTM los convierte en conversiones.
 */
import { definePlugin } from "emdash";
import { escapeHtml, isAdminPath } from "../_shared/text";

export interface AnalyticsSettings {
	gtmId: string;
	ga4Id: string;
	ga4Direct: boolean;
	clarityId: string;
	metaPixelId: string;
	consentDefault: "granted" | "denied";
	cookieBanner: boolean;
	cookieText: string;
	privacyUrl: string;
}

export const ANALYTICS_DEFAULTS: AnalyticsSettings = {
	gtmId: "GTM-N2PGLVR3",
	ga4Id: "G-H7LD9WF7GG",
	ga4Direct: true,
	clarityId: "",
	metaPixelId: "",
	consentDefault: "denied",
	cookieBanner: true,
	cookieText: "Usamos cookies de medición solo si las aceptas.",
	privacyUrl: "/politica-de-cookies/",
};

const ID = {
	gtm: /^GTM-[A-Z0-9]{4,12}$/,
	ga4: /^G-[A-Z0-9]{4,14}$/,
	clarity: /^[a-z0-9]{6,14}$/,
	pixel: /^\d{6,20}$/,
};

async function readSettings(get: <T>(key: string) => Promise<T | null>): Promise<AnalyticsSettings> {
	const out = { ...ANALYTICS_DEFAULTS };
	for (const key of Object.keys(ANALYTICS_DEFAULTS) as (keyof AnalyticsSettings)[]) {
		const value = await get<unknown>(key);
		if (value !== null && value !== undefined && value !== "") (out as Record<string, unknown>)[key] = value;
	}
	return out;
}

const BANNER_CSS = `#sv-cookies{position:fixed;right:16px;bottom:16px;left:auto;z-index:60;width:min(420px,calc(100% - 32px));padding:14px 16px;border-radius:18px;background:var(--sv-surface,#fff);color:var(--sv-text,#0b2a4e);box-shadow:0 18px 50px -20px rgb(11 42 78/.45);border:1px solid var(--sv-border,#d7e3ec);font:500 14.5px/1.45 var(--sv-font-body,system-ui);display:none}#sv-cookies[data-open=true]{display:flex;flex-direction:column;gap:10px;animation:sv-cookies-in .4s cubic-bezier(.2,.8,.2,1)}#sv-cookies p{margin:0}#sv-cookies a{color:inherit;text-decoration:underline}#sv-cookies .sv-ck-actions{display:flex;gap:8px}#sv-cookies button{flex:1;min-height:42px;padding:0 14px;border-radius:999px;font:600 14px var(--sv-font-body,system-ui);cursor:pointer;border:1px solid var(--sv-border,#c9d6e2);background:transparent;color:inherit}#sv-cookies button[data-accept]{background:var(--sv-primary,#005e9d);border-color:transparent;color:#fff}@keyframes sv-cookies-in{from{opacity:0;transform:translateY(12px)}}@media (prefers-reduced-motion:reduce){#sv-cookies[data-open=true]{animation:none}}@media (max-width:640px){#sv-cookies{right:0;bottom:0;width:100%;border-radius:18px 18px 0 0;padding:12px 16px calc(12px + env(safe-area-inset-bottom));font-size:13.5px}#sv-cookies[data-open=true]{flex-direction:row;align-items:center}#sv-cookies .sv-ck-actions{flex-direction:column;flex:none;gap:6px}#sv-cookies button{min-height:38px;padding:0 14px}}`;

export function createPlugin() {
	return definePlugin({
		id: "sovialis-analytics",
		version: "1.0.0",
		capabilities: ["hooks.page-fragments:register"],
		admin: {
			settingsSchema: {
				gtmId: { type: "string", label: "ID de Google Tag Manager", description: "Formato GTM-XXXXXXX. Vacío desactiva GTM.", default: ANALYTICS_DEFAULTS.gtmId },
				ga4Id: { type: "string", label: "ID de medición GA4", description: "Formato G-XXXXXXXXXX.", default: ANALYTICS_DEFAULTS.ga4Id },
				ga4Direct: {
					type: "boolean",
					label: "Cargar GA4 directo (gtag.js)",
					description: "Desactívalo si configuras la etiqueta de GA4 dentro de GTM, para no medir dos veces.",
					default: ANALYTICS_DEFAULTS.ga4Direct,
				},
				clarityId: { type: "string", label: "ID de Microsoft Clarity", description: "Opcional (mapas de calor y grabaciones).", default: "" },
				metaPixelId: { type: "string", label: "ID del Meta Pixel", description: "Opcional (campañas de Facebook/Instagram).", default: "" },
				consentDefault: {
					type: "select",
					label: "Consentimiento por defecto",
					description: "Denegado (recomendado, coincide con la política de cookies): GA4 mide sin cookies hasta que la persona acepta; Clarity y Meta Pixel esperan la aceptación. Concedido: mide desde la primera visita.",
					options: [
						{ value: "granted", label: "Concedido (aviso informativo)" },
						{ value: "denied", label: "Denegado hasta aceptar" },
					],
					default: ANALYTICS_DEFAULTS.consentDefault,
				},
				cookieBanner: { type: "boolean", label: "Mostrar aviso de cookies", default: true },
				cookieText: { type: "string", label: "Texto del aviso de cookies", default: ANALYTICS_DEFAULTS.cookieText },
				privacyUrl: { type: "string", label: "Enlace a la política de cookies", default: ANALYTICS_DEFAULTS.privacyUrl },
			},
		},
		hooks: {
			"page:fragments": async ({ page }, ctx) => {
				if (isAdminPath(page.path)) return null;
				const s = await readSettings((k) => ctx.settings.get(k));
				const gtm = ID.gtm.test(s.gtmId) ? s.gtmId : "";
				const ga4 = ID.ga4.test(s.ga4Id) ? s.ga4Id : "";
				const clarity = ID.clarity.test(s.clarityId) ? s.clarityId : "";
				const pixel = ID.pixel.test(s.metaPixelId) ? s.metaPixelId : "";
				const denied = s.consentDefault === "denied";
				const fragments: Array<Record<string, unknown>> = [];

				// Consent Mode v2: valor por defecto + preferencia guardada por la persona.
				fragments.push({
					kind: "inline-script",
					placement: "head",
					key: "sv-consent",
					code: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}(function(){var v;try{v=localStorage.getItem('sv-consent')}catch(e){}var g=v?v==='granted':${denied ? "false" : "true"};var st=g?'granted':'denied';gtag('consent','default',{ad_storage:st,ad_user_data:st,ad_personalization:st,analytics_storage:st,functionality_storage:'granted',security_storage:'granted',wait_for_update:500});gtag('set','ads_data_redaction',!g);})();`,
				});

				if (gtm) {
					fragments.push({
						kind: "inline-script",
						placement: "head",
						key: "sv-gtm",
						code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
					});
					fragments.push({
						kind: "html",
						placement: "body:start",
						key: "sv-gtm-noscript",
						html: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtm}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`,
					});
				}

				if (ga4 && s.ga4Direct) {
					fragments.push({ kind: "external-script", placement: "head", key: "sv-ga4-lib", src: `https://www.googletagmanager.com/gtag/js?id=${ga4}`, async: true });
					fragments.push({
						kind: "inline-script",
						placement: "head",
						key: "sv-ga4",
						code: `gtag('js',new Date());gtag('config','${ga4}',{page_type:document.documentElement.dataset.pageType||undefined});`,
					});
				}

				// Clarity y Meta Pixel solo se cargan con consentimiento (al aceptar o si ya se aceptó antes).
				if (clarity || pixel) {
					const loaders = [
						clarity
							? `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`
							: "",
						pixel
							? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`
							: "",
					].join("");
					fragments.push({
						kind: "inline-script",
						placement: "head",
						key: "sv-consented-tags",
						code: `window.svLoadConsented=function(){if(window.svConsentedLoaded)return;window.svConsentedLoaded=true;${loaders}};(function(){var v;try{v=localStorage.getItem('sv-consent')}catch(e){}if(v==='granted'||(!v&&${denied ? "false" : "true"}))window.svLoadConsented();})();`,
					});
				}

				if (s.cookieBanner && (gtm || ga4 || clarity || pixel)) {
					fragments.push({
						kind: "html",
						placement: "body:end",
						key: "sv-cookie-banner",
						html: `<style>${BANNER_CSS}</style><div id="sv-cookies" role="dialog" aria-live="polite" aria-label="Aviso de cookies"><p>${escapeHtml(s.cookieText)} <a href="${escapeHtml(s.privacyUrl)}">Más información</a>.</p><div class="sv-ck-actions"><button type="button" data-accept>Aceptar</button><button type="button" data-reject>Rechazar</button></div></div>`,
					});
					fragments.push({
						kind: "inline-script",
						placement: "body:end",
						key: "sv-cookie-banner-js",
						code: `(function(){var b=document.getElementById('sv-cookies');if(!b)return;var v;try{v=localStorage.getItem('sv-consent')}catch(e){}if(!v){var shown=false,show=function(){if(shown)return;shown=true;b.dataset.open='true'};setTimeout(show,6000);addEventListener('scroll',function(){if(scrollY>200)show()},{passive:true,once:false})}function set(g){var st=g?'granted':'denied';try{localStorage.setItem('sv-consent',st)}catch(e){}gtag('consent','update',{ad_storage:st,ad_user_data:st,ad_personalization:st,analytics_storage:st});dataLayer.push({event:'consent_update',consent:st});if(g&&window.svLoadConsented)window.svLoadConsented();b.dataset.open='false'}b.querySelector('[data-accept]').addEventListener('click',function(){set(true)});b.querySelector('[data-reject]').addEventListener('click',function(){set(false)});document.addEventListener('sv:open-cookies',function(){b.dataset.open='true'});})();`,
					});
				}

				return fragments as never;
			},
		},
	});
}
