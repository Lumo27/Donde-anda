import { create } from 'zustand'
import rutaCsv from '../../../docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv?raw'
import { useAhora } from '../features/estado/useAhora'
import { paradasDesdeCsv } from '../features/paradas/ruta0Csv'
import type { Parada, Recorrido, Reporte } from '../types/modelos'
import { ahora } from './reloj'

// Fuente de datos de la app. Las pantallas piden todo acá y no saben de dónde viene.
//
// HOY: datos locales. El recorrido real del 510 Ramal 9 con tiempos estimados sale de docs/ruta0/ (ver
// docs/recorrido.md) y los "Me subí" quedan en memoria (se pierden al recargar y no se comparten entre celulares).
// CUANDO ESTÉ FIREBASE: se reemplaza la implementación de este archivo por Firestore, sin cambiar las firmas
// de las funciones, así que las pantallas no cambian:
//   - useRecorrido → leer recorridos/510-ida y sus paradas (#16, #18)
//   - useReportes  → escuchar con onSnapshot los reportes del día del recorrido (#22)
//   - crearReporte → addDoc con { recorridoId, paradaId, creadoEn: serverTimestamp() } y NADA más (#21)

const RECORRIDO: Recorrido = {
  id: '510-ida',
  nombre: '510 Ramal 9 → Sede Parque Industrial',
  linea: '510',
  sentido: 'ida',
  // Salidas desde Estación Alberti: 15 min antes de los horarios publicados en Estación Del Viso (07:05, 12:35, 16:35).
  horariosSalida: ['06:50', '12:20', '16:20'],
  // Tiempos entre paradas estimados hasta medir la ruta 0 (#12): la app muestra el aviso.
  ficticia: true,
}

export interface DatosRecorrido {
  recorrido: Recorrido
  paradas: Parada[]
}

const DATOS: DatosRecorrido = {
  recorrido: RECORRIDO,
  paradas: paradasDesdeCsv(rutaCsv),
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
