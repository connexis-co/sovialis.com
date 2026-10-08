import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGraph } from "../../plugins/sovialis-seo/schema.ts";
import { DEFAULT_SEO } from "../../plugins/sovialis-seo/model.ts";

const input = {
	origin: "https://sovialis.com",
	url: "https://sovialis.com/servicios/cuidado-por-horas/",
	pageType: "service",
	title: "Cuidadora por horas",
	description: "Cuidado por horas en Bogotá",
	image: "https://sovialis.com/og/gen/servicios/cuidado-por-horas.jpg",
	business: DEFAULT_SEO.business,
	collection: "services",
	product: true,
	data: {
		title: "Cuidadora por horas",
		short_title: "Cuidado por horas",
		price_from: 20000,
		price_unit: "por hora",
	},
	rating: { average: 4.65, count: 5 },
};
const nodes = (overrides = {}) => buildGraph({ ...input, ...overrides })["@graph"];

test("service ratings appear once under Product, with price, image and explicit scale", () => {
	const graph = nodes();
	const rated = graph.filter((n) => n.aggregateRating);
	assert.equal(rated.length, 1);
	assert.equal(rated[0]["@type"], "Product");
	assert.deepEqual(rated[0].aggregateRating, {
		"@type": "AggregateRating",
		ratingValue: 4.7,
		ratingCount: 5,
		bestRating: 5,
		worstRating: 1,
	});
	assert.equal(rated[0].offers.price, 20000);
	assert.equal(rated[0].offers.priceCurrency, "COP");
	assert.equal(rated[0].offers.priceSpecification.unitText, "por hora");
	assert.ok(rated[0].image.length);
	assert.equal(graph.find((n) => n["@type"] === "Service").aggregateRating, undefined);
});

test("zones, articles and disabling Product never emit unsupported review snippets", () => {
	for (const overrides of [{ collection: "zones" }, { collection: "posts" }, { product: false }]) {
		assert.equal(nodes(overrides).filter((n) => n.aggregateRating).length, 0);
	}
});

test("missing, empty, fractional counts or invalid averages never publish an aggregate", () => {
	for (const rating of [
		null,
		{ average: 5, count: 0 },
		{ average: 5, count: 1.5 },
		{ average: NaN, count: 3 },
		{ average: 6, count: 3 },
		{ average: 0, count: 3 },
	]) {
		assert.equal(
			nodes({ rating }).some((n) => n.aggregateRating),
			false,
		);
	}
});

test("business and organization never receive self-serving review markup", () => {
	const graph = nodes();
	for (const type of ["LocalBusiness", "Organization"])
		assert.equal(graph.find((n) => n["@type"] === type).aggregateRating, undefined);
});
