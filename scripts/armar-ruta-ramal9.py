"""Arma docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv: paradas reales (Moovit + grupo) y tiempos ESTIMADOS por tramo.

Uso: python3 scripts/armar-ruta-ramal9.py docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv
Cuando se mida la ruta 0 (#12) este script deja de hacer falta: se carga el CSV medido."""
import sys, unicodedata, re

R5 = """Estación Alberti|Hipólito Yrigoyen Y Santa Rita|Santa Rita Y Arteaga|Plaza San Martín|Instituto María Madre Nuestra|Padre Roqueta Y Batalla De Arroyo Grande|Padre Roqueta Y Batalla De Curupaytí|Batalla De Curupaytí Y Santa Julia|Escuela Secundaria N° 10|Santa Eulalia Y Batalla De Famaillá|Santa Eulalia Y Batalla De Ituzaingó|Santa Eulalia Y Ensenada|Santa Eulalia Y Batalla De Caseros|Santa Eulalia Y Avenida Constitución|Avenida Constitución Y Azcuénaga|Avenida Madero Y Oliden|Lisandro De La Torre Y Avenida Madero|Paseo Del Viso|Lisandro De La Torre Y Arata|Juan Giménez E Independencia|Estación Del Viso|Valentín Gómez Y Avenida Madero|Valentín Gómez Y Juana García|Valentín Gómez Y Penna|Valentín Gómez Y San Cayetano|Manuel Maza Y Santa Celia|Manuel Maza Y Portinari|Escuela Primaria N° 39|Jardín De Infantes N° 914|Lisandro De La Torre Y Lola Mora|Lisandro De La Torre Y Chiappori|Colectora Este Y Florida|12 De Octubre Y Caamaño|Colectora Este Y Chile|12 De Octubre Y Saravi|12 De Octubre Y Chacabuco|Hotel Sheraton Pilar|Siga La Vaca|Village Pilar|12 De Octubre Y Tupiza|12 De Octubre Y Pisco|Colectora Este Y Argerich|Colectora Este Y Tomás Guido|12 De Octubre Y Naón|12 De Octubre Y Avenida Honorio Pueyrredón|12 De Octubre Y Santa María|Paseo Champagnat""".split("|")
assert len(R5) == 47

# 510 R9 Villa del Carmen (Pilar → Alberti), paradas 22 a 47: se recorren al revés (47 → 22).
R9VC = {22:"Colegio St. John's",23:"Chacabuco Y Darregueira",24:"Chacabuco Y Acevedo",25:"Chacabuco Y Serrano",
26:"Chacabuco Y Avenida Honorio Pueyrredón",27:"Avenida Honorio Pueyrredón Y Sánchez De Loria",28:"Moreno Y Libertad",
29:"Moreno Y Sarmiento",30:"Moreno Y Rivadavia (Estación Villa Rosa)",31:"Estación Villa Rosa",32:"Escuela N° 14",
33:"Hipólito Yrigoyen Y Avenida Honorio Pueyrredón",34:"Avenida Honorio Pueyrredón Y Benjamín Rawson",
35:"Avenida Honorio Pueyrredón Y Ernesto De La Cárcova",36:"Avenida Honorio Pueyrredón Y Athos Palma",
37:"Avenida Honorio Pueyrredón Y Chazarreta",38:"Pilar Del Este",39:"Quinquela Martín Y José Villanueva",
40:"Verazzi Y Calcagno",41:"Caamaño Y Fosatti",42:"Caamaño Y Manzoni",43:"Club De Campo Chateau Pilar",
44:"Saint Matthew's Village",45:"Saint Matthew's College",46:"Barrio Haras Del Pilar / Supermercado Eco",47:"Pueblo Caamaño"}

FINAL = ["12 De Octubre Y Domingo French (puente)","Panamericana Y Granadero Juan Mateo Gelves",
"Bajada Autopista Y Pergamino (Colectora Ruta 8)","Avenida Doctor Arturo Frondizi","Rotonda De La Calle 9",
"Sede Parque Industrial (El Cenáculo)"]

# (nombre, fuente)
paradas = [(n, "R5") for n in R5[:33]]                        # Alberti → 12 de Octubre y Caamaño
paradas += [(R9VC[i], "R9VC") for i in range(47, 21, -1)]      # Pueblo Caamaño → Colegio St. John's
paradas += [(n, "R5") for n in R5[35:47]]                      # 12 de Octubre y Chacabuco → Paseo Champagnat
paradas += [(n, "GRUPO") for n in FINAL]                       # tramo final

def ident(n):
    n = unicodedata.normalize("NFD", n); n = re.sub(r"[̀-ͯ]", "", n).lower().strip()
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", n))
ids = [ident(n) for n, _ in paradas]
dups = {i for i in ids if ids.count(i) > 1}
assert not dups, dups

# Anclas de LLEGADA (segundos desde las 12:20:00, salida de Alberti). Entre anclas se reparte parejo.
idx = {n: k for k, (n, _) in enumerate(paradas)}
anclas = {
    0: 0,                                       # Estación Alberti (sale 12:20)
    idx["Estación Del Viso"]: 14*60 + 15,       # REAL: sale 12:35 (llega 12:34:15, 45 s detenido)
    idx["12 De Octubre Y Caamaño"]: 27*60,
    idx["Estación Villa Rosa"]: 43*60,
    idx["12 De Octubre Y Chacabuco"]: 53*60,
    idx["Paseo Champagnat"]: 62*60,
    idx["Panamericana Y Granadero Juan Mateo Gelves"]: 68*60,
    idx["Bajada Autopista Y Pergamino (Colectora Ruta 8)"]: 77*60,
    len(paradas) - 1: 85*60,
}
detenido = {idx["Estación Del Viso"]: 45, idx["Estación Villa Rosa"]: 45}
llegada = [None] * len(paradas)
claves = sorted(anclas)
for a, b in zip(claves, claves[1:]):
    for k in range(a, b + 1):
        llegada[k] = round(anclas[a] + (anclas[b] - anclas[a]) * (k - a) / (b - a))
def hhmmss(seg):
    t = 12*3600 + 20*60 + seg
    return f"{t//3600:02d}:{t%3600//60:02d}:{t%60:02d}"

nota = {"R5": "Moovit 510 R5", "R9VC": "Moovit 510 R9 Villa del Carmen (sentido contrario)", "GRUPO": "referencia del grupo"}
filas = ["orden,parada,hora_llegada,hora_salida,se_detuvo,notas"]
for k, (n, f) in enumerate(paradas):
    if k == 0:
        lleg, sal, est = "12:15:00", "12:20:00", "REAL - cabecera; sale 06:50 / 12:20 / 16:20"
    else:
        d = 0 if k == len(paradas) - 1 else detenido.get(k, 20)
        lleg, sal = hhmmss(llegada[k]), hhmmss(llegada[k] + d)
        est = "REAL - pasa 07:05 / 12:35 / 16:35 (publicado por la universidad)" if n == "Estación Del Viso" else "ESTIMADO"
    nombre = f'"{n}"' if "," in n else n
    filas.append(f"{k+1},{nombre},{lleg},{sal},si,{est} - {nota[f]}")
open(sys.argv[1], "w", encoding="utf-8").write("\n".join(filas) + "\n")
print(len(paradas), "paradas; sin nombres repetidos")
for k in [0, idx["Estación Del Viso"], idx["12 De Octubre Y Caamaño"], idx["Estación Villa Rosa"], idx["Paseo Champagnat"], len(paradas)-1]:
    print(filas[k+1])
