import type { Parada } from '../../types/modelos'

// Lee el CSV de un viaje de la ruta 0 (docs/ruta0/*.csv) y lo convierte en paradas con tiempos en segundos.
// Formato: orden,parada,hora_llegada,hora_salida,se_detuvo,notas  (horas "hh:mm:ss")
// Lo usan los tests y el script de carga a Firestore (#18).

/** "07:05:40" → segundos desde las 00:00. */
export function segundosDelDia(hora: string): number {
  const [h, m, s] = hora.split(':').map(Number)
  if ([h, m, s].some((n) => n === undefined || Number.isNaN(n))) {
    throw new Error(`Hora inválida en la ruta 0: "${hora}" (se espera hh:mm:ss)`)
  }
  return h * 3600 + m * 60 + s
}

/** "Del Viso" → "del-viso". Id estable para que los reportes sigan apuntando bien si se recarga la ruta. */
export function idDeParada(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function paradasDesdeCsv(texto: string): Parada[] {
  const filas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '')
    .slice(1) // encabezado

  const leidas = filas.map((fila, i) => {
    // Las notas son la última columna y pueden tener comas: se juntan de nuevo.
    const [orden, nombre, llegada, salida] = fila.split(',')
    if (!orden || !nombre || !llegada || !salida) {
      throw new Error(`Fila ${i + 2} incompleta en la ruta 0: "${fila}"`)
    }
    return {
      orden: Number(orden),
      nombre: nombre.trim(),
      llegada: segundosDelDia(llegada),
      salida: segundosDelDia(salida),
    }
  })

  leidas.sort((a, b) => a.orden - b.orden)

  return leidas.map((p, i) => {
    const anterior = leidas[i - 1]
    return {
      id: idDeParada(p.nombre),
      orden: p.orden,
      nombre: p.nombre,
      segundosDesdeAnterior: anterior ? p.llegada - anterior.salida : 0,
      segundosDetenido: p.salida - p.llegada,
    }
  })
}
