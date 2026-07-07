#!/usr/bin/env python3
"""Génère les scripts de départ et active les liens Basthon des fiches ECE."""

from __future__ import annotations

import html
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "Studio" / "out" / "web" / "nsi" / "ece"
STARTERS = WEB / "starters"
RAW_BASE = "https://raw.githubusercontent.com/alg77/maths-info/main/SakuraMaths/Studio/out/web/nsi/ece/starters/"


def plain(fragment: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def code_plain(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).replace("\r\n", "\n").strip()


class QuestionParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.depth = 0
        self.in_question = False
        self.question_depth = 0
        self.capture = None
        self.capture_depth = 0
        self.question = []
        self.code = []
        self.exo = None
        self.result = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "div":
            self.depth += 1
            if "qblock" in classes and not self.in_question:
                self.in_question, self.question_depth = True, self.depth
        if not self.in_question:
            return
        if "qt" in classes:
            self.capture = "question"
            self.capture_depth = self.depth
        elif tag == "pre" and "sc" in classes:
            self.capture = "code"
        title = attrs.get("title", "")
        match = re.search(r"(?:Éditeur Python à intégrer — |Ouvrir )([A-Z]\d+)(?: dans Basthon)?", title)
        if match:
            self.exo = match.group(1)

    def handle_endtag(self, tag):
        if tag in ("pre",) and self.capture == "code":
            self.capture = None
        if tag == "div":
            if self.capture == "question" and self.depth == self.capture_depth:
                self.capture = None
            if self.in_question and self.depth == self.question_depth:
                if self.exo:
                    self.result[self.exo] = (plain("".join(self.question)), "".join(self.code).strip())
                self.in_question = False; self.capture = None; self.question = []; self.code = []; self.exo = None
            self.depth -= 1

    def handle_data(self, data):
        if self.capture == "question":
            self.question.append(data)
        elif self.capture == "code":
            self.code.append(data)


def starter_data(text: str) -> dict[str, tuple[str, str]]:
    parser = QuestionParser()
    parser.feed(text)
    return parser.result


def main() -> None:
    STARTERS.mkdir(parents=True, exist_ok=True)
    source = (WEB / "index.html").read_text(encoding="utf-8-sig")
    items = starter_data(source)
    # Les identifiants sont stables même lorsque la question ne contient pas encore de bloc de code.
    exos = re.findall(r'(?:Éditeur Python à intégrer — |Ouvrir )([A-Z]\d+)(?: dans Basthon)?', source)
    for exo in exos:
        question, code = items.get(exo, ("Compléter le programme demandé dans l’énoncé ECE.", ""))
        content = f'''# SakuraNSI — entraînement ECE {exo}\n# {question}\n# Le code est exécuté localement dans le navigateur par Basthon.\n\n{code or '# Écrire votre solution ici.\n'}\n'''
        (STARTERS / f"{exo}.py").write_text(content, encoding="utf-8")

    for page in (WEB / "index.html", WEB / "prof.html"):
        text = page.read_text(encoding="utf-8-sig")
        def replace(match: re.Match) -> str:
            exo = match.group(1)
            url = "https://console.basthon.fr/?from=" + quote(RAW_BASE + f"{exo}.py", safe=":/")
            return f'href="{url}" title="Ouvrir {exo} dans Basthon"'
        text = re.sub(r'href="#" aria-disabled="true" title="Éditeur Python à intégrer — ([A-Z]\d+)"', replace, text)
        page.write_text(text, encoding="utf-8")
    print(f"Starters Basthon : {len(list(STARTERS.glob('*.py')))}")


if __name__ == "__main__":
    main()
