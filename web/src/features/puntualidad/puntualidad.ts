import type { Parada, Reporte } from '../../types/modelos'
import { aplicarMargen, enOrden, horaSalidaDelDia, segundosHastaSalir, type Margen } from './calculos'
import { TOLERANCIA_A_TIEMPO_MIN } from './config'

// ¿El colectivo va a tiempo? (#23)
// Compara dónde DEBERÍA estar según la ruta 0 (con margen) con dónde ESTÁ según el último "Me subí".

export type EstadoPuntualidad = 'a_tiempo' | 'adelantado' | 'atrasado'

export interface ResultadoPuntualidad {
  estado: EstadoPuntualidad
  /** Minutos redondeados: positivo = atrasado, negativo = adelantado. */
  minutosDiferencia: number
  /** Salida de la cabecera a la que se asoció el reporte. */
  salida: Date
}

export interface OpcionesPuntualidad {
  margen?: Margen
  toleranciaMin?: number
}

/**
 * Asume que quien toca "Me subí" lo hace al subir, o sea cuando el colectivo sale de esa parada.
 * El reporte se asocia a la salida programada que deja la diferencia más chica.
 * Devuelve null si la parada no es del recorrido o no hay horarios.
 */
export function calcularEstado(
  reporte: Pick<Reporte, 'paradaId' | 'creadoEn'>,
  horariosSalida: string[],
  paradas: Parada[],
  { margen, toleranciaMin = TOLERANCIA_A_TIEMPO_MIN }: OpcionesPuntualidad = {},
): ResultadoPuntualidad | null {
  const conMargen = enOrden(aplicarMargen(paradas, margen))
  const indice = conMargen.findIndex((p) => p.id === reporte.paradaId)
  if (indice === -1 || horariosSalida.length === 0) return null

  const segundosHastaEsaParada = segundosHastaSalir(conMargen)[indice]
  const real = reporte.creadoEn.getTime()

  let mejor: { salida: Date; diferenciaMs: number } | null = null
  for (const horario of horariosSalida) {
    const salida = horaSalidaDelDia(horario, reporte.creadoEn)
    const esperado = salida.getTime() + segundosHastaEsaParada * 1000
    const diferenciaMs = real - esperado
    if (!mejor || Math.abs(diferenciaMs) < Math.abs(mejor.diferenciaMs)) {
      mejor = { salida, diferenciaMs }
    }
  }
  if (!mejor) return null

  // `|| 0` evita un "-0" cuando la diferencia redondea a cero.
  const minutosDiferencia = Math.round(mejor.diferenciaMs / 60000) || 0
  const estado: EstadoPuntualidad =
    Math.abs(minutosDiferencia) <= toleranciaMin
      ? 'a_tiempo'
      : minutosDiferencia < 0
        ? 'adelantado'
        : 'atrasado'

  return { estado, minutosDiferencia, salida: mejor.salida }
}
