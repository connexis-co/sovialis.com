/**
 * Grafo JSON-LD de Sovialis (arquitectura SEO §11): @id estables, sin tipos médicos y sin reseñas
 * propias sobre el negocio. Un solo bloque `@graph` por página que reemplaza el «primary» del núcleo.
 */
import type { BusinessSettings } from "./model";

export interface GraphInput {
	origin: string;
	url: string;
	pageType: string;
	title: string;
	description: string;
	image: string | null;
	breadcrumbs: Array<{ name: string; url: string }> | undefined;
	business: BusinessSettings;
	data?: Record<string, any> | null;
	collection?: string;
	published?: string | null;
	modified?: string | null;
	author?: { name: string; slug: string; bio?: string | null; isTeam: boolean } | null;
	rating?: { average: number; count: number } | null;
	items?: Array<{ name: string; url: string }>;
}

const abs = (origin: string, path: string | null | undefined) => (path ? new URL(path, origin).toString() : undefined);

function clean<T>(value: T): T {
	if (Array.isArray(value)) return value.map(clean).filter((v) => v !== undefined && v !== null && v !== "") as T;
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) {
			const c = clean(v);
			if (c === undefined || c === null || c === "" || (Array.isArray(c) && c.length === 0)) continue;
			out[k] = c;
		}
		return out as T;
	}
	return value;
}

function plain(markdownish: unknown): string {
	return String(markdownish ?? "")
		.replace(/\*\*(.+?)\*\*/g, "$1")
		.replace(/\[(.+?)\]\((.+?)\)/g, "$1")
		.replace(/\s+/g, " ")
		.trim();
}

