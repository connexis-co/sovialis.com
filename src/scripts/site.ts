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

/* ── Campos con etiqueta flotante: data-filled (también selects y valores prellenados) ─── */
const syncFilled = (root: Root = document) =>
	$$<HTMLElement>(".fl-field", root).forEach((w) => {
		const c = $<HTMLInputElement>("input, select, textarea", w);
		w.toggleAttribute("data-filled", Boolean(c?.value));
	});
for (const type of ["input", "change"]) {
	document.addEventListener(type, (e) => {
		const w = (e.target as HTMLElement).closest?.<HTMLElement>(".fl-field");
		if (w) syncFilled(w.parentElement ?? document);
	});
}
syncFilled();
addEventListener("pageshow", () => syncFilled());

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
		const message = form.elements.namedItem("message") as HTMLTextAreaElement | null;
		if (message && opener.dataset.message) message.value = opener.dataset.message;
		syncFilled(form);
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
	// Paso 1: nombre + celular. Paso 2 (al completarlos): zona, servicio y correo. Paso 3: el caso.
	// Solo avanza con lo que escribe la persona; un servicio o zona prellenados no destapan el resto.
	const progress = () => {
		if (!form.classList.contains("is-progressive")) return;
		const s1 = val("name").length >= 2 && val("phone").replace(/\D/g, "").length >= 10;
		let n = 1;
		if (s1) n = 2;
		if (n >= 2 && (form.dataset.zoneTouched || /^\S+@\S+\.\S+$/.test(val("email")))) n = 3;
		reached = Math.max(reached, n);
		steps.forEach((s) => s.classList.toggle("is-visible", Number(s.dataset.step) <= reached));
		const indicator = $<HTMLElement>("[data-step-indicator]", form);
		if (indicator) {
			const second = reached >= 2;
			indicator.dataset.step = second ? "2" : "1";
			const label = $("[data-step-text]", indicator);
			if (label) label.textContent = second ? "Paso 2 de 2 · Zona y detalles (casi listo)" : "Paso 1 de 2 · Tus datos de contacto";
		}
	};
	el("zone")?.addEventListener("change", () => {
		form.dataset.zoneTouched = "1";
		progress();
	});
	form.addEventListener("input", progress);
	form.addEventListener("change", progress);
	progress();
	if (form.classList.contains("is-progressive")) {
		el("phone")?.addEventListener("blur", () => {
			if (reached < 2 && val("name").length >= 2 && val("phone").replace(/\D/g, "").length >= 7) {
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

/* ── Precios: explorador (perfil × modalidad × días) y estimador mensual ───────────────────── */
type RateRow = { profile: string; modality: string; price: number; priceWeekend: number };
type RatesData = { rates: RateRow[]; minHours: number; modalities: Record<string, any>; profiles: Record<string, any>; auxService?: string };
const cop = (n: number) => `$${Math.round(n).toLocaleString("es-CO").replace(/,/g, ".")}`;
const checked = (root: Root, sel: string) => $<HTMLInputElement>(`${sel}:checked`, root)?.value ?? "";
const animateNumber = (el: HTMLElement, to: number) => {
	const from = Number(el.dataset.value ?? to);
	el.dataset.value = String(to);
	if (matchMedia("(prefers-reduced-motion: reduce)").matches || from === to) {
		el.textContent = cop(to);
		return;
	}
	const t0 = performance.now();
	const step = (t: number) => {
		const k = Math.min(1, (t - t0) / 420);
		el.textContent = cop(from + (to - from) * (1 - Math.pow(1 - k, 3)));
		if (k < 1) requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
};

for (const root of $$<HTMLElement>("[data-price-explorer]")) {
	const data = JSON.parse(root.dataset.rates || "{}") as RatesData;
	const rate = (p: string, m: string) => data.rates.find((r) => r.profile === p && r.modality === m)!;
	const priceEl = $<HTMLElement>("[data-pe-price]", root)!;
	const update = () => {
		const profile = checked(root, '[data-pe="profile"]');
		const modality = checked(root, '[data-pe="modality"]');
		const weekend = checked(root, '[data-pe="days"]') === "weekend";
		const r = rate(profile, modality);
		const mod = data.modalities[modality];
		animateNumber(priceEl, weekend ? r.priceWeekend : r.price);
		$("[data-pe-title]", root)!.textContent = `${data.profiles[profile].short} · ${mod.label}`;
		$("[data-pe-unit]", root)!.textContent = `${mod.unit} · ${weekend ? "sábados, domingos y festivos" : "lunes a viernes"}`;
		$("[data-pe-alt]", root)!.textContent = weekend ? `Lunes a viernes: ${cop(r.price)}` : `Sáb., dom. y festivos: ${cop(r.priceWeekend)}`;
		const min = $<HTMLElement>("[data-pe-min]", root)!;
		min.hidden = modality !== "por_hora";
		if (modality === "por_hora") min.textContent = `Visita mínima de ${data.minHours} h: desde ${cop((weekend ? r.priceWeekend : r.price) * data.minHours)}`;
		const list = $<HTMLElement>("[data-pe-includes]", root)!;
		list.replaceChildren(
			...(mod.includes as string[]).map((t) => {
				const li = document.createElement("li");
				li.innerHTML = `<span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>`;
				li.appendChild(document.createTextNode(t));
				return li;
			}),
		);
		list.classList.remove("pe-bump");
		void list.offsetWidth;
		list.classList.add("pe-bump");
		for (const m of Object.keys(data.modalities)) {
			const from = $(`[data-pe-from="${m}"]`, root);
			if (from) from.textContent = `desde ${cop(rate(profile, m).price)}`;
		}
		const summary = `${data.profiles[profile].label} · ${mod.label} · ${weekend ? "sábados, domingos y festivos" : "lunes a viernes"} (${cop(weekend ? r.priceWeekend : r.price)} ${mod.unit})`;
		const quote = $<HTMLElement>("[data-pe-quote]", root)!;
		quote.dataset.service = profile === "auxiliar" && data.auxService ? data.auxService : mod.serviceName;
		quote.dataset.message = `Me interesa: ${summary}.`;
		const wa = $<HTMLAnchorElement>("[data-pe-wa]", root)!;
		wa.dataset.waText = `Hola, vi los precios en la web. Me interesa: ${summary}. ¿Tienen disponibilidad?`;
		const number = (window as unknown as { svWhatsApp?: { number: string } }).svWhatsApp?.number;
		if (number) wa.href = `https://wa.me/${number}?text=${encodeURIComponent(wa.dataset.waText)}`;
	};
	root.addEventListener("change", update);
	update();
}

for (const root of $$<HTMLElement>("[data-budget]")) {
	const data = JSON.parse(root.dataset.rates || "{}") as RatesData;
	const rate = (p: string, m: string) => data.rates.find((r) => r.profile === p && r.modality === m)!;
	const hoursOut = $<HTMLOutputElement>("[data-bg-hours]", root)!;
	let hours = data.minHours;
	const update = () => {
		const profile = checked(root, '[data-bg="profile"]');
		const modality = checked(root, '[data-bg="modality"]');
		const days = $$<HTMLInputElement>('[data-bg="day"]:checked', root).map((d) => Number(d.value));
		const weekdays = days.filter((d) => d >= 1 && d <= 5).length;
		const weekend = days.length - weekdays;
		const perHour = modality === "por_hora";
		$<HTMLElement>("[data-bg-hours-group]", root)!.hidden = !perHour;
		hoursOut.textContent = String(hours);
		const r = rate(profile, modality);
		const mult = perHour ? hours : 1;
		const week = weekdays * r.price * mult + weekend * r.priceWeekend * mult;
		const month = Math.round((week * 52) / 12 / 1000) * 1000;
		animateNumber($<HTMLElement>("[data-bg-month]", root)!, month);
		$("[data-bg-week]", root)!.textContent = cop(week);
		const unit = perHour ? `${hours} h × ` : "";
		const lines: Array<[string, number]> = [];
		if (weekdays) lines.push([`${weekdays} ${weekdays === 1 ? "día" : "días"} entre semana · ${unit}${cop(r.price)}`, weekdays * r.price * mult]);
		if (weekend) lines.push([`${weekend} ${weekend === 1 ? "día" : "días"} de fin de semana · ${unit}${cop(r.priceWeekend)}`, weekend * r.priceWeekend * mult]);
		if (!lines.length) lines.push(["Elige al menos un día de la semana", 0]);
		$<HTMLElement>("[data-bg-lines]", root)!.replaceChildren(
			...lines.map(([label, value]) => {
				const li = document.createElement("li");
				const span = document.createElement("span");
				span.textContent = label;
				const b = document.createElement("b");
				b.textContent = value ? `${cop(value)}/sem.` : "";
				li.appendChild(span);
				li.appendChild(b);
				return li;
			}),
		);
		const mod = data.modalities[modality];
		const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
		const order = [1, 2, 3, 4, 5, 6, 0].filter((d) => days.includes(d)).map((d) => dayNames[d]).join(", ");
		const summary = `${data.profiles[profile]} · ${mod.label}${perHour ? ` de ${hours} h` : ""} · ${order || "sin días"} → ${cop(month)} al mes aprox.`;
		const wa = $<HTMLAnchorElement>("[data-bg-wa]", root)!;
		wa.dataset.waText = `Hola, calculé un presupuesto en la web: ${summary} ¿Me ayudan a confirmarlo?`;
		const number = (window as unknown as { svWhatsApp?: { number: string } }).svWhatsApp?.number;
		if (number) wa.href = `https://wa.me/${number}?text=${encodeURIComponent(wa.dataset.waText)}`;
		const quote = $<HTMLElement>("[data-bg-quote]", root)!;
		quote.dataset.service = mod.serviceName;
		quote.dataset.message = `Presupuesto calculado en la web: ${summary}`;
	};
	root.addEventListener("change", update);
	for (const b of $$<HTMLButtonElement>("[data-bg-step]", root)) {
		b.addEventListener("click", () => {
			hours = Math.min(12, Math.max(data.minHours, hours + Number(b.dataset.bgStep)));
			update();
		});
	}
	update();
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
