import { useState } from "react";
import { Notice, Page, lines, pluginApi, useLoad } from "../_shared/admin-kit";
import { DEFAULT_SETTINGS, type WhatsAppRule, type WhatsAppSettings } from "./model";

type Choice = { id: string; label: string };
type Choices = { services: Choice[]; zones: Choice[] };
const api = <T,>(path: string, body?: unknown) => pluginApi<T>("sovialis-whatsapp", path, body);
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function Multiple({ label, items, value, onChange }: { label: string; items: Choice[]; value: string[]; onChange: (v: string[]) => void }) {
	return (
		<label>
			{label}
			<select multiple size={Math.min(6, Math.max(3, items.length))} value={value} onChange={(e) => onChange(Array.from(e.target.selectedOptions, (o) => o.value))}>
				{items.map((i) => (
					<option key={i.id} value={i.id}>
						{i.label}
					</option>
				))}
			</select>
			<small>Vacío: todos. Ctrl/Cmd para elegir varios.</small>
		</label>
	);
}

function Preview({ config }: { config: WhatsAppSettings }) {
	return (
		<div style={{ position: "relative", height: 120, borderRadius: 12, background: "linear-gradient(135deg,#e4f4fa,#fbf8f3)", overflow: "hidden" }}>
			<div style={{ position: "absolute", bottom: Math.min(config.y, 60), [config.position]: Math.min(config.x, 60), display: "flex", alignItems: "center", gap: 12, flexDirection: config.position === "left" ? "row-reverse" : "row" }}>
				{config.labelMode !== "never" && (
					<span style={{ background: "#0f1a2a", color: "#fff", padding: "10px 18px", borderRadius: 999, fontWeight: 600, fontSize: 15 }}>{config.label}</span>
				)}
				<span style={{ width: 60, height: 60, borderRadius: "50%", background: config.color, boxShadow: `0 0 0 10px ${config.color}2e`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700 }}>WA</span>
			</div>
		</div>
	);
}

