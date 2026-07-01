#!/usr/bin/env python3
"""Construit un livret de période unique depuis les sources Markdown SakuraMaths."""

from __future__ import annotations

import argparse
import html
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT / "Studio"


def resolve_path(value: str | Path, base: Path = ROOT) -> Path:
    """Accepte les chemins depuis SakuraMaths ou depuis son dossier parent."""
    path = Path(value).expanduser()
    candidates = [path, Path.cwd() / path, base / path]
    parts = path.parts
    if parts and parts[0].lower() == ROOT.name.lower():
        candidates.append(ROOT.joinpath(*parts[1:]))
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    if parts and parts[0].lower() == ROOT.name.lower():
        return ROOT.joinpath(*parts[1:]).resolve()
    return (base / path).resolve()


def load_renderer():
    script = STUDIO / "scripts" / "build_livret.py"
    spec = importlib.util.spec_from_file_location("sakuramaths_chapter_builder", script)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Impossible de charger {script}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def period_id(label: str) -> str:
    digits = "".join(c for c in label if c.isdigit())
    return f"P{digits or '1'}"


def infer_level(data: dict, manifest_path: Path, explicit: str | None = None) -> str:
    if explicit or data.get("niveau"):
        return str(explicit or data["niveau"])
    values = [data.get("progression"), data.get("cover"), manifest_path.name]
    values += [item.get("source") for item in data.get("chapitres", [])]
    for value in values:
        if not value:
            continue
        match = re.search(r"(?:progression-|cover-|sources[/\\])([0-9]+e)", str(value), re.I)
        if match:
            return match.group(1).lower()
        match = re.match(r"([0-9]+)e?", Path(str(value)).stem, re.I)
        if match:
            return f"{match.group(1)}e"
    raise SystemExit("Niveau impossible à déduire du manifeste ou des sources.")


def level_prefix(niveau: str) -> str:
    match = re.match(r"([0-9]+)", niveau)
    return match.group(1) if match else ""


def chapter_source(item: dict, niveau: str) -> Path:
    if item.get("source"):
        path = resolve_path(item["source"])
        if path.exists():
            return path
    code = str(item.get("code", "")).upper()
    prefix = level_prefix(niveau)
    full_code = code if code.startswith(prefix) else f"{prefix}{code}"
    exact = STUDIO / "sources" / niveau / f"{full_code}.md"
    if exact.exists():
        return exact
    matches = sorted((STUDIO / "sources" / niveau).glob(f"{full_code}*.md"))
    if not matches:
        raise FileNotFoundError(f"Source Markdown introuvable pour {code} ({niveau})")
    return matches[0]


def cover_html(cover: Path, chapters: list[dict], niveau: str, periode: str,
               annee: str, prof: str, mode: str, footer: str,
               pages: dict[str, int] | None = None) -> str:
    pages = pages or {}
    entries = []
    for item in chapters:
        code = html.escape(str(item.get("code", "")))
        title = html.escape(str(item.get("titre") or item.get("title") or code))
        page = pages.get(str(item.get("code", "")).upper(), "")
        entries.append(f'<li><b>{code}</b><span>{title}</span><i></i><em>{page}</em></li>')
    student_class = " cover-eleve" if mode == "eleve" else " cover-prof"
    return f"""
<section class="period-cover{student_class}" style="background-image:url('{cover.as_uri()}')">
  <div class="cover-period">{html.escape(periode)}</div>
  <ol class="cover-summary">{''.join(entries)}</ol>
  <div class="cover-meta"><b>ANNÉE SCOLAIRE : {html.escape(annee)}</b><span>{html.escape(prof)}</span><i class="cover-blossom" aria-hidden="true">✿</i></div>
</section>
"""


