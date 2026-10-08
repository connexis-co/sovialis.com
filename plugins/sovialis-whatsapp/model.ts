/**
 * Modelo del botón de WhatsApp de Sovialis (adaptado del plugin de Curso de Globos).
 * Se guarda en los ajustes del plugin bajo la clave `config`; el tema lo lee con
 * `getPluginSetting("sovialis-whatsapp", "config")`.
 */
import { matchesPath } from "../_shared/text";

export interface WhatsAppRule {
	id: string;
	label: string;
	enabled: boolean;
	priority: number;
	services: string[];
	zones: string[];
	paths: string[];
	number: string;
	message: string;
	startsAt: string;
	endsAt: string;
}

export type LabelMode = "always" | "intro" | "hover" | "never";
export type OffHours = "hide" | "show" | "note";

export interface WhatsAppSettings {
	enabled: boolean;
	number: string;
	message: string;
	label: string;
	labelMode: LabelMode;
	labelSeconds: number;
	labelOnMobile: boolean;
	position: "left" | "right";
	x: number;
	y: number;
	showAfterScroll: number;
	delay: number;
	mobile: boolean;
	desktop: boolean;
	animate: boolean;
	color: string;
	iconColor: string;
	waveColor: string;
	labelBg: string;
	labelColor: string;
	size: number;
	mobileSize: number;
	hiddenPaths: string[];
	timezone: string;
	weekdays: number[];
	startTime: string;
	endTime: string;
	offHours: OffHours;
	offHoursNote: string;
	rules: WhatsAppRule[];
}

export interface WhatsAppContext {
	path: string;
	title: string;
	service: string;
	serviceName: string;
	zone: string;
	zoneName: string;
	url: string;
}

export interface ResolvedWhatsApp {
	number: string;
	message: string;
	url: string;
	rule: string;
	open: boolean;
	label: string;
}

export const DEFAULT_SETTINGS: WhatsAppSettings = {
	enabled: true,
	number: "573117598641",
	message: "Hola, quiero información sobre {titulo}. Lo vi en {url}",
	label: "Escríbenos por WhatsApp",
	labelMode: "intro",
	labelSeconds: 5,
	labelOnMobile: false,
	position: "right",
	x: 24,
	y: 24,
	showAfterScroll: 300,
	delay: 0,
	mobile: true,
	desktop: true,
	animate: true,
	color: "#25d366",
	iconColor: "#ffffff",
	waveColor: "#25d366",
	labelBg: "#0b2a4e",
	labelColor: "#ffffff",
	size: 60,
	mobileSize: 52,
	hiddenPaths: ["/politica-de-tratamiento-de-datos/", "/terminos-y-condiciones/"],
	timezone: "America/Bogota",
	weekdays: [0, 1, 2, 3, 4, 5, 6],
	startTime: "",
	endTime: "",
	offHours: "note",
	offHoursNote: "Fuera de horario: te respondemos en la mañana.",
	rules: [],
};

