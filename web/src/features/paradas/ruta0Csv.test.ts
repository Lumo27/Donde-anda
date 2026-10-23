import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { idDeParada, paradasDesdeCsv, segundosDelDia } from './ruta0Csv'

const csvFicticio = readFileSync(
  new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url),
  'utf-8',
)

describe('segundosDelDia', () => {
  it('convierte hh:mm:ss a segundos', () => {
    expect(segundosDelDia('07:05:40')).toBe(7 * 3600 + 5 * 60 + 40)
  })

  it('rechaza horas mal escritas', () => {
    expect(() => segundosDelDia('7:05')).toThrow(/hh:mm:ss/)
  })
})

describe('idDeParada', () => {
  it('saca acentos, mayúsculas y espacios', () => {
    expect(idDeParada('Del Viso')).toBe('del-viso')
    expect(idDeParada('Parque Industrial')).toBe('parque-industrial')
    expect(idDeParada('  Estación Pilar ')).toBe('estacion-pilar')
  })
})

describe('paradasDesdeCsv con la ruta ficticia', () => {
  const paradas = paradasDesdeCsv(csvFicticio)

  it('lee las 10 paradas en orden', () => {
    expect(paradas).toHaveLength(10)
    expect(paradas.map((p) => p.orden)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(paradas[0].nombre).toBe('Primera parada')
    expect(paradas[9].id).toBe('parque-industrial')
  })

  it('la cabecera no tiene tramo anterior', () => {
    expect(paradas[0].segundosDesdeAnterior).toBe(0)
  })

  it('calcula el tramo desde que salió de la anterior hasta que llegó', () => {
    // Sale de Primera parada 07:02:10, llega a Parada ficticia 2 07:05:40 → 3 min 30 s
    expect(paradas[1].segundosDesdeAnterior).toBe(210)
  })

  it('calcula cuánto se quedó detenido', () => {
    const delViso = paradas.find((p) => p.id === 'del-viso')!
    expect(delViso.segundosDetenido).toBe(65) // 07:31:00 → 07:32:05
    expect(paradas[2].segundosDetenido).toBe(0) // no paró
  })
})