def period_css(footer: str) -> str:
    safe = footer.replace("'", "’")
    return f"""
@page cover {{ size:A4; margin:0; }}
@page {{
  size:A4; margin:17mm 15mm 16mm;
  @bottom-left {{
    content:'{safe}'; font-family:'TitleC','DejaVu Sans',sans-serif;
    font-size:7.4pt; font-weight:600; color:#8c78a5;
  }}
  @bottom-right {{
    content:'❀  ' counter(page) '  ❀'; font-family:'Round','DejaVu Sans',sans-serif;
    font-size:8pt; font-weight:700; color:#6f6290; background:transparent;
    padding:0;
  }}
}}
.period-cover {{ page:cover; position:relative; width:210mm; height:297mm;
  margin:0; padding:0; background-size:cover; background-position:center; break-after:page; }}
.cover-period {{ position:absolute; top:66.7%; left:50%; transform:translateX(-50%);
  padding:2.2mm 10mm; border-radius:999px; background:rgba(255,255,255,.94);
  color:#594da7; font:700 15pt 'Round','DejaVu Sans',sans-serif; letter-spacing:.4px;
  box-shadow:0 1.2mm 3mm rgba(76,63,140,.16); }}
.cover-summary {{ position:absolute; left:12.5%; right:12.5%; top:72.7%; margin:0;
  padding:0; list-style:none; color:#263f84; font:600 10.5pt 'Atkinson','DejaVu Sans',sans-serif; }}
.cover-summary li {{ display:grid; grid-template-columns:13mm auto 1fr 8mm; gap:2mm; align-items:baseline;
  padding:1.25mm 2mm; }}
.cover-summary b {{ color:#6656ba; font-family:'Round','DejaVu Sans',sans-serif; }}
.cover-summary span {{ text-align:left; }}
.cover-summary i {{ border-bottom:.35mm dotted rgba(89,77,167,.45); min-width:8mm; }}
.cover-summary em {{ color:#594da7; font-style:normal; font-weight:800; text-align:right; }}
.cover-meta {{ position:absolute; left:15%; right:13%; bottom:4.2mm; display:flex;
  justify-content:center; gap:8mm; align-items:center; padding:3mm 5mm;
  color:#594da7; background:#fff; border-radius:999px;
  font:600 9.2pt 'Atkinson','DejaVu Sans',sans-serif; }}
.cover-meta b {{ font-weight:700; }}
.cover-blossom {{ color:#ea8db7; font-style:normal; font-size:14pt; line-height:1;
  text-shadow:0 .35mm .5mm rgba(179,81,127,.16); }}
.period-cover + .chapitre {{ break-before:page; }}
.chapter-page-marker {{ display:block; height:1pt; color:white; font-size:1pt; line-height:1pt; }}
"""


def write_pdf(renderer, document: str, output: Path) -> None:
    """Utilise WeasyPrint en priorité, puis Chrome/Edge en repli local."""
    if output.exists():
        try:
            output.unlink()
        except PermissionError:
            raise SystemExit(f"Ferme le PDF déjà ouvert avant de le régénérer : {output}")
    if renderer.HTML is not None:
        renderer.HTML(string=document, base_url=str(ROOT)).write_pdf(str(output))
        return
    browsers = [
        shutil.which("chrome"), shutil.which("msedge"),
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    ]
    browser = next((Path(p) for p in browsers if p and Path(p).exists()), None)
    if browser is None:
        raise SystemExit("Installe WeasyPrint ou Chrome pour générer le PDF.")
    temp_root = ROOT / "tmp" / "pdfs"
    temp_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="livret-", dir=temp_root) as folder:
        folder_path = Path(folder)
        html_file = folder_path / f"{output.stem}.html"
        profile = folder_path / "chrome-profile"
        html_file.write_text(document, encoding="utf-8")
        command = [
            str(browser), "--headless", "--no-sandbox", "--disable-gpu", "--disable-crash-reporter",
            "--disable-breakpad", "--no-pdf-header-footer",
            "--allow-file-access-from-files", f"--user-data-dir={profile}",
            f"--print-to-pdf={output}", html_file.as_uri(),
        ]
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode:
            detail = (result.stderr or result.stdout or "erreur Chrome inconnue").strip()
            raise RuntimeError(f"Chrome n'a pas pu générer le PDF : {detail}")


def prepare_source(renderer, path: Path, item: dict, niveau: str, progression: dict) -> str:
    """Ajoute un en-tête SakuraMaths aux anciens exports Google Docs."""
    source = renderer.load_source(path)
    if re.search(r"(?m)^#\s+[^|\n]+\|[^\n]+\|", source):
        return source
    code = str(item.get("code", "")).upper()
    title = str(item.get("titre") or item.get("title") or progression.get(code, {}).get("title") or code)
    comps = item.get("comps") or progression.get(code, {}).get("comps") or []
    if isinstance(comps, str):
        comps = [part.strip() for part in comps.split(",") if part.strip()]
    clean = []
    for line in source.splitlines():
        if re.match(r"^\s*!\[\]\[image\d+\]\s*$", line):
            continue
        if re.match(r"^\[image\d+\]:\s*<data:image/", line):
            continue
        line = re.sub(r"\[!\[\]\[image\d+\]\]\((https?://[^)]+)\)", r"[qr:\1]", line)
        line = re.sub(r"!\[\]\[image\d+\]", "", line)
        line = re.sub(r"^\s*\d+\.\s*#+\s*", "## ", line)
        clean.append(line)
    header = f"# {code} | {title} | {niveau} | {', '.join(comps)}"
    return header + "\n\n" + "\n".join(clean).strip() + "\n"


