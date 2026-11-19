import { describe, expect, it } from 'vitest'
import { alcanceDelModo, filaEnVista, itemsVisibles } from './vistaRecorrido'

const resumen = (items: ReturnType<typeof itemsVisibles>) =>
  items.map((i) => (i.tipo === 'parada' ? i.indice : `⋯${i.desde}-${i.hasta}`))

describe('qué paradas mostrar (#40)', () => {
  it('3 antes y 3 después, siempre con la primera y la última', () => {
    // 77 paradas, la mía es la 25 (índice 24)
    expect(resumen(itemsVisibles(77, 24, alcanceDelModo('cerca3', { antes: 0, despues: 0 })))).toEqual([
      0, '⋯1-20', 21, 22, 23, 24, 25, 26, 27, '⋯28-75', 76,
    ])
  })

  it('cerca del principio no deja huecos ni repite la primera', () => {
    expect(resumen(itemsVisibles(77, 1, { antes: 3, despues: 3 }))).toEqual([0, 1, 2, 3, 4, '⋯5-75', 76])
  })

  it('personalizado: 5 antes y 2 después', () => {
    expect(resumen(itemsVisibles(77, 40, alcanceDelModo('personalizado', { antes: 5, despues: 2 })))).toEqual([
      0, '⋯1-34', 35, 36, 37, 38, 39, 40, 41, 42, '⋯43-75', 76,
    ])
  })

  it('todas, o sin parada elegida: las 77', () => {
    expect(itemsVisibles(77, 24, alcanceDelModo('todas', { antes: 0, despues: 0 }))).toHaveLength(77)
    expect(itemsVisibles(77, -1, { antes: 3, despues: 3 })).toHaveLength(77)
  })
})

describe('dónde dibujar el colectivo en la vista', () => {
  const items = itemsVisibles(77, 24, { antes: 3, despues: 3 }) // [0, ⋯1-20, 21..27, ⋯28-75, 76]

  it('entre dos paradas visibles: interpola', () => {
    expect(filaEnVista(items, 22.5)).toEqual({ fila: 3.5, enSalto: false }) // entre 22 (fila 3) y 23 (fila 4)
  })

  it('en un tramo oculto: sobre el "⋯"', () => {
    expect(filaEnVista(items, 10)).toEqual({ fila: 1, enSalto: true })
    expect(filaEnVista(items, 50.3)).toEqual({ fila: 9, enSalto: true })
  })

  it('en la cabecera, antes de salir', () => {
    expect(filaEnVista(items, 0)).toEqual({ fila: 0, enSalto: false })
  })
})
