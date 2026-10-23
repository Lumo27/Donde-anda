import type { Parada } from '../../types/modelos'
import { MARGEN_DETENIDO_SEG, MARGEN_TRAMO_PORCENTAJE } from './config'

// Cálculos base del recorrido a partir de la ruta 0 (#13). Funciones puras: sin Firebase ni React.
//
// Convención: la "salida" es el momento en que el colectivo arranca desde la cabecera (orden 1).
// Lo que espera en la cabecera antes de salir no cuenta como tiempo de viaje.
// Cada función usa los tiempos de las paradas tal como vienen. Para estimar con margen de
// seguridad, pasarles las paradas por `aplicarMargen` (#14) antes.

export function enOrden(paradas: Parada[]): Parada[] {
  return [...paradas].sort((a, b) => a.orden - b.orden)
}

export interface Margen {
  /** Piso de segundos detenido en cada parada intermedia. */
  detenidoMinimoSeg: number
  /** Cuánto se estira cada tramo, en %. */
  tramoPorcentaje: number
}

export const MARGEN_POR_DEFECTO: Margen = {
  detenidoMinimoSeg: MARGEN_DETENIDO_SEG,
  tramoPorcentaje: MARGEN_TRAMO_PORCENTAJE,
}

/**
 * Infla los tiempos de la ruta 0 para no prometer de menos (#14): cada tramo se estira un %,
 * y en cada parada intermedia se toma al menos el piso de tiempo detenido.
 * No cambia la cabecera (su espera no cuenta) ni la última parada (ahí termina el viaje).
 */
export function aplicarMargen(paradas: Parada[], margen: Margen = MARGEN_POR_DEFECTO): Parada[] {
  const ordenadas = enOrden(paradas)
  return ordenadas.map((p, i) => {
    const esIntermedia = i > 0 && i < ordenadas.length - 1
    return {
      ...p,
      segundosDesdeAnterior: p.segundosDesdeAnterior * (1 + margen.tramoPorcentaje / 100),
      segundosDetenido: esIntermedia
        ? Math.max(p.segundosDetenido, margen.detenidoMinimoSeg)
        : p.segundosDetenido,
    }
  })
}

/** Segundos desde la salida de la cabecera hasta que el colectivo LLEGA a cada parada (en orden). */
export function segundosHastaLlegar(paradas: Parada[]): number[] {
  const ordenadas = enOrden(paradas)
  const resultado: number[] = []
  let acumulado = 0
  ordenadas.forEach((p, i) => {
    if (i > 0) {
      // Se suma lo que estuvo detenido en la parada anterior (salvo en la cabecera) y el tramo hasta esta.
      if (i > 1) acumulado += ordenadas[i - 1].segundosDetenido
      acumulado += p.segundosDesdeAnterior
    }
    resultado.push(acumulado)
  })
  return resultado
}

/** Segundos desde la salida de la cabecera hasta que el colectivo SALE de cada parada (en orden). */
export function segundosHastaSalir(paradas: Parada[]): number[] {
  const llegadas = segundosHastaLlegar(paradas)
  return enOrden(paradas).map((p, i) => (i === 0 ? 0 : llegadas[i] + p.segundosDetenido))
}

export interface ResumenRecorrido {
  cantidadParadas: number
  /** Paradas intermedias en las que el colectivo efectivamente frenó. */
  vecesQueSeDetiene: number
  /** De la salida de la cabecera a la llegada a la última parada. */
  segundosTotales: number
  /** Promedio de lo que se queda detenido, solo entre las paradas donde frenó. */
  segundosPromedioDetenido: number
}

export function resumenRecorrido(paradas: Parada[]): ResumenRecorrido {
  const ordenadas = enOrden(paradas)
  const intermedias = ordenadas.slice(1, -1)
  const detenciones = intermedias.filter((p) => p.segundosDetenido > 0)
  const llegadas = segundosHastaLlegar(ordenadas)
  return {
    cantidadParadas: ordenadas.length,
    vecesQueSeDetiene: detenciones.length,
    segundosTotales: llegadas[llegadas.length - 1] ?? 0,
    segundosPromedioDetenido:
      detenciones.length === 0
        ? 0
        : detenciones.reduce((suma, p) => suma + p.segundosDetenido, 0) / detenciones.length,
  }
}

// Argentina está en UTC-3 todo el año (sin horario de verano), así que alcanza con un offset fijo.
const OFFSET_ARGENTINA = '-03:00'
const MS_OFFSET_ARGENTINA = -3 * 60 * 60 * 1000

/** Fecha "AAAA-MM-DD" del día en Argentina en que cae `momento`. */
export function fechaEnArgentina(momento: Date): string {
  return new Date(momento.getTime() + MS_OFFSET_ARGENTINA).toISOString().slice(0, 10)
}

/** Convierte un horario de salida "HH:mm" (hora de Argentina) en un Date del mismo día que `referencia`. */
export function horaSalidaDelDia(hhmm: string, referencia: Date): Date {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) {
    throw new Error(`Horario de salida inválido: "${hhmm}" (se espera HH:mm)`)
  }
  return new Date(`${fechaEnArgentina(referencia)}T${hhmm}:00${OFFSET_ARGENTINA}`)
}

export interface HorarioEstimado {
  paradaId: string
  llegada: Date
}

/** Hora estimada de llegada a cada parada para un colectivo que sale de la cabecera en `salida`. */
export function horariosEstimados(paradas: Parada[], salida: Date): HorarioEstimado[] {
  const llegadas = segundosHastaLlegar(paradas)
  return enOrden(paradas).map((p, i) => ({
    paradaId: p.id,
    llegada: new Date(salida.getTime() + llegadas[i] * 1000),
  }))
}
