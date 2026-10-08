"""Crea el mapa del sitio de sovialis.com en Octopus.do desde docs/research/sitemap.json.

Uso: OCTOPUS_API_KEY=... python3 scripts/octopus-sitemap.py [--dry] [--project UUID]
"""
import hashlib, json, os, re, sys, urllib.request, urllib.error

OCT = "https://openapi.octopus.do"
KEY = os.environ["OCTOPUS_API_KEY"]
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "research", "sitemap.json")
DRY = "--dry" in sys.argv
PROJECT = sys.argv[sys.argv.index("--project") + 1] if "--project" in sys.argv else None
LIVE_AUTHOR = "/autores/equipo-sovialis/"


def call(method, path, body=None):
    req = urllib.request.Request(
        f"{OCT}{path}",
        data=json.dumps(body).encode() if body is not None else None,
        headers={"X-API-Key": KEY, "Content-Type": "application/json", "Accept": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:1500])
        raise


def batch(project, ops, tag):
    key = "sv-" + hashlib.sha1(json.dumps(ops, sort_keys=True).encode()).hexdigest()[:20] + ("-dry" if DRY else "")
    res = call("POST", f"/v1/projects/{project}/batch", {"operations": ops, "dry_run": DRY, "idempotency_key": key})
    print(tag, "ok" if res.get("ok") else res, "warnings:", len(res.get("warnings") or []))
    return res


def nid(url):
    slug = re.sub(r"[^a-z0-9]+", "-", url.strip("/").lower()).strip("-") or "inicio"
    return f"sv-n-{slug}"[:60]


