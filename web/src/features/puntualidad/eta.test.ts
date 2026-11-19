import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paradasDesdeCsv } from '../paradas/ruta0Csv'
import { estimarLlegadaAMiParada, type DatosEstimacion } from './eta'

const paradas = paradasDesdeCsv(
  readFileSync(new URL('../../../../docs/ruta0/ruta0-FICTICIA.csv', import.meta.url), 'utf-8'),
)
const hora = (hhmmss: string) => new Date(`2026-10-26T${hhmmss}-03:00`)

// Con margen 30 s / 10 %, desde la salida de la cabecera:
//   llega a Alberti a los 846,5 s · sale de Del Viso a los 2006 s · llega a Parada ficticia 8 a los 2374,5 s
const base: Omit<DatosEstimacion, 'ultimoReporte' | 'ahora'> = {
  miParadaId: 'parada-ficticia-8',
  paradas,
  horariosSalida: ['07:00', '08:30', '13:00', '17:30'],
  margen: { detenidoMinimoSeg: 30, tramoPorcentaje: 10 },
}
const subioEnDelViso = (hhmmss: string) => ({ paradaId: 'del-viso', creadoEn: hora(hhmmss) })

describe('estimarLlegadaAMiParada (#24)', () => {
  it('en vivo: el colectivo reportado todavía no pasó por mi parada', () => {
    // Sale de Del Viso 07:36:00 → +368,5 s → llega a la 8 a las 07:42:08
    const r = estimarLlegadaAMiParada({ ...base, ultimoReporte: subioEnDelViso('07:36:00'), ahora: hora('07:38:00') })
    expect(r).toMatchObject({ tipo: 'en_vivo', minutos: 4 })
  })

  it('en vivo: si está por llegar (dentro de la tolerancia) muestra 0 minutos', () => {
    const r = estimarLlegadaAMiParada({ ...base, ultimoReporte: subioEnDelViso('07:36:00'), ahora: hora('07:43:00') })
    expect(r).toMatchObject({ tipo: 'en_vivo', minutos: 0 })
  })

  it('si el reportado ya tendría que haber pasado, busca el próximo por horario', () => {
    // 07:50: el de las 07:00 ya pasó. Próximo: 08:30 → llega a la 8 a las 09:09:34
    const r = estimarLlegadaAMiParada({ ...base, ultimoReporte: subioEnDelViso('07:36:00'), ahora: hora('07:50:00') })
    expect(r).toMatchObject({ tipo: 'por_horario', minutos: 80, salida: hora('08:30:00') })
  })

  it('si mi parada ya quedó atrás, avisa del próximo colectivo y no del que ya pasó', () => {
    // Mi parada es Alberti, el colectivo ya va por Del Viso. Próximo: 08:30 → Alberti 08:44:06
    const r = estimarLlegadaAMiParada({
      ...base,
      miParadaId: 'alberti',
      ultimoReporte: subioEnDelViso('07:36:00'),
      ahora: hora('07:37:00'),
    })
    expect(r).toMatchObject({ tipo: 'por_horario', minutos: 67, salida: hora('08:30:00') })
  })

  it('sin reportes: estima con el horario de salida', () => {
    // 07:00 + 2374,5 s → 07:39:34
    const r = estimarLlegadaAMiParada({ ...base, ultimoReporte: null, ahora: hora('07:20:00') })
    expect(r).toMatchObject({ tipo: 'por_horario', minutos: 20, salida: hora('07:00:00') })
  })

  it('ignora un reporte más viejo que el recorrido entero', () => {
    const r = estimarLlegadaAMiParada({ ...base, ultimoReporte: subioEnDelViso('07:36:00'), ahora: hora('09:00:00') })
    expect(r).toMatchObject({ tipo: 'por_horario', minutos: 10, salida: hora('08:30:00') })
  })

  it('sin servicio: ya pasó el último colectivo del día', () => {
    const r = estimarLlegadaAMiParada({ ...base, ultimoReporte: null, ahora: hora('19:00:00') })
    expect(r).toEqual({ tipo: 'sin_servicio' })
  })

  it('devuelve null si mi parada no es del recorrido', () => {
    expect(
      estimarLlegadaAMiParada({ ...base, miParadaId: 'no-existe', ultimoReporte: null, ahora: hora('07:00:00') }),
    ).toBeNull()
  })
})
