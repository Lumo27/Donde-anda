// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

/** Simula el GPS del teléfono: responde con esa posición o con un error. */
function simularUbicacion(respuesta: { lat: number; lng: number } | { codigoError: number }) {
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((ok: PositionCallback, error: PositionErrorCallback) =>
        'lat' in respuesta
          ? ok({ coords: { latitude: respuesta.lat, longitude: respuesta.lng } } as GeolocationPosition)
          : error({ code: respuesta.codigoError } as GeolocationPositionError),
      ),
    },
  })
}

beforeEach(() => {
  localStorage.clear()
  useMiParada.setState({ paradaId: null })
})
afterEach(cleanup)

describe('ElegirMiParada (#26, #38)', () => {
  it('arranca preguntando la zona: las 6 del recorrido', () => {
    renderizar()
    expect(screen.getByRole('heading', { name: '¿De qué zona estás más cerca?' })).toBeTruthy()
    for (const zona of [
      'Alberti – Del Viso',
      'Del Viso – Panamericana',
      'Panamericana – Villa Rosa',
      'Villa Rosa – Panamericana',
      'Panamericana – Pilar',
      'Pilar – Parque Industrial',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(zona) })).toBeTruthy()
    }
  })

  it('al elegir una zona muestra solo sus paradas y guarda la elegida en el teléfono', () => {
    renderizar()
    fireEvent.click(screen.getByRole('button', { name: /Del Viso – Panamericana/ }))
    expect(screen.getAllByRole('radio')).toHaveLength(12) // paradas 22 a 33
    expect((screen.getByRole('button', { name: 'Listo' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('radio', { name: 'Valentín Gómez Y San Cayetano' }))
    fireEvent.click(screen.getByRole('button', { name: 'Listo' }))
    expect(useMiParada.getState().paradaId).toBe('valentin-gomez-y-san-cayetano')
    expect(JSON.parse(localStorage.getItem('donde-anda:mi-parada')!).state).toEqual({
      paradaId: 'valentin-gomez-y-san-cayetano',
    })
    expect(screen.getByText('Inicio')).toBeTruthy()
  })

  it('"Ver todas" lista las 76 paradas donde se puede subir (no la sede)', () => {
    renderizar()
    fireEvent.click(screen.getByRole('button', { name: /Ver todas las paradas/ }))
    expect(screen.getAllByRole('radio')).toHaveLength(76)
    expect(screen.queryByRole('radio', { name: /Sede Parque Industrial/ })).toBeNull()
  })

  it('con la ubicación encuentra la parada más cercana, la marca y muestra su zona', () => {
    simularUbicacion({ lat: -34.4476, lng: -58.8033 }) // en Valentín Gómez y San Cayetano
    renderizar()
    fireEvent.click(screen.getByRole('button', { name: /Buscar la parada más cercana/ }))
    expect(screen.getByRole('status').textContent).toMatch(/La más cercana es Valentín Gómez Y San Cayetano/)
    expect((screen.getByRole('radio', { name: 'Valentín Gómez Y San Cayetano' }) as HTMLInputElement).checked).toBe(true)
    expect(screen.getByRole('group', { name: 'Del Viso – Panamericana' })).toBeTruthy()
  })

  it('si no da permiso, le pide que elija la zona', () => {
    simularUbicacion({ codigoError: 1 })
    renderizar()
    fireEvent.click(screen.getByRole('button', { name: /Buscar la parada más cercana/ }))
    expect(screen.getByRole('status').textContent).toMatch(/No diste permiso/)
    expect(screen.getByRole('heading', { name: '¿De qué zona estás más cerca?' })).toBeTruthy()
  })

  it('si ya tenía parada, arranca en su zona con la parada marcada', () => {
    useMiParada.setState({ paradaId: 'estacion-del-viso' })
    renderizar()
    expect(screen.getByRole('group', { name: 'Alberti – Del Viso' })).toBeTruthy()
    expect((screen.getByRole('radio', { name: /Estación Del Viso/ }) as HTMLInputElement).checked).toBe(true)
  })
})
