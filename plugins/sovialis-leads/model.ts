/** Modelo y validación de leads (solicitudes de cotización y contacto). */
import { boundedText, isValidEmail, isValidPhone, normalizePhone } from "../_shared/text";

export const LEAD_STATUSES = ["nuevo", "contactado", "cotizado", "ganado", "perdido", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
	nuevo: "Nuevo",
	contactado: "Contactado",
	cotizado: "Cotizado",
	ganado: "Ganado",
	perdido: "Perdido",
	spam: "Spam",
};

export interface LeadInput {
	name: string;
	phone: string;
	email: string;
	service: string;
	zone: string;
	schedule: string;
	forWhom: string;
	message: string;
	consent: boolean;
	source: string;
	page: string;
	pageTitle: string;
	referrer: string;
	utm: Record<string, string>;
	gclid: string;
	fbclid: string;
}

export interface Lead extends LeadInput {
	id: string;
	status: LeadStatus;
	notes: string;
	consentText: string;
	city: string;
	createdAt: string;
	updatedAt: string;
	notifiedAt: string;
	notifyError: string;
}

export interface LeadSettings {
	notifyTo: string;
	subjectTemplate: string;
	successMessage: string;
	consentText: string;
	autoReply: boolean;
	autoReplySubject: string;
	autoReplyText: string;
	turnstileSiteKey: string;
	maxPerWindow: number;
}

export const LEAD_DEFAULTS: LeadSettings = {
	notifyTo: "equipo.sovialis@gmail.com",
	subjectTemplate: "Nueva solicitud web: {nombre} · {servicio}",
	successMessage: "¡Gracias! Recibimos tus datos. Una coordinadora te escribirá por WhatsApp en horario de atención.",
	consentText:
		"Autorizo a Sovialis a tratar mis datos para responder esta solicitud, según la política de tratamiento de datos.",
	autoReply: false,
	autoReplySubject: "Recibimos tu solicitud · Sovialis",
	autoReplyText:
		"Hola {nombre}:\n\nGracias por escribirnos. Una coordinadora de Sovialis revisará tu solicitud y te contactará pronto.\n\nVínculos que protegen.\nSovialis",
	turnstileSiteKey: "",
	maxPerWindow: 5,
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Valida el cuerpo enviado por el formulario público. Lanza Error con un mensaje para la persona. */
export function parseLeadInput(raw: unknown): LeadInput & { honeypot: string; elapsedMs: number; turnstileToken: string } {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Solicitud inválida.");
	const v = raw as Record<string, unknown>;
	const name = boundedText(v.name, "Nombre", 120, true);
	if (name.length < 2) throw new Error("Escribe tu nombre.");
	const phone = normalizePhone(v.phone);
	if (!isValidPhone(phone)) throw new Error("Escribe un celular válido (10 dígitos).");
	const email = boundedText(v.email, "Correo", 190);
	if (email && !isValidEmail(email)) throw new Error("El correo no parece válido.");
	if (v.consent !== true) throw new Error("Necesitamos tu autorización para tratar los datos.");
	const message = boundedText(v.message, "Mensaje", 2000);
	if ((message.match(/https?:\/\//gi) ?? []).length > 1) throw new Error("El mensaje no puede incluir enlaces.");
	const utmRaw = v.utm && typeof v.utm === "object" ? (v.utm as Record<string, unknown>) : {};
	const utm: Record<string, string> = {};
	for (const key of UTM_KEYS) {
		const value = boundedText(utmRaw[key] ?? "", key, 200);
		if (value) utm[key] = value;
	}
	return {
		name,
		phone,
		email,
		service: boundedText(v.service, "Servicio", 120),
		zone: boundedText(v.zone, "Zona", 120),
		schedule: boundedText(v.schedule, "Turno", 120),
		forWhom: boundedText(v.forWhom, "Para quién", 120),
		message,
		consent: true,
		source: boundedText(v.source, "Origen", 60) || "formulario",
		page: boundedText(v.page, "Página", 300),
		pageTitle: boundedText(v.pageTitle, "Título", 300),
		referrer: boundedText(v.referrer, "Referente", 500),
		utm,
		gclid: boundedText(v.gclid, "gclid", 300),
		fbclid: boundedText(v.fbclid, "fbclid", 300),
		honeypot: typeof v.website === "string" ? v.website : "",
		elapsedMs: typeof v.elapsedMs === "number" ? v.elapsedMs : 0,
		turnstileToken: typeof v.turnstileToken === "string" ? v.turnstileToken.slice(0, 2048) : "",
	};
}

export function fillTemplate(template: string, lead: Partial<Lead>): string {
	const tokens: Record<string, string> = {
		nombre: lead.name ?? "",
		servicio: lead.service || "sin servicio",
		zona: lead.zone || "sin zona",
		telefono: lead.phone ?? "",
		pagina: lead.page ?? "",
	};
	return template.replace(/\{(nombre|servicio|zona|telefono|pagina)\}/g, (_, key: string) => tokens[key] ?? "");
}

export function formatPhone(digits: string): string {
	if (digits.length === 12 && digits.startsWith("57")) return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
	return `+${digits}`;
}

const CSV_COLUMNS: Array<[string, (l: Lead) => string]> = [
	["Fecha", (l) => l.createdAt],
	["Estado", (l) => STATUS_LABELS[l.status] ?? l.status],
	["Nombre", (l) => l.name],
	["Celular", (l) => l.phone],
	["Correo", (l) => l.email],
	["Servicio", (l) => l.service],
	["Zona", (l) => l.zone],
	["Turno", (l) => l.schedule],
	["Para quién", (l) => l.forWhom],
	["Mensaje", (l) => l.message],
	["Origen", (l) => l.source],
	["Página", (l) => l.page],
	["Ciudad (IP)", (l) => l.city],
	["utm_source", (l) => l.utm?.utm_source ?? ""],
	["utm_medium", (l) => l.utm?.utm_medium ?? ""],
	["utm_campaign", (l) => l.utm?.utm_campaign ?? ""],
	["gclid", (l) => l.gclid],
	["Notas", (l) => l.notes],
];

export function leadsToCsv(leads: Lead[]): string {
	const cell = (value: string) => `"${String(value ?? "").replace(/"/g, '""')}"`;
	const header = CSV_COLUMNS.map(([label]) => cell(label)).join(",");
	const rows = leads.map((lead) => CSV_COLUMNS.map(([, get]) => cell(get(lead))).join(","));
	return `﻿${[header, ...rows].join("\r\n")}\r\n`;
}
