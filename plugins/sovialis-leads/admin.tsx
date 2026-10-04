import { useEffect, useState } from "react";
import { Notice, Page, Tabs, pluginApi, useLoad } from "../_shared/admin-kit";
import { LEAD_DEFAULTS, LEAD_STATUSES, STATUS_LABELS, formatPhone, type Lead, type LeadSettings, type LeadStatus } from "./model";

const api = <T,>(path: string, body?: unknown) => pluginApi<T>("sovialis-leads", path, body);
type ListResult = { items: Lead[]; cursor: string | null; hasMore: boolean; counts: Record<string, number> };

const fmtDate = (iso: string) =>
	new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });

function LeadRow({ lead, onChange }: { lead: Lead; onChange: (l: Lead | null) => void }) {
	const [open, setOpen] = useState(false);
	const [notes, setNotes] = useState(lead.notes);
	const [busy, setBusy] = useState(false);
	const patch = async (body: Partial<Lead>) => {
		setBusy(true);
		try {
			const r = await api<{ lead: Lead }>("update", { id: lead.id, ...body });
			onChange(r.lead);
		} finally {
			setBusy(false);
		}
	};
	const wa = `https://wa.me/${lead.phone}?text=${encodeURIComponent(`Hola ${lead.name}, te escribimos de Sovialis por tu solicitud en la web.`)}`;
	return (
		<>
			<tr>
				<td>{fmtDate(lead.createdAt)}</td>
				<td>
					<strong>{lead.name}</strong>
					<div className="hint">{lead.email}</div>
				</td>
				<td>
					<a href={wa} target="_blank" rel="noopener">
						{formatPhone(lead.phone)}
					</a>
				</td>
				<td>
					{lead.service || "—"}
					{lead.zone && <div className="hint">{lead.zone}</div>}
				</td>
				<td>
					<select value={lead.status} disabled={busy} onChange={(e) => patch({ status: e.target.value as LeadStatus })}>
						{LEAD_STATUSES.map((s) => (
							<option key={s} value={s}>
								{STATUS_LABELS[s]}
							</option>
						))}
					</select>
				</td>
				<td>
					<button className="btn secondary" type="button" onClick={() => setOpen(!open)}>
						{open ? "Cerrar" : "Ver"}
					</button>
				</td>
			</tr>
			{open && (
				<tr>
					<td colSpan={6}>
						<div className="grid">
							<div>
								<p>
									<strong>Turno:</strong> {lead.schedule || "—"} · <strong>Para:</strong> {lead.forWhom || "—"}
								</p>
								<p style={{ whiteSpace: "pre-wrap" }}>{lead.message || "Sin mensaje."}</p>
								<p className="hint">
									Página: {lead.page} · Origen: {lead.source} · {lead.city}
									<br />
									Campaña: {[lead.utm?.utm_source, lead.utm?.utm_medium, lead.utm?.utm_campaign].filter(Boolean).join(" / ") || "—"}
									{lead.gclid ? " · gclid" : ""}
									<br />
									Aviso por correo: {lead.notifiedAt ? `enviado ${fmtDate(lead.notifiedAt)}` : lead.notifyError ? `falló (${lead.notifyError})` : "no enviado"}
								</p>
							</div>
							<label>
								Notas internas
								<textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
								<div className="row">
									<button className="btn" type="button" disabled={busy} onClick={() => patch({ notes })}>
										Guardar notas
									</button>
									<a className="btn secondary" href={wa} target="_blank" rel="noopener">
										Escribir por WhatsApp
									</a>
									<button
										className="btn danger"
										type="button"
										onClick={async () => {
											if (!confirm(`¿Eliminar definitivamente el lead de ${lead.name}?`)) return;
											await api("remove", { id: lead.id });
											onChange(null);
										}}
									>
										Eliminar
									</button>
								</div>
							</label>
						</div>
					</td>
				</tr>
			)}
		</>
	);
}

function Inbox() {
	const [status, setStatus] = useState<"" | LeadStatus>("");
	const [result, setResult] = useState<ListResult | null>(null);
	const [error, setError] = useState("");
	const load = async (cursor?: string) => {
		try {
			const params = new URLSearchParams();
			if (status) params.set("status", status);
			if (cursor) params.set("cursor", cursor);
			const r = await api<ListResult>(`list?${params}`);
			setResult((prev) => (cursor && prev ? { ...r, items: [...prev.items, ...r.items] } : r));
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al cargar.");
		}
	};
	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);
	const total = result ? Object.values(result.counts).reduce((a, b) => a + b, 0) : 0;
	return (
		<section>
			<div className="row" style={{ justifyContent: "space-between" }}>
				<Tabs
					value={status}
					onChange={setStatus}
					items={[["", `Todos (${total})`], ...LEAD_STATUSES.map((s) => [s, `${STATUS_LABELS[s]} (${result?.counts[s] ?? 0})`] as ["" | LeadStatus, string])]}
				/>
				<a className="btn secondary" href="/_emdash/api/plugins/sovialis-leads/export">
					Exportar CSV
				</a>
			</div>
			<Notice error={error} />
			{!result ? (
				<p>Cargando…</p>
			) : result.items.length === 0 ? (
				<p className="hint">No hay solicitudes en este estado.</p>
			) : (
				<table>
					<thead>
						<tr>
							<th>Fecha</th>
							<th>Persona</th>
							<th>Celular</th>
							<th>Servicio / zona</th>
							<th>Estado</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{result.items.map((lead) => (
							<LeadRow
								key={lead.id}
								lead={lead}
								onChange={(updated) =>
									setResult({ ...result, items: updated ? result.items.map((l) => (l.id === lead.id ? updated : l)) : result.items.filter((l) => l.id !== lead.id) })
								}
							/>
						))}
					</tbody>
				</table>
			)}
			{result?.hasMore && result.cursor && (
				<button className="btn secondary" type="button" onClick={() => load(result.cursor!)}>
					Cargar más
				</button>
			)}
		</section>
	);
}

