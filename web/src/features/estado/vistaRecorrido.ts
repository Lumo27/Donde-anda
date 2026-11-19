// Qué paradas mostrar en el recorrido del inicio (#40). Funciones puras.
// Siempre se ven la primera y la última parada; lo que no se muestra se resume en un "⋯ N paradas".

export type ModoVista = 'cerca3' | 'cerca10' | 'personalizado' | 'todas'

export type ItemVista =
  | { tipo: 'parada'; indice: number }
  /** Paradas ocultas, de `desde` a `hasta` (índices, incluidos). */
  | { tipo: 'salto'; desde: number; hasta: number }

/** Cuántas paradas antes y después de la mía muestra cada modo (null = todas). */
export function alcanceDelModo(
  modo: ModoVista,
  personalizado: { antes: number; despues: number },
): { antes: number; despues: number } | null {
  if (modo === 'cerca3') return { antes: 3, despues: 3 }
  if (modo === 'cerca10') return { antes: 10, despues: 10 }
  if (modo === 'personalizado') return personalizado
  return null
}

/**
 * Las filas a mostrar para un recorrido de `total` paradas, alrededor de la parada `indiceMia`.
 * Sin parada elegida (indiceMia = -1) o con alcance null, se muestran todas.
 */
export function itemsVisibles(
  total: number,
  indiceMia: number,
  alcance: { antes: number; despues: number } | null,
): ItemVista[] {
  const visibles = new Set<number>()
  if (!alcance || indiceMia < 0) {
    for (let i = 0; i < total; i++) visibles.add(i)
  } else {
    visibles.add(0)
    visibles.add(total - 1)
    const desde = Math.max(0, indiceMia - alcance.antes)
    const hasta = Math.min(total - 1, indiceMia + alcance.despues)
    for (let i = desde; i <= hasta; i++) visibles.add(i)
  }

  const items: ItemVista[] = []
  for (let i = 0; i < total; i++) {
    if (visibles.has(i)) {
      items.push({ tipo: 'parada', indice: i })
    } else {
      const ultimo = items[items.length - 1]
      if (ultimo?.tipo === 'salto') ultimo.hasta = i
      else items.push({ tipo: 'salto', desde: i, hasta: i })
    }
  }
  return items
}

/**
 * Dónde va un colectivo en la vista: `x` es su posición en el recorrido (índice de parada, con decimales:
 * 6.5 = mitad de camino entre la 7.ª y la 8.ª). Devuelve la fila (con decimales) para dibujarlo, y si cae
 * en un tramo oculto ("⋯").
 */
export function filaEnVista(items: ItemVista[], x: number): { fila: number; enSalto: boolean } {
  for (let k = 0; k < items.length; k++) {
    const it = items[k]
    if (it.tipo === 'parada') {
      if (x === it.indice) return { fila: k, enSalto: false }
      const sig = items[k + 1]
      if (sig?.tipo === 'parada' && x > it.indice && x < sig.indice) {
        return { fila: k + (x - it.indice) / (sig.indice - it.indice), enSalto: false }
      }
      // Entre una parada visible y un salto: se dibuja sobre el salto.
      if (sig?.tipo === 'salto' && x > it.indice && x < sig.desde) return { fila: k + 0.5, enSalto: false }
    } else if (x >= it.desde - 1 && x <= it.hasta + 1) {
      // Dentro del tramo oculto (o saliendo/entrando de él): sobre el "⋯".
      return { fila: k, enSalto: true }
    }
  }
  return { fila: Math.max(0, items.length - 1), enSalto: false }
}
