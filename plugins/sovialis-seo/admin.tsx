import { useState } from "react";
import { Notice, Page, Tabs, lines, pluginApi, useLoad } from "../_shared/admin-kit";
import type { BusinessSettings, SeoSettings } from "./model";

const api = <T,>(path: string, body?: unknown) => pluginApi<T>("sovialis-seo", path, body);
type Row = { collection: string; slug: string; url: string; title: string; description: string; keyword: string; noIndex: boolean; issues: string[]; score: number };
type NotFound = { id: string; path: string; count: number; lastAt: string; referrers: string[] };

function BusinessTab({ s, set }: { s: SeoSettings; set: (s: SeoSettings) => void }) {
	const b = s.business;
	const up = <K extends keyof BusinessSettings>(k: K, v: BusinessSettings[K]) => set({ ...s, business: { ...b, [k]: v } });
	const field = (k: keyof BusinessSettings, label: string, hint?: string) => (
		<label>
			{label}
			<input value={String(b[k] ?? "")} onChange={(e) => up(k, e.target.value as never)} />
			{hint && <small>{hint}</small>}
		</label>
	);
	return (
		<section>
			<h2>Entidad del negocio (LocalBusiness)</h2>
			<p className="hint">Estos datos alimentan el JSON-LD de todas las páginas, llms.txt y deben coincidir exactamente con Google Business Profile (NAP).</p>
			<label className="check" style={{ margin: "10px 0 16px" }}>
				<input type="checkbox" checked={b.verified} onChange={(e) => up("verified", e.target.checked)} />
				Datos verificados (publica dirección y código postal en el schema)
			</label>
			<div className="grid">
				{field("name", "Nombre comercial")}
				{field("legalName", "Razón social")}
				{field("slogan", "Eslogan")}
				{field("telephone", "Teléfono (+57…)")}
				{field("email", "Correo")}
				{field("streetAddress", "Dirección")}
				{field("locality", "Ciudad")}
				{field("region", "Departamento")}
				{field("postalCode", "Código postal")}
				{field("openingHours", "Horario (formato schema)", "Ej.: Mo-Su 07:00-20:00")}
				{field("priceRange", "Rango de precios", "Ej.: $$")}
				{field("logo", "Logo (URL o ruta)")}
				{field("image", "Imagen principal (URL o ruta)")}
				<label>
					Latitud
					<input type="number" step="0.0001" value={b.lat ?? ""} onChange={(e) => up("lat", e.target.value === "" ? null : Number(e.target.value))} />
				</label>
				<label>
					Longitud
					<input type="number" step="0.0001" value={b.lng ?? ""} onChange={(e) => up("lng", e.target.value === "" ? null : Number(e.target.value))} />
				</label>
			</div>
			<label style={{ marginTop: 14 }}>
				Descripción canónica (igual en web, Google Business y redes)
				<textarea value={b.description} onChange={(e) => up("description", e.target.value)} />
			</label>
			<div className="grid" style={{ marginTop: 14 }}>
				<label>
					Zonas atendidas (una por línea)
					<textarea value={b.areaServed.join("\n")} onChange={(e) => up("areaServed", lines(e.target.value))} />
				</label>
				<label>
					Especialidades (knowsAbout)
					<textarea value={b.knowsAbout.join("\n")} onChange={(e) => up("knowsAbout", lines(e.target.value))} />
				</label>
				<label>
					Perfiles oficiales (sameAs, https://…)
					<textarea value={b.sameAs.join("\n")} onChange={(e) => up("sameAs", lines(e.target.value))} />
				</label>
			</div>
			<h2 style={{ marginTop: 18 }}>Valoraciones y servicios</h2>
			<label className="check">
				<input type="checkbox" checked={s.ratingsInSchema} onChange={(e) => set({ ...s, ratingsInSchema: e.target.checked })} />
				Incluir el promedio de valoraciones de servicios en Product (aggregateRating)
			</label>
			<label className="check">
				<input type="checkbox" checked={s.productSchema} onChange={(e) => set({ ...s, productSchema: e.target.checked })} />
				Marcar cada servicio también como Product (precio desde y valoraciones disponibles)
			</label>
			<label style={{ maxWidth: 260, marginTop: 10 }}>
				Mínimo de votos para publicarlo
				<input type="number" min={1} max={100} value={s.ratingsMinVotes} onChange={(e) => set({ ...s, ratingsMinVotes: Number(e.target.value) })} />
			</label>
			<p className="hint">Google no admite Service ni BlogPosting para fragmentos de reseñas. Las estrellas de zonas y guías se muestran en el sitio sin ese marcado. Tampoco se agregan reseñas propias al negocio (LocalBusiness). Google decide si muestra un resultado enriquecido.</p>
		</section>
	);
}

function IndexingTab({ s, set, setMessage }: { s: SeoSettings; set: (s: SeoSettings) => void; setMessage: (m: string) => void }) {
	return (
		<section>
			<h2>Robots, sitemaps e IndexNow</h2>
			<label className="check">
				<input type="checkbox" checked={s.robotsAiAllowed} onChange={(e) => set({ ...s, robotsAiAllowed: e.target.checked })} />
				Permitir buscadores y asistentes de IA (OAI-SearchBot, ChatGPT, Perplexity, Claude, Gemini…)
			</label>
			<label style={{ marginTop: 12 }}>
				Reglas adicionales para robots.txt
				<textarea value={s.robotsExtra} onChange={(e) => set({ ...s, robotsExtra: e.target.value })} />
				<small>
					Vista previa: <a href="/robots.txt" target="_blank" rel="noopener">/robots.txt</a> · Sitemap: <a href="/sitemap.xml" target="_blank" rel="noopener">/sitemap.xml</a>
				</small>
			</label>
			<label style={{ marginTop: 12 }}>
				Excluir del sitemap (rutas, una por línea)
				<textarea value={s.sitemapExclude.join("\n")} onChange={(e) => set({ ...s, sitemapExclude: lines(e.target.value) })} />
			</label>
			<label className="check" style={{ marginTop: 12 }}>
				<input type="checkbox" checked={s.indexNowEnabled} onChange={(e) => set({ ...s, indexNowEnabled: e.target.checked })} />
				Avisar a IndexNow (Bing, Copilot, Yandex) cada vez que se publica una página
			</label>
			<p className="hint">Clave: {s.indexNowKey || "se genera al guardar"} · archivo /{s.indexNowKey}.txt</p>
			<button
				type="button"
				className="btn secondary"
				onClick={async () => {
					const r = await api<{ status: number; submitted: number }>("indexnowAll", {});
					setMessage(`IndexNow: ${r.submitted} URLs enviadas (respuesta ${r.status}).`);
				}}
			>
				Enviar todas las URLs a IndexNow
			</button>
			<label className="check" style={{ marginTop: 16 }}>
				<input type="checkbox" checked={s.log404} onChange={(e) => set({ ...s, log404: e.target.checked })} />
				Registrar errores 404
			</label>
			<p className="hint">El título SEO, la descripción, la imagen social, el canonical y el «noindex» de cada página se editan en el panel SEO de cada contenido. El separador de títulos, la imagen por defecto y las verificaciones de Google y Bing están en Ajustes → SEO.</p>
		</section>
	);
}

function LlmsTab({ s, set }: { s: SeoSettings; set: (s: SeoSettings) => void }) {
	return (
		<section>
			<h2>Optimización para asistentes de IA (llms.txt)</h2>
			<label>
				Descripción de la entidad
				<textarea rows={5} value={s.llmsIntro} onChange={(e) => set({ ...s, llmsIntro: e.target.value })} />
			</label>
			<label style={{ marginTop: 12 }}>
				Datos clave (precios, condiciones; uno por línea)
				<textarea rows={6} value={s.llmsNotes} onChange={(e) => set({ ...s, llmsNotes: e.target.value })} />
			</label>
			<p className="hint">
				Vista previa: <a href="/llms.txt" target="_blank" rel="noopener">/llms.txt</a> · <a href="/llms-full.txt" target="_blank" rel="noopener">/llms-full.txt</a>. Los servicios, zonas y guías se agregan solos.
			</p>
		</section>
	);
}

function AnalysisTab() {
	const { data, error, loading, reload } = useLoad(() => api<{ rows: Row[] }>("analysis"));
	if (loading) return <p>Analizando páginas…</p>;
	if (error || !data) return <Notice error={error} />;
	return (
		<section>
			<div className="row" style={{ justifyContent: "space-between" }}>
				<h2>Análisis SEO por página</h2>
				<button type="button" className="btn secondary" onClick={reload}>
					Volver a analizar
				</button>
			</div>
			<table>
				<thead>
					<tr>
						<th>Puntaje</th>
						<th>Página</th>
						<th>Keyword</th>
						<th>Pendientes</th>
					</tr>
				</thead>
				<tbody>
					{data.rows.map((r) => (
						<tr key={`${r.collection}:${r.slug}`}>
							<td>
								<span className="pill" style={{ background: r.score >= 85 ? "#00855e22" : r.score >= 60 ? "#e28d0022" : "#b4233c22" }}>
									{r.score}
								</span>
							</td>
							<td>
								<a href={r.url} target="_blank" rel="noopener">
									{r.title || r.slug}
								</a>
								<div className="hint">
									{r.url}
									{r.noIndex ? " · noindex" : ""}
								</div>
							</td>
							<td>{r.keyword || "—"}</td>
							<td>{r.issues.length ? r.issues.join(" · ") : "✓ Sin pendientes"}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}

function NotFoundTab() {
	const { data, error, loading, reload } = useLoad(() => api<{ items: NotFound[] }>("notfound"));
	if (loading) return <p>Cargando…</p>;
	if (error || !data) return <Notice error={error} />;
	return (
		<section>
			<div className="row" style={{ justifyContent: "space-between" }}>
				<h2>Errores 404</h2>
				<button
					type="button"
					className="btn secondary"
					onClick={async () => {
						await api("clear404", {});
						reload();
					}}
				>
					Vaciar registro
				</button>
			</div>
			<p className="hint">Crea redirecciones 301 para las URLs con más visitas en Ajustes → Redirecciones de EmDash.</p>
			{data.items.length === 0 ? (
				<p>Sin errores registrados.</p>
			) : (
				<table>
					<thead>
						<tr>
							<th>Ruta</th>
							<th>Visitas</th>
							<th>Última</th>
							<th>Desde</th>
						</tr>
					</thead>
					<tbody>
						{data.items.map((i) => (
							<tr key={i.id}>
								<td>{i.path}</td>
								<td>{i.count}</td>
								<td>{new Date(i.lastAt).toLocaleString("es-CO")}</td>
								<td className="hint">{i.referrers.join(" · ") || "—"}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</section>
	);
}

function SeoAdmin() {
	const { data, setData, error, setError } = useLoad(() => api<{ settings: SeoSettings }>("settings"));
	const [tab, setTab] = useState<"negocio" | "indexacion" | "llms" | "analisis" | "404">("negocio");
	const [message, setMessage] = useState("");
	if (!data) return <Page title="SEO">{error ? <Notice error={error} /> : <p>Cargando…</p>}</Page>;
	const s = data.settings;
	const set = (next: SeoSettings) => setData({ settings: next });
	const save = async () => {
		setMessage("");
		setError("");
		try {
			setData(await api<{ settings: SeoSettings }>("save", s));
			setMessage("Ajustes SEO guardados.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al guardar.");
		}
	};
	return (
		<Page title="SEO" intro="Datos estructurados del negocio, indexación, robots para IA, llms.txt, análisis de páginas y errores 404.">
			<Tabs
				value={tab}
				onChange={setTab}
				items={[
					["negocio", "Negocio y schema"],
					["indexacion", "Indexación"],
					["llms", "IA y llms.txt"],
					["analisis", "Análisis"],
					["404", "Errores 404"],
				]}
			/>
			<Notice message={message} error={error} />
			{tab === "negocio" && <BusinessTab s={s} set={set} />}
			{tab === "indexacion" && <IndexingTab s={s} set={set} setMessage={setMessage} />}
			{tab === "llms" && <LlmsTab s={s} set={set} />}
			{tab === "analisis" && <AnalysisTab />}
			{tab === "404" && <NotFoundTab />}
			{["negocio", "indexacion", "llms"].includes(tab) && (
				<button className="btn" type="button" onClick={save}>
					Guardar ajustes SEO
				</button>
			)}
		</Page>
	);
}

export const pages = { "/seo": SeoAdmin };