function SettingsForm() {
	const { data, setData, error, setError } = useLoad(async () => (await api<{ settings: LeadSettings }>("settings")).settings);
	const [message, setMessage] = useState("");
	if (!data) return <Notice error={error} />;
	const set = <K extends keyof LeadSettings>(k: K, v: LeadSettings[K]) => setData({ ...data, [k]: v });
	const field = (k: keyof LeadSettings, label: string, hint?: string, area = false) => (
		<label>
			{label}
			{area ? <textarea value={String(data[k])} onChange={(e) => set(k, e.target.value as never)} /> : <input value={String(data[k])} onChange={(e) => set(k, e.target.value as never)} />}
			{hint && <small>{hint}</small>}
		</label>
	);
	return (
		<section>
			<Notice message={message} error={error} />
			<div className="grid">
				{field("notifyTo", "Avisar a (correos separados por coma)", "Con Cloudflare Email Routing solo llegan a direcciones verificadas de la cuenta.")}
				{field("subjectTemplate", "Asunto del aviso", "Variables: {nombre}, {servicio}, {zona}, {telefono}, {pagina}.")}
				{field("turnstileSiteKey", "Clave de sitio de Turnstile (opcional)", "La clave secreta va en Plugins → sovialis-leads → Ajustes.")}
				<label>
					Máximo de envíos por IP cada 10 min
					<input type="number" min={1} max={50} value={data.maxPerWindow} onChange={(e) => set("maxPerWindow", Number(e.target.value))} />
				</label>
			</div>
			<div className="grid" style={{ marginTop: 14 }}>
				{field("successMessage", "Mensaje de éxito", undefined, true)}
				{field("consentText", "Texto de autorización de datos (Ley 1581)", undefined, true)}
			</div>
			<label className="check" style={{ margin: "14px 0" }}>
				<input type="checkbox" checked={data.autoReply} onChange={(e) => set("autoReply", e.target.checked)} />
				Enviar respuesta automática a quien escribe (requiere Email Sending de Cloudflare)
			</label>
			<div className="grid">
				{field("autoReplySubject", "Asunto de la respuesta automática")}
				{field("autoReplyText", "Texto de la respuesta automática", "Variables: {nombre}, {servicio}.", true)}
			</div>
			<div className="row" style={{ marginTop: 14 }}>
				<button
					className="btn"
					type="button"
					onClick={async () => {
						setMessage("");
						setError("");
						try {
							setData((await api<{ settings: LeadSettings }>("saveSettings", data)).settings);
							setMessage("Ajustes guardados.");
						} catch (e) {
							setError(e instanceof Error ? e.message : "Error al guardar.");
						}
					}}
				>
					Guardar ajustes
				</button>
				<button
					className="btn secondary"
					type="button"
					onClick={async () => {
						setMessage("");
						setError("");
						try {
							const r = await api<{ sentTo: string }>("testEmail", {});
							setMessage(`Correo de prueba enviado a ${r.sentTo}.`);
						} catch (e) {
							setError(e instanceof Error ? e.message : "No se pudo enviar.");
						}
					}}
				>
					Enviar correo de prueba
				</button>
				<button className="btn secondary" type="button" onClick={() => setData({ ...LEAD_DEFAULTS, notifyTo: data.notifyTo })}>
					Restaurar textos
				</button>
			</div>
		</section>
	);
}

function LeadsAdmin() {
	const [tab, setTab] = useState<"inbox" | "settings">("inbox");
	return (
		<Page title="Leads y solicitudes" intro="Solicitudes que llegan desde los formularios del sitio (cotización, contacto y landings). Cada una avisa por correo al equipo.">
			<Tabs value={tab} onChange={setTab} items={[["inbox", "Bandeja"], ["settings", "Ajustes y avisos"]]} />
			{tab === "inbox" ? <Inbox /> : <SettingsForm />}
		</Page>
	);
}

function RecentWidget() {
	const { data } = useLoad(() => api<ListResult>("list"));
	if (!data) return <p style={{ padding: 12 }}>Cargando…</p>;
	return (
		<div style={{ padding: 12, fontSize: 14 }}>
			<p style={{ margin: "0 0 8px" }}>
				<strong>{data.counts.nuevo ?? 0}</strong> nuevas sin gestionar
			</p>
			<ul style={{ margin: 0, paddingLeft: 18 }}>
				{data.items.slice(0, 5).map((l) => (
					<li key={l.id}>
						{l.name} · {l.service || "sin servicio"} · {fmtDate(l.createdAt)}
					</li>
				))}
			</ul>
			<a href="/_emdash/admin/plugins/sovialis-leads/leads">Abrir bandeja</a>
		</div>
	);
}

export const pages = { "/leads": LeadsAdmin };
export const widgets = { recientes: RecentWidget };
