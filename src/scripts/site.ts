/**
 * Comportamiento global del sitio público (≈ 6 KB gz, sin frameworks):
 * cabecera compacta, mega menú, menú móvil, modal y formularios de cotización, barra móvil,
 * buscador de zonas, pestañas, carruseles, valoraciones y medición (contrato data-cta de Connexis).
 */

declare global {
	interface Window {
		dataLayer: Record<string, unknown>[];
		svWhatsApp?: { number: string; message: string };
		turnstile?: { getResponse(el?: Element): string | undefined; reset(el?: Element): void };
	}
}

// Los tipos de Workers (servidor) y del DOM conviven en el proyecto; estos helpers evitan el choque de `Element`.
type Root = { querySelector(selector: string): unknown; querySelectorAll(selector: string): Iterable<unknown> };
const $ = <T = HTMLElement>(sel: string, root: Root = document): T | null => root.querySelector(sel) as T | null;
const $$ = <T = HTMLElement>(sel: string, root: Root = document): T[] => [...root.querySelectorAll(sel)] as T[];
window.dataLayer = window.dataLayer || [];
const track = (event: string, data: Record<string, unknown> = {}) =>
	window.dataLayer.push({ event, page_type: document.documentElement.dataset.pageType || "pagina", ...data });
const once = (key: string) => {
	try {
		if (sessionStorage.getItem(key)) return false;
		sessionStorage.setItem(key, "1");
	} catch {
		/* modo privado */
	}
	return true;
};

/* ── Atribución: guarda UTM / gclid de la primera página para los formularios ───────────── */
const ATTR_KEY = "sv:attr";
(() => {
	const params = new URLSearchParams(location.search);
	const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
	const found = Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ""]).filter(([, v]) => v));
	try {
		if (Object.keys(found).length) sessionStorage.setItem(ATTR_KEY, JSON.stringify({ ...found, landing: location.pathname }));
		else if (!sessionStorage.getItem(ATTR_KEY)) sessionStorage.setItem(ATTR_KEY, JSON.stringify({ landing: location.pathname, referrer: document.referrer }));
	} catch {
		/* sin almacenamiento */
	}
})();
const attribution = (): Record<string, string> => {
	try {
		return JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}");
	} catch {
		return {};
	}
};

/* ── Cabecera compacta ─────────────────────────────────────────────────────────────────── */
const header = $("#site-header");
let ticking = false;
const onScroll = () => {
	header?.classList.toggle("is-compact", scrollY > 80);
	ticking = false;
};
addEventListener(
	"scroll",
	() => {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(onScroll);
		}
	},
	{ passive: true },
);
onScroll();

/* ── Mega menú (<details name>) ────────────────────────────────────────────────────────── */
const dropdowns = $$<HTMLDetailsElement>(".nav-dropdown");
const hoverable = matchMedia("(hover:hover) and (pointer:fine)");
let closeTimer = 0;
const closeOthers = (keep?: HTMLDetailsElement) => dropdowns.forEach((d) => d !== keep && (d.open = false));
for (const d of dropdowns) {
	const summary = $("summary", d)!;
	d.addEventListener("pointerenter", () => {
		if (!hoverable.matches) return;
		clearTimeout(closeTimer);
		closeOthers(d);
		d.open = true;
	});
	d.addEventListener("pointerleave", () => {
		if (!hoverable.matches) return;
		closeTimer = window.setTimeout(() => {
			if (!d.contains(document.activeElement)) d.open = false;
		}, 160);
	});
	d.addEventListener("toggle", () => summary.setAttribute("aria-expanded", String(d.open)));
	d.addEventListener("focusout", () =>
		requestAnimationFrame(() => {
			if (!d.contains(document.activeElement) && !d.matches(":hover")) d.open = false;
		}),
	);
	d.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			d.open = false;
			summary.focus();
		}
		if (e.key === "ArrowDown" && e.target === summary) {
			e.preventDefault();
			closeOthers(d);
			d.open = true;
			$<HTMLElement>("a,input", d)?.focus();
		}
	});
}
document.addEventListener("click", (e) => {
	if (!(e.target as Element).closest(".nav-dropdown")) closeOthers();
});

