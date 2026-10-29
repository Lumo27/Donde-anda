import { create } from 'zustand'
import rutaFicticiaCsv from '../../../docs/ruta0/ruta0-FICTICIA.csv?raw'
import { useAhora } from '../features/estado/useAhora'
import { paradasDesdeCsv } from '../features/paradas/ruta0Csv'
import { horariosDeSimulacion, reportesSimulados } from '../features/simulacion/simulacion'
import type { Parada, Recorrido, Reporte } from '../types/modelos'
import { ahora, configurarReloj } from './reloj'

// Fuente de datos de la app. Las pantallas piden todo acá y no saben de dónde viene.
//
// HOY: datos locales de prueba. La ruta ficticia sale de docs/ruta0/ y, fuera de los tests, corre la
// simulación de demo (#36): un colectivo ya en viaje, "Me subí" ficticios y el reloj acelerado.
// Los "Me subí" que toca el usuario quedan en memoria (se pierden al recargar y no se comparten).
// CUANDO ESTÉ FIREBASE: se reemplaza la implementación de este archivo por Firestore
// (#16 conexión, #18 ruta cargada, #21 crearReporte, #22 escuchar el último reporte).
// Las firmas de las funciones se mantienen, así que las pantallas no cambian.

/** Velocidad del reloj de la demo. Se cambia con ?velocidad=1 (tiempo real) … ?velocidad=20 en la URL. */
const VELOCIDAD_POR_DEFECTO = 5
export const SIMULACION_ACTIVA = import.meta.env.MODE !== 'test'

const paradas = paradasDesdeCsv(rutaFicticiaCsv)
const inicio = new Date()

if (SIMULACION_ACTIVA) {
  const pedida = Number(new URLSearchParams(window.location.search).get('velocidad'))
  configurarReloj(inicio, pedida > 0 && pedida <= 60 ? pedida : VELOCIDAD_POR_DEFECTO)
  // Cada vez que arranca la demo, se libera el bloqueo de "Me subí" de la demo anterior.
  try {
    localStorage.removeItem('donde-anda:ultimo-me-subi')
  } catch {
    // sin almacenamiento: no hay nada que liberar
  }
}

const RECORRIDO_FICTICIO: Recorrido = {
  id: '510-ida',
  nombre: '510 → Parque Industrial',
  linea: '510',
  sentido: 'ida',
  // Mock (ver docs/recorrido.md). En la demo, horarios armados para que haya un viaje en curso.
  horariosSalida: SIMULACION_ACTIVA ? horariosDeSimulacion(inicio) : ['07:00', '08:30', '13:00', '17:30'],
  ficticia: true,
}

export interface DatosRecorrido {
  recorrido: Recorrido
  paradas: Parada[]
}

const DATOS_FICTICIOS: DatosRecorrido = { recorrido: RECORRIDO_FICTICIO, paradas }

const REPORTES_SIMULADOS = SIMULACION_ACTIVA
  ? reportesSimulados(RECORRIDO_FICTICIO.id, paradas, RECORRIDO_FICTICIO.horariosSalida, inicio)
  : []

/** El recorrido del MVP con sus paradas. Devuelve null mientras carga (con Firebase va a tardar un instante). */
export function useRecorrido(): DatosRecorrido | null {
  return DATOS_FICTICIOS
}

// Reportes del usuario, en memoria. Solo parada y hora: igual que en Firestore, nada de quién lo hizo.
const useReportesLocales = create<{ reportes: Reporte[] }>(() => ({ reportes: [] }))

/** Los "Me subí" del recorrido que ya ocurrieron, del más viejo al más nuevo. Se actualiza solo. */
export function useReportes(recorridoId: string): Reporte[] {
  const momento = useAhora()
  const propios = useReportesLocales((s) => s.reportes)
  return [...REPORTES_SIMULADOS, ...propios]
    .filter((r) => r.recorridoId === recorridoId && r.creadoEn <= momento)
    .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime())
}

/** El último "Me subí" del recorrido, o null si no hay. Se actualiza solo cuando llega uno nuevo. */
export function useUltimoReporte(recorridoId: string): Reporte | null {
  const reportes = useReportes(recorridoId)
  return reportes[reportes.length - 1] ?? null
}

/** Guarda un "Me subí". Solo recorrido, parada y hora. */
export async function crearReporte(recorridoId: string, paradaId: string): Promise<void> {
  const reporte: Reporte = {
    // crypto.randomUUID solo existe en https/localhost; desde el celular por la red local es http.
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    recorridoId,
    paradaId,
    creadoEn: ahora(),
  }
  useReportesLocales.setState((s) => ({ reportes: [...s.reportes, reporte] }))
}
