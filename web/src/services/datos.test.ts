// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { crearReporte, useRecorrido, useUltimoReporte } from './datos'

describe('datos locales (hasta tener Firebase)', () => {
  it('trae el recorrido del 510 Ramal 9 con sus 77 paradas y las salidas desde Alberti', () => {
    const { result } = renderHook(() => useRecorrido())
    expect(result.current?.recorrido).toMatchObject({
      id: '510-ida',
      linea: '510',
      horariosSalida: ['06:50', '12:20', '16:20'],
      ficticia: true,
    })
    expect(result.current?.paradas).toHaveLength(77)
    expect(result.current?.paradas[0].nombre).toBe('Estación Alberti')
    expect(result.current?.paradas[76].nombre).toBe('Sede Parque Industrial (El Cenáculo)')
  })

  it('un "Me subí" nuevo aparece como último reporte, solo con parada y hora', async () => {
    const { result } = renderHook(() => useUltimoReporte('510-ida'))
    expect(result.current).toBeNull()
    await act(() => crearReporte('510-ida', 'estacion-del-viso'))
    expect(result.current).toMatchObject({ recorridoId: '510-ida', paradaId: 'estacion-del-viso' })
    expect(Object.keys(result.current!).sort()).toEqual(['creadoEn', 'id', 'paradaId', 'recorridoId'])
  })
})
