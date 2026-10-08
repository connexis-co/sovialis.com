/**
 * Fuentes de imagen de la biblioteca de EmDash. Con PUBLIC_CF_IMAGES=on el srcset usa las
 * transformaciones de Cloudflare (/cdn-cgi/image, AVIF/WebP según el navegador). Lo usan el
 * componente Img y la precarga del <head>, para que ambos pidan exactamente el mismo archivo.
 */
export interface ImageValue {
	src?: string;
	url?: string;
	alt?: string;
	width?: number;
	height?: number;
	meta?: { storageKey?: string };
	storageKey?: string;
}

// Pasos cercanos en móvil (tarjetas al 75-92 % del ancho en pantallas de 360-430 px a 2-3x).
export const IMAGE_WIDTHS = [480, 640, 768, 960, 1200, 1440, 1920];

export function imageSources(image: ImageValue | string | null | undefined, widths: number[] = IMAGE_WIDTHS) {
	if (!image) return null;
	const value: ImageValue = typeof image === "string" ? { src: image } : image;
	const key = value.meta?.storageKey ?? value.storageKey;
	const src = value.src || value.url || (key ? `/_emdash/api/media/file/${key}` : "");
	if (!src) return null;
	const transforms = import.meta.env.PUBLIC_CF_IMAGES === "on" && src.startsWith("/");
	const max = value.width ?? 1920;
	const srcset = transforms
		? widths
				.filter((w) => w <= max)
				.map((w) => `/cdn-cgi/image/width=${w},format=auto,quality=78${src} ${w}w`)
				.join(", ")
		: undefined;
	return { src, srcset: srcset || undefined, alt: value.alt, width: value.width, height: value.height };
}

/** Atributo sizes de la foto de portada según el diseño del bloque Hero. */
export const HERO_SIZES = {
	split: "(min-width:1024px) 46vw, 92vw",
	full: "100vw",
	centered: "(min-width:1100px) 1024px, 92vw",
} as const;

type HeroValue = Record<string, any>;

export const heroHasImage = (v: HeroValue) => Boolean(v.image?.src || v.image?.id || v.image?.meta?.storageKey);

/** Formulario del hero: «barra», «tarjeta» o «boton» (show_form es el valor heredado). */
export function heroFormMode(v: HeroValue): "barra" | "tarjeta" | "boton" {
	if (v.form_mode === "barra" || v.form_mode === "tarjeta" || v.form_mode === "boton") return v.form_mode;
	return v.show_form ? (heroHasImage(v) ? "barra" : "tarjeta") : "boton";
}

/** Qué ocupa la columna de medios del diseño dividido: la foto, el formulario o nada. */
export function heroMediaKind(v: HeroValue): "photo" | "form" | null {
	const mode = heroFormMode(v);
	const hasImage = heroHasImage(v);
	return mode === "tarjeta" || (mode === "barra" && !hasImage) ? "form" : hasImage ? "photo" : null;
}

/** Precarga de la foto de portada (la imagen LCP) con el mismo srcset y sizes que usa el Hero. */
export function heroPreload(v: HeroValue | undefined | null) {
	if (!v || !heroHasImage(v)) return null;
	const variant = v.variant || "dividido";
	const sizes = variant === "foto-completa" ? HERO_SIZES.full : variant === "centrado" ? HERO_SIZES.centered : heroMediaKind(v) === "photo" ? HERO_SIZES.split : null;
	if (!sizes) return null;
	const img = imageSources(v.image);
	return img ? { ...img, sizes } : null;
}
