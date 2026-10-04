/**
 * Datos globales del sitio: entrada «general» de la colección `site` (editable en el panel),
 * configuración del plugin de WhatsApp y valores de respaldo para que nada quede vacío.
 */
import { getEmDashCollection, getEmDashEntry, getPluginSetting, getSiteSettings } from "emdash";
import { DEFAULT_SETTINGS as WA_DEFAULTS, type WhatsAppSettings } from "../../plugins/sovialis-whatsapp/model";
import { ROUTES } from "./routes";

export interface SiteData {
	name: string;
	tagline: string;
	logoUrl: string | null;
	legalName: string;
	nit: string;
	phoneDisplay: string;
	phoneE164: string;
	whatsappDisplay: string;
	whatsappNumber: string;
	whatsappMessage: string;
	email: string;
	address: string;
	city: string;
	hours: string;
	coverage: string;
	announcement: string;
	announcementUrl: string;
	headerCta: string;
	stickyTitle: string;
	stickyText: string;
	footerAbout: string;
	footerLegal: string;
	leadTitle: string;
	leadEyebrow: string;
	leadText: string;
	leadSchedules: string[];
	leadRelations: string[];
	social: Array<{ name: string; url: string }>;
	trust: Array<{ icon: string; text: string }>;
}

const FALLBACK: SiteData = {
	name: "Sovialis",
	tagline: "Vínculos que protegen",
	logoUrl: null,
	legalName: "SOVIALIS CUIDADO INTEGRAL S.A.S.",
	nit: "",
	phoneDisplay: "300 892 1144",
	phoneE164: "+573008921144",
	whatsappDisplay: "300 892 1144",
	whatsappNumber: "573008921144",
	whatsappMessage: WA_DEFAULTS.message,
	email: "contacto@sovialis.com",
	address: "",
	city: "Bogotá D.C.",
	hours: "Lunes a domingo, 7:00 a. m. a 8:00 p. m.",
	coverage: "Norte de Bogotá y la Sabana",
	announcement: "",
	announcementUrl: "",
	headerCta: "Cotiza en 2 minutos",
	stickyTitle: "¿Hablamos hoy?",
	stickyText: "Te respondemos por WhatsApp",
	footerAbout: "Cuidado del adulto mayor en casa con cuidadoras y auxiliares de enfermería seleccionadas, en el norte de Bogotá.",
	footerLegal:
		"Sovialis presta servicios de cuidado no sanitario a domicilio. No es una Institución Prestadora de Servicios de Salud (IPS) y su personal no realiza procedimientos de salud. Para servicios de salud, consulta a tu EPS o a una IPS habilitada.",
	leadTitle: "Cotiza el cuidado de tu familiar",
	leadEyebrow: "Sin compromiso",
	leadText: "Déjanos tus datos y una coordinadora te escribe por WhatsApp con el precio para tu caso.",
	leadSchedules: ["Turno de día (12 h)", "Turno de noche (12 h)", "24 horas / interna", "Por horas", "Acompañamiento a citas", "Aún no lo sé"],
	leadRelations: ["Mi mamá", "Mi papá", "Mis padres", "Un abuelo o abuela", "Otro familiar", "Para mí"],
	social: [],
	trust: [],
};

const lines = (text: unknown) =>
	typeof text === "string"
		? text
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean)
		: [];
const str = (value: unknown, fallback: string) => (typeof value === "string" && value.trim() ? value.trim() : fallback);

let cache: { at: number; data: SiteData } | null = null;

export async function getSiteData(): Promise<SiteData> {
	if (cache && Date.now() - cache.at < 5_000) return cache.data;
	const [settings, siteEntry, wa] = await Promise.all([
		getSiteSettings().catch(() => ({}) as Record<string, unknown>),
		getEmDashEntry("site", "general").catch(() => ({ entry: null })),
		getPluginSetting<Partial<WhatsAppSettings>>("sovialis-whatsapp", "config").catch(() => undefined),
	]);
	const d = (siteEntry.entry?.data ?? {}) as Record<string, unknown>;
	const s = settings as { title?: string; tagline?: string; logo?: { url?: string } };
	const data: SiteData = {
		name: str(s.title, FALLBACK.name),
		tagline: str(s.tagline, FALLBACK.tagline),
		logoUrl: s.logo?.url ?? null,
		legalName: str(d.legal_name, FALLBACK.legalName),
		nit: str(d.nit, FALLBACK.nit),
		phoneDisplay: str(d.phone_display, FALLBACK.phoneDisplay),
		phoneE164: str(d.phone_e164, FALLBACK.phoneE164).replace(/[^\d+]/g, ""),
		whatsappDisplay: str(d.whatsapp_display, FALLBACK.whatsappDisplay),
		whatsappNumber: str(wa?.number, FALLBACK.whatsappNumber).replace(/\D/g, ""),
		whatsappMessage: str(wa?.message, FALLBACK.whatsappMessage),
		email: str(d.email, FALLBACK.email),
		address: str(d.address, FALLBACK.address),
		city: str(d.city, FALLBACK.city),
		hours: str(d.hours, FALLBACK.hours),
		coverage: str(d.coverage, FALLBACK.coverage),
		announcement: str(d.announcement, FALLBACK.announcement),
		announcementUrl: str(d.announcement_url, FALLBACK.announcementUrl),
		headerCta: str(d.header_cta, FALLBACK.headerCta),
		stickyTitle: str(d.sticky_title, FALLBACK.stickyTitle),
		stickyText: str(d.sticky_text, FALLBACK.stickyText),
		footerAbout: str(d.footer_about, FALLBACK.footerAbout),
		footerLegal: str(d.footer_legal, FALLBACK.footerLegal),
		leadTitle: str(d.lead_title, FALLBACK.leadTitle),
		leadEyebrow: str(d.lead_eyebrow, FALLBACK.leadEyebrow),
		leadText: str(d.lead_text, FALLBACK.leadText),
		leadSchedules: lines(d.lead_schedules).length ? lines(d.lead_schedules) : FALLBACK.leadSchedules,
		leadRelations: lines(d.lead_relations).length ? lines(d.lead_relations) : FALLBACK.leadRelations,
		social: Array.isArray(d.social) ? (d.social as SiteData["social"]).filter((x) => x?.url) : [],
		trust: Array.isArray(d.trust) ? (d.trust as SiteData["trust"]).filter((x) => x?.text) : FALLBACK.trust,
	};
	cache = { at: Date.now(), data };
	return data;
}