COLORS = [
    ("sv-c-core", "#0B2A4E", "Núcleo e institucional"),
    ("sv-c-serv", "#005E9D", "Servicios (transaccional)"),
    ("sv-c-zona", "#00A6D6", "Zonas del norte de Bogotá"),
    ("sv-c-blog", "#F08A65", "Blog / guías"),
    ("sv-c-legal", "#6B7280", "Legal y utilidad (noindex)"),
]
TYPE_COLOR = {
    "home": "sv-c-core", "hub-servicios": "sv-c-serv", "servicio-perfil": "sv-c-serv", "servicio-horario": "sv-c-serv",
    "servicio-necesidad": "sv-c-serv", "precios": "sv-c-serv", "proceso": "sv-c-core", "empresa": "sv-c-core",
    "reclutamiento": "sv-c-core", "contacto": "sv-c-core", "hub-zonas": "sv-c-zona", "zona": "sv-c-zona",
    "hub-blog": "sv-c-blog", "categoria-blog": "sv-c-blog", "blog-cornerstone": "sv-c-blog", "blog-apoyo": "sv-c-blog",
    "legal": "sv-c-legal", "autor": "sv-c-core", "utilidad": "sv-c-legal",
}
SERVICE_BLOCKS = [
    ("Hero dividido + formulario de 3 campos", "Chip de precio «desde» · CTA WhatsApp · confianza", ["breadcrumbs", "text_and_sidebar_form"]),
    ("Franja de imágenes", "3 fotos del servicio", ["triple"]),
    ("Qué incluye / para quién", "Bloques editables desde EmDash", ["features_triple"]),
    ("Cómo funciona", "Pasos: conversación → plan → persona verificada → seguimiento", ["steps"]),
    ("Tarifas de referencia", "Precios finales con IVA (tarifas del panel)", ["pricing"]),
    ("Preguntas frecuentes", "FAQ única de la URL (FAQPage)", ["faq"]),
    ("Servicios relacionados + zonas", "Enlazado interno", ["cards", "bullet_points"]),
    ("Cierre con CTA", "Cotizar · WhatsApp · llamar", ["cta"]),
]
BLOCKS = {
    "home": [
        ("Hero estático dividido", "H1 indexable + atajos «¿Qué necesita tu familiar?» (sin slider)", ["text_on_image", "cards"]),
        ("Barra de confianza", "Personas verificadas · reemplazo en el plazo acordado · plan por escrito", ["features_quarter"]),
        ("Servicios por turno y por necesidad", "Tarjetas con precio desde", ["cards", "tabs"]),
        ("Cómo funciona", "", ["steps"]),
        ("Cobertura norte de Bogotá", "Mapa + zonas", ["map", "bullet_points"]),
        ("Precios de referencia", "", ["pricing"]),
        ("Guías recientes", "", ["articles_3"]),
        ("Preguntas frecuentes", "Genéricas, sin canibalizar servicios", ["faq"]),
        ("CTA final", "", ["cta"]),
    ],
    "hub-servicios": [("Encabezado", "", ["title_center"]), ("Servicios agrupados", "Por turno / por necesidad", ["cards", "cards"]), ("Comparativa", "Cuidadora vs auxiliar", ["table"]), ("FAQ", "", ["faq"]), ("CTA", "", ["cta"])],
    "precios": [("Encabezado", "", ["title_center"]), ("Tarjetas de tarifas", "Por horas · 8 h · 12 h · 24 h", ["pricing"]), ("Tabla completa", "Cuidadora y auxiliar, día/noche, recargos", ["table"]), ("FAQ de precios", "", ["faq"]), ("CTA", "", ["cta"])],
    "proceso": [("Encabezado", "", ["title_center"]), ("Pasos", "", ["steps", "timeline"]), ("Garantías", "", ["features_triple"]), ("FAQ", "", ["faq"]), ("CTA", "", ["cta"])],
    "empresa": [("Historia y propósito", "«Vínculos que protegen»", ["text_on_image"]), ("Equipo", "Foto real pendiente", ["team"]), ("Cómo seleccionamos", "", ["features_triple"]), ("CTA", "", ["cta"])],
    "reclutamiento": [("Encabezado", "Vocabulario de prestación de servicios (sin «empleo»)", ["title_left"]), ("Requisitos", "", ["bullet_points"]), ("Formulario", "", ["form"]), ("FAQ", "", ["faq"])],
    "contacto": [("Contacto", "Formulario + WhatsApp + teléfono", ["text_and_form", "messengers"]), ("Cobertura", "", ["map"]), ("FAQ", "", ["faq"])],
    "hub-zonas": [("Encabezado", "", ["title_center"]), ("Mapa de cobertura", "", ["map_2"]), ("Zonas", "Buscador + tarjetas", ["searchbar", "cards"]), ("FAQ", "", ["faq"]), ("CTA", "", ["cta"])],
    "zona": [
        ("Hero de zona", "Badges: personas verificadas · relevos coordinados · cobertura confirmada", ["breadcrumbs", "text_on_image"]),
        ("Cómo trabajamos en la zona", "Aside con clínicas y lugares de referencia", ["text_and_sidebar_form"]),
        ("Barrios que atendemos", "", ["bullet_points_double"]),
        ("Servicios disponibles", "", ["cards"]),
        ("Mapa", "", ["map"]),
        ("FAQ local", "", ["faq"]),
        ("CTA", "", ["cta"]),
    ],
    "hub-blog": [("Encabezado", "", ["title_center"]), ("Categorías", "", ["filter"]), ("Guías", "", ["articles_3", "pagination"])],
    "categoria-blog": [("Encabezado", "noindex hasta tener 4 guías", ["title_left"]), ("Guías de la categoría", "", ["articles_2", "pagination"])],
    "blog": [
        ("Encabezado del artículo", "Migas, autor, fechas, tiempo de lectura", ["breadcrumbs", "title_left", "image"]),
        ("Resumen + índice", "En resumen · TOC lateral fijo", ["text_and_sidebar_form", "table_of_contents"]),
        ("Cuerpo", "H2 con palabras clave; tablas", ["text", "table"]),
        ("CTA contextual", "", ["cta_right"]),
        ("FAQ", "", ["faq"]),
        ("Valoración con estrellas", "Alimenta aggregateRating", ["rating"]),
        ("Comentarios nativos EmDash", "", ["post_thread"]),
        ("Autor + relacionados", "", ["profile", "articles_3"]),
    ],
    "legal": [("Texto legal", "", ["title_left", "text"])],
    "autor": [("Perfil", "Pendiente: autor/revisor real con credenciales", ["profile"]), ("Guías del autor", "", ["articles_2"])],
    "utilidad": [("Contenido", "", ["title_center", "messengers"])],
}


