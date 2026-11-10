import { describe, expect, it } from 'vitest'
import type { Parada } from '../../types/modelos'
import { distanciaMetros, distanciaPorRecorrido, paradaMasCercana, textoDistancia } from './cercania'

const parada = (id: string, lat?: number, lng?: number): Parada => ({
  id,
  orden: 1,
  nombre: id,
  segundosDesdeAnterior: 0,
  segundosDetenido: 0,
  lat,
  lng,
})

describe('cercanía (#38)', () => {
  it('mide distancias en metros', () => {
    // Una cuadra porteña (~100 m) hacia el norte: 0,0009° de latitud
    expect(distanciaMetros({ lat: -34.45, lng: -58.8 }, { lat: -34.4491, lng: -58.8 })).toBeCloseTo(100, -1)
  })

  it('elige la parada más cercana e ignora las que no tienen coordenadas', () => {
    const paradas = [
      parada('lejos', -34.46, -58.77),
      parada('sin-ubicacion'),
      parada('cerca', -34.4476, -58.8033),
    ]
    const r = paradaMasCercana(paradas, { lat: -34.448, lng: -58.803 })
    expect(r?.parada.id).toBe('cerca')
    expect(r?.metros).toBeLessThan(100)
  })

  it('null si ninguna parada tiene coordenadas', () => {
    expect(paradaMasCercana([parada('a'), parada('b')], { lat: 0, lng: 0 })).toBeNull()
  })

  it('escribe la distancia de forma amigable', () => {
    expect(textoDistancia(340)).toBe('a 350 m')
    expect(textoDistancia(12)).toBe('a 50 m')
    expect(textoDistancia(1234)).toBe('a 1,2 km')
  })
})

describe('distancia por recorrido (#40)', () => {
  // Tres paradas en línea recta hacia el norte, a ~100 m una de otra
  const enFila = [parada('a', -34.45, -58.8), parada('b', -34.4491, -58.8), parada('c', -34.4482, -58.8)]

  it('suma tramo por tramo', () => {
    expect(distanciaPorRecorrido(enFila, 0, 2)).toBeCloseTo(200, -1)
  })

  it('0 si es la misma parada o ya quedó atrás', () => {
    expect(distanciaPorRecorrido(enFila, 2, 2)).toBe(0)
    expect(distanciaPorRecorrido(enFila, 2, 0)).toBe(0)
  })

  it('null si falta la ubicación de alguna parada del tramo', () => {
    expect(distanciaPorRecorrido([...enFila, parada('sin')], 1, 3)).toBeNull()
  })
})
