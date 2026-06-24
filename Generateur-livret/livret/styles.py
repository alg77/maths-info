"""Chargement des feuilles de style maintenues hors du code Python."""

from functools import lru_cache
from pathlib import Path


STYLE_DIR = Path(__file__).resolve().parents[1] / "styles"


@lru_cache(maxsize=None)
def load_style(name):
    path = STYLE_DIR / name
    if not path.is_file():
        raise FileNotFoundError(f"Feuille de style introuvable : {path}")
    return path.read_text(encoding="utf-8")


def design_tokens():
    return load_style("tokens.css")