def blocks_for(t):
    if t.startswith("servicio-"):
        return SERVICE_BLOCKS
    if t.startswith("blog-"):
        return BLOCKS["blog"]
    return BLOCKS[t]


def page_ops(p, tab_id):
    url = LIVE_AUTHOR if p["type"] == "autor" else p["url"]
    parent = p["parent"]
    v2 = p["priority"] == "v2"
    idx = p.get("indexable", True)
    title = (p.get("h1") or p["title"]).split(" | ")[0]
    if p["url"] == "/404/":
        title = "Página no encontrada (404)"
    ops = [{"operation": "nodes.create", "data": {
        "parent_id": nid(parent) if parent else tab_id, "id": nid(url), "title": title[:120], "url": url,
        "color_id": TYPE_COLOR[p["type"]], "variant": "ghost" if v2 else "default",
    }}]
    h2 = "\n".join(f"- {h}" for h in p.get("h2") or [])
    faqs = "\n".join(f"- {f['q']}" for f in (p.get("faqs") or [])[:8])
    links = "\n".join(f"- [{l['anchor']}]({l['url']})" if isinstance(l, dict) else f"- {l}" for l in (p.get("internalLinks") or []))[:1200]
    schema = ", ".join(p["schema"]) if isinstance(p.get("schema"), list) else str(p.get("schema") or "")
    cta = p.get("cta") if isinstance(p.get("cta"), str) else json.dumps(p.get("cta"), ensure_ascii=False) if p.get("cta") else ""
    note = (
        f"**{'Fase 2 (pendiente)' if v2 else 'Publicada en v1'}** · plantilla `{p['type']}`"
        f"{'' if idx else ' · **noindex**'}\n\n"
        f"**Keyword principal:** {p.get('primaryKeyword') or '—'} ({p.get('primaryVolume') or 0}/mes)\n\n"
        + (f"**H2:**\n{h2}\n\n" if h2 else "")
        + (f"**FAQ:**\n{faqs}\n\n" if faqs else "")
        + (f"**Schema:** {schema}\n\n" if schema else "")
        + (f"**CTA:** {cta}\n\n" if cta else "")
        + (f"**Enlaces internos:**\n{links}" if links else "")
    )
    ops.append({"operation": "nodes.update", "data": {"id": nid(url), "notes": {
        "note": note[:4000],
        "keywords": ", ".join([p.get("primaryKeyword") or ""] + (p.get("secondaryKeywords") or []))[:1000],
        "page_intent": p.get("intent") or "",
        "seo_title": p["title"],
        "seo_description": p.get("metaDescription") or "",
        "seo_h1": p.get("h1") or "",
        "seo_slug": url.strip("/").split("/")[-1] if url != "/" else "",
        "seo_url": f"https://sovialis.com{url}",
    }}})
    for i, (bt, content, wf) in enumerate(blocks_for(p["type"])):
        ops.append({"operation": "blocks.create", "data": {"node_id": nid(url), "title": bt, "content": content, "wireframes": wf}})
    ops.append({"operation": "tags.assign_node", "data": {"id": "sv-t-fase2" if v2 else "sv-t-live", "node_id": nid(url)}})
    return ops


