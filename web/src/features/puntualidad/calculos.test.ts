import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import {
  fechaEnArgentina,
  horaSalidaDelDia,
  horariosEstimados,
  resumenRecorrido,
  segundosHastaLlegar,
  segundosHastaSalir,
} from './calculos'

// Ruta ficticia: sale de la cabecera 07:02:10 y llega a Parque Industrial 07:51:15 (ver docs/ruta0).
const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)

describe('segundosHastaLlegar', () => {
  it('coincide con las horas reales del CSV, contando desde la salida de la cabecera', () => {
    const llegadas = segundosHastaLlegar(paradas)
    expect(llegadas[0]).toBe(0)
    expect(llegadas[1]).toBe(210) // 07:05:40
    expect(llegadas[6]).toBe(1730) // Del Viso 07:31:00
    expect(llegadas[9]).toBe(2945) // Parque Industrial 07:51:15
  })

  it('no depende del orden en que vengan las paradas', () => {
    const mezcladas = [...paradas].reverse()
    expect(segundosHastaLlegar(mezcladas)).toEqual(segundosHastaLlegar(paradas))
  })
})

describe('segundosHastaSalir', () => {
  it('suma lo que se queda detenido en cada parada', () => {
    const salidas = segundosHastaSalir(paradas)
    expect(salidas[0]).toBe(0) // la cabecera: la salida es el punto de partida
    expect(salidas[6]).toBe(1795) // Del Viso sale 07:32:05
  })
})

describe('resumenRecorrido', () => {
  const resumen = resumenRecorrido(paradas)

  it('cuenta paradas y detenciones', () => {
    expect(resumen.cantidadParadas).toBe(10)
    // Frena en 6 de las 8 intermedias (no frena en Parada ficticia 3 ni 9)
    expect(resumen.vecesQueSeDetiene).toBe(6)
  })

  it('calcula el tiempo total de punta a punta', () => {
    expect(resumen.segundosTotales).toBe(2945) // 49 min 5 s
  })

  it('promedia el tiempo detenido solo donde frenó', () => {
    expect(resumen.segundosPromedioDetenido).toBeCloseTo(205 / 6)
  })

  it('no explota con un recorrido vacío', () => {
    expect(resumenRecorrido([])).toEqual({
      cantidadParadas: 0,
      vecesQueSeDetiene: 0,
      segundosTotales: 0,
      segundosPromedioDetenido: 0,
    })
  })
})

describe('horarios en hora de Argentina', () => {
  it('toma el día de Argentina aunque en UTC ya sea el día siguiente', () => {
    // 01:00 UTC del 27 = 22:00 del 26 en Argentina
    expect(fechaEnArgentina(new Date('2026-10-27T01:00:00Z'))).toBe('2026-10-26')
  })

  it('convierte "HH:mm" a la hora de ese día', () => {
    const salida = horaSalidaDelDia('07:00', new Date('2026-10-26T15:00:00Z'))
    expect(salida.toISOString()).toBe('2026-10-26T10:00:00.000Z')
  })

  it('rechaza horarios mal escritos', () => {
    expect(() => horaSalidaDelDia('7:00', new Date())).toThrow(/HH:mm/)
  })
})

describe('horariosEstimados', () => {
  it('estima la llegada a cada parada a partir de la salida', () => {
    const salida = new Date('2026-10-26T07:00:00-03:00')
    const horarios = horariosEstimados(paradas, salida)
    expect(horarios).toHaveLength(10)
    expect(horarios[6]).toEqual({
      paradaId: 'del-viso',
      llegada: new Date('2026-10-26T07:28:50-03:00'), // 7:00 + 1730 s
    })
  })
})
