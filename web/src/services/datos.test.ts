// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { crearReporte, useRecorrido, useUltimoReporte } from './datos'

describe('datos locales (hasta tener Firebase)', () => {
  it('trae el recorrido ficticio de la 510 con sus 10 paradas', () => {
    const { result } = renderHook(() => useRecorrido())
    expect(result.current?.recorrido).toMatchObject({ id: '510-ida', linea: '510', ficticia: true })
    expect(result.current?.paradas).toHaveLength(10)
  })

  it('un "Me subí" nuevo aparece como último reporte, solo con parada y hora', async () => {
    const { result } = renderHook(() => useUltimoReporte('510-ida'))
    expect(result.current).toBeNull()
    await act(() => crearReporte('510-ida', 'del-viso'))
    expect(result.current).toMatchObject({ recorridoId: '510-ida', paradaId: 'del-viso' })
    expect(Object.keys(result.current!).sort()).toEqual(['creadoEn', 'id', 'paradaId', 'recorridoId'])
  })
})