def main():
    data = json.load(open(SRC))
    project = PROJECT
    if not project:
        if DRY:
            sys.exit("Para --dry pasa --project de un proyecto existente o crea primero.")
        res = call("POST", "/v1/projects/create", {"idempotency_key": "sovialis-sitemap-v1-create"})
        project = res.get("project_id") or res.get("uuid") or (res.get("entity") or {}).get("id")
        print("PROJECT", project, json.dumps(res)[:400])
    outline = call("GET", f"/v1/projects/{project}?view=outline&format=nested")
    starters = [pg["id"] for t in outline.get("tabs", []) for s in t.get("sections", []) for pg in s.get("pages", []) if not str(pg["id"]).startswith("sv-")]
    first_tab = outline["tabs"][0]["id"]
    first_section = outline["tabs"][0]["sections"][0]["id"] if outline["tabs"][0].get("sections") else None
    print("tab", first_tab, "section", first_section, "starters", starters)

    base = [
        {"operation": "settings.update", "data": {"title": "sovialis.com — Arquitectura SEO v1 (2026-10)", "theme": "light", "tree": "map", "frame": "web", "legend_position": "bottom"}},
        *[{"operation": "colors.create", "data": {"id": cid, "hex_code": hx, "title": t, "show_in_legend": True}} for cid, hx, t in COLORS],
        {"operation": "tags.create", "data": {"id": "sv-t-live", "title": "Publicada (v1)", "color_id": "sv-c-serv"}},
        {"operation": "tags.create", "data": {"id": "sv-t-fase2", "title": "Fase 2"}},
        {"operation": "symbols.create", "data": {"id": "sv-s-header", "title": "Header global", "content": "Barra de anuncio · logo · mega menú Servicios/Zonas · Precios · Cómo funciona · Guías · Nosotros · WhatsApp · Cotiza en 2 minutos", "wireframes": ["header"]}},
        {"operation": "symbols.create", "data": {"id": "sv-s-footer", "title": "Footer global", "content": "NAP · servicios · zonas · empresa · legales · preferencias de cookies", "wireframes": ["footer"]}},
        {"operation": "symbols.create", "data": {"id": "sv-s-wa", "title": "WhatsApp + barra móvil", "content": "FAB con halos y etiqueta (escritorio) · barra fija llamar + WhatsApp (móvil) · configurable en el plugin", "wireframes": ["messengers", "mobile_bottom_bar"]}},
        {"operation": "tabs.update", "data": {"id": first_tab, "title": "Sitio público"}},
    ]
    if first_section:
        base.append({"operation": "sections.update", "data": {"id": first_section, "title": "sovialis.com"}})
    base += [
        {"operation": "sticky_notes.create", "data": {"tab_id": first_tab, "content": "**Reglas de contenido**\n- Sin IPS: no anunciar «enfermería a domicilio» ni procedimientos en páginas transaccionales.\n- Énfasis norte/noroccidente de Bogotá; nunca mencionar el sur.\n- Precios finales con IVA, «desde».\n- FAQ únicas por URL (sin canibalización).", "color": "yellow", "x": 40, "y": 40, "width": 320, "height": 200}},
        {"operation": "sticky_notes.create", "data": {"tab_id": first_tab, "content": "**Leyenda**\n- Páginas sólidas: publicadas (v1, 47 URLs).\n- Páginas fantasma: fase 2 (24 URLs).\n- Header, footer y WhatsApp son símbolos globales.", "color": "cyan", "x": 380, "y": 40, "width": 280, "height": 160}},
        {"operation": "external_links.create", "data": {"tab_id": first_tab, "title": "Sitio en producción", "url": "https://sovialis.com/", "x": 680, "y": 40}},
    ]
    batch(project, base, "base")

    ops_pages, current = [], []
    for p in data["pages"]:
        ops = page_ops(p, first_tab)
        if p["url"] == "/":
            ops[2:2] = [
                {"operation": "blocks.create", "data": {"node_id": nid("/"), "id": "sv-b-home-h", "title": "Header", "wireframes": ["header"]}},
                {"operation": "blocks.link_symbol", "data": {"id": "sv-b-home-h", "symbol_id": "sv-s-header"}},
            ]
            ops += [
                {"operation": "blocks.create", "data": {"node_id": nid("/"), "id": "sv-b-home-wa", "title": "WhatsApp", "wireframes": ["messengers"]}},
                {"operation": "blocks.link_symbol", "data": {"id": "sv-b-home-wa", "symbol_id": "sv-s-wa"}},
                {"operation": "blocks.create", "data": {"node_id": nid("/"), "id": "sv-b-home-f", "title": "Footer", "wireframes": ["footer"]}},
                {"operation": "blocks.link_symbol", "data": {"id": "sv-b-home-f", "symbol_id": "sv-s-footer"}},
            ]
        if len(current) + len(ops) > 100:
            ops_pages.append(current)
            current = []
        current += ops
    ops_pages.append(current)
    for i, ops in enumerate(ops_pages):
        batch(project, ops, f"pages {i + 1}/{len(ops_pages)} ({len(ops)} ops)")

    if starters and not DRY:
        batch(project, [{"operation": "nodes.delete", "data": {"id": s}} for s in starters], "cleanup")
    print("PROJECT", project)


main()
