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

/* ── Foto de perfil: la S del isotipo centrada dentro del círculo seguro (≈ 62 % del lado) ── */
const S = 1080;
const isoH = 600;
const isoW = Math.round(isoH * 0.7102); // proporción del isotipo 710,2 × 1000
const profile = (dark) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
	<defs>
		<radialGradient id="bg" cx="50%" cy="38%" r="75%">
			${dark ? '<stop offset="0" stop-color="#0E3A68"/><stop offset="1" stop-color="#0B2A4E"/>' : '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EAF4FA"/>'}
		</radialGradient>
	</defs>
	<rect width="${S}" height="${S}" fill="url(#bg)"/>
	<image href="${dark ? isoWhite : isoColor}" x="${(S - isoW) / 2}" y="${(S - isoH) / 2}" width="${isoW}" height="${isoH}"/>
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
const photo = await sharp(join(CONTENT, "media/home-hero.webp")).resize(980, CH, { fit: "cover", position: "north" }).jpeg({ quality: 90 }).toBuffer();
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
	<rect x="304" y="462" width="372" height="52" rx="26" fill="#F08A65"/>
	<text x="330" y="497" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="24" fill="#0B2A4E">WhatsApp 311 759 8641</text>
	<rect x="0" y="${CH - 10}" width="${CW}" height="10" fill="url(#bar)"/>
</svg>`;
await writeFile(join(OUT, "portada-facebook-1640x624.jpg"), await sharp(render(cover, CW)).jpeg({ quality: 88, mozjpeg: true }).toBuffer());
console.log(`Listo: ${OUT}`);
