// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ElegirMiParada from './ElegirMiParada'
import { useMiParada } from './useMiParada'

const renderizar = () =>
  render(
    <MemoryRouter initialEntries={['/mi-parada']}>
      <Routes>
        <Route path="/mi-parada" element={<ElegirMiParada />} />
        <Route path="/" element={<p>Inicio</p>} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => {
  localStorage.clear()
  useMiParada.setState({ paradaId: null })
})
afterEach(cleanup)

describe('ElegirMiParada (#26)', () => {
  it('lista las paradas donde se puede tomar el colectivo (no la facu)', () => {
    renderizar()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(9)
    expect(screen.queryByRole('radio', { name: /Parque Industrial/ })).toBeNull()
  })

  it('no deja confirmar sin elegir', () => {
    renderizar()
    expect((screen.getByRole('button', { name: 'Listo' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('guarda la parada solo en el teléfono y vuelve al inicio', () => {
    renderizar()
    fireEvent.click(screen.getByRole('radio', { name: 'Del Viso' }))
    fireEvent.click(screen.getByRole('button', { name: 'Listo' }))
    expect(useMiParada.getState().paradaId).toBe('del-viso')
    expect(JSON.parse(localStorage.getItem('donde-anda:mi-parada')!).state).toEqual({ paradaId: 'del-viso' })
    expect(screen.getByText('Inicio')).toBeTruthy()
  })
})
