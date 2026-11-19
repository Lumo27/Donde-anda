// Tipos del modelo de datos. Detalle y reglas de privacidad en docs/modelo-datos.md.

/** Una línea en un sentido. Firestore: recorridos/{id} */
export interface Recorrido {
  id: string
  nombre: string
  linea: string
  sentido: 'ida' | 'vuelta'
  /** Horas de salida desde la cabecera, "HH:mm" (hora de Argentina). */
  horariosSalida: string[]
  /** true mientras los tiempos sean estimados (sin medir la ruta 0): la app muestra el aviso. */
  ficticia: boolean
  /** Días en que corre, 0 = domingo … 6 = sábado (hora de Argentina). */
  diasServicio: number[]
  /** Zonas del recorrido para elegir "mi parada" por cercanía (#38). Van en orden. */
  tramos: Tramo[]
}

/** Una zona del recorrido: las paradas con `orden` entre `desde` y `hasta` (incluidas). */
export interface Tramo {
  nombre: string
  desde: number
  hasta: number
}

/** Una parada con los tiempos medidos en la ruta 0. Firestore: recorridos/{id}/paradas/{id} */
export interface Parada {
  id: string
  /** 1 = cabecera. */
  orden: number
  nombre: string
  referencia?: string
  /** Desde que salió de la parada anterior hasta que llegó a esta. 0 en la cabecera. */
  segundosDesdeAnterior: number
  /** Cuánto se quedó parado en esta parada. */
  segundosDetenido: number
  /** Ubicación de la parada (para buscar la más cercana, #38). Puede ser aproximada. */
  lat?: number
  lng?: number
}

/**
 * Un "Me subí". Firestore: reportes/{id}
 * Anónimo: solo estos campos. Nunca nombre, mail, uid ni ubicación.
 */
export interface Reporte {
  id: string
  recorridoId: string
  paradaId: string
  creadoEn: Date
}
