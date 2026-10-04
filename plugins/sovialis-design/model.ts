/**
 * Tokens de diseño editables de Sovialis. El tema define los valores por defecto en
 * `src/styles/tokens.css`; este plugin guarda los cambios hechos en el panel y los inyecta como
 * variables CSS en `<head>`, así que Tailwind v4 (que lee esas variables) los aplica en todo el sitio.
 */

export const COLOR_KEYS = [
	["primary", "Primario (botones, enlaces)"],
	["primaryHover", "Primario al pasar el mouse"],
	["onPrimary", "Texto sobre primario"],
	["deep", "Azul tinta (titulares, fondos oscuros)"],
	["secondary", "Cian vital (acentos, iconos)"],
	["accent", "Acento cálido (resaltados puntuales)"],
	["text", "Texto principal"],
	["textMuted", "Texto secundario"],
	["bg", "Fondo de página"],
	["surface", "Superficie (tarjetas)"],
	["surfaceAlt", "Superficie bruma (secciones frías)"],
	["surfaceWarm", "Superficie arena (secciones cálidas)"],
	["border", "Bordes"],
	["success", "Éxito"],
	["danger", "Error"],
	["whatsapp", "WhatsApp (botones de chat)"],
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number][0];

export const FONT_OPTIONS = {
	display: ["Jost", "Atkinson Hyperlegible Next"],
	body: ["Atkinson Hyperlegible Next", "Jost"],
} as const;

export interface DesignTokens {
	preset: string;
	colors: Record<ColorKey, string>;
	fontDisplay: string;
	fontBody: string;
	fontScale: number;
	radius: number;
	buttonShape: "pill" | "rounded";
	shadow: "none" | "soft" | "strong";
	motion: "full" | "subtle" | "none";
	heroOverlay: number;
	gradientHeadings: boolean;
}

export const OCEANO: Record<ColorKey, string> = {
	primary: "#005E9D",
	primaryHover: "#004E85",
	onPrimary: "#FFFFFF",
	deep: "#0B2A4E",
	secondary: "#00A6D6",
	accent: "#F08A65",
	text: "#0B2A4E",
	textMuted: "#3E4754",
	bg: "#FFFFFF",
	surface: "#FFFFFF",
	surfaceAlt: "#EEF7FB",
	surfaceWarm: "#FBF8F3",
	border: "#DCE6EE",
	success: "#006C4C",
	danger: "#A8181A",
	whatsapp: "#25D366",
};

export const PRESETS: Record<string, { label: string; colors: Partial<Record<ColorKey, string>> }> = {
	oceano: { label: "Océano (marca)", colors: OCEANO },
	sereno: { label: "Océano sereno", colors: { primary: "#1F4E79", primaryHover: "#163A5C", deep: "#001D39", secondary: "#7BBDE8", surfaceAlt: "#E7F0F6", text: "#0E2A44" } },
	real: { label: "Azul real", colors: { primary: "#1747C9", primaryHover: "#10349A", deep: "#0A1F5C", secondary: "#12B5F2", surfaceAlt: "#E8F0FD", text: "#0A1F5C" } },
	confianza: { label: "Azul confianza", colors: { primary: "#1D5FA8", primaryHover: "#16497F", deep: "#0E2F57", secondary: "#2F8ED2", surfaceAlt: "#EAF3FC", text: "#0E2F57" } },
};

export const DEFAULT_TOKENS: DesignTokens = {
	preset: "oceano",
	colors: { ...OCEANO },
	fontDisplay: "Jost",
	fontBody: "Atkinson Hyperlegible Next",
	fontScale: 100,
	radius: 24,
	buttonShape: "pill",
	shadow: "soft",
	motion: "full",
	heroOverlay: 55,
	gradientHeadings: true,
};

const HEX = /^#[0-9a-f]{6}$/i;