/* ── Menú móvil con niveles ────────────────────────────────────────────────────────────── */
const menu = $<HTMLDialogElement>("#mobile-menu");
const menuOpener = $("[data-menu-open]");
if (menu && menuOpener) {
	const levels = $$<HTMLElement>("[data-menu-level]", menu);
	let previous = "main";
	const go = (level: string, moveFocus = true) => {
		previous = menu.dataset.level || "main";
		menu.dataset.level = level;
		levels.forEach((l) => (l.hidden = l.dataset.menuLevel !== level));
		if (!moveFocus) return;
		if (level === "main") $<HTMLElement>(`[data-menu-next="${previous}"]`, menu)?.focus();
		else $<HTMLElement>(`[data-menu-level="${level}"] h2`, menu)?.focus({ preventScroll: true });
	};
	menuOpener.addEventListener("click", () => {
		go("main", false);
		menu.showModal();
		menuOpener.setAttribute("aria-expanded", "true");
		track("open_mobile_menu");
	});
	menu.addEventListener("click", (e) => {
		const t = e.target as Element;
		const next = t.closest<HTMLElement>("[data-menu-next]");
		if (next) go(next.dataset.menuNext!);
		if (t.closest("[data-menu-back]")) go("main");
		if (t.closest("[data-menu-close]")) menu.close();
		if (t.closest("a[href]")) menu.close();
	});
	menu.addEventListener("cancel", (e) => {
		if (menu.dataset.level !== "main") {
			e.preventDefault();
			go("main");
		}
	});
	menu.addEventListener("keydown", (e) => {
		if (e.key !== "Escape") return;
		e.preventDefault();
		e.stopPropagation();
		if (menu.dataset.level === "main") menu.close();
		else go("main");
	});
	menu.addEventListener("close", () => {
		go("main", false);
		menuOpener.setAttribute("aria-expanded", "false");
		menuOpener.focus({ preventScroll: true });
	});
	matchMedia("(min-width:1024px)").addEventListener("change", (m) => m.matches && menu.open && menu.close());
}

/* ── Buscador de zonas sin tildes ──────────────────────────────────────────────────────── */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
for (const input of $$<HTMLInputElement>("[data-zone-search]")) {
	const list = document.getElementById(input.dataset.zoneSearch!);
	const counter = input.closest("div,section")?.querySelector<HTMLElement>("[data-zone-count]");
	if (!list) continue;
	input.addEventListener("input", () => {
		const q = norm(input.value.trim());
		let shown = 0;
		for (const li of $$<HTMLElement>("[data-zone-name]", list)) {
			const match = !q || norm(li.dataset.zoneName ?? "").includes(q);
			li.hidden = !match;
			if (match) shown++;
		}
		if (counter) counter.textContent = q ? (shown ? `${shown} zona${shown === 1 ? "" : "s"} encontrada${shown === 1 ? "" : "s"}` : "No encontramos esa zona: escríbenos y confirmamos cobertura.") : "";
	});
}

/* ── Banner de cookies → variable CSS para que el botón flotante no lo tape ─────────────────── */
const cookieBanner = $("#sv-cookies");
if (cookieBanner) {
	const set = () =>
		document.documentElement.style.setProperty(
			"--alto-consentimiento",
			`${cookieBanner.dataset.open === "true" ? Math.ceil(cookieBanner.getBoundingClientRect().height) + 12 : 0}px`,
		);
	new MutationObserver(set).observe(cookieBanner, { attributes: true, attributeFilter: ["data-open"] });
	set();
}

/* ── Modal de cotización ──────────────────────────────────────────────────────────────── */
const dialog = $<HTMLDialogElement>("#quote-dialog");
document.addEventListener("click", (e) => {
	const t = e.target as Element;
	const opener = t.closest<HTMLElement>("[data-quote]");
	if (opener && dialog) {
		e.preventDefault();
		$<HTMLDialogElement>("#mobile-menu[open]")?.close();
		const form = $<HTMLFormElement>("form", dialog)!;
		const setSelect = (name: string, value?: string) => {
			const el = form.elements.namedItem(name) as HTMLSelectElement | null;
			if (!el || !value) return;
			const opt = [...el.options].find((o) => o.value === value || norm(o.textContent ?? "") === norm(value));
			if (opt) el.value = opt.value;
		};
		setSelect("service", opener.dataset.service);
		setSelect("zone", opener.dataset.zone);
		dialog.showModal();
		track("open_quote_modal", { cta: opener.dataset.cta ?? "sin-etiqueta" });
	}
	if (t.closest("[data-dialog-close]")) t.closest("dialog")?.close();
});
dialog?.addEventListener("click", (e) => {
	if (e.target !== dialog) return;
	const r = dialog.getBoundingClientRect();
	if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});

