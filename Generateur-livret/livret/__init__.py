"""Cœur réutilisable du générateur de livrets."""

from .components import (
    COMPONENT_LABELS,
    KNOWN_COMPONENTS,
    lines_html,
    render_body,
    render_table,
)
from .inline import blank_width, inline, make_qr, mathify, process
from .source import SourceError, load_source, parse, validate_source

__all__ = [
    "SourceError",
    "COMPONENT_LABELS",
    "KNOWN_COMPONENTS",
    "blank_width",
    "inline",
    "load_source",
    "lines_html",
    "make_qr",
    "mathify",
    "parse",
    "process",
    "render_body",
    "render_table",
    "validate_source",
]
