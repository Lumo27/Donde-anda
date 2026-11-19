import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import { posicionEstimada } from './posicion'
import { proyectarColectivo, type DatosProyeccion } from './proyeccion'

const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)
const hora = (hhmmss: string) => new Date(`2026-10-26T${hhmmss}-03:00`)
const base: Omit<DatosProyeccion, 'ultimoReporte' | 'ahora'> = {
  paradas,
  horariosSalida: ['07:00', '08:30'],
  margen: { detenidoMinimoSeg: 30, tramoPorcentaje: 10 },
}
const posicion = (ahora: Date, ultimoReporte: DatosProyeccion['ultimoReporte'] = null) =>
  posicionEstimada(proyectarColectivo({ ...base, ultimoReporte, ahora }), ahora)

describe('posicionEstimada (#36)', () => {
  it('antes de salir: espera en la cabecera', () => {
    expect(posicion(hora('06:55:00'))).toEqual({ tipo: 'por_salir', salida: hora('07:00:00') })
  })

  it('por horario: entre dos paradas, con la fracción del tramo', () => {
    // Llega a la parada 2 a los 231 s y a la 3 a los 475,5 s → a los 353 s va por la mitad
    const p = posicion(new Date(hora('07:00:00').getTime() + 353_250))
    expect(p).toMatchObject({ tipo: 'en_viaje', desde: 1 })
    if (p.tipo === 'en_viaje') expect(p.fraccion).toBeCloseTo(0.5)
  })

  it('en vivo: arranca desde la parada del último reporte', () => {
    const p = posicion(hora('07:36:30'), { paradaId: 'del-viso', creadoEn: hora('07:36:00') })
    expect(p).toMatchObject({ tipo: 'en_viaje', desde: 6 })
    if (p.tipo === 'en_viaje') {
      expect(p.fraccion).toBeGreaterThan(0)
      expect(p.progreso).toBeGreaterThan(6 / 9)
      expect(p.progreso).toBeLessThan(7 / 9)
    }
  })

  it('el progreso va de 0 a 1 a lo largo del recorrido', () => {
    const al = (seg: number) => posicion(new Date(hora('07:00:00').getTime() + seg * 1000))
    const a = al(100)
    const b = al(2000)
    expect(a.tipo === 'en_viaje' && b.tipo === 'en_viaje' && a.progreso < b.progreso).toBe(true)
  })
})
