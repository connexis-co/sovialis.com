/** Utilidades compartidas por los plugins de Sovialis (sin dependencias). */

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: unknown): string {
	return String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

/** Texto acotado: recorta espacios y rechaza valores que no son texto o exceden el máximo. */
export function boundedText(value: unknown, name: string, max: number, required = false): string {
	if (value === undefined || value === null) value = "";
	if (typeof value !== "string") throw new Error(`${name}: valor inválido.`);
	const text = value.trim();
	if (text.length > max) throw new Error(`${name}: máximo ${max} caracteres.`);
	if (required && !text) throw new Error(`${name}: es obligatorio.`);
	return text;
}

/** Normaliza un celular colombiano o internacional a dígitos con indicativo (p. ej. 573001234567). */
export function normalizePhone(value: unknown, defaultCountry = "57"): string {
	const digits = String(value ?? "").replace(/\D/g, "");
	if (!digits) return "";
	if (digits.length === 10 && digits.startsWith("3")) return `${defaultCountry}${digits}`;
	if (digits.length === 12 && digits.startsWith("57")) return digits;
	return digits;
}

export function isValidPhone(digits: string): boolean {
	return /^[1-9]\d{9,14}$/.test(digits);
}

export function isValidEmail(value: string): boolean {
	return /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i.test(value);
}

export function matchesPath(path: string, pattern: string): boolean {
	const clean = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
	if (!pattern.includes("*")) return clean(path) === clean(pattern);
	const re = pattern
		.split("*")
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join(".*");
	return new RegExp(`^${re}$`).test(path);
}

export function isAdminPath(path: string): boolean {
	return path.startsWith("/_emdash") || path.startsWith("/admin");
}