def chapter_pages(pdf: Path, chapters: list[dict]) -> dict[str, int]:
    """Repère la première page de chaque chapitre dans le PDF de première passe."""
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise SystemExit("Le sommaire paginé nécessite pypdf : pip install pypdf") from exc
    reader = PdfReader(str(pdf)); result = {}; start = 1
    for item in chapters:
        code = str(item.get("code", "")).upper()
        for index in range(start, len(reader.pages)):
            text = (reader.pages[index].extract_text() or "").upper()
            if f"SAKURA_CHAPTER_{code}" in text:
                result[code] = index + 1; start = index; break
    return result


def mark_chapters(body: str, chapters: list[dict]) -> str:
    iterator = iter(chapters)
    def marker(match):
        item = next(iterator, {})
        code = str(item.get("code", "")).upper()
        return match.group(0) + f'<span class="chapter-page-marker">SAKURA_CHAPTER_{code}</span>'
    return re.sub(r'<div class="chapitre[^>]*>', marker, body)


def output_paths(output: Path, mode: str) -> dict[str, Path]:
    if mode != "both":
        return {mode: output}
    name = output.name
    if "-eleve" in name:
        return {"eleve": output, "prof": output.with_name(name.replace("-eleve", "-prof"))}
    if "-prof" in name:
        return {"prof": output, "eleve": output.with_name(name.replace("-prof", "-eleve"))}
    return {m: output.with_name(f"{output.stem}-{m}{output.suffix}") for m in ("eleve", "prof")}


