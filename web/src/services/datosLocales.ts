import { create } from 'zustand'
import coordenadasCsv from '../../../docs/ruta0/paradas-coordenadas.csv?raw'
import rutaCsv from '../../../docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv?raw'
import { useAhora } from '../features/estado/useAhora'
import { paradasDesdeCsv, sumarCoordenadas } from '../features/paradas/ruta0Csv'
import type { Parada, Recorrido, Reporte } from '../types/modelos'
import { RECORRIDO_510 } from './recorrido510'
import { ahora } from './reloj'

// Fuente de datos LOCAL (sin internet): el recorrido sale de docs/ruta0/ y los "Me subí" quedan en memoria.
// La usan los tests y el desarrollo sin conexión (VITE_DATOS=local). La app real usa datosFirestore.ts.
// Las dos tienen las mismas funciones: services/datos.ts elige cuál usar.

export interface DatosRecorrido {
  recorrido: Recorrido
  paradas: Parada[]
}

const DATOS: DatosRecorrido = {
  recorrido: RECORRIDO_510,
  paradas: sumarCoordenadas(paradasDesdeCsv(rutaCsv), coordenadasCsv),
}

/** El recorrido del MVP con sus paradas. Devuelve null mientras carga (con Firebase va a tardar un instante). */
export function useRecorrido(): DatosRecorrido | null {
  return DATOS
}

// Reportes en memoria. Solo parada y hora: igual que en Firestore, nada de quién lo hizo.
const useReportesLocales = create<{ reportes: Reporte[] }>(() => ({ reportes: [] }))

/** Los "Me subí" del recorrido que ya ocurrieron, del más viejo al más nuevo. Se actualiza solo. */
export function useReportes(recorridoId: string): Reporte[] {
  const momento = useAhora()
  const reportes = useReportesLocales((s) => s.reportes)
  return reportes
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
