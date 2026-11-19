import type { Parada, Reporte } from '../../types/modelos'
import { horaSalidaDelDia, type Margen } from './calculos'
import { estimarLlegadaAMiParada, type Estimacion } from './eta'
import { posicionEstimada, type Posicion } from './posicion'
import { proyectarColectivo, type Proyeccion } from './proyeccion'
import { calcularEstado } from './puntualidad'

// Varios colectivos a la vez en el recorrido (#37).
// Los "Me subí" son anónimos: no dicen de qué colectivo son. Cada reporte se asigna a la salida
// programada que mejor lo explica (la de menor diferencia, como en la puntualidad) y cada colectivo
// se sigue por separado con su último reporte.

type ReporteMinimo = Pick<Reporte, 'paradaId' | 'creadoEn'>

export interface Colectivo {
  /** Horario de salida "HH:mm": identifica al colectivo. */
  horario: string
  salida: Date
  ultimoReporte: ReporteMinimo | null
  proyeccion: Exclude<Proyeccion, { fuente: 'sin_servicio' }>
  posicion: Extract<Posicion, { tipo: 'en_viaje' | 'por_salir' }>
}

export interface DatosColectivos {
  reportes: ReporteMinimo[]
  paradas: Parada[]
  horariosSalida: string[]
  ahora: Date
  margen?: Margen
}

/** El último reporte de cada salida. */
function reportesPorSalida({ reportes, paradas, horariosSalida, ahora, margen }: DatosColectivos) {
  const porHorario = new Map<string, ReporteMinimo>()
  for (const r of reportes) {
    if (r.creadoEn > ahora) continue
    const salida = calcularEstado(r, horariosSalida, paradas, { margen })?.salida
    const horario = horariosSalida.find((h) => horaSalidaDelDia(h, r.creadoEn).getTime() === salida?.getTime())
    if (!horario) continue
    const previo = porHorario.get(horario)
    if (!previo || r.creadoEn >= previo.creadoEn) porHorario.set(horario, r)
  }
  return porHorario
}

/**
 * Los colectivos que están en viaje ahora (en orden de salida) y, si hay, el próximo por salir.
 * Los que ya llegaron a la facu no se incluyen.
 */
export function colectivosEnRecorrido(datos: DatosColectivos): Colectivo[] {
  const { paradas, horariosSalida, ahora, margen } = datos
  const ultimos = reportesPorSalida(datos)
  const ordenados = [...horariosSalida].sort()

  const enViaje: Colectivo[] = []
  let proximo: Colectivo | null = null
  for (const horario of ordenados) {
    const ultimoReporte = ultimos.get(horario) ?? null
    const proyeccion = proyectarColectivo({ ultimoReporte, paradas, horariosSalida: [horario], ahora, margen })
    if (proyeccion.fuente === 'sin_servicio') continue
    const posicion = posicionEstimada(proyeccion, ahora)
    const colectivo = (p: Colectivo['posicion']): Colectivo => ({
      horario,
      salida: horaSalidaDelDia(horario, ahora),
      ultimoReporte,
      proyeccion,
      posicion: p,
    })
    if (posicion.tipo === 'en_viaje') enViaje.push(colectivo(posicion))
    else if (posicion.tipo === 'por_salir' && !proximo) proximo = colectivo(posicion)
  }
  return proximo ? [...enViaje, proximo] : enViaje
}

export type EstimacionMiParada = Exclude<Estimacion, { tipo: 'sin_servicio' }> & { horario: string }

/**
 * Cuánto falta para que llegue a mi parada el PRIMER colectivo que todavía no pasó por ahí,
 * mirando todos los que están en viaje y, si ninguno sirve, los que salen más tarde.
 * Devuelve null si no queda ninguno en el día.
 */
export function proximoAMiParada(
  datos: DatosColectivos & { miParadaId: string },
  colectivos: Colectivo[] = colectivosEnRecorrido(datos),
): EstimacionMiParada | null {
  const { paradas, horariosSalida, ahora, margen, miParadaId } = datos
  const candidatos: EstimacionMiParada[] = []

  for (const c of colectivos) {
    const e = estimarLlegadaAMiParada({
      ultimoReporte: c.ultimoReporte,
      miParadaId,
      paradas,
      horariosSalida: [c.horario],
      ahora,
      margen,
    })
    if (e && e.tipo !== 'sin_servicio') candidatos.push({ ...e, horario: c.horario })
  }

  // Los que todavía no salieron (y no están en la lista), por horario.
  const siguientes = horariosSalida.filter((h) => !colectivos.some((c) => c.horario === h))
  const porHorario = estimarLlegadaAMiParada({
    ultimoReporte: null,
    miParadaId,
    paradas,
    horariosSalida: siguientes,
    ahora,
    margen,
  })
  if (porHorario && porHorario.tipo === 'por_horario') {
    const horario = siguientes.find((h) => horaSalidaDelDia(h, ahora).getTime() === porHorario.salida.getTime())
    if (horario) candidatos.push({ ...porHorario, horario })
  }

  candidatos.sort((a, b) => a.llegada.getTime() - b.llegada.getTime())
  return candidatos[0] ?? null
}
