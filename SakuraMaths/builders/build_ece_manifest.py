#!/usr/bin/env python3
"""Construit le manifeste unique des sujets ECE 2024 et 2026."""

from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ECE = ROOT / "Studio" / "references" / "nsi" / "ece"
OLD_DASHBOARD = ROOT / "Studio" / "out" / "web" / "nsi" / "ece" / "dashboard.html"
OUT = ECE / "manifest-ece.json"
WEB_DATA = ROOT / "Studio" / "out" / "web" / "nsi" / "ece" / "ece-manifest-data.js"
INTERACTIVE_2026 = {1, 2, 3, 4, 5, 6, 7, 15}
CANONICAL_THEMES_2026 = {
    2: ["Dictionnaires", "Listes", "kNN", "Tests/débogage"],
    3: ["Dates", "Conditions", "Tests", "Chaînes de caractères"],
    4: ["POO", "Dictionnaires", "Listes", "Tests/débogage"],
}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", value))).strip()


def existing_titles() -> dict[str, str]:
    if not OLD_DASHBOARD.exists():
        return {}
    text = OLD_DASHBOARD.read_text(encoding="utf-8-sig", errors="replace")
    strong_rows = re.findall(r"<tr[^>]*>\s*<td class=\"cell-num\">(.*?)</td>\s*<td><strong>(.*?)</strong>", text, re.S)
    if strong_rows:
        return {clean(ref): clean(title) for ref, title in strong_rows}
    rows = re.findall(r"<tr[^>]*>\s*<td class=\"cell-num\">(.*?)</td>\s*<td>(.*?)</td>", text, re.S)
    return {clean(ref): clean(title) for ref, title in rows}


def existing_subjects() -> dict[str, dict]:
    if not OUT.exists():
        return {}
    try:
        data = json.loads(OUT.read_text(encoding="utf-8"))
        return {subject["id"]: subject for subject in data.get("sujets", [])}
    except (OSError, ValueError, KeyError):
        return {}


def themes_for(title: str) -> list[str]:
    rules = {
        "SQL": ("sql", "base de données", "sqlite"),
        "POO": ("classe", "objet", "poo", "simulation"),
        "Listes": ("liste", "tableau", "image"),
        "Dictionnaires": ("dictionnaire", "carbone", "budget"),
        "Récursivité": ("récurs",),
        "Graphes": ("graphe", "chemin", "évacuation"),
        "Fichiers/CSV": ("csv", "fichier", "kml"),
        "Tests/débogage": ("bug", "erreur", "test"),
        "Binaire": ("binaire", "bcd", "parité", "qr"),
    }
    low = title.lower()
    return [theme for theme, words in rules.items() if any(word in low for word in words)]


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def subject_2026(folder: Path, titles: dict[str, str], previous: dict[str, dict]) -> dict:
    number = int(re.search(r"(\d+)$", folder.name).group(1))
    ref = f"26-{number:02d}"
    files = sorted(p for p in folder.iterdir() if p.is_file())
    pdf = next((p for p in files if p.suffix.lower() == ".pdf"), None)
    title = previous.get(ref, {}).get("titre") or titles.get(ref, f"Sujet ECE 2026 n°{number}")
    return {
        "id": ref,
        "annee": 2026,
        "numero": number,
        "titre": title,
        "themes": CANONICAL_THEMES_2026.get(number) or previous.get(ref, {}).get("themes") or themes_for(title),
        "statut": "interactive" if number in INTERACTIVE_2026 else "reference",
        "sourcePdf": rel(pdf) if pdf else None,
        "dossier": rel(folder),
        "fichiers": [rel(p) for p in files],
        "zip": f"Studio/references/nsi/ece/zip/2026/{folder.name}.zip",
        "entrainement": "Studio/out/web/nsi/ece/index.html" if number in INTERACTIVE_2026 else None,
        "professeur": "Studio/out/web/nsi/ece/prof.html" if number in INTERACTIVE_2026 else None,
        "eleves": "Studio/out/web/nsi/ece/eleves.html" if number in INTERACTIVE_2026 else None,
    }


def subject_2024(number: int, titles: dict[str, str], previous: dict[str, dict]) -> dict:
    ref = f"24-{number:02d}"
    base = ECE / "2024"
    files = [p for p in (base / f"24_NSI_{number:02d}.pdf", base / f"24_NSI_{number:02d}.py") if p.exists()]
    pdf = next((p for p in files if p.suffix.lower() == ".pdf"), None)
    title = previous.get(ref, {}).get("titre") or titles.get(ref, f"Sujet ECE 2024 n°{number}")
    return {
        "id": ref,
        "annee": 2024,
        "numero": number,
        "titre": title,
        "themes": previous.get(ref, {}).get("themes") or themes_for(title),
        "statut": "reference",
        "sourcePdf": rel(pdf) if pdf else None,
        "dossier": rel(base),
        "fichiers": [rel(p) for p in files],
        "zip": f"Studio/references/nsi/ece/zip/2024/24_NSI_{number:02d}.zip",
        "entrainement": None,
        "professeur": None,
        "eleves": None,
    }


def main() -> None:
    titles = existing_titles()
    previous = existing_subjects()
    subjects = [subject_2026(p, titles, previous) for p in sorted((ECE / "2026").iterdir(), key=lambda p: int(re.search(r"(\d+)$", p.name).group(1))) if p.is_dir()]
    subjects += [subject_2024(number, titles, previous) for number in range(1, 49)]
    manifest = {
        "schemaVersion": 1,
        "description": "Banque ECE NSI officielle. Les sujets 2025 réemploient les sujets 2024 dans un ordre différent.",
        "annees": [2024, 2026],
        "total": len(subjects),
        "sujets": subjects,
    }
    OUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    WEB_DATA.parent.mkdir(parents=True, exist_ok=True)
    WEB_DATA.write_text("window.ECE_MANIFEST_DATA = " + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"Manifeste ECE : {OUT} ({len(subjects)} sujets)")


if __name__ == "__main__":
    main()
