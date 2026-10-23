// Anti-spam del MVP (#28, ver #11): no se puede tocar "Me subí" dos veces en 10 minutos.
// Solo se guarda la HORA del último reporte, en el teléfono. Nada de parada ni de quién.

export const MINUTOS_BLOQUEO_REPORTE = 10
const CLAVE = 'donde-anda:ultimo-me-subi'

/** Minutos que faltan para poder volver a reportar (0 = ya puede). */
export function minutosDeBloqueo(ultimoReporte: Date | null, ahora: Date): number {
  if (!ultimoReporte) return 0
  const restanteMs = ultimoReporte.getTime() + MINUTOS_BLOQUEO_REPORTE * 60000 - ahora.getTime()
  return restanteMs > 0 ? Math.ceil(restanteMs / 60000) : 0
}

export function leerUltimoReporteLocal(): Date | null {
  try {
    const guardado = localStorage.getItem(CLAVE)
    const fecha = guardado ? new Date(guardado) : null
    return fecha && !Number.isNaN(fecha.getTime()) ? fecha : null
  } catch {
    return null // modo privado o almacenamiento bloqueado: no se bloquea
  }
}

export function guardarUltimoReporteLocal(momento: Date): void {
  try {
    localStorage.setItem(CLAVE, momento.toISOString())
  } catch {
    // Si no se puede guardar, el reporte igual se mandó: solo se pierde el bloqueo.
  }
}
