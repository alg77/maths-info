"""Chargement, composition et validation des sources de cours."""

import re
from pathlib import Path


KNOWN_COMPONENTS = {
    "couverture",
    "def",
    "methode",
    "prop",
    "rappel",
    "raw",
    "regle",
    "ressources",
    "retenu",
    "reussite",
}


class SourceError(ValueError):
    """Erreur lisible par une autrice de chapitre."""

    def __init__(self, message, path=None, line=None):
        self.path = Path(path) if path else None
        self.line = line
        location = ""
        if self.path:
            location = str(self.path)
            if line is not None:
                location += f":{line}"
            location += " : "
        super().__init__(location + message)


def load_source(path, _seen=None, _stack=None):
    """Charge une source et développe ses ``@include`` une seule fois."""
    seen = _seen if _seen is not None else set()
    stack = _stack if _stack is not None else []
    source_path = Path(path).resolve()

    if source_path in stack:
        cycle = " -> ".join(item.name for item in [*stack, source_path])
        raise SourceError(f"inclusion circulaire détectée ({cycle})", source_path)
    if source_path in seen:
        return ""
    if not source_path.is_file():
        raise SourceError("fichier source introuvable", source_path)

    seen.add(source_path)
    stack.append(source_path)
    output = []
    try:
        for line_number, line in enumerate(
            source_path.read_text(encoding="utf-8").split("\n"), start=1
        ):
            include = re.fullmatch(r"\s*@include\s+(.+?)\s*", line)
            if not include:
                output.append(line)
                continue
            included_path = source_path.parent / include.group(1)
            try:
                output.append(load_source(included_path, seen, stack))
            except SourceError as error:
                raise SourceError(
                    f"impossible d'inclure {include.group(1)!r} ({error})",
                    source_path,
                    line_number,
                ) from error
    finally:
        stack.pop()
    return "\n".join(output)


def validate_source(source, path=None):
    """Vérifie la structure avant rendu et renvoie la liste des chapitres."""
    source_path = Path(path) if path else None
    open_component = None
    headers = []

    for line_number, raw_line in enumerate(source.split("\n"), start=1):
        line = raw_line.strip()
        if line == ":::":
            if open_component is None:
                raise SourceError(
                    "fermeture de composant sans ouverture", source_path, line_number
                )
            open_component = None
            continue

        if line.startswith(":::"):
            if open_component is not None:
                raise SourceError(
                    f"le composant {open_component!r} n'est pas fermé",
                    source_path,
                    line_number,
                )
            head = line[3:].strip()
            component_type = head.partition("|")[0].strip()
            if not component_type:
                raise SourceError("type de composant manquant", source_path, line_number)
            if component_type not in KNOWN_COMPONENTS:
                known = ", ".join(sorted(KNOWN_COMPONENTS))
                raise SourceError(
                    f"composant inconnu {component_type!r}; types permis : {known}",
                    source_path,
                    line_number,
                )
            open_component = component_type
            continue

        if line.startswith("# ") and open_component is None:
            parts = [part.strip() for part in line[2:].split("|")]
            if len(parts) < 3 or not parts[0] or not parts[1] or not parts[2]:
                raise SourceError(
                    "en-tête attendu : # CODE | Titre | Niveau | Compétences",
                    source_path,
                    line_number,
                )
            headers.append(parts[0])

    if open_component is not None:
        raise SourceError(
            f"le composant {open_component!r} n'est pas fermé",
            source_path,
            len(source.split("\n")),
        )
    if not headers:
        raise SourceError("aucun chapitre trouvé", source_path)
    return headers


def parse(source):
    """Transforme la syntaxe historique en blocs indépendants du rendu."""
    lines = source.split("\n")
    blocks = []
    index = 0
    while index < len(lines):
        stripped = lines[index].strip()
        if not stripped:
            index += 1
            continue
        if stripped.startswith("# "):
            parts = [part.strip() for part in stripped[2:].split("|")]
            blocks.append(
                (
                    "header",
                    (
                        parts[0] if parts else "",
                        parts[1] if len(parts) > 1 else "",
                        parts[2] if len(parts) > 2 else "",
                        parts[3] if len(parts) > 3 else "",
                    ),
                )
            )
            index += 1
            continue
        if stripped.startswith("## "):
            blocks.append(("section", stripped[3:].strip()))
            index += 1
            continue
        if stripped.startswith(":::"):
            head = stripped[3:].strip()
            block_type, _, block_title = head.partition("|")
            block_type, block_title = block_type.strip(), block_title.strip()
            body = []
            index += 1
            while index < len(lines) and lines[index].strip() != ":::":
                body.append(lines[index])
                index += 1
            index += 1
            blocks.append(("box", (block_type, block_title, body)))
            continue
        paragraph = []
        while (
            index < len(lines)
            and lines[index].strip()
            and not lines[index].strip().startswith(("#", ":::"))
        ):
            paragraph.append(lines[index])
            index += 1
        blocks.append(("para", paragraph))
    return blocks

