/**
 * Kit mínimo para las páginas de administración de los plugins de Sovialis.
 * Hereda colores del panel de EmDash cuando existen (`--foreground`, `--background`) y usa
 * la paleta Océano como acento. Sin dependencias además de React.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";

export async function pluginApi<T>(pluginId: string, path: string, body?: unknown): Promise<T> {
	const response = await fetch(`/_emdash/api/plugins/${pluginId}/${path}`, {
		method: body === undefined ? "GET" : "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/json", "X-EmDash-Request": "1" },
		...(body === undefined ? {} : { body: JSON.stringify(body) }),
	});
	const value = (await response.json().catch(() => ({}))) as { success?: boolean; error?: { message?: string }; data?: T };
	if (!response.ok || value.success === false) throw new Error(value.error?.message || `Error ${response.status}`);
	return value.data as T;
}

export function useLoad<T>(loader: () => Promise<T>) {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const reload = useCallback(() => {
		setLoading(true);
		loader()
			.then((d) => {
				setData(d);
				setError("");
			})
			.catch((e: unknown) => setError(e instanceof Error ? e.message : "Error al cargar."))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(reload, [reload]);
	return { data, setData, error, setError, loading, reload };
}

export const KIT_CSS = `
.svk{max-width:1120px;padding:24px;color:var(--foreground,inherit);font-size:14px;line-height:1.5}
.svk h1{font-size:26px;font-weight:700;margin:0 0 4px;letter-spacing:-.01em}
.svk h2{font-size:18px;font-weight:650;margin:0 0 12px}
.svk .lead{opacity:.75;margin:0 0 20px;max-width:70ch}
.svk section,.svk details.card{border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:14px;padding:20px;margin:16px 0;background:color-mix(in srgb,var(--background,#fff) 96%,#0073aa 4%)}
.svk label{display:flex;flex-direction:column;gap:6px;font-weight:550}
.svk label small,.svk .hint{font-weight:400;opacity:.68;font-size:12.5px}
.svk input:not([type=checkbox]):not([type=color]),.svk select,.svk textarea{width:100%;border:1px solid color-mix(in srgb,currentColor 22%,transparent);border-radius:9px;padding:9px 11px;background:var(--background,transparent);color:inherit;font:inherit}
.svk textarea{min-height:90px;resize:vertical}
.svk input[type=color]{width:52px;height:38px;border:none;background:none;padding:0;cursor:pointer}
.svk .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.svk .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.svk .check{flex-direction:row;align-items:center;gap:8px;font-weight:500}
.svk .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:999px;border:1px solid transparent;background:#005e9d;color:#fff;font-weight:600;cursor:pointer;font:inherit;font-weight:600}
.svk .btn.secondary{background:transparent;color:inherit;border-color:color-mix(in srgb,currentColor 25%,transparent)}
.svk .btn.danger{background:#b4233c}
.svk .btn:disabled{opacity:.5;cursor:not-allowed}
.svk [role=status]{padding:10px 14px;border-radius:10px;border:1px solid color-mix(in srgb,#0073aa 45%,transparent);background:color-mix(in srgb,#0073aa 10%,transparent);margin:12px 0}
.svk [role=alert]{padding:10px 14px;border-radius:10px;border:1px solid #b4233c66;background:#b4233c14;margin:12px 0}
.svk table{width:100%;border-collapse:collapse}
.svk th,.svk td{text-align:left;padding:10px 8px;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent);vertical-align:top}
.svk th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;opacity:.7}
.svk .pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;background:color-mix(in srgb,#0073aa 14%,transparent)}
.svk .tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 4px}
.svk .tabs button{padding:7px 14px;border-radius:999px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);background:transparent;color:inherit;cursor:pointer;font:inherit}
.svk .tabs button[aria-selected=true]{background:#0b2a4e;color:#fff;border-color:#0b2a4e}
.svk summary{cursor:pointer;font-weight:600}
`;

export function Page({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
	return (
		<div className="svk">
			<style>{KIT_CSS}</style>
			<h1>{title}</h1>
			{intro && <p className="lead">{intro}</p>}
			{children}
		</div>
	);
}

export function Notice({ message, error }: { message?: string; error?: string }) {
	return (
		<>
			{message && <p role="status">{message}</p>}
			{error && <p role="alert">{error}</p>}
		</>
	);
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: Array<[T, string]> }) {
	return (
		<div className="tabs" role="tablist">
			{items.map(([id, label]) => (
				<button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}>
					{label}
				</button>
			))}
		</div>
	);
}

export const lines = (text: string) => text.split("\n").map((x) => x.trim()).filter(Boolean);
