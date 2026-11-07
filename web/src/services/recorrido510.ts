import type { Recorrido } from '../types/modelos'

// Datos del recorrido del MVP (sin las paradas, que salen de docs/ruta0/). Detalle en docs/recorrido.md.
// Los usan la fuente de datos local (tests y desarrollo sin internet) y el script que los carga en Firestore (#18).
export const RECORRIDO_510: Recorrido = {
  id: '510-ida',
  nombre: '510 Ramal 9 → Sede Parque Industrial',
  linea: '510',
  sentido: 'ida',
  // Salidas desde Estación Alberti: 15 min antes de los horarios publicados en Estación Del Viso (07:05, 12:35, 16:35).
  horariosSalida: ['06:50', '12:20', '16:20'],
  // Tiempos entre paradas estimados hasta medir la ruta 0 (#12): la app muestra el aviso.
  ficticia: true,
  // Todos los días (0 = domingo … 6 = sábado). Para probar solo los lunes: [1].
  diasServicio: [0, 1, 2, 3, 4, 5, 6],
  // Zonas para elegir "mi parada" (#38), por número de parada (ver docs/recorrido.md).
  tramos: [
    { nombre: 'Alberti – Del Viso', desde: 1, hasta: 21 },
    { nombre: 'Del Viso – Panamericana', desde: 22, hasta: 33 },
    { nombre: 'Panamericana – Villa Rosa', desde: 34, hasta: 50 },
    { nombre: 'Villa Rosa – Panamericana', desde: 51, hasta: 60 },
    { nombre: 'Panamericana – Pilar', desde: 61, hasta: 71 },
    { nombre: 'Pilar – Parque Industrial', desde: 72, hasta: 77 },
  ],
}
