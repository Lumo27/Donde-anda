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
  // 12:30: el de las 12:20 va por Alberti, antes de llegar a Del Viso
  vi.setSystemTime(new Date('2026-10-26T12:30:00-03:00'))
  useMiParada.setState({ paradaId: '12-de-octubre-y-caamano' })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ListaParadas (#29)', () => {
  it('muestra las 77 paradas en orden con la hora del próximo colectivo', () => {
    renderizar()
    const items = paradasEnPantalla()
    expect(items).toHaveLength(77)
    // El de las 12:20 en viaje y el de las 16:20 por salir, los dos estimados por horario
    expect(screen.getAllByText(/\(por horario\)/)).toHaveLength(2)
    // El de las 12:20 ya pasó por Santa Rita y Arteaga: ahí el próximo es el de las 16:20.
    expect(within(items[2]).getByText(/próximo: el de las 16:20/)).toBeTruthy()
    // Lisandro de la Torre y Av. Madero todavía no (12:31:47 con margen)
    expect(within(items[16]).getByText('~12:31')).toBeTruthy()
    // Mi parada: el de las 12:20 llega a las 12:48:07
    expect(within(items[32]).getByText(/tu parada/)).toBeTruthy()
    expect(within(items[32]).getByText('~12:48')).toBeTruthy()
    expect(within(items[76]).getByText(/llegada a la facu/)).toBeTruthy()
  })

  it('se actualiza sola con un "Me subí" y marca dónde fue', async () => {
    renderizar()
    vi.setSystemTime(new Date('2026-10-26T12:36:00-03:00'))
    await act(() => crearReporte('510-ida', 'estacion-del-viso'))
    expect(screen.getByText(/\(en vivo\)/)).toBeTruthy()
    const delViso = paradasEnPantalla()[20]
    expect(within(delViso).getByText(/se subió alguien a las 12:36 \(el de las 12:20\)/)).toBeTruthy()
  })
})
