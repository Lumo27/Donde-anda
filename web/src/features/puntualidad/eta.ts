import type { Parada, Reporte } from '../../types/modelos'
import {
  aplicarMargen,
  enOrden,
  horaSalidaDelDia,
  segundosHastaLlegar,
  segundosHastaSalir,
  type Margen,
} from './calculos'
import { TOLERANCIA_A_TIEMPO_MIN } from './config'
import { calcularEstado } from './puntualidad'

// ¿Cuánto falta para que llegue a MI parada? (#24) El dato principal de la pantalla de inicio.

export type Estimacion =
  /** Calculado desde el último "Me subí" de un colectivo que todavía no pasó por mi parada. */
  | { tipo: 'en_vivo'; minutos: number; llegada: Date }
  /** Sin reporte útil: próximo colectivo según el horario de salida + ruta 0. */
  | { tipo: 'por_horario'; minutos: number; llegada: Date; salida: Date }
  /** No quedan colectivos en el día. */
  | { tipo: 'sin_servicio' }

export interface DatosEstimacion {
  ultimoReporte: Pick<Reporte, 'paradaId' | 'creadoEn'> | null
  miParadaId: string
  paradas: Parada[]
  horariosSalida: string[]
  ahora: Date
  margen?: Margen
}

const minutosEntre = (desde: Date, hasta: Date) =>
  Math.max(0, Math.round((hasta.getTime() - desde.getTime()) / 60000))

/** Devuelve null si "mi parada" no es del recorrido. */
export function estimarLlegadaAMiParada({
  ultimoReporte,
  miParadaId,
  paradas,
  horariosSalida,
  ahora,
  margen,
}: DatosEstimacion): Estimacion | null {
  const conMargen = enOrden(aplicarMargen(paradas, margen))
  const indiceMia = conMargen.findIndex((p) => p.id === miParadaId)
  if (indiceMia === -1) return null

  const llegadas = segundosHastaLlegar(conMargen)
  const salidas = segundosHastaSalir(conMargen)
  const duracionTotalMs = llegadas[llegadas.length - 1] * 1000

  // Si hay un reporte, el colectivo de ese reporte ya no sirve para buscar el próximo por horario.
  let salidaDelReporte: Date | null = null

  if (ultimoReporte) {
    const indiceReporte = conMargen.findIndex((p) => p.id === ultimoReporte.paradaId)
    const antiguedadMs = ahora.getTime() - ultimoReporte.creadoEn.getTime()
    // Un reporte más viejo que el recorrido entero es de un colectivo que ya llegó.
    const sigueEnViaje = indiceReporte !== -1 && antiguedadMs >= 0 && antiguedadMs <= duracionTotalMs

    if (sigueEnViaje) {
      salidaDelReporte =
        calcularEstado(ultimoReporte, horariosSalida, paradas, { margen })?.salida ?? null

      if (indiceReporte < indiceMia) {
        const llegada = new Date(
          ultimoReporte.creadoEn.getTime() + (llegadas[indiceMia] - salidas[indiceReporte]) * 1000,
        )
        // Si según la cuenta ya tendría que haber llegado hace rato, lo damos por pasado.
        const yaPaso = ahora.getTime() - llegada.getTime() > TOLERANCIA_A_TIEMPO_MIN * 60000
        if (!yaPaso) return { tipo: 'en_vivo', minutos: minutosEntre(ahora, llegada), llegada }
      }
    }
  }

  // Por horario: el primer colectivo que todavía no pasó por mi parada (y no es el del reporte).
  const candidatos = horariosSalida
    .map((h) => horaSalidaDelDia(h, ahora))
    .filter((salida) => !salidaDelReporte || salida.getTime() > salidaDelReporte.getTime())
    .sort((a, b) => a.getTime() - b.getTime())

  for (const salida of candidatos) {
    const llegada = new Date(salida.getTime() + llegadas[indiceMia] * 1000)
    if (llegada.getTime() >= ahora.getTime()) {
      return { tipo: 'por_horario', minutos: minutosEntre(ahora, llegada), llegada, salida }
    }
  }
  return { tipo: 'sin_servicio' }
}
