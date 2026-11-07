import type { Parada } from '../../types/modelos'

// Buscar la parada más cercana a donde está la persona (#38).
// La ubicación se usa UNA sola vez y el cálculo se hace acá, en el teléfono: nunca se envía ni se guarda.

export interface Punto {
  lat: number
  lng: number
}

/** Distancia aproximada en metros entre dos puntos (alcanza de sobra para distancias de una ciudad). */
export function distanciaMetros(a: Punto, b: Punto): number {
  const rad = Math.PI / 180
  const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad)
  const y = (b.lat - a.lat) * rad
  return 6_371_000 * Math.hypot(x, y)
}

export interface ParadaCercana {
  parada: Parada
  metros: number
}

/** La parada con coordenadas más cercana a `punto`, o null si ninguna tiene coordenadas. */
export function paradaMasCercana(paradas: Parada[], punto: Punto): ParadaCercana | null {
  let mejor: ParadaCercana | null = null
  for (const parada of paradas) {
    if (parada.lat === undefined || parada.lng === undefined) continue
    const metros = distanciaMetros(punto, { lat: parada.lat, lng: parada.lng })
    if (!mejor || metros < mejor.metros) mejor = { parada, metros }
  }
  return mejor
}

/** "a 350 m" / "a 1,2 km". */
export function textoDistancia(metros: number): string {
  if (metros < 1000) return `a ${Math.round(metros / 50) * 50 || 50} m`
  return `a ${(metros / 1000).toFixed(1).replace('.', ',')} km`
}
