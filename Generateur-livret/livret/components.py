"""Registre et rendu HTML des composants pédagogiques."""

import html

from .inline import inline, make_qr, process


COMPONENT_LABELS = {
    "def": "Définition",
    "definition": "Définition",
    "regle": "Règle",
    "prop": "Propriété",
    "propriete": "Propriété",
    "methode": "Méthode",
    "exemple": "Exemple",
    "exercice": "Exercice",
    "rappel": "Je me souviens",
    "retenu": "J'ai retenu",
    "retenir": "À retenir",
    "a-retenir": "À retenir",
    "a_retenir": "À retenir",
    "defi": "Défi",
    "reussite": "Critères de réussite",
    "ressources": "Pour aller plus loin",
    "qr": "Ressource",
}

STRUCTURAL_COMPONENTS = {"couverture", "raw"}
KNOWN_COMPONENTS = frozenset((*COMPONENT_LABELS, *STRUCTURAL_COMPONENTS))


def render_table(rows, mode):
    def cells(row):
        return [cell.strip() for cell in row.strip().strip("|").split("|")]

    has_separator = (
        len(rows) > 1
        and set(rows[1].replace("|", "").replace("-", "").replace(":", "").strip())
        == set()
    )
    output = []
    start = 0
    if has_separator:
        output.append(
            "<tr>"
            + "".join(f"<th>{process(cell, mode)}</th>" for cell in cells(rows[0]))
            + "</tr>"
        )
        start = 2
    for row in rows[start:]:
        output.append(
            "<tr>"
            + "".join(f"<td>{process(cell, mode)}</td>" for cell in cells(row))
            + "</tr>"
        )
    return f'<table class="grid">{"".join(output)}</table>'


def lines_html(body, mode):
    output = []
    index = 0
    in_list = False
    while index < len(body):
        line = body[index]
        stripped = line.strip()
        if stripped.startswith("<svg"):
            if in_list:
                output.append("</ul>")
                in_list = False
            svg = [line]
            while "</svg>" not in line and index + 1 < len(body):
                index += 1
                line = body[index]
                svg.append(line)
            output.append("\n".join(svg))
            index += 1
            continue
        if stripped.startswith("|"):
            if in_list:
                output.append("</ul>")
                in_list = False
            rows = []
            while index < len(body) and body[index].strip().startswith("|"):
                rows.append(body[index].strip())
                index += 1
            output.append(render_table(rows, mode))
            continue
        if not stripped:
            if in_list:
                output.append("</ul>")
                in_list = False
            index += 1
            continue
        if stripped.startswith("- "):
            if not in_list:
                output.append("<ul>")
                in_list = True
            output.append(f"<li>{process(stripped[2:], mode)}</li>")
            index += 1
            continue
        if in_list:
            output.append("</ul>")
            in_list = False
        output.append(f"<p>{process(stripped, mode)}</p>")
        index += 1
    if in_list:
        output.append("</ul>")
    return "\n".join(output)


def _render_checklist(body, mode):
    items = "".join(
        f'<li><span class="case"></span>{process(line.strip(), mode)}</li>'
        for line in body
        if line.strip()
    )
    return f'<ul class="checklist">{items}</ul>'


def _render_resources(body):
    items = []
    for line in body:
        stripped = line.strip()
        if not stripped.startswith("- "):
            continue
        label, _, url = stripped[2:].partition("|")
        label, url = label.strip(), url.strip()
        qr_code = make_qr(url) if url else ""
        items.append(
            f'<li><span class="res-txt">{inline(label)}<br>'
            f'<span class="res-url">{html.escape(url)}</span></span>{qr_code}</li>'
        )
    return f'<ul class="ressources">{"".join(items)}</ul>'


def _render_qr(title, body, mode):
    url = title.strip()
    content = list(body)
    if not url and content:
        url = content.pop(0).strip()
    caption = lines_html(content, mode) if content else ""
    return f'<div class="qr-card">{caption}{make_qr(url) if url else ""}</div>'


def render_body(body, mode):
    """Rend les blocs d'un chapitre à partir du registre de composants."""
    parts = []
    for kind, data in body:
        if kind == "section":
            parts.append(f"<h2>{process(data, mode)}</h2>")
            continue
        if kind == "para":
            parts.append(lines_html(data, mode))
            continue
        if kind != "box":
            continue

        block_type, title, block_body = data
        if block_type == "raw":
            parts.append("\n".join(block_body))
            continue
        label = title or COMPONENT_LABELS.get(block_type, "")
        if block_type == "reussite":
            inner = _render_checklist(block_body, mode)
        elif block_type == "ressources":
            inner = _render_resources(block_body)
        elif block_type == "qr":
            inner = _render_qr(title, block_body, mode)
            label = COMPONENT_LABELS["qr"]
        else:
            inner = lines_html(block_body, mode)
        label_html = (
            f'<span class="box-label">{inline(label)}</span>' if label else ""
        )
        parts.append(
            f'<div class="box box-{block_type}">{label_html}{inner}</div>'
        )
    return "\n".join(parts)