/* ── Formularios de cotización ────────────────────────────────────────────────────────── */
const MSG: Record<string, string> = {
	name: "Escribe tu nombre.",
	phone: "Escribe un celular de 10 dígitos (3xx xxx xxxx).",
	email: "Revisa el correo o déjalo vacío.",
	zone: "Elige tu zona o barrio.",
	consent: "Autoriza el tratamiento de tus datos para poder atender tu solicitud.",
};
const LEADS_ENDPOINT = "/_emdash/api/plugins/sovialis-leads/submit";

for (const form of $$<HTMLFormElement>("[data-quote-form]")) {
	const openedAt = Date.now();
	const el = (n: string) => form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
	const val = (n: string) => (el(n)?.value ?? "").trim();
	const text = (n: string) => {
		const e = el(n);
		return e instanceof HTMLSelectElement ? (e.selectedOptions[0]?.value ? e.selectedOptions[0].textContent ?? "" : "") : val(n);
	};
	const steps = $$<HTMLElement>("[data-step]", form);
	let reached = 1;
	const progress = () => {
		if (!form.classList.contains("is-progressive")) return;
		const s1 = val("name").length >= 2 && val("phone").replace(/\D/g, "").length >= 7;
		let n = 1;
		if (s1 || val("email")) n = 2;
		if ((n >= 2 && /^\S+@\S+\.\S+$/.test(val("email"))) || val("service") || val("zone") || val("message") || (n >= 2 && form.dataset.touched3)) n = 3;
		reached = Math.max(reached, n);
		steps.forEach((s) => s.classList.toggle("is-visible", Number(s.dataset.step) <= reached));
	};
	form.addEventListener("input", progress);
	form.addEventListener("change", progress);
	el("email")?.addEventListener("blur", () => {
		form.dataset.touched3 = "1";
		progress();
	});
	progress();
	if (form.classList.contains("is-progressive")) {
		el("phone")?.addEventListener("blur", () => {
			if (reached < 2 && val("phone")) {
				reached = 2;
				progress();
			}
		});
	}

	const summary = $("[data-error-summary]", form)!;
	const invalid = () => {
		const bad: string[] = [];
		if (val("name").length < 2) bad.push("name");
		if (!/^(?:57)?3\d{9}$/.test(val("phone").replace(/\D/g, "")) && !/^\+?\d{10,15}$/.test(val("phone").replace(/[\s()-]/g, ""))) bad.push("phone");
		if (val("email") && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(val("email"))) bad.push("email");
		if (el("zone") && !val("zone")) bad.push("zone");
		if (!(el("consent") as HTMLInputElement | null)?.checked) bad.push("consent");
		return bad;
	};
	const showErrors = (bad: string[]) => {
		$("ul", summary)!.replaceChildren();
		$$("[aria-invalid]", form).forEach((x) => x.removeAttribute("aria-invalid"));
		$$<HTMLElement>("[data-error]", form).forEach((x) => {
			x.hidden = true;
			x.textContent = "";
		});
		if (bad.length && form.classList.contains("is-progressive")) {
			reached = 3;
			steps.forEach((s) => s.classList.add("is-visible"));
		}
		for (const n of bad) {
			const f = el(n);
			f?.setAttribute("aria-invalid", "true");
			const slot = $<HTMLElement>(`[data-error="${n}"]`, form);
			if (slot) {
				slot.hidden = false;
				slot.textContent = MSG[n] ?? "Revisa este campo.";
			}
			const li = document.createElement("li");
			const a = document.createElement("a");
			a.href = `#${f?.id ?? form.id}`;
			a.textContent = MSG[n] ?? n;
			a.addEventListener("click", (ev) => {
				ev.preventDefault();
				f?.focus();
			});
			li.appendChild(a);
			$("ul", summary)!.appendChild(li);
		}
		summary.hidden = bad.length === 0;
		if (bad.length) summary.focus();
	};

	const waHref = () => {
		const number = window.svWhatsApp?.number || form.dataset.waNumber || "";
		const lines = [
			`Hola, soy ${val("name") || "una persona interesada"}. Quiero información sobre el cuidado de un adulto mayor.`,
			text("service") && `Servicio: ${text("service")}`,
			text("zone") && `Zona: ${text("zone")}`,
			text("schedule") && `Turno: ${text("schedule")}`,
		].filter(Boolean);
		return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
	};
	$$<HTMLAnchorElement>("[data-contact-whatsapp]", form).forEach((a) =>
		a.addEventListener("click", () => {
			a.href = waHref();
		}),
	);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const submit = $<HTMLButtonElement>("[type=submit]", form)!;
		if (submit.disabled) return;
		const bad = invalid();
		if (bad.length) {
			track("form_error", { form_source: form.dataset.source, fields: bad.join(",") });
			return showErrors(bad);
		}
		showErrors([]);
		submit.disabled = true;
		form.setAttribute("aria-busy", "true");
		const label = $("[data-submit-label]", submit);
		const original = label?.textContent;
		if (label) label.textContent = "Enviando…";
		const status = $("[data-status]", form)!;
		status.hidden = true;
		const attr = attribution();
		const payload = {
			name: val("name"),
			phone: val("phone"),
			email: val("email"),
			service: text("service"),
			zone: text("zone"),
			schedule: text("schedule"),
			forWhom: text("forWhom"),
			message: val("message"),
			consent: true,
			website: val("website"),
			elapsedMs: Date.now() - openedAt,
			source: form.dataset.source || "formulario",
			page: location.pathname,
			pageTitle: document.title,
			referrer: attr.referrer || document.referrer,
			utm: { utm_source: attr.utm_source, utm_medium: attr.utm_medium, utm_campaign: attr.utm_campaign, utm_term: attr.utm_term, utm_content: attr.utm_content },
			gclid: attr.gclid || "",
			fbclid: attr.fbclid || "",
			turnstileToken: window.turnstile?.getResponse($(".cf-turnstile", form) ?? undefined) || "",
		};
		try {
			const res = await fetch(LEADS_ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: AbortSignal.timeout(20_000),
			});
			const body = (await res.json().catch(() => ({}))) as { data?: { ok?: boolean; error?: string; message?: string; whatsappUrl?: string; id?: string } };
			const data = body.data ?? {};
			if (!res.ok || !data.ok) throw new Error(data.error || "No pudimos enviar tu solicitud. Tus datos siguen aquí: inténtalo de nuevo o continúa por WhatsApp.");
			track("generate_lead", { form_source: form.dataset.source, service: payload.service, zone: payload.zone, value: 1, currency: "COP" });
			try {
				sessionStorage.setItem("sv:receipt", JSON.stringify({ id: data.id, name: payload.name, message: data.message, whatsappUrl: data.whatsappUrl, at: Date.now() }));
			} catch {
				/* sin almacenamiento */
			}
			location.assign("/gracias/");
		} catch (err) {
			status.textContent = err instanceof Error && err.name === "Error" ? err.message : "No pudimos confirmar el envío. Inténtalo de nuevo o continúa por WhatsApp.";
			status.hidden = false;
			status.tabIndex = -1;
			status.focus();
			window.turnstile?.reset($(".cf-turnstile", form) ?? undefined);
		} finally {
			submit.disabled = false;
			form.removeAttribute("aria-busy");
			if (label && original) label.textContent = original;
		}
	});

	if ($(".cf-turnstile", form) && !$("script[data-turnstile]")) {
		const s = document.createElement("script");
		s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
		s.async = true;
		s.defer = true;
		s.dataset.turnstile = "";
		document.head.appendChild(s);
	}
}

