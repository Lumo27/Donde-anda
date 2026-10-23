// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { crearReporte } from '../../services/datos'
import ListaParadas from './ListaParadas'
import { useMiParada } from './useMiParada'

const renderizar = () =>
  render(
    <MemoryRouter>
      <ListaParadas />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-26T07:30:00-03:00'))
  useMiParada.setState({ paradaId: 'parada-ficticia-8' })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ListaParadas (#29)', () => {
  it('muestra las 10 paradas en orden con hora estimada por horario', () => {
    renderizar()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(10)
    expect(screen.getByText('Estimado por horario (sale 07:00)')).toBeTruthy()
    // A las 07:30 el de las 07:00 ya pasó por Alberti (07:14) y todavía no por la 8 (07:39)
    expect(within(items[3]).getByText(/ya pasó/)).toBeTruthy()
    expect(within(items[7]).getByText('tu parada')).toBeTruthy()
    expect(within(items[7]).getByText('~07:39')).toBeTruthy()
    expect(within(items[9]).getByText('llegada a la facu')).toBeTruthy()
  })

  it('se actualiza sola con un "Me subí" y marca dónde fue', async () => {
    renderizar()
    vi.setSystemTime(new Date('2026-10-26T07:34:00-03:00'))
    await act(() => crearReporte('510-ida', 'del-viso'))
    expect(screen.getByText('En vivo, según el último reporte')).toBeTruthy()
    const delViso = screen.getAllByRole('listitem')[6]
    expect(within(delViso).getByText(/último reporte/)).toBeTruthy()
    expect(within(delViso).getByText('07:34')).toBeTruthy()
  })
})
