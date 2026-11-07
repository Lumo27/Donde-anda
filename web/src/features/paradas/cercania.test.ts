import { describe, expect, it } from 'vitest'
import type { Parada } from '../../types/modelos'
import { distanciaMetros, paradaMasCercana, textoDistancia } from './cercania'

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
