import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import { colectivosEnRecorrido } from '../puntualidad/colectivos'
import { calcularEstado } from '../puntualidad/puntualidad'
import { horariosDeSimulacion, reportesSimulados } from './simulacion'

const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)
const margen = { detenidoMinimoSeg: 30, tramoPorcentaje: 10 }
const inicio = new Date('2026-10-29T15:10:30-03:00')
const horarios = horariosDeSimulacion(inicio)
const reportes = reportesSimulados('510-ida', paradas, horarios, inicio)
const yaOcurridos = reportes.filter((r) => r.creadoEn <= inicio)

describe('simulación de demo (#36)', () => {
  it('el 1º salió hace 23 min, el 2º 15 min después y el 3º todavía no salió', () => {
    expect(horarios).toEqual(['14:47', '15:02', '15:47'])
  })

  it('al abrir hay dos colectivos en viaje y uno por salir', () => {
    const colectivos = colectivosEnRecorrido({ reportes: yaOcurridos, paradas, horariosSalida: horarios, ahora: inicio, margen })
    expect(colectivos.map((c) => [c.horario, c.posicion.tipo])).toEqual([
      ['14:47', 'en_viaje'],
      ['15:02', 'en_viaje'],
      ['15:47', 'por_salir'],
    ])
    // El 1º ya tiene 3 paradas reportadas; el último reporte de cada uno:
    expect(colectivos[0].ultimoReporte?.paradaId).toBe('parada-ficticia-5')
    expect(colectivos[1].ultimoReporte?.paradaId).toBe('parada-ficticia-2')
  })

  it('al abrir ya hay 4 "Me subí": 3 del primero y 1 del segundo', () => {
    expect(yaOcurridos.map((r) => r.paradaId)).toEqual([
      'parada-ficticia-2', // 1º
      'alberti', // 1º
      'parada-ficticia-2', // 2º
      'parada-ficticia-5', // 1º
    ])
  })

  it('los reportes siguientes llegan después (los colectivos siguen avanzando)', () => {
    const proximos = reportes.filter((r) => r.creadoEn > inicio).slice(0, 2)
    // El 2º viene adelantado: reporta Alberti (15:14) y la 5 (15:18) antes de que el 1º llegue a Del Viso (15:22)
    expect(proximos.map((r) => r.paradaId)).toEqual(['alberti', 'parada-ficticia-5'])
  })

  it('el primero se va atrasando: a tiempo en Alberti, atrasado al llegar a la 8', () => {
    const delPrimero = (paradaId: string) => reportes.find((r) => r.id.startsWith('sim-0-') && r.paradaId === paradaId)!
    const estado = (paradaId: string) =>
      calcularEstado(delPrimero(paradaId), horarios, paradas, { margen, toleranciaMin: 2 })?.estado
    expect(estado('alberti')).toBe('a_tiempo')
    expect(estado('parada-ficticia-8')).toBe('atrasado')
  })

  it('los reportes ficticios tampoco dicen quién: solo recorrido, parada y hora', () => {
    expect(Object.keys(reportes[0]).sort()).toEqual(['creadoEn', 'id', 'paradaId', 'recorridoId'])
  })
})
