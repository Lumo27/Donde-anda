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
/** Las paradas (la lista numerada), no la lista de colectivos de arriba. */
const paradasEnPantalla = () =>
  within(screen.getAllByRole('list').find((l) => l.tagName === 'OL')!).getAllByRole('listitem')

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
  it('muestra las 10 paradas en orden con la hora del próximo colectivo', () => {
    renderizar()
    const items = paradasEnPantalla()
    expect(items).toHaveLength(10)
    // El de las 07:00 en viaje y el de las 08:30 por salir, los dos estimados por horario
    expect(screen.getAllByText(/\(por horario\)/)).toHaveLength(2)
    // A las 07:30 el de las 07:00 ya pasó por Alberti (07:14) y todavía no por la 8 (07:39).
    // Por Alberti el próximo es el de las 08:30.
    expect(within(items[3]).getByText('~08:44')).toBeTruthy()
    expect(within(items[7]).getByText(/tu parada/)).toBeTruthy()
    expect(within(items[7]).getByText('~07:39')).toBeTruthy()
    expect(within(items[9]).getByText(/llegada a la facu/)).toBeTruthy()
  })

  it('se actualiza sola con un "Me subí" y marca dónde fue', async () => {
    renderizar()
    vi.setSystemTime(new Date('2026-10-26T07:34:00-03:00'))
    await act(() => crearReporte('510-ida', 'del-viso'))
    expect(screen.getByText(/\(en vivo\)/)).toBeTruthy()
    const delViso = paradasEnPantalla()[6]
    expect(within(delViso).getByText(/se subió alguien a las 07:34 \(el de las 07:00\)/)).toBeTruthy()
  })
})
