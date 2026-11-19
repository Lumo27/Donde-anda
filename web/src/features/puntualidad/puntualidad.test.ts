import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import { calcularEstado } from './puntualidad'

const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)
const horarios = ['07:00', '08:30', '13:00', '17:30']
// Valores fijos para que los tests no dependan de config.ts.
const opciones = { margen: { detenidoMinimoSeg: 30, tramoPorcentaje: 10 }, toleranciaMin: 2 }

// Con ese margen, el colectivo de las 07:00 debería salir de Del Viso a las 07:33:26 (salida + 2006 s).
const enDelViso = (hora: string) => ({
  paradaId: 'del-viso',
  creadoEn: new Date(`2026-10-26T${hora}-03:00`),
})

describe('calcularEstado (#23)', () => {
  it('a tiempo: dentro de la tolerancia', () => {
    expect(calcularEstado(enDelViso('07:34:00'), horarios, paradas, opciones)).toEqual({
      estado: 'a_tiempo',
      minutosDiferencia: 1,
      salida: new Date('2026-10-26T07:00:00-03:00'),
    })
  })

  it('atrasado: pasó después de lo esperado', () => {
    const r = calcularEstado(enDelViso('07:40:00'), horarios, paradas, opciones)
    expect(r?.estado).toBe('atrasado')
    expect(r?.minutosDiferencia).toBe(7)
  })

  it('adelantado: pasó antes de lo esperado', () => {
    const r = calcularEstado(enDelViso('07:28:00'), horarios, paradas, opciones)
    expect(r?.estado).toBe('adelantado')
    expect(r?.minutosDiferencia).toBe(-5)
  })

  it('asocia el reporte a la salida más cercana', () => {
    // 09:05 en Del Viso corresponde al de las 08:30 (esperado 09:03:26), no al de las 07:00.
    const r = calcularEstado(enDelViso('09:05:00'), horarios, paradas, opciones)
    expect(r?.salida).toEqual(new Date('2026-10-26T08:30:00-03:00'))
    expect(r?.estado).toBe('a_tiempo')
  })

  it('el límite de la tolerancia todavía es "a tiempo"', () => {
    // 07:35:26 = 2 min justos de atraso
    expect(calcularEstado(enDelViso('07:35:26'), horarios, paradas, opciones)?.estado).toBe('a_tiempo')
  })

  it('devuelve null si la parada no es del recorrido o no hay horarios', () => {
    const otraParada = { paradaId: 'no-existe', creadoEn: new Date() }
    expect(calcularEstado(otraParada, horarios, paradas, opciones)).toBeNull()
    expect(calcularEstado(enDelViso('07:34:00'), [], paradas, opciones)).toBeNull()
  })

  it('funciona con los valores por defecto de config.ts', () => {
    expect(calcularEstado(enDelViso('07:34:00'), horarios, paradas)?.estado).toBeDefined()
  })
})
