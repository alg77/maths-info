#!/usr/bin/env python3
"""Génère le squelette des liens Drive depuis les progressions SakuraMaths."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT / "Studio"
OUTPUT = ROOT / "curriculum" / "ressources" / "drive-prof.json"


def progression_files() -> list[Path]:
    found: dict[str, Path] = {}
    for folder in (ROOT / "Progressions", STUDIO / "config"):
        if folder.exists():
            for path in folder.glob("progression-*.json"):
                found[path.stem.removeprefix("progression-")] = path
    return [found[level] for level in sorted(found, key=lambda value: int(re.match(r"\d+", value).group()) if re.match(r"\d+", value) else 99, reverse=True)]


def periods(chapters: list[dict]) -> list[int]:
    explicit = []
    for chapter in chapters:
        match = re.search(r"\d+", str(chapter.get("periode") or chapter.get("period") or ""))
        explicit.append(int(match.group()) if match else 0)
    if any(explicit):
        return [value or 1 for value in explicit]
    total = sum(float(chapter.get("weeks") or 1) for chapter in chapters) or 1
    target, cumulative, current = total / 5, 0.0, 1
    result = []
    for chapter in chapters:
        weight = float(chapter.get("weeks") or 1)
        if current < 5 and cumulative and cumulative + weight > target * current:
            current += 1
        result.append(current)
        cumulative += weight
    return result


def slot(filename: str) -> dict[str, str]:
    return {"fichier": filename, "drive": ""}


def chapter_resources(level: str, code: str) -> dict:
    digit = re.match(r"\d+", level)
    prefix = digit.group() if digit else ""
    full = code if code.startswith(prefix) else f"{prefix}{code}"
    return {
        "source_md": slot(f"{full}.md"),
        "cours_pdf_eleve": slot(f"{full}__eleve_atkinson_11pt_couleur.pdf"),
        "cours_pdf_prof": slot(f"{full}__prof_atkinson_11pt_couleur.pdf"),
        "page_html_eleve": slot(f"{full}.html"),
        "page_html_prof": slot(f"{full}-prof.html"),
        "evaluation_A": slot(f"{full}__evaluation-A.pdf"),
        "evaluation_B": slot(f"{full}__evaluation-B.pdf"),
        "evaluation_DYS_PAP": slot(f"{full}__evaluation-DYS-PAP.pdf"),
        "corrige": slot(f"{full}__corrige.pdf"),
        "bareme": slot(f"{full}__bareme.pdf"),
    }


def main() -> None:
    result = {
        "schema": "sakuramaths.drive-links.v1",
        "instructions": "Coller un lien Google Drive complet ou un identifiant dans chaque champ drive. Laisser vide si le document n'existe pas encore.",
        "niveaux": {},
    }
    for path in progression_files():
        level = path.stem.removeprefix("progression-")
        data = json.loads(path.read_text(encoding="utf-8"))
        chapters = data.get("seq") or data.get("chapitres") or data.get("sequences") or []
        assigned = periods(chapters)
        level_data = {f"P{number}": {
            "livrets": {
                "livret_eleve_pdf": slot(f"livret-{level}-P{number}-eleve-v2.pdf"),
                "livret_prof_pdf": slot(f"livret-{level}-P{number}-prof-v2.pdf"),
            },
            "chapitres": {},
        } for number in range(1, 6)}
        for chapter, period in zip(chapters, assigned):
            code = str(chapter.get("code") or "").upper()
            level_data[f"P{period}"]["chapitres"][code] = {
                "titre": chapter.get("title") or chapter.get("titre") or code,
                "ressources": chapter_resources(level, code),
            }
        result["niveaux"][level] = level_data
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Squelette Drive généré : {OUTPUT}")


if __name__ == "__main__":
    main()
