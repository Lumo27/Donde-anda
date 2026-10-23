// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BadgeEstado } from './BadgeEstado'
import { Boton } from './Boton'
import { Selector } from './Selector'
import { Tarjeta } from './Tarjeta'
import { textoEstado } from './textoEstado'

afterEach(cleanup)

describe('BadgeEstado', () => {
  it('dice el estado en texto, no solo con color', () => {
    expect(textoEstado('a_tiempo', 1)).toBe('A tiempo')
    expect(textoEstado('atrasado', 4)).toBe('Atrasado 4 min')
    expect(textoEstado('adelantado', -3)).toBe('Adelantado 3 min')
  })

  it('muestra el texto en pantalla', () => {
    render(<BadgeEstado estado="atrasado" minutosDiferencia={4} />)
    expect(screen.getByText('Atrasado 4 min')).toBeTruthy()
  })
})

describe('Boton', () => {
  it('es un botón que responde al clic', () => {
    const alTocar = vi.fn()
    render(<Boton onClick={alTocar}>Me subí</Boton>)
    fireEvent.click(screen.getByRole('button', { name: 'Me subí' }))
    expect(alTocar).toHaveBeenCalledOnce()
  })

  it('no manda formularios por accidente', () => {
    render(<Boton>Listo</Boton>)
    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })
})

describe('Tarjeta', () => {
  it('con título es una sección con nombre para el lector de pantalla', () => {
    render(<Tarjeta titulo="Último reporte">contenido</Tarjeta>)
    expect(screen.getByRole('region', { name: 'Último reporte' })).toBeTruthy()
  })
})

describe('Selector', () => {
  const opciones = [
    { valor: 'alberti', etiqueta: 'Alberti' },
    { valor: 'del-viso', etiqueta: 'Del Viso', detalle: 'tu parada' },
  ]

  it('es un grupo de radios con leyenda', () => {
    render(<Selector leyenda="Tu parada" opciones={opciones} valor="del-viso" onCambio={() => {}} />)
    expect(screen.getByRole('group', { name: 'Tu parada' })).toBeTruthy()
    expect((screen.getByRole('radio', { name: /Del Viso/ }) as HTMLInputElement).checked).toBe(true)
  })

  it('avisa qué opción se eligió', () => {
    const alCambiar = vi.fn()
    render(<Selector leyenda="Tu parada" opciones={opciones} valor={null} onCambio={alCambiar} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Alberti' }))
    expect(alCambiar).toHaveBeenCalledWith('alberti')
  })
})
