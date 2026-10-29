import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import { calcularEstado } from '../puntualidad/puntualidad'
import { horariosDeSimulacion, reportesSimulados } from './simulacion'

const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)
const inicio = new Date('2026-10-29T15:10:30-03:00')
const horarios = horariosDeSimulacion(inicio)
const reportes = reportesSimulados('510-ida', paradas, horarios, inicio)
const yaOcurridos = reportes.filter((r) => r.creadoEn <= inicio)

describe('simulación de demo (#36)', () => {
  it('el primer colectivo salió 23 min antes de abrir la demo y hay 3 salidas cada 45 min', () => {
    expect(horarios).toEqual(['14:47', '15:32', '16:17'])
  })

  it('al abrir ya hay un viaje en curso con 3 paradas reportadas', () => {
    expect(yaOcurridos.map((r) => r.paradaId)).toEqual(['parada-ficticia-2', 'alberti', 'parada-ficticia-5'])
  })

  it('los reportes siguientes llegan después (el colectivo sigue avanzando)', () => {
    const proximos = reportes.filter((r) => r.creadoEn > inicio).slice(0, 2)
    expect(proximos.map((r) => r.paradaId)).toEqual(['del-viso', 'parada-ficticia-8'])
  })

  it('el primer viaje se va atrasando: a tiempo en Alberti, atrasado más adelante', () => {
    const estado = (paradaId: string) =>
      calcularEstado(yaOcurridos.find((r) => r.paradaId === paradaId)!, horarios, paradas, {
        margen: { detenidoMinimoSeg: 30, tramoPorcentaje: 10 },
        toleranciaMin: 2,
      })?.estado
    expect(estado('alberti')).toBe('a_tiempo')
    expect(estado('parada-ficticia-5')).toBe('atrasado')
  })

  it('los reportes ficticios tampoco dicen quién: solo recorrido, parada y hora', () => {
    expect(Object.keys(reportes[0]).sort()).toEqual(['creadoEn', 'id', 'paradaId', 'recorridoId'])
  })
})
