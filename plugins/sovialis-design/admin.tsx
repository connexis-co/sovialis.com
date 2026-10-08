import { useState } from "react";
import { Notice, Page, pluginApi, useLoad } from "../_shared/admin-kit";
import { COLOR_KEYS, FONT_OPTIONS, tokensToCss, type DesignTokens } from "./model";

const api = <T,>(path: string, body?: unknown) => pluginApi<T>("sovialis-design", path, body);
type Loaded = { tokens: DesignTokens; defaults: DesignTokens; presets: Record<string, { label: string; colors: Partial<DesignTokens["colors"]> }> };

/** Contraste WCAG entre dos colores hex. */
function contrast(a: string, b: string): number {
	const lum = (hex: string) => {
		const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
		return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
	};
	const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
	return (l1! + 0.05) / (l2! + 0.05);
}

function Preview({ t }: { t: DesignTokens }) {
	const css = tokensToCss(t).replace(":root:root", ".sv-preview");
	const c = t.colors;
	const radius = t.buttonShape === "pill" ? 999 : Math.max(8, Math.round(t.radius * 0.6));
	return (
		<div className="sv-preview" style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${c.border}`, fontSize: `${t.fontScale}%` }}>
			<style>{css}</style>
			<div style={{ background: c.deep, color: "#fff", padding: "28px 24px" }}>
				<p style={{ margin: 0, textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12, color: c.secondary, fontWeight: 700 }}>Cuidado del adulto mayor</p>
				<h3 style={{ fontFamily: `"${t.fontDisplay} Variable","${t.fontDisplay}",sans-serif`, fontSize: 30, margin: "8px 0", fontWeight: 600 }}>Vínculos que protegen</h3>
				<p style={{ fontFamily: `"${t.fontBody} Variable","${t.fontBody}",sans-serif`, opacity: 0.85, margin: 0 }}>Cuidadoras y auxiliares de enfermería en el norte de Bogotá.</p>
			</div>
			<div style={{ background: c.surfaceWarm, padding: 24, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
				<div style={{ background: c.surface, borderRadius: t.radius, padding: 18, border: `1px solid ${c.border}`, color: c.text }}>
					<strong style={{ fontFamily: `"${t.fontDisplay} Variable",sans-serif`, fontSize: 18 }}>Cuidadora 12 horas</strong>
					<p style={{ color: c.textMuted, margin: "6px 0 14px", fontFamily: `"${t.fontBody} Variable",sans-serif` }}>Turno de día con acompañamiento y apoyo en la rutina.</p>
					<span style={{ display: "inline-block", background: c.primary, color: c.onPrimary, padding: "10px 18px", borderRadius: radius, fontWeight: 600 }}>Cotizar</span>{" "}
					<span style={{ display: "inline-block", background: c.whatsapp, color: "#fff", padding: "10px 18px", borderRadius: radius, fontWeight: 600 }}>WhatsApp</span>
				</div>
				<div style={{ background: c.surfaceAlt, borderRadius: t.radius, padding: 18, color: c.text }}>
					<span style={{ background: c.accent, color: c.deep, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>Nuevo</span>
					<p style={{ margin: "10px 0 0" }}>Superficie bruma con texto principal.</p>
				</div>
			</div>
		</div>
	);
}

function DesignAdmin() {
	const { data, setData, error, setError } = useLoad(() => api<Loaded>("tokens"));
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);
	if (!data) return <Page title="Diseño y marca">{error ? <Notice error={error} /> : <p>Cargando…</p>}</Page>;
	const t = data.tokens;
	const set = (patch: Partial<DesignTokens>) => setData({ ...data, tokens: { ...t, ...patch } });
	const setColor = (key: keyof DesignTokens["colors"], value: string) => set({ preset: "personalizado", colors: { ...t.colors, [key]: value.toUpperCase() } });
	const checks: Array<[string, number, number]> = [
		["Texto sobre fondo", contrast(t.colors.text, t.colors.bg), 7],
		["Texto secundario sobre fondo", contrast(t.colors.textMuted, t.colors.bg), 4.5],
		["Texto de botón sobre primario", contrast(t.colors.onPrimary, t.colors.primary), 4.5],
		["Blanco sobre azul tinta", contrast("#FFFFFF", t.colors.deep), 7],
		["Primario sobre superficie arena", contrast(t.colors.primary, t.colors.surfaceWarm), 4.5],
	];
	const save = async () => {
		setBusy(true);
		setMessage("");
		setError("");
		try {
			const r = await api<{ tokens: DesignTokens }>("save", t);
			setData({ ...data, tokens: r.tokens });
			setMessage("Diseño guardado. Recarga el sitio para verlo aplicado.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al guardar.");
		} finally {
			setBusy(false);
		}
	};
	return (
		<Page title="Diseño y marca" intro="Colores, tipografías y estilo del sitio. Los cambios se aplican a todas las páginas sin publicar de nuevo. Los valores de fábrica siguen el manual de marca (paleta Océano).">
			<Notice message={message} error={error} />
			<section>
				<h2>Paleta</h2>
				<div className="row" style={{ marginBottom: 14 }}>
					{Object.entries(data.presets).map(([id, preset]) => (
						<button
							key={id}
							type="button"
							className={`btn ${t.preset === id ? "" : "secondary"}`}
							onClick={() => set({ preset: id, colors: { ...data.defaults.colors, ...preset.colors } })}
						>
							{preset.label}
						</button>
					))}
				</div>
				<div className="grid">
					{COLOR_KEYS.map(([key, label]) => (
						<label key={key}>
							{label}
							<span className="row">
								<input type="color" value={t.colors[key]} onChange={(e) => setColor(key, e.target.value)} />
								<input value={t.colors[key]} onChange={(e) => setColor(key, e.target.value)} style={{ maxWidth: 120 }} />
							</span>
						</label>
					))}
				</div>
				<h2 style={{ marginTop: 18 }}>Contraste (WCAG)</h2>
				<ul>
					{checks.map(([label, ratio, min]) => (
						<li key={label}>
							{label}: <strong>{ratio.toFixed(2)}:1</strong> {ratio >= min ? "✓" : `⚠ recomendado ≥ ${min}:1`}
						</li>
					))}
				</ul>
			</section>
			<section>
				<h2>Tipografía, forma y movimiento</h2>
				<div className="grid">
					<label>
						Títulos
						<select value={t.fontDisplay} onChange={(e) => set({ fontDisplay: e.target.value })}>
							{FONT_OPTIONS.display.map((f) => (
								<option key={f}>{f}</option>
							))}
						</select>
					</label>
					<label>
						Texto
						<select value={t.fontBody} onChange={(e) => set({ fontBody: e.target.value })}>
							{FONT_OPTIONS.body.map((f) => (
								<option key={f}>{f}</option>
							))}
						</select>
					</label>
					<label>
						Tamaño del texto ({t.fontScale} %)
						<input type="range" min={90} max={120} value={t.fontScale} onChange={(e) => set({ fontScale: Number(e.target.value) })} />
						<small>Súbelo si tu público lee mejor con letra grande.</small>
					</label>
					<label>
						Redondeo de tarjetas ({t.radius} px)
						<input type="range" min={0} max={32} value={t.radius} onChange={(e) => set({ radius: Number(e.target.value) })} />
					</label>
					<label>
						Botones
						<select value={t.buttonShape} onChange={(e) => set({ buttonShape: e.target.value as DesignTokens["buttonShape"] })}>
							<option value="pill">Píldora</option>
							<option value="rounded">Redondeados</option>
						</select>
					</label>
					<label>
						Sombras
						<select value={t.shadow} onChange={(e) => set({ shadow: e.target.value as DesignTokens["shadow"] })}>
							<option value="soft">Suaves</option>
							<option value="strong">Marcadas</option>
							<option value="none">Sin sombras</option>
						</select>
					</label>
					<label>
						Animaciones
						<select value={t.motion} onChange={(e) => set({ motion: e.target.value as DesignTokens["motion"] })}>
							<option value="full">Completas</option>
							<option value="subtle">Sutiles</option>
							<option value="none">Ninguna</option>
						</select>
						<small>Siempre se respetan las preferencias de «reducir movimiento» del dispositivo.</small>
					</label>
					<label>
						Oscurecido sobre fotos de portada ({t.heroOverlay} %)
						<input type="range" min={0} max={90} value={t.heroOverlay} onChange={(e) => set({ heroOverlay: Number(e.target.value) })} />
					</label>
					<label className="check">
						<input type="checkbox" checked={t.gradientHeadings} onChange={(e) => set({ gradientHeadings: e.target.checked })} />
						Degradado de marca en palabras destacadas de los títulos
					</label>
				</div>
			</section>
			<section>
				<h2>Vista previa</h2>
				<Preview t={t} />
			</section>
			<div className="row">
				<button className="btn" disabled={busy} onClick={save}>
					{busy ? "Guardando…" : "Guardar diseño"}
				</button>
				<button
					className="btn secondary"
					type="button"
					onClick={async () => {
						if (!confirm("¿Volver al diseño de fábrica (paleta Océano)?")) return;
						await api("reset", {});
						setData({ ...data, tokens: data.defaults });
						setMessage("Diseño restaurado.");
					}}
				>
					Restaurar de fábrica
				</button>
			</div>
		</Page>
	);
}

export const pages = { "/diseno": DesignAdmin };
