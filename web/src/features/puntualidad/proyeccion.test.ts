import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import { proyectarColectivo, type DatosProyeccion } from './proyeccion'

const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)
const hora = (hhmmss: string) => new Date(`2026-10-26T${hhmmss}-03:00`)
const base: Omit<DatosProyeccion, 'ultimoReporte' | 'ahora'> = {
  paradas,
  horariosSalida: ['07:00', '08:30', '13:00', '17:30'],
  margen: { detenidoMinimoSeg: 30, tramoPorcentaje: 10 },
}
const subioEnDelViso = (hhmmss: string) => ({ paradaId: 'del-viso', creadoEn: hora(hhmmss) })

describe('proyectarColectivo', () => {
  it('en vivo: marca lo que ya pasó y estima lo que falta desde el reporte', () => {
    const p = proyectarColectivo({ ...base, ultimoReporte: subioEnDelViso('07:36:00'), ahora: hora('07:38:00') })
    expect(p.fuente).toBe('en_vivo')
    if (p.fuente !== 'en_vivo') return
    expect(p.salida).toEqual(hora('07:00:00'))
    expect(p.pasos[3]).toEqual({ paradaId: 'alberti', llegada: null, yaPaso: true })
    expect(p.pasos[6]).toEqual({ paradaId: 'del-viso', llegada: hora('07:36:00'), yaPaso: true })
    expect(p.pasos[7].yaPaso).toBe(false)
    // Del Viso → Parada ficticia 8: 368,5 s
    expect(p.pasos[7].llegada).toEqual(new Date(hora('07:36:00').getTime() + 368500))
  })

  it('por horario si no hay reportes: el próximo que todavía no llegó a la facu', () => {
    // 07:30: el de las 07:00 sigue en viaje (llega 07:55:09)
    const p = proyectarColectivo({ ...base, ultimoReporte: null, ahora: hora('07:30:00') })
    expect(p).toMatchObject({ fuente: 'por_horario', salida: hora('07:00:00') })
    if (p.fuente !== 'por_horario') return
    expect(p.pasos[0].yaPaso).toBe(true)
    expect(p.pasos[9].yaPaso).toBe(false)
  })

  it('cuando el reportado ya llegó a la facu, pasa al siguiente por horario', () => {
    const p = proyectarColectivo({ ...base, ultimoReporte: subioEnDelViso('07:36:00'), ahora: hora('08:10:00') })
    expect(p).toMatchObject({ fuente: 'por_horario', salida: hora('08:30:00') })
  })

  it('sin servicio después del último colectivo', () => {
    expect(proyectarColectivo({ ...base, ultimoReporte: null, ahora: hora('20:00:00') })).toEqual({
      fuente: 'sin_servicio',
    })
  })
})
