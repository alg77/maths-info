"""Vérifie les références locales des pages HTML et feuilles CSS SakuraMaths."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


HTML_REF = re.compile(
    r"(?:href|src|action|poster)\s*=\s*([\"'])(.*?)\1",
    re.IGNORECASE,
)
HTML_BASE = re.compile(
    r"<base\b[^>]*?href\s*=\s*([\"'])(.*?)\1",
    re.IGNORECASE,
)
CSS_REF = re.compile(r"url\(\s*([\"']?)(.*?)\1\s*\)", re.IGNORECASE)
IGNORED_SCHEMES = {
    "http", "https", "mailto", "tel", "data", "javascript", "blob", "about"
}
DEFAULT_EXCLUDES = {Path("Studio/out"), Path("Studio/sources")}


def is_excluded(relative_path: Path, exclusions: set[Path]) -> bool:
    return any(relative_path == item or item in relative_path.parents for item in exclusions)


def local_target(
    root: Path,
    source: Path,
    reference: str,
    base_directory: Path | None = None,
) -> Path | None:
    reference = reference.strip()
    if not reference or reference.startswith(("#", "//", "{")):
        return None
    if any(marker in reference for marker in ("${", "'+", "+'", '"+', '+"')):
        return None

    parsed = urlsplit(reference)
    if parsed.scheme.lower() in IGNORED_SCHEMES:
        return None

    path = unquote(parsed.path)
    if not path:
        return None

    if path.startswith("/"):
        return root / path.lstrip("/")
    return (base_directory or source.parent) / Path(path)


def html_base_directory(root: Path, path: Path) -> tuple[str, Path] | None:
    """Retourne la référence <base> et le dossier qu'elle définit."""
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    match = HTML_BASE.search(text)
    if not match:
        return None
    reference = match.group(2).strip()
    target = local_target(root, path, reference)
    if target is None:
        return None
    parsed_path = unquote(urlsplit(reference).path)
    directory = target if parsed_path.endswith(("/", "\\")) else target.parent
    return reference, directory


def references(path: Path) -> list[tuple[int, str]]:
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    pattern = HTML_REF if path.suffix.lower() == ".html" else CSS_REF
    found: list[tuple[int, str]] = []
    for match in pattern.finditer(text):
        line = text.count("\n", 0, match.start()) + 1
        found.append((line, match.group(2)))
    return found


def check(root: Path, exclusions: set[Path]) -> tuple[int, list[tuple[Path, int, str]]]:
    checked = 0
    broken: list[tuple[Path, int, str]] = []

    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in {".html", ".css"}:
            continue
        relative = path.relative_to(root)
        if is_excluded(relative, exclusions):
            continue

        base = html_base_directory(root, path) if path.suffix.lower() == ".html" else None
        base_reference, base_directory = base if base else (None, None)

        for line, reference in references(path):
            # La balise <base> elle-même se résout depuis le dossier du document.
            target = local_target(
                root,
                path,
                reference,
                None if reference == base_reference else base_directory,
            )
            if target is None:
                continue
            checked += 1
            if not target.exists():
                broken.append((relative, line, reference))

    return checked, broken


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="racine SakuraMaths (par défaut : dossier parent de scripts)",
    )
    parser.add_argument(
        "--include-generated",
        action="store_true",
        help="inclure Studio/out et Studio/sources dans le contrôle",
    )
    args = parser.parse_args()

    root = args.root.resolve()
    exclusions = set() if args.include_generated else DEFAULT_EXCLUDES
    checked, broken = check(root, exclusions)

    if broken:
        print(
            f"ERREUR : {len(broken)} lien(s) local(aux) cassé(s) "
            f"sur {checked} référence(s) contrôlée(s) :"
        )
        for path, line, reference in broken:
            print(f"- {path}:{line} -> {reference}")
        return 1

    print(f"OK : {checked} référence(s) locale(s) contrôlée(s), aucun lien cassé.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