export function waLink(site: Pick<SiteData, "whatsappNumber" | "whatsappMessage">, message?: string): string {
	return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message || site.whatsappMessage.replace(/\{[a-z]+\}/g, "").trim())}`;
}

export function telLink(site: Pick<SiteData, "phoneE164">): string {
	return `tel:${site.phoneE164}`;
}

const COP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
export function formatCOP(value: number | null | undefined): string {
	return typeof value === "number" && value > 0 ? COP.format(value).replace(/\$\s+/, "$").replace(/\s/g, " ") : "";
}

/** Servicios y zonas publicados, ordenados, para menús, mega menú, formularios y bloques automáticos. */
export interface CatalogItem {
	slug: string;
	title: string;
	shortTitle: string;
	excerpt: string;
	icon: string;
	priceFrom: number | null;
	priceUnit: string;
	image: { src?: string; alt?: string; width?: number; height?: number } | null;
	featured: boolean;
	group: string;
	lat: number | null;
	lng: number | null;
	parent: string;
	kind: string;
	url: string;
}

let catalogCache: { at: number; services: CatalogItem[]; zones: CatalogItem[] } | null = null;

export async function getCatalog(): Promise<{ services: CatalogItem[]; zones: CatalogItem[] }> {
	if (catalogCache && Date.now() - catalogCache.at < 5_000) return catalogCache;
	const [services, zones] = await Promise.all([
		getEmDashCollection("services", { status: "published", limit: 50 }).catch(() => ({ entries: [] })),
		getEmDashCollection("zones", { status: "published", limit: 60 }).catch(() => ({ entries: [] })),
	]);
	const toItem = (e: { id: string; data: Record<string, unknown> }): CatalogItem & { order: number } => ({
		slug: e.id,
		title: String(e.data.title ?? e.id),
		shortTitle: String(e.data.short_title || e.data.title || e.id),
		excerpt: String(e.data.excerpt ?? ""),
		icon: String(e.data.icon ?? "corazon"),
		priceFrom: typeof e.data.price_from === "number" ? e.data.price_from : null,
		priceUnit: String(e.data.price_unit ?? ""),
		image: (e.data.hero_image as CatalogItem["image"]) ?? null,
		featured: Boolean(e.data.featured),
		group: String(e.data.menu_group ?? e.data.locality ?? ""),
		lat: typeof e.data.lat === "number" ? e.data.lat : null,
		lng: typeof e.data.lng === "number" ? e.data.lng : null,
		parent: String(e.data.parent ?? ""),
		kind: String(e.data.kind ?? ""),
		url: "",
		order: typeof e.data.order === "number" ? e.data.order : 99,
	});
	const sort = (a: { order: number; title: string }, b: { order: number; title: string }) => a.order - b.order || a.title.localeCompare(b.title, "es");
	const serviceItems = services.entries.map((e) => toItem(e as never)).sort(sort);
	serviceItems.forEach((s) => (s.url = ROUTES.services(s.slug)));
	const zoneItems = zones.entries.map((e) => toItem(e as never)).sort(sort);
	zoneItems.forEach((z) => (z.url = ROUTES.zones(z.slug, z.parent || null)));
	catalogCache = { at: Date.now(), services: serviceItems, zones: zoneItems };
	return catalogCache;
}

/** URL pública de un valor de imagen de EmDash (archivo en R2 servido por la API de medios). */
export function mediaUrl(value: unknown): string | undefined {
	if (!value) return undefined;
	if (typeof value === "string") return value;
	const v = value as { src?: string; url?: string; meta?: { storageKey?: string }; storageKey?: string };
	const key = v.meta?.storageKey ?? v.storageKey;
	return v.src || v.url || (key ? `/_emdash/api/media/file/${key}` : undefined);
}