export function collectFaqs(data: Record<string, any> | null | undefined): Array<{ question: string; answer: string }> {
	if (!data) return [];
	const fromBlocks = (Array.isArray(data.layout) ? data.layout : []).filter((b: any) => b?._type === "faq").flatMap((b: any) => b.items ?? []);
	const all = [...(Array.isArray(data.faqs) ? data.faqs : []), ...fromBlocks].filter((f: any) => f?.question && f?.answer);
	const seen = new Set<string>();
	return all.filter((f: any) => {
		const k = String(f.question).toLowerCase();
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}

export function buildGraph(input: GraphInput): Record<string, unknown> {
	const { origin, url, business: b, data } = input;
	const ORG = `${origin}/#organization`;
	const LB = `${origin}/#localbusiness`;
	const SITE = `${origin}/#website`;
	const pageId = `${url}#webpage`;
	const graph: Record<string, unknown>[] = [];

	graph.push({
		"@type": "Organization",
		"@id": ORG,
		name: b.name,
		legalName: b.legalName || undefined,
		url: `${origin}/`,
		slogan: b.slogan,
		description: b.description,
		logo: b.logo ? { "@type": "ImageObject", url: abs(origin, b.logo), caption: b.name } : undefined,
		email: b.email,
		telephone: b.telephone,
		sameAs: b.sameAs,
	});

	graph.push({
		"@type": "LocalBusiness",
		"@id": LB,
		name: b.name,
		parentOrganization: { "@id": ORG },
		description: b.description,
		url: `${origin}/`,
		image: abs(origin, b.image),
		logo: abs(origin, b.logo),
		telephone: b.telephone,
		email: b.email,
		priceRange: b.priceRange,
		currenciesAccepted: "COP",
		address: {
			"@type": "PostalAddress",
			streetAddress: b.verified ? b.streetAddress : undefined,
			addressLocality: b.locality,
			addressRegion: b.region,
			postalCode: b.verified ? b.postalCode : undefined,
			addressCountry: b.country,
		},
		geo: b.lat !== null && b.lng !== null ? { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng } : undefined,
		openingHours: b.openingHours || undefined,
		areaServed: b.areaServed.map((name) => ({ "@type": "Place", name })),
		knowsAbout: b.knowsAbout,
		sameAs: b.sameAs,
	});

	graph.push({
		"@type": "WebSite",
		"@id": SITE,
		url: `${origin}/`,
		name: b.name,
		description: b.description,
		inLanguage: "es-CO",
		publisher: { "@id": ORG },
	});

	const crumbs = input.breadcrumbs && input.breadcrumbs.length > 1 ? input.breadcrumbs : null;
	const pageTypeMap: Record<string, string> = {
		about: "AboutPage",
		contact: "ContactPage",
		collection: "CollectionPage",
		author: "ProfilePage",
	};
	const webPage: Record<string, unknown> = {
		"@type": pageTypeMap[input.pageType] ?? "WebPage",
		"@id": pageId,
		url,
		name: input.title,
		description: input.description,
		isPartOf: { "@id": SITE },
		inLanguage: "es-CO",
		primaryImageOfPage: input.image ? { "@type": "ImageObject", url: input.image } : undefined,
		breadcrumb: crumbs ? { "@id": `${url}#breadcrumb` } : undefined,
		about: input.pageType === "website" ? { "@id": LB } : undefined,
		datePublished: input.published ?? undefined,
		dateModified: input.modified ?? undefined,
	};
	graph.push(webPage);

	if (crumbs) {
		graph.push({
			"@type": "BreadcrumbList",
			"@id": `${url}#breadcrumb`,
			itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(origin, c.url) })),
		});
	}

	if (input.items?.length) {
		webPage.mainEntity = {
			"@type": "ItemList",
			itemListElement: input.items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(origin, it.url) })),
		};
	}

	if (input.collection === "services" && data) {
		const price = typeof data.price_from === "number" ? data.price_from : null;
		graph.push({
			"@type": "Service",
			"@id": `${url}#service`,
			name: data.short_title || data.title,
			serviceType: data.service_type || data.short_title || data.title,
			description: input.description,
			url,
			image: input.image ?? undefined,
			provider: { "@id": LB },
			areaServed: b.areaServed.map((name) => ({ "@type": "Place", name })),
			audience: { "@type": "PeopleAudience", audienceType: "Familias de personas mayores" },
			offers: price
				? {
						"@type": "Offer",
						priceCurrency: "COP",
						price,
						priceSpecification: {
							"@type": "UnitPriceSpecification",
							price,
							priceCurrency: "COP",
							unitText: data.price_unit || undefined,
							valueAddedTaxIncluded: true,
						},
						availability: "https://schema.org/InStock",
						url: `${origin}/precios/`,
					}
				: undefined,
		});
		webPage.mainEntity = { "@id": `${url}#service` };
	}

	if (input.collection === "zones" && data) {
		const place = {
			"@type": data.kind === "localidad" ? "AdministrativeArea" : "Place",
			name: `${data.short_title || data.title}, Bogotá`,
			geo: typeof data.lat === "number" && typeof data.lng === "number" ? { "@type": "GeoCoordinates", latitude: data.lat, longitude: data.lng } : undefined,
			containedInPlace: { "@type": "City", name: "Bogotá" },
		};
		graph.push({
			"@type": "Service",
			"@id": `${url}#service`,
			name: `Cuidado del adulto mayor en ${data.short_title || data.title}`,
			serviceType: "Cuidado de personas mayores en casa",
			provider: { "@id": LB },
			areaServed: place,
			url,
		});
		webPage.about = place;
	}

	if (input.collection === "posts" && data) {
		const author = input.author;
		const authorNode = author
			? author.isTeam
				? { "@id": ORG }
				: { "@type": "Person", "@id": `${origin}/autores/${author.slug}/#person`, name: author.name, url: `${origin}/autores/${author.slug}/`, description: author.bio ?? undefined, worksFor: { "@id": ORG } }
			: { "@id": ORG };
		const words = plain(JSON.stringify(data.content ?? "")).split(/\s+/).length;
		graph.push({
			"@type": "BlogPosting",
			"@id": `${url}#article`,
			headline: input.title,
			description: input.description,
			image: input.image ?? undefined,
			url,
			datePublished: input.published ?? undefined,
			dateModified: input.modified ?? input.published ?? undefined,
			inLanguage: "es-CO",
			author: authorNode,
			publisher: { "@id": ORG },
			mainEntityOfPage: { "@id": pageId },
			isPartOf: { "@id": SITE },
			articleSection: data.terms?.category?.[0]?.label ?? undefined,
			keywords: Array.isArray(data.terms?.tag) ? data.terms.tag.map((t: any) => t.label).join(", ") : undefined,
			wordCount: words > 50 ? words : undefined,
			aggregateRating: input.rating
				? { "@type": "AggregateRating", ratingValue: input.rating.average, ratingCount: input.rating.count, bestRating: 5, worstRating: 1 }
				: undefined,
		});
	}

	const faqs = collectFaqs(data);
	if (faqs.length) {
		graph.push({
			"@type": "FAQPage",
			"@id": `${url}#faq`,
			isPartOf: { "@id": pageId },
			inLanguage: "es-CO",
			mainEntity: faqs.map((f) => ({
				"@type": "Question",
				name: plain(f.question),
				acceptedAnswer: { "@type": "Answer", text: plain(f.answer) },
			})),
		});
	}

	return clean({ "@context": "https://schema.org", "@graph": graph });
}
