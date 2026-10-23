// Tipos del modelo de datos. Detalle y reglas de privacidad en docs/modelo-datos.md.

/** Una línea en un sentido. Firestore: recorridos/{id} */
export interface Recorrido {
  id: string
  nombre: string
  linea: string
  sentido: 'ida' | 'vuelta'
  /** Horas de salida desde la cabecera, "HH:mm" (hora de Argentina). */
  horariosSalida: string[]
  /** true mientras se usen datos de prueba: la app muestra "Datos de prueba". */
  ficticia: boolean
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
