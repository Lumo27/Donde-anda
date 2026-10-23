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

// ¿Por dónde va el colectivo en cada parada? (#27, #29)
// Proyecta el colectivo "actual": el del último reporte si sigue en viaje, o si no, el próximo por horario.

export interface PasoEstimado {
  paradaId: string
  /** Hora estimada de llegada. null en las paradas que ya pasó antes del reporte (no se sabe a qué hora). */
  llegada: Date | null
  yaPaso: boolean
}

export type Proyeccion =
  | { fuente: 'en_vivo'; salida: Date | null; paradaReportadaId: string; pasos: PasoEstimado[] }
  | { fuente: 'por_horario'; salida: Date; pasos: PasoEstimado[] }
  | { fuente: 'sin_servicio' }

export interface DatosProyeccion {
  ultimoReporte: Pick<Reporte, 'paradaId' | 'creadoEn'> | null
  paradas: Parada[]
  horariosSalida: string[]
  ahora: Date
  margen?: Margen
}

export function proyectarColectivo({
  ultimoReporte,
  paradas,
  horariosSalida,
  ahora,
  margen,
}: DatosProyeccion): Proyeccion {
  const conMargen = enOrden(aplicarMargen(paradas, margen))
  if (conMargen.length === 0) return { fuente: 'sin_servicio' }
  const llegadas = segundosHastaLlegar(conMargen)
  const salidas = segundosHastaSalir(conMargen)
  const ultima = conMargen.length - 1
  const toleranciaMs = TOLERANCIA_A_TIEMPO_MIN * 60000

  let salidaDelReporte: Date | null = null

  if (ultimoReporte) {
    const r = conMargen.findIndex((p) => p.id === ultimoReporte.paradaId)
    const desdeReporte = (i: number) =>
      new Date(ultimoReporte.creadoEn.getTime() + (llegadas[i] - salidas[r]) * 1000)

    if (r !== -1 && ultimoReporte.creadoEn.getTime() <= ahora.getTime()) {
      salidaDelReporte = calcularEstado(ultimoReporte, horariosSalida, paradas, { margen })?.salida ?? null
      // Sigue en viaje si todavía no tendría que haber llegado a la facu.
      const llegadaFinal = r === ultima ? ultimoReporte.creadoEn : desdeReporte(ultima)
      if (ahora.getTime() - llegadaFinal.getTime() <= toleranciaMs && r < ultima) {
        const pasos = conMargen.map((p, i): PasoEstimado => {
          if (i < r) return { paradaId: p.id, llegada: null, yaPaso: true }
          if (i === r) return { paradaId: p.id, llegada: ultimoReporte.creadoEn, yaPaso: true }
          const llegada = desdeReporte(i)
          return { paradaId: p.id, llegada, yaPaso: llegada.getTime() < ahora.getTime() }
        })
        return { fuente: 'en_vivo', salida: salidaDelReporte, paradaReportadaId: conMargen[r].id, pasos }
      }
    }
  }

  // Por horario: el primer colectivo (posterior al del reporte, si hubo) que todavía no llegó a la facu.
  const candidatos = horariosSalida
    .map((h) => horaSalidaDelDia(h, ahora))
    .filter((s) => !salidaDelReporte || s.getTime() > salidaDelReporte.getTime())
    .sort((a, b) => a.getTime() - b.getTime())

  for (const salida of candidatos) {
    if (salida.getTime() + llegadas[ultima] * 1000 < ahora.getTime()) continue
    const pasos = conMargen.map((p, i): PasoEstimado => {
      const llegada = new Date(salida.getTime() + llegadas[i] * 1000)
      return { paradaId: p.id, llegada, yaPaso: llegada.getTime() < ahora.getTime() }
    })
    return { fuente: 'por_horario', salida, pasos }
  }
  return { fuente: 'sin_servicio' }
}