function boundedText(input: unknown, name: string, max: number): string {
	if (input === undefined || input === null) return "";
	if (typeof input !== "string" || input.length > max) throw new Error(`${name}: texto de máximo ${max} caracteres.`);
	return input.trim();
}
function integer(input: unknown, name: string, min: number, max: number): number {
	const n = Number(input);
	if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name}: usa un entero entre ${min} y ${max}.`);
	return n;
}
function strings(input: unknown, name: string, max = 200): string[] {
	if (input === undefined) return [];
	if (!Array.isArray(input) || input.length > max) throw new Error(`${name}: lista inválida.`);
	return [...new Set(input.map((item) => boundedText(item, name, 200)).filter(Boolean))];
}
function phone(value: unknown): string {
	const number = boundedText(value, "Número internacional", 24).replace(/[\s+()-]/g, "");
	if (number && !/^[1-9]\d{6,14}$/.test(number)) throw new Error("Número: usa entre 7 y 15 dígitos con indicativo (57…).");
	return number;
}
function bool(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}
function date(value: unknown, name: string): string {
	const text = boundedText(value, name, 40);
	if (text && !Number.isFinite(Date.parse(text))) throw new Error(`${name}: fecha inválida.`);
	return text;
}

export function validateSettings(input: unknown): WhatsAppSettings {
	if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Configuración inválida.");
	const v = input as Record<string, unknown>;
	const d = DEFAULT_SETTINGS;
	const settings: WhatsAppSettings = {
		enabled: bool(v.enabled, d.enabled),
		number: phone(v.number),
		message: boundedText(v.message, "Mensaje", 1500) || d.message,
		label: boundedText(v.label, "Etiqueta", 80) || d.label,
		labelMode: (["always", "intro", "hover", "never"] as const).includes(v.labelMode as LabelMode) ? (v.labelMode as LabelMode) : d.labelMode,
		labelSeconds: integer(v.labelSeconds ?? d.labelSeconds, "Segundos de la etiqueta", 1, 60),
		labelOnMobile: bool(v.labelOnMobile, d.labelOnMobile),
		position: v.position === "left" ? "left" : "right",
		x: integer(v.x ?? d.x, "Separación horizontal", 0, 300),
		y: integer(v.y ?? d.y, "Separación inferior", 0, 500),
		showAfterScroll: integer(v.showAfterScroll ?? d.showAfterScroll, "Aparecer tras scroll (px)", 0, 5000),
		delay: integer(v.delay ?? d.delay, "Espera", 0, 120),
		mobile: bool(v.mobile, d.mobile),
		desktop: bool(v.desktop, d.desktop),
		animate: bool(v.animate, d.animate),
		color: boundedText(v.color, "Color", 7) || d.color,
		iconColor: boundedText(v.iconColor, "Color del ícono", 7) || d.iconColor,
		waveColor: boundedText(v.waveColor, "Color de las ondas", 7) || d.waveColor,
		labelBg: boundedText(v.labelBg, "Fondo de la etiqueta", 7) || d.labelBg,
		labelColor: boundedText(v.labelColor, "Texto de la etiqueta", 7) || d.labelColor,
		size: integer(v.size ?? d.size, "Tamaño en escritorio", 44, 80),
		mobileSize: integer(v.mobileSize ?? d.mobileSize, "Tamaño en móvil", 40, 72),
		hiddenPaths: strings(v.hiddenPaths, "Rutas ocultas"),
		timezone: boundedText(v.timezone, "Zona horaria", 60) || d.timezone,
		weekdays: Array.isArray(v.weekdays) ? [...new Set(v.weekdays.map((x) => integer(x, "Días", 0, 6)))] : d.weekdays,
		startTime: boundedText(v.startTime, "Inicio de horario", 5),
		endTime: boundedText(v.endTime, "Fin de horario", 5),
		offHours: (["hide", "show", "note"] as const).includes(v.offHours as OffHours) ? (v.offHours as OffHours) : d.offHours,
		offHoursNote: boundedText(v.offHoursNote, "Nota fuera de horario", 160),
		rules: [],
	};
	if (!settings.number) throw new Error("El número general de WhatsApp es obligatorio.");
	for (const key of ["color", "iconColor", "waveColor", "labelBg", "labelColor"] as const) {
		if (!/^#[a-f0-9]{6}$/i.test(settings[key])) throw new Error("Usa colores hexadecimales (#RRGGBB).");
	}
	try {
		new Intl.DateTimeFormat("en", { timeZone: settings.timezone });
	} catch {
		throw new Error("Zona horaria IANA inválida (ej. America/Bogota).");
	}
	const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
	if (!!settings.startTime !== !!settings.endTime || [settings.startTime, settings.endTime].some((t) => t && !hhmm.test(t))) {
		throw new Error("Completa ambas horas (HH:MM) o deja ambas vacías.");
	}
	const rules = Array.isArray(v.rules) ? v.rules : [];
	if (rules.length > 100) throw new Error("Máximo 100 reglas.");
	settings.rules = rules.map((raw, index) => {
		if (!raw || typeof raw !== "object") throw new Error(`Regla ${index + 1} inválida.`);
		const r = raw as Record<string, unknown>;
		const rule: WhatsAppRule = {
			id: boundedText(r.id, "ID", 80),
			label: boundedText(r.label, "Nombre", 100),
			enabled: bool(r.enabled, true),
			priority: integer(r.priority ?? 100, "Prioridad", -1000, 1000),
			services: strings(r.services, "Servicios"),
			zones: strings(r.zones, "Zonas"),
			paths: strings(r.paths, "Rutas"),
			number: phone(r.number),
			message: boundedText(r.message, "Mensaje", 1500),
			startsAt: date(r.startsAt, "Inicio"),
			endsAt: date(r.endsAt, "Fin"),
		};
		if (!/^[a-zA-Z0-9_-]+$/.test(rule.id) || !rule.label) throw new Error("Cada regla requiere un ID y un nombre.");
		if (rule.startsAt && rule.endsAt && Date.parse(rule.startsAt) >= Date.parse(rule.endsAt)) {
			throw new Error(`Regla «${rule.label}»: la fecha de fin debe ser posterior al inicio.`);
		}
		return rule;
	});
	if (new Set(settings.rules.map((r) => r.id)).size !== settings.rules.length) throw new Error("Hay IDs de reglas repetidos.");
	return settings;
}

/** Combina lo guardado con los valores por defecto (por si faltan claves nuevas). */
export function withDefaults(stored: Partial<WhatsAppSettings> | null | undefined): WhatsAppSettings {
	return { ...DEFAULT_SETTINGS, ...(stored ?? {}), rules: stored?.rules ?? [] };
}

export function inSchedule(settings: WhatsAppSettings, now: Date): boolean {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: settings.timezone,
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(now);
	const get = (key: string) => parts.find((p) => p.type === key)?.value ?? "";
	const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
	const time = `${get("hour")}:${get("minute")}`;
	if (!settings.startTime) return settings.weekdays.includes(day);
	if (settings.startTime <= settings.endTime) {
		return settings.weekdays.includes(day) && time >= settings.startTime && time < settings.endTime;
	}
	return time >= settings.startTime ? settings.weekdays.includes(day) : time < settings.endTime && settings.weekdays.includes((day + 6) % 7);
}

export function buildMessage(template: string, context: WhatsAppContext): string {
	const tokens: Record<string, string> = {
		titulo: context.title || "el cuidado de un adulto mayor",
		servicio: context.serviceName || context.title,
		zona: context.zoneName || "Bogotá",
		url: context.url,
		pagina: context.path,
	};
	return template.replace(/\{(titulo|servicio|zona|url|pagina)\}/g, (_, token: string) => tokens[token] ?? "");
}

export function resolveWhatsApp(settings: WhatsAppSettings, context: WhatsAppContext, now = new Date()): ResolvedWhatsApp | null {
	if (!settings.enabled) return null;
	if (settings.hiddenPaths.some((p) => matchesPath(context.path, p))) return null;
	const open = inSchedule(settings, now);
	if (!open && settings.offHours === "hide") return null;
	const nowMs = now.valueOf();
	const rule = settings.rules
		.filter(
			(r) =>
				r.enabled &&
				(!r.startsAt || nowMs >= Date.parse(r.startsAt)) &&
				(!r.endsAt || nowMs < Date.parse(r.endsAt)) &&
				(!r.services.length || r.services.includes(context.service)) &&
				(!r.zones.length || r.zones.includes(context.zone)) &&
				(!r.paths.length || r.paths.some((p) => matchesPath(context.path, p))),
		)
		.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))[0];
	const number = rule?.number || settings.number;
	if (!/^[1-9]\d{6,14}$/.test(number)) return null;
	const message = buildMessage(rule?.message || settings.message, context);
	return {
		number,
		message,
		url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
		rule: rule?.id ?? "general",
		open,
		label: settings.label,
	};
}
