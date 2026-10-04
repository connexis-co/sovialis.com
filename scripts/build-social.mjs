#!/usr/bin/env node
/**
 * Piezas para redes sociales con los activos de marca:
 *   - Foto de perfil 1080×1080 (segura para recorte circular de WhatsApp, Instagram y Facebook),
 *     en versión clara y oscura.
 *   - Portada de Facebook 1640×624 (zona segura central para móvil y esquina inferior izquierda libre
 *     para la foto de perfil en escritorio).
 *
 *   node scripts/build-social.mjs   → ../brand/redes/
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { CONTENT, ROOT } from "./lib/content.mjs";

const OUT = join(ROOT, "../brand/redes");
const FONTS = ["jost-latin-600-normal", "jost-latin-500-normal", "atkinson-hyperlegible-next-latin-500-normal", "atkinson-hyperlegible-next-latin-700-normal"].map((f) =>
	join(ROOT, `scripts/og/fonts/${f}.ttf`),
);
const b64 = async (file, type) => `data:${type};base64,${(await readFile(file)).toString("base64")}`;
const isoColor = await b64(join(ROOT, "public/brand/sovialis-isotipo-degradado.svg"), "image/svg+xml");
const isoWhite = await b64(join(ROOT, "public/brand/sovialis-isotipo-negativo.svg"), "image/svg+xml");
const logoWhite = await b64(join(ROOT, "public/brand/sovialis-logo-completo-negativo.svg"), "image/svg+xml");

const render = (svg, width) =>
	new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Jost" }, fitTo: { mode: "width", value: width } }).render().asPng();

await mkdir(OUT, { recursive: true });

/* ── Foto de perfil: S del isotipo + «SOVIALIS» + eslogan del logo, dentro del círculo seguro ── */
const S = 1080;
const isoH = 400;
const isoW = Math.round(isoH * 0.7102); // proporción del isotipo 710,2 × 1000
const isoY = 236;
// Eslogan y líneas de pulso tal cual el logo completo (trazos), recortados con su viewBox.
const logoTinta = await readFile(join(ROOT, "public/brand/sovialis-logo-completo-tinta.svg"), "utf8");
const pathOf = (id) => logoTinta.match(new RegExp(`<path id="${id}"[^>]*d="([^"]+)"`))[1];
const sloganPaths = ["slogan", "ecg-l", "ecg-r"].map((id) => pathOf(id));
const slogan = (color) =>
	`<svg x="${(S - 560) / 2}" y="790" width="560" height="40" viewBox="920 1018 1590 104">${sloganPaths.map((d) => `<path d="${d}" fill="${color}"/>`).join("")}</svg>`;
const profile = (dark) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
	<defs>
		<radialGradient id="bg" cx="50%" cy="38%" r="75%">
			${dark ? '<stop offset="0" stop-color="#0E3A68"/><stop offset="1" stop-color="#0B2A4E"/>' : '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EAF4FA"/>'}
		</radialGradient>
	</defs>
	<rect width="${S}" height="${S}" fill="url(#bg)"/>
	<image href="${dark ? isoWhite : isoColor}" x="${(S - isoW) / 2}" y="${isoY}" width="${isoW}" height="${isoH}"/>
	<text x="${S / 2}" y="${isoY + isoH + 108}" text-anchor="middle" font-family="Jost" font-weight="500" font-size="78" letter-spacing="15" fill="${dark ? "#FFFFFF" : "#0B2A4E"}">SOVIALIS</text>
	${slogan(dark ? "#8FD8F2" : "#005E9D")}
</svg>`;
for (const [name, dark] of [
	["perfil-sovialis-claro", false],
	["perfil-sovialis-oscuro", true],
]) {
	await writeFile(join(OUT, `${name}-1080.png`), await sharp(render(profile(dark), S)).png({ compressionLevel: 9 }).toBuffer());
}

/* ── Portada de Facebook 1640×624 ─────────────────────────────────────────────────────── */
const CW = 1640;
const CH = 624;
// Foto vertical del inicio: se escala al ancho del bloque y se recorta con las dos caras al centro.
const photo = await sharp(await sharp(join(CONTENT, "media/home-hero.webp")).resize({ width: 980 }).toBuffer())
	.extract({ left: 0, top: 120, width: 980, height: CH })
	.jpeg({ quality: 90 })
	.toBuffer();
const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">
	<defs>
		<linearGradient id="panel" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0B2A4E"/><stop offset="1" stop-color="#0E3A68"/></linearGradient>
		<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#0B2A4E" stop-opacity="1"/><stop offset=".35" stop-color="#0B2A4E" stop-opacity=".55"/><stop offset="1" stop-color="#0B2A4E" stop-opacity="0"/></linearGradient>
		<linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#005E9D"/><stop offset="1" stop-color="#00A6D6"/></linearGradient>
	</defs>
	<rect width="${CW}" height="${CH}" fill="url(#panel)"/>
	<image href="data:image/jpeg;base64,${photo.toString("base64")}" x="${CW - 980}" y="0" width="980" height="${CH}" preserveAspectRatio="xMidYMid slice"/>
	<rect x="${CW - 980}" y="0" width="520" height="${CH}" fill="url(#fade)"/>
	<image href="${isoWhite}" x="-90" y="-60" width="${Math.round(760 * 0.7102)}" height="760" opacity=".06"/>
	<image href="${logoWhite}" x="300" y="128" width="420" height="171" preserveAspectRatio="xMinYMid meet"/>
	<text x="304" y="372" font-family="Jost" font-weight="600" font-size="46" fill="#FFFFFF">Cuidado del adulto mayor</text>
	<text x="304" y="428" font-family="Jost" font-weight="600" font-size="46" fill="#FFFFFF">a domicilio en Bogotá</text>
	<rect x="304" y="462" width="356" height="56" rx="28" fill="#FFFFFF"/>
	<circle cx="336" cy="490" r="20" fill="#1FAF55"/>
	<path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.94 12.94 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.62c-2 0-3.95-.54-5.65-1.55l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.86 4.77-10.63 10.64-10.63 5.86 0 10.6 4.77 10.6 10.63 0 5.87-4.76 10.62-10.6 10.62Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.6 9.6 0 0 1-1.78-2.2c-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.2 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.25 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" fill="#FFFFFF" transform="translate(320 474) scale(1)"/>
	<text x="368" y="498" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="24" fill="#0B2A4E">311 759 8641</text>
	<text x="526" y="498" font-family="Atkinson Hyperlegible Next" font-weight="500" font-size="19" fill="#4A5D72">WhatsApp</text>
	<rect x="0" y="${CH - 10}" width="${CW}" height="10" fill="url(#bar)"/>
</svg>`;
await writeFile(join(OUT, "portada-facebook-1640x624.jpg"), await sharp(render(cover, CW)).jpeg({ quality: 88, mozjpeg: true }).toBuffer());
console.log(`Listo: ${OUT}`);
