"""Transformation des éléments écrits à l'intérieur des paragraphes."""

import base64
import html
import io
import re

try:
    import qrcode

    HAS_QR = True
except ImportError:
    qrcode = None
    HAS_QR = False


def make_qr(url):
    if not HAS_QR:
        return f'<span class="qr-missing">[QR: {html.escape(url)}]</span>'
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode()
    return f'<img class="qr" src="data:image/png;base64,{encoded}" alt="QR"/>'


def mathify(text):
    """Convertit le sous-ensemble LaTeX utilisé au collège en HTML."""
    commands = []
    text = re.sub(
        r"\\[a-zA-Z]+",
        lambda match: commands.append(match.group(0))
        or f"\x00{len(commands) - 1}\x00",
        text,
    )
    text = re.sub(r"[A-Za-z]+", lambda match: f"<em>{match.group()}</em>", text)
    text = re.sub(
        r"\x00(\d+)\x00", lambda match: commands[int(match.group(1))], text
    )
    replacements = {
        "\\times": "×",
        "\\div": "÷",
        "\\cdot": "·",
        "\\pm": "±",
        "\\leq": "≤",
        "\\le": "≤",
        "\\geq": "≥",
        "\\ge": "≥",
        "\\neq": "≠",
        "\\ne": "≠",
        "\\approx": "≈",
        "\\pi": "π",
        "\\ldots": "…",
        "\\dots": "…",
        "\\%": "%",
        "\\,": "\u2009",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(
        r"\\sqrt\{([^{}]*)\}", r'√<span class="sqrtarg">\1</span>', text
    )
    for _ in range(4):
        converted = re.sub(
            r"\\frac\{([^{}]*)\}\{([^{}]*)\}",
            r'<span class="frac"><span class="fnum">\1</span>'
            r'<span class="fden">\2</span></span>',
            text,
        )
        if converted == text:
            break
        text = converted
    text = re.sub(r"\^\{([^{}]*)\}", r"<sup>\1</sup>", text)
    text = re.sub(r"\^(<em>\w</em>|\w)", r"<sup>\1</sup>", text)
    text = re.sub(r"_\{([^{}]*)\}", r"<sub>\1</sub>", text)
    text = re.sub(r"_(<em>\w</em>|\w)", r"<sub>\1</sub>", text)
    return f'<span class="math">{text}</span>'


def _inline_basic(text):
    text = re.sub(
        r"\[qr:([^\]]+)\]", lambda match: make_qr(match.group(1).strip()), text
    )
    text = re.sub(r"\^\{([^}]+)\}", r"<sup>\1</sup>", text)
    text = re.sub(r"\^(\w)", r"<sup>\1</sup>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    return text


def inline(text):
    output = []
    last = 0
    for match in re.finditer(r"\$(.+?)\$", text):
        output.append(_inline_basic(text[last : match.start()]))
        output.append(mathify(match.group(1)))
        last = match.end()
    output.append(_inline_basic(text[last:]))
    return "".join(output)


def blank_width(answer):
    length = len(re.sub(r"[*^{}]", "", answer))
    return max(2.5, min(length * 0.55, 30))


def process(text, mode):
    """Produit les réponses professeur, interactives ou les blancs élève."""
    if mode not in {"prof", "eleve", "inter"}:
        raise ValueError(f"Mode de rendu inconnu : {mode}")

    output = []
    last = 0
    for match in re.finditer(r"\[\[(.+?)\]\]", text):
        output.append(inline(text[last : match.start()]))
        answer = match.group(1)
        if mode == "prof":
            output.append(f'<span class="rep">{inline(answer)}</span>')
        elif mode == "inter":
            output.append(f'<span class="ans">{inline(answer)}</span>')
        else:
            output.append(
                '<span class="blank" '
                f'style="min-width:{blank_width(answer):.1f}em"></span>'
            )
        last = match.end()
    output.append(inline(text[last:]))
    return "".join(output)

