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

const WA_PATH =
	"M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.94 12.94 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm5.83 15.66c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.6 9.6 0 0 1-1.78-2.2c-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.2 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.25 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z";

function Preview({ config }: { config: WhatsAppSettings }) {
	const size = config.size;
	return (
		<div style={{ position: "relative", height: 150, borderRadius: 12, background: "linear-gradient(135deg,#e4f4fa,#fbf8f3)", overflow: "hidden" }}>
			<style>{`@keyframes sv-prev-wave{0%{transform:scale(1)}15%{opacity:1}100%{opacity:0;transform:scale(2.5)}}`}</style>
			<div style={{ position: "absolute", bottom: 40, [config.position]: 60, display: "flex", alignItems: "center", flexDirection: config.position === "left" ? "row-reverse" : "row" }}>
				{config.labelMode !== "never" && (
					<span
						style={{
							position: "relative",
							zIndex: 1,
							background: config.labelBg,
							color: config.labelColor,
							height: size - 10,
							display: "flex",
							alignItems: "center",
							padding: config.position === "left" ? `0 22px 0 ${size / 2 + 8}px` : `0 ${size / 2 + 8}px 0 22px`,
							margin: config.position === "left" ? `0 0 0 ${-size / 2}px` : `0 ${-size / 2}px 0 0`,
							borderRadius: 999,
							fontWeight: 600,
							fontSize: 15,
							whiteSpace: "nowrap",
						}}
					>
						{config.label}
					</span>
				)}
				{config.animate &&
					[1, 1.3].map((delay) => (
						<span
							key={delay}
							style={{
								position: "absolute",
								[config.position]: 0,
								width: size,
								height: size,
								borderRadius: "50%",
								background: config.waveColor,
								opacity: 0,
								animation: `sv-prev-wave 1.7s ease ${delay}s infinite`,
							}}
						/>
					))}
				<span
					style={{
						position: "relative",
						zIndex: 2,
						width: size,
						height: size,
						borderRadius: "50%",
						background: config.color,
						color: config.iconColor,
						display: "grid",
						placeItems: "center",
						boxShadow: "0 8px 22px rgba(0,0,0,.18)",
					}}
				>
					<svg viewBox="0 0 32 32" width={size * 0.54} height={size * 0.54} fill="currentColor" aria-hidden="true">
						<path d={WA_PATH} />
					</svg>
				</span>
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
							["animate", "Ondas animadas"],
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
						<small>Sin espacios ni «+». Ej.: 573117598641.</small>
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
					{(
						[
							["color", "Color del botón"],
							["iconColor", "Color del ícono"],
							["waveColor", "Color de las ondas"],
							["labelBg", "Fondo de la etiqueta"],
							["labelColor", "Texto de la etiqueta"],
						] as const
					).map(([key, label]) => (
						<label key={key}>
							{label}
							<input type="color" value={config[key]} onChange={(e) => update(key, e.target.value)} />
						</label>
					))}
					{(
						[
							["showAfterScroll", "Aparece tras bajar (px)", 5000],
							["delay", "Espera antes de aparecer (s)", 120],
							["labelSeconds", "Segundos de la etiqueta (modo intro)", 60],
							["size", "Tamaño en escritorio (px)", 80],
							["mobileSize", "Tamaño en móvil (px)", 72],
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
