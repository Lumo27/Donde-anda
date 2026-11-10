// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { crearReporte } from '../../services/datos'
import { useMiParada } from '../paradas/useMiParada'
import PantallaEstado from './PantallaEstado'
import { useVistaRecorrido } from './useVistaRecorrido'

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
  useVistaRecorrido.setState({ modo: 'cerca3', antes: 5, despues: 5 })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('PantallaEstado (#27, #40)', () => {
  it('sin reportes muestra la estimación por horario para mi parada', () => {
    renderizar()
    const proximo = screen.getByRole('region', { name: 'Próximo a tu parada' })
    expect(proximo.textContent).toMatch(/Tu parada: \d+\. 12 De Octubre Y Caamaño/)
    // 12:20 + 28 min 7 s (con margen) → 12:48 → faltan ~18 min
    expect(within(proximo).getByText('Llega ~12:48')).toBeTruthy()
    expect(within(proximo).getByText('en 18 min')).toBeTruthy()
    expect(proximo.textContent).toMatch(/El de las 12:20 · a \d+ paradas/)
    expect(proximo.textContent).toMatch(/estimado por horario/)
    expect(screen.getByRole('region', { name: 'Último reporte' }).textContent).toMatch(/Sin reportes en vivo/)
    expect(screen.getByText('Salidas de hoy: 06:50 · 12:20 · 16:20')).toBeTruthy()
  })

  it('con un "Me subí" muestra dónde anda, sin decir quién, y si va a tiempo', async () => {
    renderizar()
    // Con margen, el de las 12:20 debería salir de Estación Del Viso a las 12:35:28 → 12:36 está a tiempo
    vi.setSystemTime(new Date('2026-10-26T12:36:00-03:00'))
    await act(() => crearReporte('510-ida', 'estacion-del-viso'))
    const ultimo = screen.getByRole('region', { name: 'Último reporte' })
    expect(ultimo.textContent).toMatch(/Parada \d+: Estación Del Viso/)
    expect(ultimo.textContent).toMatch(/Alguien se subió .* · el de las 12:20/)
    expect(within(ultimo).getByText('A tiempo')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Próximo a tu parada' }).textContent).toMatch(/según el último reporte/)
  })

  it('el recorrido muestra solo las paradas cercanas a la mía, y todas si se elige', () => {
    renderizar()
    // 3 y 3: primera, última, mi parada y sus vecinas, con saltos en el medio.
    expect(screen.getAllByText(/⋯ \d+ paradas más/).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('listitem').length).toBeLessThan(15)

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }))
    expect(screen.queryByText(/⋯ \d+ paradas más/)).toBeNull()
    expect(screen.getAllByRole('listitem').length).toBe(77)
  })

  it('personalizado deja elegir cuántas antes y después', () => {
    renderizar()
    fireEvent.click(screen.getByRole('button', { name: 'Personalizado' }))
    const conCinco = screen.getAllByRole('listitem').length
    fireEvent.click(screen.getByRole('button', { name: 'Una parada más después' }))
    expect(screen.getAllByRole('listitem').length).toBe(conCinco + 1)
  })
})
