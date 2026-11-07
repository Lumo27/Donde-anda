# Recorrido del MVP — donde anda 🚌

El MVP cubre **una sola línea, un ramal y un sentido**: la **510, Ramal 9**, cartel **"Sede Parque Industrial"**, en el viaje de ida desde Estación Alberti hasta la sede. Todo lo demás (vuelta, otros ramales, otras sedes) es una idea futura (F1).

> 📏 **El recorrido y los horarios de salida son reales; los tiempos entre paradas son estimados.** Los únicos tiempos confirmados son la salida de Alberti y el paso por Estación Del Viso (15 min). El resto se reemplaza cuando se mida la ruta 0 (#12), y eso no obliga a cambiar código.

---

## Línea

| Dato | Valor | Fuente |
|---|---|---|
| Línea | **510**, empresa Pilar Bus S.A. | Moovit |
| Ramal | **Ramal 9**, cartel "Sede Parque Industrial" | Página de la universidad |
| Sentido del MVP | Ida: Estación Alberti → Sede Parque Industrial | Grupo |
| Identificador en la base | `510-ida` | — |

---

## Horarios

| | Mañana | Mediodía | Tarde | Fuente |
|---|---|---|---|---|
| Sale de **Estación Alberti** | 06:50 | 12:20 | 16:20 | Grupo (12:20); los otros, 15 min antes de Del Viso |
| Pasa por **Estación Del Viso** | 07:05 | 12:35 | 16:35 | **Publicado por la universidad** |

En la app: `horariosSalida: ["06:50", "12:20", "16:20"]` (salidas desde la cabecera, Alberti).

El 53 % de la encuesta dice que los horarios **no se cumplen**. Por eso la app no depende solo de estos horarios: los combina con los tiempos de la ruta 0 y con los reportes en vivo.

---

## Itinerario (por dónde va)

1. Sale de **Estación Alberti** y va hasta **Lisandro de la Torre**, donde dobla hacia el centro de Del Viso.
2. Cruza Del Viso por adentro: pasa por la **Estación Del Viso** y dobla hasta tomar **Valentín Gómez**.
3. Por **Valentín Gómez** sigue derecho hasta **Portinari**.
4. Por **Portinari** dobla hasta **Lisandro de la Torre**, y por Lisandro de la Torre sale a la **Panamericana**.
5. Baja en **Caamaño** y sigue derecho por la colectora.
6. Antes de la **Ruta 25** dobla a la izquierda y toma la diagonal.
7. Entra por la 25 a la **Estación Villa Rosa**, sale de Villa Rosa y corta por adentro.
8. Sale a la **Panamericana** a la altura del **puente de St. Catherine's** (el mismo de Mapuche, donde está Action) y dobla hacia Pilar.
9. Va directo por Panamericana hasta bajar en **Frondizi**, la calle del Parque Industrial, y llega a la **sede**.

Fuente: descripción del grupo. Los nombres de las paradas entre Alberti y la Panamericana coinciden con las del ramal R5 en Moovit, que hace el mismo tramo.

---

## Paradas (en orden)

Son **puntos de referencia** del recorrido, no la lista oficial completa (el R5 tiene 59 paradas). El criterio para la ruta real es cargar las paradas donde **suben estudiantes**. En la ruta 0 (#12) se confirma cada una y se agregan o se sacan las que hagan falta.

| Orden | Parada | Estado |
|---|---|---|
| 1 | Estación Alberti (cabecera) | ✅ Real |
| 2 | Plaza San Martín | ⏳ A confirmar |
| 3 | Lisandro de la Torre y Av. Madero | ⏳ A confirmar |
| 4 | Paseo Del Viso | ⏳ A confirmar |
| 5 | Estación Del Viso | ✅ Real (horario publicado) |
| 6 | Valentín Gómez y San Cayetano | ⏳ A confirmar |
| 7 | Valentín Gómez y Portinari | ⏳ A confirmar |
| 8 | Lisandro de la Torre y Lola Mora | ⏳ A confirmar |
| 9 | Colectora Este y Caamaño | ⏳ A confirmar |
| 10 | Ruta 25 (diagonal) | ⏳ A confirmar |
| 11 | Estación Villa Rosa | ⏳ A confirmar |
| 12 | Puente St. Catherine's (Mapuche) | ⏳ A confirmar |
| 13 | Frondizi (bajada Parque Industrial) | ⏳ A confirmar |
| 14 | Sede Parque Industrial | ✅ Real (destino) |

Los tiempos de cada parada están en [`ruta0/ruta0-RAMAL9-ESTIMADA.csv`](ruta0/ruta0-RAMAL9-ESTIMADA.csv): un viaje de **55 minutos** desde Alberti (12:20 → 13:15). Cada fila dice si el dato es REAL o ESTIMADO.

---

## Cómo se marca que los tiempos son estimados

- **CSV:** el archivo se llama `ruta0-RAMAL9-ESTIMADA.csv` y cada fila dice REAL o ESTIMADO en `notas`.
- **Base de datos:** el recorrido `510-ida` se carga con `ficticia: true` (datos sin medir).
- **App:** mientras `ficticia` sea `true`, muestra el cartel **"Tiempos estimados: falta medir la ruta 0"**.

**Cuando estén los datos reales:**
1. Medir la ruta 0 (#12) con el mismo formato de CSV.
2. Reemplazar el CSV (y ajustar paradas si hace falta).
3. Recargar la ruta (#18).
4. Poner `ficticia: false`.

> `ruta0-FICTICIA.csv` (la ruta inventada del principio) se queda **solo para los tests de los cálculos**: sus números están verificados a mano y no cambian.
