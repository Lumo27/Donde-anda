"""Genera los wireframes (SVG, baja fidelidad) en docs/wireframes/."""
import sys
from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

W, H = 360, 720
INK, MID, LIGHT, BG = "#1f2937", "#6b7280", "#e5e7eb", "#ffffff"


def phone(title, body):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W + 40}" height="{H + 80}" viewBox="0 0 {W + 40} {H + 80}" font-family="Helvetica, Arial, sans-serif">
<rect width="100%" height="100%" fill="#f3f4f6"/>
<text x="20" y="30" font-size="15" font-weight="700" fill="{INK}">{escape(title)}</text>
<g transform="translate(20,50)">
<rect width="{W}" height="{H}" rx="28" fill="{BG}" stroke="{INK}" stroke-width="2"/>
<rect x="0" y="0" width="{W}" height="36" rx="28" fill="{LIGHT}"/>
<text x="{W / 2}" y="23" font-size="11" text-anchor="middle" fill="{MID}">9:41 · barra del celular</text>
{body}
</g></svg>"""


def text(x, y, s, size=14, weight=400, color=INK, anchor="start"):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{escape(s)}</text>'


def box(x, y, w, h, fill="none", stroke=INK, rx=12, dash=False):
    d = ' stroke-dasharray="6 4"' if dash else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"{d}/>'


def button(x, y, w, h, label, primary=True):
    fill = INK if primary else BG
    color = BG if primary else INK
    return box(x, y, w, h, fill=fill) + text(x + w / 2, y + h / 2 + 6, label, 17, 700, color, "middle")


def note(y, s):
    return text(W / 2, y, s, 11, 400, MID, "middle")


def header(title):
    return text(20, 76, "📍 Donde anda?", 18, 800) + text(W - 20, 76, "☰", 20, 400, INK, "end") + \
        f'<line x1="20" y1="92" x2="{W - 20}" y2="92" stroke="{LIGHT}" stroke-width="2"/>' + \
        (text(20, 120, title, 13, 700, MID) if title else "")


banner_ficticia = box(20, 100, W - 40, 26, fill="#fef3c7", stroke="#d97706", rx=6) + \
    text(W / 2, 118, "⚠ Datos de prueba (ruta ficticia)", 12, 700, "#92400e", "middle")

screens = {}

# 00 · Login
screens["00-login.svg"] = phone("00 · Login", "".join([
    text(W / 2, 200, "📍", 48, 400, INK, "middle"),
    text(W / 2, 250, "Donde anda?", 28, 800, INK, "middle"),
    text(W / 2, 285, "Sabé por dónde viene el colectivo", 15, 400, MID, "middle"),
    text(W / 2, 305, "y cuánto falta para tu parada.", 15, 400, MID, "middle"),
    button(30, 400, W - 60, 56, "G   Entrar con Google"),
    box(30, 480, W - 60, 92, fill="#f9fafb", stroke=LIGHT),
    text(50, 508, "🔒 Tu nombre y mail no se guardan", 13, 700),
    text(50, 528, "en los reportes. Solo se registra la", 13),
    text(50, 548, "parada y la hora.", 13),
    note(690, "Un solo botón. Sin formulario ni contraseña."),
]))

# 01 · Estado (inicio)
screens["01-estado.svg"] = phone("01 · Estado (inicio)", "".join([
    header(""),
    banner_ficticia,
    box(20, 140, W - 40, 150, fill="#f9fafb"),
    text(36, 166, "ÚLTIMO REPORTE", 11, 700, MID),
    text(36, 194, "Alguien se subió en Del Viso", 17, 700),
    text(36, 216, "hace 3 min · 7:34", 13, 400, MID),
    box(36, 232, 180, 36, fill=BG, rx=18),
    text(52, 256, "⏱ Atrasado 3 min", 15, 700),
    box(20, 304, W - 40, 110, stroke=INK),
    text(36, 330, "TU PARADA: Parada ficticia 8", 11, 700, MID),
    text(36, 372, "Llega en ~7 min", 30, 800),
    text(36, 398, "Cambiar mi parada ›", 13, 400, MID),
    text(20, 446, "Salida 7:00 · Llegada a la facu ~7:55", 13, 400, MID),
    text(20, 466, "10 paradas · 51 min de recorrido", 13, 400, MID),
    text(W - 20, 466, "Ver paradas ›", 13, 700, INK, "end"),
    button(20, 560, W - 40, 72, "🚌  Me subí"),
    note(700, "Lo clave arriba, sin scroll. Botón al alcance del pulgar."),
]))

# 02 · Me subí
screens["02-me-subi.svg"] = phone("02 · Me subí (2 toques)", "".join([
    f'<rect x="0" y="36" width="{W}" height="{H - 36}" fill="#000" opacity="0.35"/>',
    box(0, 250, W, H - 250, fill=BG, rx=24),
    text(24, 290, "¿En qué parada te subiste?", 19, 800),
    text(24, 312, "Solo se guarda la parada y la hora.", 13, 400, MID),
    *[box(24, 330 + i * 52, W - 48, 44, fill=("#f3f4f6" if p.startswith("●") else BG), rx=10) +
      text(40, 358 + i * 52, p, 15, 700 if p.startswith("●") else 400)
      for i, p in enumerate(["○  Del Viso", "○  Parada ficticia 7", "●  Parada ficticia 8  (tu parada)", "○  Parada ficticia 9"])],
    button(24, 560, W - 48, 58, "Confirmar"),
    text(W / 2, 648, "Cancelar", 15, 400, MID, "middle"),
    box(24, 670, W - 48, 34, fill="#ecfdf5", stroke="#059669", rx=8, dash=True),
    text(W / 2, 692, "Después: \"¡Gracias! Solo guardamos parada y hora\"", 12, 400, "#065f46", "middle"),
]))

# 03 · Listado de paradas
rows = [
    ("Primera parada", "7:02", "ya pasó"), ("Parada ficticia 2", "7:06", "ya pasó"),
    ("Parada ficticia 3", "7:09", "ya pasó"), ("Alberti", "7:15", "ya pasó"),
    ("Parada ficticia 5", "7:20", "ya pasó"), ("Parada ficticia 6", "7:25", "ya pasó"),
    ("Del Viso", "7:34", "🚌 acá (reporte)"), ("⭐ Parada ficticia 8", "~7:41", "tu parada"),
    ("Parada ficticia 9", "~7:48", ""), ("Parque Industrial", "~7:55", "llegada"),
]
body = [header("PARADAS · 510 → Parque Industrial"), text(20, 140, "‹ Volver", 13, 700)]
for i, (n, h, tag) in enumerate(rows):
    y = 160 + i * 50
    gone = tag == "ya pasó"
    color = MID if gone else INK
    weight = 700 if tag in ("tu parada", "🚌 acá (reporte)") else 400
    if tag == "tu parada":
        body.append(box(14, y - 4, W - 28, 46, fill="#f3f4f6", stroke=INK, rx=8))
    body.append(f'<circle cx="34" cy="{y + 19}" r="6" fill="{color if not gone else LIGHT}" stroke="{color}"/>')
    if i < len(rows) - 1:
        body.append(f'<line x1="34" y1="{y + 25}" x2="34" y2="{y + 63}" stroke="{LIGHT}" stroke-width="3"/>')
    body.append(text(52, y + 18, n, 15, weight, color))
    body.append(text(52, y + 35, tag, 11, 400, MID))
    body.append(text(W - 24, y + 24, h, 15, weight, color, "end"))
body.append(note(706, "\"ya pasó\" con texto, no solo en gris. ~ = estimado."))
screens["03-paradas.svg"] = phone("03 · Listado de paradas", "".join(body))

# 04 · Elegir mi parada
opts = ["Primera parada", "Parada ficticia 2", "Parada ficticia 3", "Alberti", "Parada ficticia 5",
        "Parada ficticia 6", "Del Viso", "Parada ficticia 8", "Parada ficticia 9"]
body = [header(""), text(20, 130, "¿Dónde tomás el colectivo?", 21, 800),
        text(20, 154, "Te avisamos cuánto falta para que llegue ahí.", 13, 400, MID),
        text(20, 172, "Se guarda solo en tu teléfono.", 13, 400, MID)]
for i, o in enumerate(opts):
    y = 190 + i * 44
    sel = o == "Parada ficticia 8"
    body.append(box(20, y, W - 40, 38, fill="#f3f4f6" if sel else BG, rx=8))
    body.append(text(36, y + 25, ("●  " if sel else "○  ") + o, 15, 700 if sel else 400))
body.append(button(20, 600, W - 40, 58, "Listo"))
body.append(note(690, "Aparece la primera vez; después desde \"Cambiar mi parada\"."))
screens["04-mi-parada.svg"] = phone("04 · Elegir mi parada", "".join(body))

for name, svg in screens.items():
    (OUT / name).write_text(svg, encoding="utf-8")
    print("ok", name)