def main() -> None:
    parser = argparse.ArgumentParser(description="Génère un livret de période avec pagination globale")
    parser.add_argument("--manifest", required=True, help="manifeste JSON produit par le sélecteur")
    parser.add_argument("--niveau")
    parser.add_argument("--periode")
    parser.add_argument("--annee")
    parser.add_argument("--prof")
    parser.add_argument("--mode", choices=["eleve", "prof", "both"], default=None,
                        help="remplace le mode du manifeste (both par défaut)")
    parser.add_argument("--cover")
    parser.add_argument("--out", required=True)
    parser.add_argument("--police", choices=["atkinson", "opensans", "opendyslexic"], default="atkinson")
    parser.add_argument("--taille", type=float, default=11)
    parser.add_argument("--interligne", type=float, default=1.45)
    parser.add_argument("--couleur", choices=["couleur", "nb"], default="couleur")
    args = parser.parse_args()

    manifest_path = resolve_path(args.manifest)
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    niveau = infer_level(data, manifest_path, args.niveau)
    periode = args.periode or data.get("periode", "Période 1")
    annee = args.annee or data.get("annee", "2026-2027")
    prof = args.prof or data.get("prof", "Mme Le Guern")
    mode = args.mode or data.get("mode") or "both"
    chapters = data.get("chapitres", [])
    if not chapters:
        raise SystemExit("Le manifeste ne contient aucun chapitre.")

    default_cover = ROOT / "assets" / "covers" / f"cover-{niveau}.png"
    cover = resolve_path(args.cover or data.get("cover") or default_cover)
    if not cover.exists():
        raise FileNotFoundError(f"Couverture introuvable : {cover}")

    renderer = load_renderer()
    pont = STUDIO / "config" / f"pont-livret-{niveau}.json"
    if not pont.exists():
        pont = ROOT / "Progressions" / f"pont-livret-{niveau}.json"
    if pont.exists():
        raw_pont = json.loads(pont.read_text(encoding="utf-8"))
        renderer.PONT = {item["code"]: item for item in raw_pont.get("sequences", [])}

    progression_path = STUDIO / "config" / f"progression-{niveau}.json"
    if not progression_path.exists():
        progression_path = ROOT / "Progressions" / f"progression-{niveau}.json"
    progression_data = json.loads(progression_path.read_text(encoding="utf-8")) if progression_path.exists() else {}
    progression = {str(item.get("code", "")).upper(): item for item in progression_data.get("seq", [])}
    sources = [chapter_source(item, niveau) for item in chapters]
    source_text = "\n\n".join(prepare_source(renderer, path, item, niveau, progression)
                                    for path, item in zip(sources, chapters))
    blocks = renderer.parse(source_text)
    _unused_cover, recognized = renderer.split_chapters(blocks)
    if not recognized:
        raise SystemExit("Aucun chapitre reconnu : vérifie les en-têtes Markdown '# CODE | titre | niveau | compétences'.")
    if len(recognized) != len(chapters):
        raise SystemExit(f"{len(recognized)} chapitre(s) reconnu(s) sur {len(chapters)} demandé(s).")
    output = resolve_path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    generated = {}
    for current_mode, current_output in output_paths(output, mode).items():
        chapter_body = mark_chapters(renderer.render(blocks, current_mode), chapters)
        footer = f"Maths Livret {niveau} - {periode} - {annee} - {prof}"
        css = renderer.build_print_css(args.police, args.taille, args.interligne, args.couleur, "") + period_css(footer)
        first_cover = cover_html(cover, chapters, niveau, periode, annee, prof, current_mode, footer)
        first_pdf = current_output.with_name(f".{current_output.stem}-pass1.pdf")
        write_pdf(renderer, renderer.html_doc(first_cover + chapter_body, css,
                                               title=current_output.stem), first_pdf)
        pages = chapter_pages(first_pdf, chapters)
        try:
            first_pdf.unlink()
        except OSError:
            pass
        final_cover = cover_html(cover, chapters, niveau, periode, annee, prof, current_mode, footer, pages)
        write_pdf(renderer, renderer.html_doc(final_cover + chapter_body, css,
                                               title=current_output.stem), current_output)
        generated[current_mode] = {"pdf": current_output, "pages": pages}
        print(f"Livret {current_mode} généré : {current_output}")

    web_dir = STUDIO / "out" / "web"
    web_dir.mkdir(parents=True, exist_ok=True)
    for item, source in zip(chapters, sources):
        code = str(item.get("code", "")).upper()
        prefix = level_prefix(niveau)
        full_code = code if code.startswith(prefix) else f"{prefix}{code}"
        single_blocks = renderer.parse(prepare_source(renderer, source, item, niveau, progression))
        for current_mode in ("eleve", "prof"):
            web_name = f"{full_code}.html" if current_mode == "eleve" else f"{full_code}-prof.html"
            web_path = web_dir / web_name
            web_path.write_text(renderer.html_doc(renderer.render(single_blocks, current_mode),
                                                   renderer.build_web_css(args.police), web=True), encoding="utf-8")
            item.setdefault("html", {})[current_mode] = str(web_path.relative_to(ROOT)).replace("\\", "/")
        item["source"] = str(source.relative_to(ROOT)).replace("\\", "/")
        item["comps"] = item.get("comps") or progression.get(code, {}).get("comps", [])
        item["pages"] = {m: info["pages"].get(code) for m, info in generated.items()}

    data.update({"schema": "sakuramaths.livret-periode.v2", "niveau": niveau,
                 "periode": periode, "periode_id": period_id(periode), "annee": annee,
                 "prof": prof, "mode": "both" if mode == "both" else mode,
                 "progression": str(progression_path.relative_to(ROOT)).replace("\\", "/")
                 if progression_path.exists() else f"Studio/config/progression-{niveau}.json",
                 "cover": str(cover.relative_to(ROOT)).replace("\\", "/"), "chapitres": chapters})
    if "eleve" in generated:
        data["livret"] = str(generated["eleve"]["pdf"].relative_to(ROOT)).replace("\\", "/")
    if "prof" in generated:
        data["livret_prof"] = str(generated["prof"]["pdf"].relative_to(ROOT)).replace("\\", "/")
    manifest_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    dashboard = ROOT / "builders" / "build_dashboard.py"
    if dashboard.exists():
        subprocess.run([sys.executable, str(dashboard)], check=True)

    print("Sources : " + ", ".join(path.name for path in sources))
    print("Chapitres : " + ", ".join(item.get("code", "") for item in chapters))


if __name__ == "__main__":
    main()