export function validateTokens(input: unknown): DesignTokens {
	if (!input || typeof input !== "object") throw new Error("Tokens inválidos.");
	const v = input as Record<string, unknown>;
	const colorsIn = (v.colors ?? {}) as Record<string, unknown>;
	const colors = { ...OCEANO };
	for (const [key, label] of COLOR_KEYS) {
		const value = colorsIn[key];
		if (value === undefined) continue;
		if (typeof value !== "string" || !HEX.test(value)) throw new Error(`${label}: usa un color #RRGGBB.`);
		colors[key] = value.toUpperCase();
	}
	const pick = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
		options.includes(value as T) ? (value as T) : fallback;
	const num = (value: unknown, min: number, max: number, fallback: number) => {
		const n = Number(value);
		return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
	};
	return {
		preset: typeof v.preset === "string" && v.preset.length < 40 ? v.preset : "personalizado",
		colors,
		fontDisplay: pick(v.fontDisplay, FONT_OPTIONS.display, DEFAULT_TOKENS.fontDisplay),
		fontBody: pick(v.fontBody, FONT_OPTIONS.body, DEFAULT_TOKENS.fontBody),
		fontScale: num(v.fontScale, 90, 120, 100),
		radius: num(v.radius, 0, 32, DEFAULT_TOKENS.radius),
		buttonShape: pick(v.buttonShape, ["pill", "rounded"] as const, "pill"),
		shadow: pick(v.shadow, ["none", "soft", "strong"] as const, "soft"),
		motion: pick(v.motion, ["full", "subtle", "none"] as const, "full"),
		heroOverlay: num(v.heroOverlay, 0, 90, DEFAULT_TOKENS.heroOverlay),
		gradientHeadings: typeof v.gradientHeadings === "boolean" ? v.gradientHeadings : true,
	};
}

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Convierte los tokens en una hoja `:root` (solo variables; el tema hace el resto). */
export function tokensToCss(t: DesignTokens): string {
	const vars: string[] = [];
	for (const [key] of COLOR_KEYS) vars.push(`--sv-${kebab(key)}:${t.colors[key]}`);
	const stack = (font: string) => `"${font} Variable","${font}",ui-sans-serif,system-ui,sans-serif`;
	vars.push(`--sv-font-display:${stack(t.fontDisplay)}`, `--sv-font-body:${stack(t.fontBody)}`);
	vars.push(`--sv-font-scale:${t.fontScale / 100}`);
	vars.push(`--sv-radius:${t.radius}px`);
	vars.push(`--sv-radius-button:${t.buttonShape === "pill" ? "999px" : `${Math.max(8, Math.round(t.radius * 0.6))}px`}`);
	const shadows = {
		none: ["none", "none", "none"],
		soft: [
			"0 1px 2px rgb(11 42 78/.06),0 2px 8px -2px rgb(11 42 78/.08)",
			"0 12px 32px -12px rgb(11 42 78/.22)",
			"0 30px 70px -28px rgb(11 42 78/.35)",
		],
		strong: [
			"0 2px 4px rgb(11 42 78/.1),0 4px 12px -2px rgb(11 42 78/.14)",
			"0 18px 40px -12px rgb(11 42 78/.32)",
			"0 40px 90px -30px rgb(11 42 78/.5)",
		],
	}[t.shadow];
	vars.push(`--sv-shadow-sm:${shadows[0]}`, `--sv-shadow-md:${shadows[1]}`, `--sv-shadow-lg:${shadows[2]}`);
	vars.push(`--sv-motion:${t.motion === "none" ? 0 : t.motion === "subtle" ? 0.5 : 1}`);
	vars.push(`--sv-hero-overlay:${t.heroOverlay / 100}`);
	vars.push(`--sv-highlight-fill:${t.gradientHeadings ? "var(--sv-gradient-highlight)" : "none"}`, `--sv-highlight-color:${t.gradientHeadings ? "transparent" : "var(--sv-secondary)"}`);
	return `:root:root{${vars.join(";")}}`;
}

export function withDefaults(stored: Partial<DesignTokens> | null | undefined): DesignTokens {
	if (!stored) return { ...DEFAULT_TOKENS, colors: { ...OCEANO } };
	return { ...DEFAULT_TOKENS, ...stored, colors: { ...OCEANO, ...(stored.colors ?? {}) } };
}