/* ── Pestañas (texto + imagen por pestaña) ─────────────────────────────────────────────────────────────── */
for (const tabs of $$("[data-tabs]")) {
	const buttons = $$<HTMLButtonElement>('[role="tab"]', tabs);
	const panels = $$<HTMLElement>('[role="tabpanel"]', tabs);
	const select = (i: number, focus = false) => {
		buttons.forEach((b, j) => {
			b.setAttribute("aria-selected", String(i === j));
			b.tabIndex = i === j ? 0 : -1;
		});
		panels.forEach((p, j) => {
			if (i === j) p.removeAttribute("hidden");
			else if (p.dataset.untilFound !== undefined) p.setAttribute("hidden", "until-found");
			else p.hidden = true;
		});
		$$("[data-tab-media] > *", tabs).forEach((m, j) => m.classList.toggle("is-active", i === j));
		if (focus) buttons[i]?.focus();
	};
	buttons.forEach((b, i) => {
		b.addEventListener("click", () => select(i));
		b.addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), select((i + 1) % buttons.length, true));
			if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), select((i - 1 + buttons.length) % buttons.length, true));
		});
	});
	// Búsqueda del navegador (Ctrl+F) dentro de un panel oculto con hidden="until-found": abre su pestaña.
	panels.forEach((p, i) => p.addEventListener("beforematch", () => select(i)));
}

