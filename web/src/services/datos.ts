import { create } from 'zustand'
import rutaFicticiaCsv from '../../../docs/ruta0/ruta0-FICTICIA.csv?raw'
import { paradasDesdeCsv } from '../features/paradas/ruta0Csv'
import type { Parada, Recorrido, Reporte } from '../types/modelos'

// Fuente de datos de la app. Las pantallas piden todo acá y no saben de dónde viene.
//
// HOY: datos locales de prueba. La ruta ficticia sale de docs/ruta0/ y los "Me subí" quedan en
// memoria (se pierden al recargar la página y no se comparten entre celulares).
// CUANDO ESTÉ FIREBASE: se reemplaza la implementación de este archivo por Firestore
// (#16 conexión, #18 ruta cargada, #21 crearReporte, #22 escuchar el último reporte).
// Las firmas de las funciones se mantienen, así que las pantallas no cambian.

const RECORRIDO_FICTICIO: Recorrido = {
  id: '510-ida',
  nombre: '510 → Parque Industrial',
  linea: '510',
  sentido: 'ida',
  horariosSalida: ['07:00', '08:30', '13:00', '17:30'], // mock, ver docs/recorrido.md
  ficticia: true,
}

export interface DatosRecorrido {
  recorrido: Recorrido
  paradas: Parada[]
}

const DATOS_FICTICIOS: DatosRecorrido = {
  recorrido: RECORRIDO_FICTICIO,
  paradas: paradasDesdeCsv(rutaFicticiaCsv),
}

/** El recorrido del MVP con sus paradas. Devuelve null mientras carga (con Firebase va a tardar un instante). */
export function useRecorrido(): DatosRecorrido | null {
  return DATOS_FICTICIOS
}

// Reportes en memoria. Solo parada y hora: igual que en Firestore, nada de quién lo hizo.
const useReportesLocales = create<{ reportes: Reporte[] }>(() => ({ reportes: [] }))

/** El último "Me subí" del recorrido, o null si no hay. Se actualiza solo cuando llega uno nuevo. */
export function useUltimoReporte(recorridoId: string): Reporte | null {
  return useReportesLocales((s) => {
    const delRecorrido = s.reportes.filter((r) => r.recorridoId === recorridoId)
    return delRecorrido[delRecorrido.length - 1] ?? null
  })
}

/** Guarda un "Me subí". Solo recorrido, parada y hora. */
export async function crearReporte(recorridoId: string, paradaId: string): Promise<void> {
  const reporte: Reporte = {
    id: crypto.randomUUID(),
    recorridoId,
    paradaId,
    creadoEn: new Date(),
  }
  useReportesLocales.setState((s) => ({ reportes: [...s.reportes, reporte] }))
}
