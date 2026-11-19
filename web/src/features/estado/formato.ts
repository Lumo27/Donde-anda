import { format } from 'date-fns'

// Textos de hora y tiempo para las pantallas.

/** "07:42" en la hora del teléfono. */
export function formatearHora(momento: Date): string {
  return format(momento, 'HH:mm')
}

/** "recién", "hace 3 min", "hace 1 h 5 min". */
export function haceCuanto(desde: Date, ahora: Date): string {
  const minutos = Math.max(0, Math.floor((ahora.getTime() - desde.getTime()) / 60000))
  if (minutos < 1) return 'recién'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto === 0 ? `hace ${horas} h` : `hace ${horas} h ${resto} min`
}

/** "51 min" o "1 h 5 min". */
export function duracion(segundos: number): string {
  const minutos = Math.round(segundos / 60)
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}