function WhatsAppAdmin() {
	const { data, setData, error, setError, loading } = useLoad(async () => {
		const [c, ch] = await Promise.all([api<{ config: WhatsAppSettings }>("config"), api<Choices>("choices")]);
		return { config: c.config, choices: ch };
	});
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	if (loading || !data) return <Page title="WhatsApp">{error ? <Notice error={error} /> : <p>Cargando…</p>}</Page>;
	const { config, choices } = data;
	const update = <K extends keyof WhatsAppSettings>(key: K, value: WhatsAppSettings[K]) => setData({ ...data, config: { ...config, [key]: value } });
	const updateRule = (id: string, patch: Partial<WhatsAppRule>) =>
		update("rules", config.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	const save = async () => {
		setBusy(true);
		setMessage("");
		setError("");
		try {
			const saved = await api<{ config: WhatsAppSettings }>("save", config);
			setData({ ...data, config: saved.config });
			setMessage("Guardado. Se aplica al abrir o recargar las páginas.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al guardar.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<Page
			title="WhatsApp"
			intro="Botón flotante y enlaces de WhatsApp de todo el sitio. Todos los botones «Escríbenos por WhatsApp» del tema usan este número y un mensaje que cambia según la página."
		>
			<Notice message={message} error={error} />
			<section>
				<h2>General</h2>
				<div className="row" style={{ marginBottom: 14 }}>
					{(
						[
							["enabled", "Mostrar botón flotante"],
							["mobile", "En móvil"],
							["desktop", "En escritorio"],
							["animate", "Halo animado"],
							["labelOnMobile", "Etiqueta también en móvil"],
						] as const
					).map(([key, label]) => (
						<label key={key} className="check">
							<input type="checkbox" checked={config[key]} onChange={(e) => update(key, e.target.checked)} />
							{label}
						</label>
					))}
				</div>
				<div className="grid">
					<label>
						Número (con indicativo)
						<input value={config.number} placeholder="573001234567" onChange={(e) => update("number", e.target.value)} />
						<small>Sin espacios ni «+». Ej.: 573008921144.</small>
					</label>
					<label>
						Texto de la etiqueta
						<input value={config.label} onChange={(e) => update("label", e.target.value)} />
					</label>
					<label>
						Comportamiento de la etiqueta
						<select value={config.labelMode} onChange={(e) => update("labelMode", e.target.value as WhatsAppSettings["labelMode"])}>
							<option value="always">Siempre visible</option>
							<option value="intro">Se muestra unos segundos al aparecer</option>
							<option value="hover">Solo al pasar el mouse</option>
							<option value="never">Nunca</option>
						</select>
					</label>
					<label>
						Lado
						<select value={config.position} onChange={(e) => update("position", e.target.value as "left" | "right")}>
							<option value="right">Derecha</option>
							<option value="left">Izquierda</option>
						</select>
					</label>
					<label>
						Color del botón
						<input type="color" value={config.color} onChange={(e) => update("color", e.target.value)} />
					</label>
					{(
						[
							["showAfterScroll", "Aparece tras bajar (px)", 5000],
							["delay", "Espera antes de aparecer (s)", 120],
							["labelSeconds", "Segundos de la etiqueta (modo intro)", 60],
							["x", "Separación lateral (px)", 300],
							["y", "Separación inferior (px)", 500],
						] as const
					).map(([key, label, max]) => (
						<label key={key}>
							{label}
							<input type="number" min={0} max={max} value={config[key]} onChange={(e) => update(key, Number(e.target.value))} />
						</label>
					))}
				</div>
				<label style={{ marginTop: 14 }}>
					Mensaje predeterminado
					<textarea value={config.message} onChange={(e) => update("message", e.target.value)} />
					<small>Variables: {"{titulo}"} (título de la página), {"{servicio}"}, {"{zona}"}, {"{url}"}, {"{pagina}"}.</small>
				</label>
				<label style={{ marginTop: 14 }}>
					Ocultar el botón en estas rutas
					<textarea value={config.hiddenPaths.join("\n")} onChange={(e) => update("hiddenPaths", lines(e.target.value))} />
					<small>Una por línea. Admite comodín: /blog/*.</small>
				</label>
				<h2 style={{ marginTop: 18 }}>Vista previa</h2>
				<Preview config={config} />
			</section>

			<section>
				<h2>Horario de atención</h2>
				<p className="hint">Con ambas horas vacías el botón está disponible todo el día.</p>
				<div className="grid">
					<label>
						Zona horaria
						<input value={config.timezone} onChange={(e) => update("timezone", e.target.value)} />
					</label>
					<label>
						Desde
						<input type="time" value={config.startTime} onChange={(e) => update("startTime", e.target.value)} />
					</label>
					<label>
						Hasta
						<input type="time" value={config.endTime} onChange={(e) => update("endTime", e.target.value)} />
					</label>
					<label>
						Fuera de horario
						<select value={config.offHours} onChange={(e) => update("offHours", e.target.value as WhatsAppSettings["offHours"])}>
							<option value="note">Mostrar con una nota</option>
							<option value="show">Mostrar igual</option>
							<option value="hide">Ocultar el botón</option>
						</select>
					</label>
					<label>
						Nota fuera de horario
						<input value={config.offHoursNote} onChange={(e) => update("offHoursNote", e.target.value)} />
					</label>
				</div>
				<div className="row" style={{ marginTop: 12 }}>
					{DAYS.map((day, i) => (
						<label className="check" key={day}>
							<input
								type="checkbox"
								checked={config.weekdays.includes(i)}
								onChange={(e) => update("weekdays", e.target.checked ? [...config.weekdays, i] : config.weekdays.filter((d) => d !== i))}
							/>
							{day}
						</label>
					))}
				</div>
			</section>

			<section>
				<h2>Reglas por servicio, zona o ruta</h2>
				<p className="hint">Si coinciden varias reglas, gana la de mayor prioridad. Sirven para cambiar el número o el mensaje en una landing, una campaña o una zona.</p>
				{config.rules.map((r, i) => (
					<details className="card" key={r.id}>
						<summary>
							{i + 1}. {r.label} · prioridad {r.priority}
							{!r.enabled ? " · inactiva" : ""}
						</summary>
						<label className="check" style={{ margin: "12px 0" }}>
							<input type="checkbox" checked={r.enabled} onChange={(e) => updateRule(r.id, { enabled: e.target.checked })} />
							Regla activa
						</label>
						<div className="grid">
							<label>
								Nombre
								<input value={r.label} onChange={(e) => updateRule(r.id, { label: e.target.value })} />
							</label>
							<label>
								Prioridad
								<input type="number" value={r.priority} onChange={(e) => updateRule(r.id, { priority: Number(e.target.value) })} />
							</label>
							<label>
								Número de esta regla
								<input value={r.number} placeholder="Vacío: número general" onChange={(e) => updateRule(r.id, { number: e.target.value })} />
							</label>
							<Multiple label="Servicios" items={choices.services} value={r.services} onChange={(services) => updateRule(r.id, { services })} />
							<Multiple label="Zonas" items={choices.zones} value={r.zones} onChange={(zones) => updateRule(r.id, { zones })} />
						</div>
						<label style={{ marginTop: 12 }}>
							Mensaje
							<textarea value={r.message} placeholder="Vacío: mensaje general" onChange={(e) => updateRule(r.id, { message: e.target.value })} />
						</label>
						<label style={{ marginTop: 12 }}>
							Limitar a estas rutas
							<textarea value={r.paths.join("\n")} onChange={(e) => updateRule(r.id, { paths: lines(e.target.value) })} />
						</label>
						<div className="grid" style={{ marginTop: 12 }}>
							{(["startsAt", "endsAt"] as const).map((key) => (
								<label key={key}>
									{key === "startsAt" ? "Comienza" : "Termina"}
									<input
										type="datetime-local"
										value={r[key] ? new Date(Date.parse(r[key]) - new Date(r[key]).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
										onChange={(e) => updateRule(r.id, { [key]: e.target.value ? new Date(e.target.value).toISOString() : "" })}
									/>
								</label>
							))}
						</div>
						<button className="btn danger" style={{ marginTop: 12 }} type="button" onClick={() => update("rules", config.rules.filter((x) => x.id !== r.id))}>
							Quitar regla
						</button>
					</details>
				))}
				<button
					className="btn secondary"
					type="button"
					onClick={() =>
						update("rules", [
							...config.rules,
							{ id: crypto.randomUUID(), label: "Nueva regla", enabled: true, priority: 100, services: [], zones: [], paths: [], number: "", message: "", startsAt: "", endsAt: "" },
						])
					}
				>
					Añadir regla
				</button>
			</section>

			<div className="row">
				<button className="btn" disabled={busy} onClick={save}>
					{busy ? "Guardando…" : "Guardar WhatsApp"}
				</button>
				<button className="btn secondary" type="button" onClick={() => setData({ ...data, config: { ...DEFAULT_SETTINGS, number: config.number, rules: config.rules } })}>
					Restaurar valores de diseño
				</button>
			</div>
		</Page>
	);
}

export const pages = { "/whatsapp": WhatsAppAdmin };
