/**
 * sovialis-leads — Captura de solicitudes (formularios modal, en línea y de contacto).
 *
 * - Ruta pública `submit`: valida, filtra spam (honeypot, tiempo mínimo, límite por IP,
 *   Turnstile opcional), guarda el lead en el almacenamiento del plugin y avisa por correo
 *   (transporte de Cloudflare vía `ctx.email`).
 * - Rutas privadas para el panel: listar, actualizar estado/notas, exportar CSV, ajustes.
 * - Página de administración «Leads y solicitudes» y widget de escritorio.
 */
import { definePlugin, getPluginSettings, pluginResponse, ulid } from "emdash";
import { escapeHtml } from "../_shared/text";
import {
	LEAD_DEFAULTS,
	LEAD_STATUSES,
	STATUS_LABELS,
	fillTemplate,
	formatPhone,
	leadsToCsv,
	parseLeadInput,
	type Lead,
	type LeadSettings,
	type LeadStatus,
} from "./model";

const WINDOW_MS = 10 * 60 * 1000;
const MIN_FILL_MS = 2500;

async function sha256Hex(text: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function readSettings(get: <T>(key: string) => Promise<T | null>): Promise<LeadSettings> {
	const out = { ...LEAD_DEFAULTS };
	for (const key of Object.keys(LEAD_DEFAULTS) as (keyof LeadSettings)[]) {
		const value = await get<unknown>(key);
		if (value !== null && value !== undefined && value !== "") (out as Record<string, unknown>)[key] = value;
	}
	return out;
}

function validateSettings(input: unknown): LeadSettings {
	if (!input || typeof input !== "object") throw new Error("Ajustes inválidos.");
	const v = input as Record<string, unknown>;
	const text = (key: keyof LeadSettings, max: number) => {
		const value = v[key];
		if (typeof value !== "string" || value.length > max) throw new Error(`${key}: texto inválido (máx. ${max}).`);
		return value.trim();
	};
	const notifyTo = text("notifyTo", 500);
	for (const address of notifyTo.split(",").map((a) => a.trim()).filter(Boolean)) {
		if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(address)) throw new Error(`Correo inválido: ${address}`);
	}
	const max = Number(v.maxPerWindow);
	return {
		notifyTo,
		subjectTemplate: text("subjectTemplate", 200),
		successMessage: text("successMessage", 400),
		consentText: text("consentText", 600),
		autoReply: v.autoReply === true,
		autoReplySubject: text("autoReplySubject", 200),
		autoReplyText: text("autoReplyText", 3000),
		turnstileSiteKey: text("turnstileSiteKey", 100),
		maxPerWindow: Number.isInteger(max) && max >= 1 && max <= 50 ? max : LEAD_DEFAULTS.maxPerWindow,
	};
}

function notificationHtml(lead: Lead): string {
	const row = (label: string, value: string) =>
		value
			? `<tr><th align="left" style="padding:6px 12px;color:#4a6178;font-weight:600;vertical-align:top">${escapeHtml(label)}</th><td style="padding:6px 12px;color:#0b2a4e">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`
			: "";
	const wa = `https://wa.me/${lead.phone}?text=${encodeURIComponent(`Hola ${lead.name}, te escribimos de Sovialis por tu solicitud en la web.`)}`;
	return `<!doctype html><html lang="es"><body style="margin:0;background:#f3f7fa;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dbe6ee"><tr><td style="background:#0b2a4e;color:#fff;padding:20px 24px;font-size:18px;font-weight:700">Nueva solicitud desde sovialis.com</td></tr><tr><td style="padding:16px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">${row("Nombre", lead.name)}${row("Celular", formatPhone(lead.phone))}${row("Correo", lead.email)}${row("Servicio", lead.service)}${row("Zona", lead.zone)}${row("Turno", lead.schedule)}${row("Para quién", lead.forWhom)}${row("Mensaje", lead.message)}${row("Página", lead.page)}${row("Origen", lead.source)}${row("Campaña", [lead.utm.utm_source, lead.utm.utm_medium, lead.utm.utm_campaign].filter(Boolean).join(" / "))}${row("Ciudad (aprox.)", lead.city)}</table></td></tr><tr><td style="padding:8px 24px 24px"><a href="${wa}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Responder por WhatsApp</a>&nbsp;&nbsp;<a href="https://sovialis.com/_emdash/admin/plugins/sovialis-leads/leads" style="color:#005e9d">Ver en el panel</a></td></tr></table></td></tr></table></body></html>`;
}

