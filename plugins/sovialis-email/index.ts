/**
 * sovialis-email — Transporte de correo de EmDash sobre Cloudflare (binding `send_email`).
 *
 * Implementa el hook exclusivo `email:deliver`: todo correo que EmDash o un plugin envíe con
 * `ctx.email.send()` (avisos de leads, notificaciones de comentarios, invitaciones) sale por el
 * servicio de correo de Cloudflare, sin proveedor externo ni costo. Con Email Routing, Cloudflare
 * solo entrega a direcciones verificadas de la cuenta; con Email Service activo en el dominio,
 * a cualquier destinatario.
 */
import { env } from "cloudflare:workers";
import { definePlugin } from "emdash";

interface EmailBinding {
	send(message: {
		from: { name: string; email: string } | string;
		to: string | string[];
		cc?: string | string[];
		replyTo?: string;
		subject: string;
		text?: string;
		html?: string;
		headers?: Record<string, string>;
	}): Promise<{ messageId: string }>;
}

const DEFAULT_FROM = "web@sovialis.com";
const DEFAULT_NAME = "Sovialis";

export function createPlugin() {
	return definePlugin({
		id: "sovialis-email",
		version: "1.0.0",
		capabilities: ["hooks.email-transport:register"],
		admin: {
			settingsSchema: {
				fromAddress: {
					type: "email",
					label: "Correo remitente",
					description: "Debe pertenecer al dominio sovialis.com (Cloudflare Email Routing activo).",
					default: DEFAULT_FROM,
				},
				fromName: { type: "string", label: "Nombre del remitente", default: DEFAULT_NAME },
			},
		},
		hooks: {
			"email:deliver": {
				exclusive: true,
				handler: async ({ message }, ctx) => {
					const binding = (env as unknown as { EMAIL?: EmailBinding }).EMAIL;
					if (!binding) throw new Error("El binding EMAIL (send_email) no está configurado en wrangler.jsonc.");
					const fromAddress = (await ctx.settings.get<string>("fromAddress")) || DEFAULT_FROM;
					const fromName = (await ctx.settings.get<string>("fromName")) || DEFAULT_NAME;
					const result = await binding.send({
						from: { name: fromName, email: fromAddress },
						to: message.to,
						...(message.cc?.length ? { cc: message.cc } : {}),
						...(message.replyTo ? { replyTo: message.replyTo } : {}),
						subject: message.subject,
						text: message.text,
						...(message.html ? { html: message.html } : {}),
					});
					ctx.log.info("Correo entregado por Cloudflare", { to: message.to, messageId: result?.messageId });
				},
			},
		},
	});
}
