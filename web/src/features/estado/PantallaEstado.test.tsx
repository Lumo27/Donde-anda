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
  // Lunes 26/10/2026 12:30 en Argentina: el de las 12:20 ya salió de Alberti. Solo se falsea la fecha.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-26T12:30:00-03:00'))
  useMiParada.setState({ paradaId: '12-de-octubre-y-caamano' })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('PantallaEstado (#27)', () => {
  it('sin reportes muestra la estimación por horario para mi parada', () => {
    renderizar()
    expect(screen.getByText('Sin reportes en vivo')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Tu parada: 12 De Octubre Y Caamaño' })).toBeTruthy()
    // 12:20 + 28 min 7 s (con margen) → 12:48 → faltan ~18 min
    expect(screen.getByText('Llega en ~18 min')).toBeTruthy()
    expect(screen.getByText(/El de las 12:20, estimado por horario/)).toBeTruthy()
    // En el recorrido: el de las 12:20 ya está en viaje
    expect(screen.getByText(/El de las 12:20:/)).toBeTruthy()
  })

  it('con un "Me subí" muestra dónde anda, sin decir quién, y si va a tiempo', async () => {
    renderizar()
    // Con margen, el de las 12:20 debería salir de Estación Del Viso a las 12:35:28 → 12:36 está a tiempo
    vi.setSystemTime(new Date('2026-10-26T12:36:00-03:00'))
    await act(() => crearReporte('510-ida', 'estacion-del-viso'))
    expect(screen.getByText('Alguien se subió en Estación Del Viso')).toBeTruthy()
    expect(screen.getByText('A tiempo')).toBeTruthy()
    expect(screen.getByText(/El de las 12:20, según su último reporte/)).toBeTruthy()
  })
})
