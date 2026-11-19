import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import { colectivosEnRecorrido, proximoAMiParada, type DatosColectivos } from './colectivos'

const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)
const hora = (hhmmss: string) => new Date(`2026-10-26T${hhmmss}-03:00`)

// Dos colectivos en viaje: el de las 07:00 va por Del Viso y el de las 07:15 acaba de pasar por Alberti.
const datos: DatosColectivos = {
  paradas,
  horariosSalida: ['07:00', '07:15', '08:00'],
  margen: { detenidoMinimoSeg: 30, tramoPorcentaje: 10 },
  ahora: hora('07:38:00'),
  reportes: [
    { paradaId: 'alberti', creadoEn: hora('07:16:00') }, // el de las 07:00
    { paradaId: 'alberti', creadoEn: hora('07:30:00') }, // el de las 07:15
    { paradaId: 'del-viso', creadoEn: hora('07:36:00') }, // el de las 07:00
  ],
}

describe('colectivosEnRecorrido (#37)', () => {
  const colectivos = colectivosEnRecorrido(datos)

  it('sigue a cada colectivo por separado y suma el próximo por salir', () => {
    expect(colectivos.map((c) => c.horario)).toEqual(['07:00', '07:15', '08:00'])
    expect(colectivos.map((c) => c.posicion.tipo)).toEqual(['en_viaje', 'en_viaje', 'por_salir'])
  })

  it('asigna cada reporte a su colectivo: el de Alberti 07:30 es del de las 07:15', () => {
    expect(colectivos[0].ultimoReporte?.paradaId).toBe('del-viso')
    expect(colectivos[1].ultimoReporte).toEqual({ paradaId: 'alberti', creadoEn: hora('07:30:00') })
  })

  it('cada uno está donde corresponde según su último reporte', () => {
    expect(colectivos[0].posicion).toMatchObject({ desde: 6 }) // salió de Del Viso hace 2 min
    // Pasó por Alberti a las 07:30; 8 min después ya dejó atrás la Parada ficticia 5 (~4 min de tramo)
    expect(colectivos[1].posicion).toMatchObject({ desde: 4 })
  })

  it('no incluye colectivos que ya llegaron a la facu', () => {
    const tarde = colectivosEnRecorrido({ ...datos, ahora: hora('08:20:00') })
    expect(tarde.map((c) => c.horario)).toEqual(['08:00'])
  })
})

describe('proximoAMiParada (#37)', () => {
  it('usa el colectivo que todavía no pasó: el de las 07:00 llega a la 8 en ~4 min', () => {
    expect(proximoAMiParada({ ...datos, miParadaId: 'parada-ficticia-8' })).toMatchObject({
      tipo: 'en_vivo',
      minutos: 4,
      horario: '07:00',
    })
  })

  it('si los dos que están en viaje ya pasaron por mi parada, avisa del siguiente por horario', () => {
    // Alberti: el de las 07:00 pasó hace rato y el de las 07:15 se subió alguien ahí a las 07:30
    expect(proximoAMiParada({ ...datos, miParadaId: 'alberti' })).toMatchObject({
      tipo: 'por_horario',
      minutos: 36,
      horario: '08:00',
    })
  })

  it('null si ya no queda ningún colectivo en el día', () => {
    expect(proximoAMiParada({ ...datos, miParadaId: 'alberti', ahora: hora('20:00:00') })).toBeNull()
  })
})
