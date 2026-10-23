# Recorrido del MVP — donde anda 🚌

El MVP cubre **una sola línea y un solo sentido**: la **510**, en el viaje de ida hacia la sede Parque Industrial. Todo lo demás (vuelta, otras líneas, otras sedes) es una idea futura (F1).

> 🧪 **Las paradas intermedias y los horarios de salida son datos de prueba (mocks).** Alcanzan para desarrollar y probar la app. Se reemplazan por los reales cuando se mida la ruta 0 (#12), y eso no obliga a cambiar código.

---

## Línea

| Dato | Valor |
|---|---|
| Línea | **510** |
| Sentido del MVP | Ida: desde la cabecera hacia la sede Parque Industrial |
| ¿Incluye la vuelta? | No en el MVP |
| Identificador en la base | `510-ida` |

---

## Paradas (en orden)

| Orden | Parada | Origen del dato |
|---|---|---|
| 1 | Primera parada (cabecera) | Real (flyers) |
| 2 | Parada ficticia 2 | 🧪 Mock |
| 3 | Parada ficticia 3 | 🧪 Mock |
| 4 | Alberti | Real (flyers) |
| 5 | Parada ficticia 5 | 🧪 Mock |
| 6 | Parada ficticia 6 | 🧪 Mock |
| 7 | Del Viso | Real (flyers) |
| 8 | Parada ficticia 8 | 🧪 Mock |
| 9 | Parada ficticia 9 | 🧪 Mock |
| 10 | Parque Industrial (sede Universidad) | Real (flyers) |

Los nombres son reales para las 4 paradas de los flyers. **Los tiempos son mock en todas**, incluidas esas 4: salen de [`ruta0/ruta0-FICTICIA.csv`](ruta0/ruta0-FICTICIA.csv), un viaje inventado pero creíble de unos 51 minutos.

**Criterio para la ruta real:** cargar las paradas donde **suben estudiantes**, no necesariamente todas las paradas oficiales de la línea.

---

## Horarios de salida desde la cabecera (🧪 mock)

| Franja | Horarios de salida |
|---|---|
| Mañana | 07:00 · 08:30 |
| Tarde | 13:00 · 17:30 |

En la base: `horariosSalida: ["07:00", "08:30", "13:00", "17:30"]`.

El 53 % de la encuesta dice que el horario oficial **no se cumple**. Por eso la app no depende solo de estos horarios: los combina con los tiempos de la ruta 0 y con los reportes en vivo.

---

## Cómo se marca que son datos de prueba

- **CSV:** el archivo se llama `ruta0-FICTICIA.csv` y cada fila tiene "FICTICIO" en `notas`.
- **Base de datos:** el recorrido `510-ida` se carga con `ficticia: true`.
- **App:** mientras `ficticia` sea `true`, muestra el cartel **"⚠ Datos de prueba"** (ver [`wireframes/01-estado.png`](wireframes/01-estado.png)).

**Cuando estén los datos reales:**
1. Medir la ruta 0 (#12).
2. Reemplazar el CSV y los horarios.
3. Recargar la ruta (#18).
4. Poner `ficticia: false`.
