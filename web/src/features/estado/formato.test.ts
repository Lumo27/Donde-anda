import { describe, expect, it } from 'vitest'
import { duracion, haceCuanto } from './formato'

const t = (hhmmss: string) => new Date(`2026-10-26T${hhmmss}-03:00`)

describe('haceCuanto', () => {
  it('menos de un minuto es "recién"', () => {
    expect(haceCuanto(t('07:36:00'), t('07:36:40'))).toBe('recién')
  })
  it('en minutos', () => {
    expect(haceCuanto(t('07:36:00'), t('07:39:10'))).toBe('hace 3 min')
  })
  it('en horas', () => {
    expect(haceCuanto(t('07:00:00'), t('08:05:00'))).toBe('hace 1 h 5 min')
    expect(haceCuanto(t('07:00:00'), t('09:00:00'))).toBe('hace 2 h')
  })
  it('un reporte "del futuro" (reloj del teléfono adelantado) es "recién"', () => {
    expect(haceCuanto(t('07:40:00'), t('07:36:00'))).toBe('recién')
  })
})

describe('duracion', () => {
  it('redondea a minutos', () => {
    expect(duracion(3309)).toBe('55 min')
    expect(duracion(3900)).toBe('1 h 5 min')
    expect(duracion(7200)).toBe('2 h')
  })
})
