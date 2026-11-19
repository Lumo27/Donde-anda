"""Calcula las coordenadas de cada parada del recorrido a partir de las calles de OpenStreetMap.

- Paradas que son esquinas ("Valentín Gómez Y San Cayetano"): el cruce de las dos calles en OSM.
  Si el cruce aparece en varias localidades, se elige el más cercano a la parada anterior.
- Paradas que son lugares (estaciones, colegios, barrios) o esquinas que no se encuentran: se ubican
  entre la parada anterior y la siguiente, y se marcan como "aproximada".

Uso:
  1. Bajar las calles de la zona (una sola consulta a Overpass, ver docs/recorrido.md):
     [out:json];(way["highway"]["name"](-34.56,-59.00,-34.37,-58.72););out body;>;out skel qt;
  2. python3 scripts/coordenadas-paradas.py calles.json docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv \
         docs/ruta0/paradas-coordenadas.csv

Datos © OpenStreetMap contributors (licencia ODbL).
"""
from __future__ import annotations

import csv, json, math, re, sys, unicodedata

calles_json, ruta_csv, salida_csv = sys.argv[1:4]

def normalizar(texto: str) -> str:
    texto = unicodedata.normalize("NFD", texto)
    texto = re.sub(r"[̀-ͯ]", "", texto).lower()
    texto = re.sub(r"\(.*?\)", " ", texto)
    texto = re.sub(r"\b(avenida|av\.?|doctor|dr\.?|general|gral\.?|presidente|pte\.?|coronel|cnel\.?)\b", " ", texto)
    return re.sub(r"[^a-z0-9]+", " ", texto).strip()

# Algunas calles figuran en OSM con otro nombre o con el nombre completo.
ALIAS = {
    "12 de octubre": ["12 de octubre", "doce de octubre"],
    "colectora este": ["colectora este", "colectora panamericana", "12 de octubre"],
    "colectora oeste": ["colectora oeste", "colectora panamericana"],
    "batalla de ituzaingo": ["batalla de ituzaingo", "combate de ituzaingo", "ituzaingo"],
    "valentin gomez": ["valentin gomez"],
    "panamericana": ["acceso norte ramal pilar", "panamericana"],
    "granadero juan mateo gelves": ["granadero m gelves", "gelves"],
}

# Paradas que no son "calle Y calle" pero se ubican por calles de referencia (descripción del grupo):
# dos calles = su cruce; una calle = el punto de esa calle más cercano a la parada anterior.
REFERENCIAS = {
    "Paseo Champagnat": ["champagnat", "acceso norte ramal pilar"],
    "12 De Octubre Y Domingo French (puente)": ["domingo french", "acceso norte ramal pilar"],
    "Bajada Autopista Y Pergamino (Colectora Ruta 8)": ["pergamino"],
    "Avenida Doctor Arturo Frondizi": ["arturo frondizi"],
    "Rotonda De La Calle 9": ["calle 9"],  # el cruce exacto es la rotonda (no comparte punto con Frondizi)
}

datos = json.load(open(calles_json, encoding="utf-8"))
nodos = {e["id"]: (e["lat"], e["lon"]) for e in datos["elements"] if e["type"] == "node"}
nodos_por_calle: dict[str, set[int]] = {}
for e in datos["elements"]:
    if e["type"] == "way" and "name" in e.get("tags", {}):
        nodos_por_calle.setdefault(normalizar(e["tags"]["name"]), set()).update(e["nodes"])

def nodos_de(calle: str) -> set[int]:
    clave = normalizar(calle)
    variantes = ALIAS.get(clave, [clave])
    if clave in ("calle 9",):  # nombre exacto: si no, también agarra "9 de Julio"
        return set().union(*(ids for n, ids in nodos_por_calle.items() if n == clave)) if clave in nodos_por_calle else set()
    encontrados: set[int] = set()
    for nombre_osm, ids in nodos_por_calle.items():
        if any(re.search(rf"\b{re.escape(v)}\b", nombre_osm) for v in variantes):
            encontrados |= ids
    return encontrados

def distancia_m(a, b) -> float:
    (la1, lo1), (la2, lo2) = a, b
    x = math.radians(lo2 - lo1) * math.cos(math.radians((la1 + la2) / 2))
    y = math.radians(la2 - la1)
    return 6_371_000 * math.hypot(x, y)

paradas = [fila[1] for fila in list(csv.reader(open(ruta_csv, encoding="utf-8")))[1:]]
coords: list[tuple[float, float] | None] = [None] * len(paradas)
fuente = [""] * len(paradas)

anterior = None
for i, nombre in enumerate(paradas):
    partes = REFERENCIAS.get(nombre) or re.split(r"\s+[YE]\s+", re.sub(r"\(.*?\)", "", nombre).strip(), maxsplit=1, flags=re.I)
    if len(partes) == 1 and nombre in REFERENCIAS:
        candidatos = [nodos[n] for n in nodos_de(partes[0]) if n in nodos]
    elif len(partes) == 2 and all(p.strip() for p in partes):
        comunes = nodos_de(partes[0]) & nodos_de(partes[1])
        candidatos = [nodos[n] for n in comunes if n in nodos]
    else:
        candidatos = []
    if candidatos:
        elegido = min(candidatos, key=lambda c: distancia_m(c, anterior)) if anterior else candidatos[0]
        # Un punto a más de 4 km de la parada anterior es casi seguro de otra localidad: se descarta.
        if not anterior or distancia_m(elegido, anterior) < 4000:
            coords[i] = elegido
            fuente[i] = "referencia de calles (OSM)" if nombre in REFERENCIAS else "cruce de calles (OSM)"
            anterior = elegido

# Las que faltan: interpolar entre la anterior y la siguiente con coordenada.
conocidas = [i for i, c in enumerate(coords) if c]
for i in range(len(paradas)):
    if coords[i]:
        continue
    antes = max((k for k in conocidas if k < i), default=None)
    despues = min((k for k in conocidas if k > i), default=None)
    if antes is not None and despues is not None:
        t = (i - antes) / (despues - antes)
        a, b = coords[antes], coords[despues]
        coords[i] = (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
    else:
        coords[i] = coords[antes if antes is not None else despues]
    fuente[i] = "aproximada (entre paradas vecinas)"

with open(salida_csv, "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(["orden", "parada", "lat", "lng", "fuente"])
    for i, (nombre, (lat, lng)) in enumerate(zip(paradas, coords)):
        w.writerow([i + 1, nombre, f"{lat:.6f}", f"{lng:.6f}", fuente[i]])

# Control: saltos raros entre paradas seguidas.
print(f"{len(paradas)} paradas · por cruce: {sum(f.startswith('cruce') for f in fuente)} · por referencia: {sum(f.startswith('referencia') for f in fuente)} · aproximadas: {sum(f.startswith('aprox') for f in fuente)}")
for i in range(1, len(paradas)):
    d = distancia_m(coords[i - 1], coords[i])
    if d > 2500:
        print(f"  salto de {d/1000:.1f} km entre {i}. {paradas[i-1]} y {i+1}. {paradas[i]}")