/* ── Carruseles con scroll-snap: flechas y barra de progreso ──────────────────────────── */
for (const carousel of $$("[data-carousel]")) {
	const track = $("[data-carousel-track]", carousel)!;
	const bar = $<HTMLElement>("[data-carousel-progress]", carousel);
	const step = () => (track.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? track.clientWidth * 0.8;
	$("[data-carousel-prev]", carousel)?.addEventListener("click", () => track.scrollBy({ left: -step() - 24, behavior: "smooth" }));
	$("[data-carousel-next]", carousel)?.addEventListener("click", () => track.scrollBy({ left: step() + 24, behavior: "smooth" }));
	const update = () => {
		const max = track.scrollWidth - track.clientWidth;
		const ratio = max > 0 ? track.scrollLeft / max : 1;
		if (bar) bar.style.setProperty("--progress", String(Math.max(0.12, ratio)));
	};
	track.addEventListener("scroll", update, { passive: true });
	update();
}

/* ── Valoraciones con estrellas ───────────────────────────────────────────────────────── */
for (const widget of $$("[data-rating]")) {
	const target = widget.dataset.rating!;
	const out = $("[data-rating-summary]", widget);
	const msg = $("[data-rating-message]", widget);
	const stored = (() => {
		try {
			return Number(localStorage.getItem(`sv:rate:${target}`) || 0);
		} catch {
			return 0;
		}
	})();
	const paint = (n: number) => $$<HTMLButtonElement>("[data-star]", widget).forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.star) <= n)));
	if (stored) paint(stored);
	widget.addEventListener("click", async (e) => {
		const btn = (e.target as Element).closest<HTMLButtonElement>("[data-star]");
		if (!btn) return;
		const value = Number(btn.dataset.star);
		paint(value);
		try {
			const res = await fetch("/_emdash/api/plugins/sovialis-ratings/rate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ target, value }),
			});
			const body = (await res.json()) as { data?: { ok?: boolean; aggregate?: { average: number; count: number } } };
			if (!body.data?.ok || !body.data.aggregate) throw new Error();
			const { average, count } = body.data.aggregate;
			if (out) out.textContent = `${average.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 · ${count} ${count === 1 ? "valoración" : "valoraciones"}`;
			if (msg) msg.textContent = "¡Gracias por tu valoración!";
			try {
				localStorage.setItem(`sv:rate:${target}`, String(value));
			} catch {
				/* sin almacenamiento */
			}
			track("rate_content", { value });
		} catch {
			if (msg) msg.textContent = "No pudimos guardar tu valoración. Inténtalo más tarde.";
		}
	});
}

/* ── Medición: contrato data-cta (compartido con otros sitios de Connexis) ─────────────── */
const touch = matchMedia("(pointer:coarse)").matches;
document.addEventListener("click", (e) => {
	const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
	if (!a) return;
	const cta = a.dataset.cta ?? "sin-etiqueta";
	const href = a.getAttribute("href") ?? "";
	if (href.includes("wa.me") || href.includes("whatsapp.com")) {
		track("whatsapp_click", { cta });
		if (once(`sv:wa:${cta}`)) track("generate_lead_whatsapp", { cta, value: 1, currency: "COP" });
	} else if (href.startsWith("tel:")) {
		if (touch) {
			if (once("sv:call")) track("generate_lead_call", { cta, value: 1, currency: "COP" });
		} else track("click_telefono", { cta });
	} else if (a.dataset.cta) {
		track("cta_click", { cta });
	}
});

export {};