function notificationText(lead: Lead): string {
	return [
		"Nueva solicitud desde sovialis.com",
		"",
		`Nombre: ${lead.name}`,
		`Celular: ${formatPhone(lead.phone)}`,
		lead.email && `Correo: ${lead.email}`,
		lead.service && `Servicio: ${lead.service}`,
		lead.zone && `Zona: ${lead.zone}`,
		lead.schedule && `Turno: ${lead.schedule}`,
		lead.forWhom && `Para quién: ${lead.forWhom}`,
		lead.message && `Mensaje: ${lead.message}`,
		`Página: ${lead.page}`,
		`Origen: ${lead.source}`,
	]
		.filter(Boolean)
		.join("\n");
}

async function whatsappContinueUrl(lead: Lead): Promise<string | null> {
	try {
		const wa = (await getPluginSettings("sovialis-whatsapp")) as { config?: { number?: string } };
		const number = wa?.config?.number?.replace(/\D/g, "");
		if (!number) return null;
		const text = `Hola, soy ${lead.name}. Acabo de enviar una solicitud en la web${lead.service ? ` sobre ${lead.service}` : ""}${lead.zone ? ` en ${lead.zone}` : ""}.`;
		return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
	} catch {
		return null;
	}
}

export function createPlugin() {
	return definePlugin({
		id: "sovialis-leads",
		version: "1.0.0",
		capabilities: ["email:send", "network:request"],
		allowedHosts: ["challenges.cloudflare.com"],
		storage: {
			leads: { indexes: ["status", "createdAt", "service", "source", ["status", "createdAt"]] },
		},
		admin: {
			pages: [{ path: "/leads", label: "Leads y solicitudes", icon: "inbox" }],
			widgets: [{ id: "recientes", title: "Últimas solicitudes", size: "half" }],
			settingsSchema: {
				turnstileSecret: {
					type: "secret",
					label: "Clave secreta de Cloudflare Turnstile",
					description: "Opcional. Si la completas junto con la clave de sitio (en Leads → Ajustes), los formularios exigen el reto antispam.",
				},
			},
		},
		routes: {
			submit: {
				public: true,
				methods: ["POST"],
				request: { body: "json", maxBytes: 16_384 },
				handler: async (ctx) => {
					let input: ReturnType<typeof parseLeadInput>;
					try {
						input = parseLeadInput(ctx.input);
					} catch (error) {
						return { ok: false, error: error instanceof Error ? error.message : "Solicitud inválida." };
					}
					const settings = await readSettings((k) => ctx.settings.get(k));

					// Spam silencioso: se responde como éxito sin guardar.
					if (input.honeypot || input.elapsedMs < MIN_FILL_MS) {
						return { ok: true, message: settings.successMessage };
					}

					const ip = ctx.requestMeta?.ip ?? "0.0.0.0";
					const bucket = Math.floor(Date.now() / WINDOW_MS);
					const rateKey = `rl:${(await sha256Hex(`${ip}:${bucket}`)).slice(0, 24)}`;
					const count = ((await ctx.kv.get<number>(rateKey)) ?? 0) + 1;
					if (count > settings.maxPerWindow) {
						return { ok: false, error: "Recibimos varias solicitudes seguidas. Escríbenos por WhatsApp, por favor." };
					}
					await ctx.kv.set(rateKey, count);

					const turnstileSecret = await ctx.settings.get<string>("turnstileSecret");
					if (settings.turnstileSiteKey && turnstileSecret && ctx.http) {
						const form = new FormData();
						form.append("secret", turnstileSecret);
						form.append("response", input.turnstileToken);
						form.append("remoteip", ip);
						const res = await ctx.http.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
						const verdict = (await res.json()) as { success?: boolean };
						if (!verdict.success) return { ok: false, error: "No pudimos verificar el formulario. Intenta de nuevo." };
					}

					const now = new Date().toISOString();
					const { honeypot: _h, elapsedMs: _e, turnstileToken: _t, ...data } = input;
					const geo = ctx.requestMeta?.geo;
					const lead: Lead = {
						...data,
						id: ulid(),
						status: "nuevo",
						notes: "",
						consentText: settings.consentText,
						city: [geo?.city, geo?.region].filter(Boolean).join(", "),
						createdAt: now,
						updatedAt: now,
						notifiedAt: "",
						notifyError: "",
					};
					await ctx.storage.leads.put(lead.id, lead);

					const recipients = settings.notifyTo.split(",").map((a) => a.trim()).filter(Boolean);
					if (ctx.email && recipients.length) {
						try {
							await ctx.email.send({
								to: recipients[0]!,
								cc: recipients.slice(1),
								replyTo: lead.email || undefined,
								subject: fillTemplate(settings.subjectTemplate, lead),
								text: notificationText(lead),
								html: notificationHtml(lead),
							});
							lead.notifiedAt = new Date().toISOString();
						} catch (error) {
							lead.notifyError = error instanceof Error ? error.message.slice(0, 300) : "Error de envío";
							ctx.log.warn("No se pudo enviar el aviso del lead", { id: lead.id, error: lead.notifyError });
						}
						if (settings.autoReply && lead.email) {
							try {
								await ctx.email.send({
									to: lead.email,
									subject: fillTemplate(settings.autoReplySubject, lead),
									text: fillTemplate(settings.autoReplyText, lead),
								});
							} catch (error) {
								ctx.log.warn("No se pudo enviar la respuesta automática", { id: lead.id });
							}
						}
						await ctx.storage.leads.put(lead.id, lead);
					}

					return { ok: true, id: lead.id, message: settings.successMessage, whatsappUrl: await whatsappContinueUrl(lead) };
				},
			},

			config: {
				public: true,
				methods: ["GET"],
				request: { body: "none" },
				cacheControl: "public, max-age=60, stale-while-revalidate=600",
				handler: async (ctx) => {
					const s = await readSettings((k) => ctx.settings.get(k));
					return { consentText: s.consentText, successMessage: s.successMessage, turnstileSiteKey: s.turnstileSiteKey };
				},
			},

			list: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async (ctx) => {
					const q = (ctx.input ?? {}) as Record<string, string>;
					const status = LEAD_STATUSES.includes(q.status as LeadStatus) ? (q.status as LeadStatus) : undefined;
					const result = await ctx.storage.leads.query({
						...(status ? { where: { status } } : {}),
						orderBy: { createdAt: "desc" },
						limit: 50,
						...(q.cursor ? { cursor: q.cursor } : {}),
					});
					const counts: Record<string, number> = {};
					for (const s of LEAD_STATUSES) counts[s] = await ctx.storage.leads.count({ status: s });
					return { items: result.items.map((i) => i.data as Lead), cursor: result.cursor ?? null, hasMore: result.hasMore, counts, labels: STATUS_LABELS };
				},
			},

			update: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 16_384 },
				handler: async (ctx) => {
					const v = (ctx.input ?? {}) as { id?: string; status?: string; notes?: string };
					if (!v.id) throw new Error("Falta el id del lead.");
					const lead = (await ctx.storage.leads.get(v.id)) as Lead | null;
					if (!lead) throw new Error("El lead ya no existe.");
					if (v.status !== undefined) {
						if (!LEAD_STATUSES.includes(v.status as LeadStatus)) throw new Error("Estado inválido.");
						lead.status = v.status as LeadStatus;
					}
					if (v.notes !== undefined) {
						if (typeof v.notes !== "string" || v.notes.length > 5000) throw new Error("Notas inválidas.");
						lead.notes = v.notes;
					}
					lead.updatedAt = new Date().toISOString();
					await ctx.storage.leads.put(lead.id, lead);
					return { lead };
				},
			},

			remove: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 1024 },
				handler: async (ctx) => {
					const v = (ctx.input ?? {}) as { id?: string };
					if (!v.id) throw new Error("Falta el id del lead.");
					return { deleted: await ctx.storage.leads.delete(v.id) };
				},
			},

			export: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				response: "raw",
				handler: async (ctx) => {
					const leads: Lead[] = [];
					let cursor: string | undefined;
					do {
						const page = await ctx.storage.leads.query({ orderBy: { createdAt: "desc" }, limit: 100, ...(cursor ? { cursor } : {}) });
						leads.push(...page.items.map((i) => i.data as Lead));
						cursor = page.hasMore ? page.cursor : undefined;
					} while (cursor && leads.length < 10_000);
					const date = new Date().toISOString().slice(0, 10);
					return pluginResponse({
						body: leadsToCsv(leads),
						headers: {
							"Content-Type": "text/csv; charset=utf-8",
							"Content-Disposition": `attachment; filename="sovialis-leads-${date}.csv"`,
						},
					});
				},
			},

			settings: {
				methods: ["GET"],
				permission: "settings:manage",
				request: { body: "none" },
				handler: async (ctx) => ({ settings: await readSettings((k) => ctx.settings.get(k)) }),
			},

			saveSettings: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 32_768 },
				handler: async (ctx) => {
					const settings = validateSettings(ctx.input);
					for (const [key, value] of Object.entries(settings)) await ctx.settings.set(key, value);
					return { settings };
				},
			},

			testEmail: {
				methods: ["POST"],
				permission: "settings:manage",
				request: { body: "json", maxBytes: 1024 },
				handler: async (ctx) => {
					if (!ctx.email) throw new Error("No hay transporte de correo activo.");
					const settings = await readSettings((k) => ctx.settings.get(k));
					const to = settings.notifyTo.split(",")[0]?.trim();
					if (!to) throw new Error("Configura al menos un destinatario.");
					await ctx.email.send({ to, subject: "Prueba de avisos · sovialis.com", text: "Si lees esto, los avisos de leads llegan correctamente." });
					return { sentTo: to };
				},
			},
		},
	});
}
