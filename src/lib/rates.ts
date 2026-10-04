/**
 * Tarifas públicas de Sovialis (precio final con IVA). La fuente es el repetidor «Tarifas» de los
 * Ajustes del sitio (panel); si está vacío se usan estos valores, iguales al tarifario de la
 * herramienta de gestión. Sábados, domingos y festivos llevan su propia tarifa.
 */
export type Profile = "cuidadora" | "auxiliar";
export type Modality = "por_hora" | "8h_dia" | "8h_noche" | "12h_dia" | "12h_noche" | "24h";

export interface Rate {
	profile: Profile;
	modality: Modality;
	price: number;
	priceWeekend: number;
}

export const PROFILES: Record<Profile, { label: string; short: string; description: string }> = {
	cuidadora: {
		label: "Cuidadora",
		short: "Cuidadora",
		description: "Compañía, higiene, comidas, movilidad y recordatorio de medicamentos orales.",
	},
	auxiliar: {
		label: "Formación de auxiliar",
		short: "Auxiliar",
		description: "Personal con formación de auxiliar de enfermería, para alta dependencia o recién salidos del hospital.",
	},
};

export const MODALITIES: Record<Modality, { label: string; short: string; unit: string; icon: string; hours: number; includes: string[]; service: string }> = {
	por_hora: {
		label: "Por horas",
		short: "Por horas",
		unit: "por hora",
		icon: "reloj",
		hours: 1,
		includes: ["Visitas desde 4 horas", "Compañía, salidas y diligencias", "Apoyo en una comida o en el baño"],
		service: "cuidado-por-horas",
	},
	"8h_dia": {
		label: "Turno de 8 h de día",
		short: "8 h día",
		unit: "por turno de 8 h",
		icon: "sol",
		hours: 8,
		includes: ["Mañana o tarde completa", "Higiene, comidas y movilidad", "Bitácora diaria para la familia"],
		service: "cuidadora-adulto-mayor",
	},
	"8h_noche": {
		label: "Turno de 8 h de noche",
		short: "8 h noche",
		unit: "por turno de 8 h",
		icon: "luna",
		hours: 8,
		includes: ["Cuidadora despierta", "Idas al baño y cambios de posición", "Prevención de caídas en la madrugada"],
		service: "cuidado-nocturno",
	},
	"12h_dia": {
		label: "Turno de 12 h de día",
		short: "12 h día",
		unit: "por turno de 12 h",
		icon: "sol",
		hours: 12,
		includes: ["De 7:00 a. m. a 7:00 p. m.", "Rutina completa del día", "Salidas y citas acompañadas"],
		service: "cuidadora-adulto-mayor",
	},
	"12h_noche": {
		label: "Turno de 12 h de noche",
		short: "12 h noche",
		unit: "por turno de 12 h",
		icon: "luna",
		hours: 12,
		includes: ["De 7:00 p. m. a 7:00 a. m.", "Cuidadora despierta toda la noche", "Reporte al amanecer"],
		service: "cuidado-nocturno",
	},
	"24h": {
		label: "Cuidado 24 horas",
		short: "24 h",
		unit: "por día de 24 h",
		icon: "casa",
		hours: 24,
		includes: ["Relevos coordinados", "Cobertura de día y de noche", "Incluye fines de semana y festivos"],
		service: "cuidado-24-horas",
	},
};

export const MODALITY_ORDER: Modality[] = ["por_hora", "8h_dia", "8h_noche", "12h_dia", "12h_noche", "24h"];

export const DEFAULT_RATES: Rate[] = [
	{ profile: "cuidadora", modality: "por_hora", price: 20_000, priceWeekend: 22_000 },
	{ profile: "cuidadora", modality: "8h_dia", price: 120_000, priceWeekend: 130_000 },
	{ profile: "cuidadora", modality: "8h_noche", price: 140_000, priceWeekend: 150_000 },
	{ profile: "cuidadora", modality: "12h_dia", price: 160_000, priceWeekend: 170_000 },
	{ profile: "cuidadora", modality: "12h_noche", price: 190_000, priceWeekend: 200_000 },
	{ profile: "cuidadora", modality: "24h", price: 300_000, priceWeekend: 320_000 },
	{ profile: "auxiliar", modality: "por_hora", price: 25_000, priceWeekend: 27_000 },
	{ profile: "auxiliar", modality: "8h_dia", price: 135_000, priceWeekend: 145_000 },
	{ profile: "auxiliar", modality: "8h_noche", price: 155_000, priceWeekend: 165_000 },
	{ profile: "auxiliar", modality: "12h_dia", price: 180_000, priceWeekend: 190_000 },
	{ profile: "auxiliar", modality: "12h_noche", price: 215_000, priceWeekend: 225_000 },
	{ profile: "auxiliar", modality: "24h", price: 340_000, priceWeekend: 360_000 },
];

/** Normaliza el repetidor del panel; completa con los valores por defecto las celdas que falten. */
export function normalizeRates(raw: unknown): Rate[] {
	const rows = Array.isArray(raw) ? raw : [];
	return DEFAULT_RATES.map((d) => {
		const row = rows.find((r: any) => r?.profile === d.profile && r?.modality === d.modality) as any;
		const price = Number(row?.price);
		const weekend = Number(row?.price_weekend);
		return {
			...d,
			price: Number.isFinite(price) && price > 0 ? price : d.price,
			priceWeekend: Number.isFinite(weekend) && weekend > 0 ? weekend : d.priceWeekend,
		};
	});
}

export const findRate = (rates: Rate[], profile: Profile, modality: Modality) => rates.find((r) => r.profile === profile && r.modality === modality)!;
