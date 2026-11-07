# Recorrido del MVP — donde anda 🚌

El MVP cubre **una sola línea, un ramal y un sentido**: la **510, Ramal 9**, cartel **"Sede Parque Industrial"**, en el viaje de ida desde Estación Alberti hasta la sede. Todo lo demás (vuelta, otros ramales, otras sedes) es una idea futura (F1).

> 📏 **El recorrido, las paradas y los horarios de salida son reales; los tiempos entre paradas son estimados.** Los únicos tiempos confirmados son la salida de Alberti y el paso por Estación Del Viso. El resto se reemplaza cuando se mida la ruta 0 (#12), y eso no obliga a cambiar código.

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

## Itinerario y paradas (77, en orden)

El recorrido se armó juntando tres fuentes. La lista completa, con la hora estimada de cada parada, está en [`ruta0/ruta0-RAMAL9-ESTIMADA.csv`](ruta0/ruta0-RAMAL9-ESTIMADA.csv). La columna `notas` dice de dónde sale cada parada y si su hora es REAL o ESTIMADA.

### 1. Alberti → Del Viso → Panamericana (paradas 1 a 33)

Fuente: **Moovit, 510 R5** (Alberti → Pilar x Del Viso), que va en el mismo sentido.

Sale de **Estación Alberti**, cruza Alberti (Santa Rita, Plaza San Martín, Padre Roqueta, Santa Eulalia, Av. Constitución) y toma **Lisandro de la Torre**, donde dobla hacia el centro de Del Viso. Pasa por **Paseo Del Viso** y **Estación Del Viso** (parada 21, ✅ 12:35). Toma **Valentín Gómez** derecho, dobla por **Manuel Maza y Portinari**, vuelve a **Lisandro de la Torre** y sale a la Panamericana: **Colectora Este y Florida** y **12 de Octubre y Caamaño** (parada 33).

### 2. Por Caamaño hasta Villa Rosa y vuelta a la Panamericana (paradas 34 a 59)

Fuente: **Moovit, 510 R9 "Villa del Carmen"** (paradas 47 a 22 de esa línea, **al revés**, porque esa línea va de Pilar hacia Alberti). Hay que confirmar en la calle que en este sentido para en los mismos lugares.

Baja en **Caamaño**: Pueblo Caamaño, Barrio Haras del Pilar, Saint Matthew's, Club de Campo Chateau, Caamaño y Manzoni, Caamaño y Fosatti. Sigue por **Verazzi** y toma **Quinquela Martín**, pasa por Pilar del Este, recorre **Av. Honorio Pueyrredón** y llega a la **Estación Villa Rosa** (Belgrano Norte, parada 50). Da la vuelta por adentro (Moreno, Honorio Pueyrredón y Sánchez de Loria, **Chacabuco**) y pasa por el **Colegio St. John's** (parada 59).

### 3. Por la Panamericana hasta Paseo Champagnat (paradas 60 a 71)

Fuente: **Moovit, 510 R5**, del lado de la colectora en este sentido.

Retoma la Panamericana en **12 de Octubre y Chacabuco** y sigue por la colectora (Hotel Sheraton, Siga La Vaca, Village Pilar, Tomás Guido, Naón, Honorio Pueyrredón) hasta **Paseo Champagnat** (parada 71).

### 4. Panamericana y Acceso Norte hasta la sede (paradas 72 a 77)

Fuente: **descripción del grupo**. Son referencias, todavía sin nombre oficial de parada.

| Orden | Parada (referencia) | Detalle |
|---|---|---|
| 72 | 12 de Octubre y Domingo French (puente) | Baja en el puente y vuelve a subir a la Panamericana |
| 73 | Panamericana y Granadero Juan Mateo Gelves | Después va directo por **Acceso Norte**, sin paradas |
| 74 | Bajada Autopista y Pergamino (Colectora Ruta 8) | Baja por la colectora de la Ruta Nacional 8 |
| 75 | Avenida Doctor Arturo Frondizi | Por Frondizi derecho |
| 76 | Rotonda de la calle 9 | Entra por La Montonera |
| 77 | **Sede Parque Industrial (El Cenáculo)** | Destino. ⏳ Confirmar que El Cenáculo es la sede |

---

## Qué falta confirmar

- **Tiempos de cada parada:** se miden en la ruta 0 (#12). Hoy el viaje estimado dura **85 minutos** (12:20 → 13:45). Solo la salida de Alberti y el paso por Del Viso son reales.
- **Tramo 2:** que en este sentido el colectivo para en las mismas paradas que la línea que va al revés.
- **Tramo 4:** los nombres oficiales de esas paradas y que **El Cenáculo** sea la sede.
- **Qué paradas usan los estudiantes:** sirve para el piloto; la app igual muestra todas.

---

## Cómo se marca que los tiempos son estimados

- **CSV:** cada fila dice REAL o ESTIMADO en `notas`.
- **Base de datos:** el recorrido `510-ida` se carga con `ficticia: true` (datos sin medir).
- **App:** mientras `ficticia` sea `true`, muestra el cartel **"Tiempos estimados: falta medir la ruta 0"**.

**Cuando estén los datos reales:**
1. Medir la ruta 0 (#12) con el mismo formato de CSV: orden, parada, hora de llegada, hora de salida, si se detuvo y notas.
2. Reemplazar las horas del CSV (y ajustar paradas si hace falta).
3. Recargar la ruta (#18).
4. Poner `ficticia: false`.

> `ruta0-FICTICIA.csv` (la ruta inventada del principio) se queda **solo para los tests de los cálculos**: sus números están verificados a mano y no cambian.
