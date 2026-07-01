#!/usr/bin/env python3
"""Normalise les réponses calculées : $calcul=$[[$réponse$]]."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ANSWER = re.compile(r"\[\[([^\]\n]+)\]\]")
MATH_SPAN = re.compile(r"\$([^$\n]*)\$")


def math_answer(value: str) -> bool:
    value = value.strip()
    if value.startswith("$") and value.endswith("$"):
        return False
    return bool(re.search(r"\d|\\|[+−×÷=<>^]|(?:^|\W)-\d", value))


def split_math_span(match: re.Match[str]) -> str:
    content = match.group(1)
    if "[[" not in content:
        return match.group(0)
    output, cursor = [], 0
    for answer in ANSWER.finditer(content):
        before = content[cursor:answer.start()]
        if before:
            output.append(f"${before}$")
        value = answer.group(1).strip()
        output.append(f"[[$${value}$$]]".replace("$$", "$"))
        cursor = answer.end()
    after = content[cursor:]
    if after:
        output.append(f"${after}$")
    return "".join(output)


def normalize(text: str) -> str:
    text = MATH_SPAN.sub(split_math_span, text)
    return ANSWER.sub(
        lambda match: f"[[$${match.group(1).strip()}$$]]".replace("$$", "$")
        if math_answer(match.group(1)) else match.group(0),
        text,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="+")
    args = parser.parse_args()
    for filename in args.files:
        path = Path(filename)
        original = path.read_text(encoding="utf-8")
        updated = normalize(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            print(f"normalisé : {path}")


if __name__ == "__main__":
    main()
