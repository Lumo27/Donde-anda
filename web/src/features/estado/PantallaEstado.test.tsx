// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { crearReporte } from '../../services/datos'
import { useMiParada } from '../paradas/useMiParada'
import PantallaEstado from './PantallaEstado'

const renderizar = () =>
  render(
    <MemoryRouter>
      <PantallaEstado />
    </MemoryRouter>,
  )

beforeEach(() => {
  // Lunes 26/10/2026 07:20 en Argentina. Solo se falsea la fecha (los timers siguen reales).
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-26T07:20:00-03:00'))
  useMiParada.setState({ paradaId: 'parada-ficticia-8' })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('PantallaEstado (#27)', () => {
  it('sin reportes muestra la estimación por horario para mi parada', () => {
    renderizar()
    expect(screen.getByText('Sin reportes en vivo')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Tu parada: Parada ficticia 8' })).toBeTruthy()
    // 07:00 + 39 min 34 s (con margen) → faltan ~20 min
    expect(screen.getByText('Llega en ~20 min')).toBeTruthy()
    expect(screen.getByText(/El de las 07:00, estimado por horario/)).toBeTruthy()
    // En el recorrido: el de las 07:00 ya está en viaje
    expect(screen.getByText(/El de las 07:00:/)).toBeTruthy()
  })

  it('con un "Me subí" muestra dónde anda, sin decir quién, y si va a tiempo', async () => {
    renderizar()
    vi.setSystemTime(new Date('2026-10-26T07:34:00-03:00'))
    await act(() => crearReporte('510-ida', 'del-viso'))
    expect(screen.getByText('Alguien se subió en Del Viso')).toBeTruthy()
    expect(screen.getByText('A tiempo')).toBeTruthy()
    expect(screen.getByText(/El de las 07:00, según su último reporte/)).toBeTruthy()
  })
})
