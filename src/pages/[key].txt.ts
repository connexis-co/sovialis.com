import type { APIRoute } from "astro";
import { getSeoSettings } from "../../plugins/sovialis-seo/public";

/** Archivo de verificación de IndexNow: /<clave>.txt devuelve la clave. */
export const GET: APIRoute = async ({ params }) => {
	const { indexNowKey } = await getSeoSettings();
	if (!indexNowKey || params.key !== indexNowKey) return new Response("No encontrado", { status: 404 });
	return new Response(indexNowKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
