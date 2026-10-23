import { describe, expect, it } from 'vitest'
import { minutosDeBloqueo } from './bloqueo'

const t = (hhmmss: string) => new Date(`2026-10-26T${hhmmss}-03:00`)

describe('minutosDeBloqueo (anti-spam #28)', () => {
  it('sin reportes previos se puede reportar', () => {
    expect(minutosDeBloqueo(null, t('07:30:00'))).toBe(0)
  })
  it('recién reportado: faltan 10 min', () => {
    expect(minutosDeBloqueo(t('07:30:00'), t('07:30:00'))).toBe(10)
  })
  it('redondea para arriba lo que falta', () => {
    expect(minutosDeBloqueo(t('07:30:00'), t('07:35:30'))).toBe(5)
  })
  it('pasados 10 minutos se puede volver a reportar', () => {
    expect(minutosDeBloqueo(t('07:30:00'), t('07:40:00'))).toBe(0)
  })
})
