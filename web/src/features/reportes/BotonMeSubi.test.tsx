// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BotonMeSubi } from './BotonMeSubi'

const opciones = [
  { valor: 'alberti', etiqueta: 'Alberti' },
  { valor: 'del-viso', etiqueta: 'Del Viso', detalle: 'tu parada' },
]

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('BotonMeSubi (#28)', () => {
  it('en 2 toques manda el reporte con mi parada, agradece y se bloquea 10 min', async () => {
    render(<BotonMeSubi recorridoId="510-ida" opciones={opciones} miParadaId="del-viso" />)

    fireEvent.click(screen.getByRole('button', { name: 'Me subí' }))
    const ventana = screen.getByRole('dialog', { name: '¿En qué parada te subiste?' })
    expect(ventana).toBeTruthy()
    expect((screen.getByRole('radio', { name: /Del Viso/ }) as HTMLInputElement).checked).toBe(true)

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Confirmar' })))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('status').textContent).toMatch(/¡Gracias!/)
    expect((screen.getByRole('button', { name: 'Me subí' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText(/volver a reportar en 10 min/)).toBeTruthy()
    // En el teléfono queda solo la hora, nada de la parada.
    expect(localStorage.getItem('donde-anda:ultimo-me-subi')).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('Cancelar cierra sin reportar', () => {
    render(<BotonMeSubi recorridoId="510-ida" opciones={opciones} miParadaId="del-viso" />)
    fireEvent.click(screen.getByRole('button', { name: 'Me subí' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(localStorage.getItem('donde-anda:ultimo-me-subi')).toBeNull()
  })
})
