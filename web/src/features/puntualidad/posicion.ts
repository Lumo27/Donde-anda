import type { Proyeccion } from './proyeccion'

// ¿Dónde dibujar el colectivo sobre la ruta? (#36)
// Interpola entre las horas estimadas de la proyección: no es GPS, es lo que la app calcula con
// la ruta 0 y el último "Me subí". Cuando llega un reporte nuevo, la posición se corrige sola.

export type Posicion =
  | { tipo: 'sin_servicio' }
  | { tipo: 'por_salir'; salida: Date }
  /** Entre la parada `desde` y la siguiente; `fraccion` va de 0 (recién salió) a 1 (llegando). */
  | { tipo: 'en_viaje'; desde: number; fraccion: number; progreso: number }
  | { tipo: 'llego' }

export function posicionEstimada(proyeccion: Proyeccion, ahora: Date): Posicion {
  if (proyeccion.fuente === 'sin_servicio') return { tipo: 'sin_servicio' }
  const { pasos } = proyeccion
  const t = ahora.getTime()
  const ultima = pasos.length - 1

  // Última parada con hora conocida a la que ya llegó.
  let desde = -1
  pasos.forEach((p, i) => {
    if (p.llegada && p.llegada.getTime() <= t) desde = i
  })

  if (desde === -1) {
    return proyeccion.fuente === 'por_horario'
      ? { tipo: 'por_salir', salida: proyeccion.salida }
      : { tipo: 'sin_servicio' }
  }
  if (desde >= ultima) return { tipo: 'llego' }

  const inicioTramo = pasos[desde].llegada!.getTime()
  const finTramo = pasos[desde + 1].llegada?.getTime() ?? inicioTramo
  const fraccion = finTramo > inicioTramo ? Math.min(1, Math.max(0, (t - inicioTramo) / (finTramo - inicioTramo))) : 0
  return { tipo: 'en_viaje', desde, fraccion, progreso: (desde + fraccion) / ultima }
}
