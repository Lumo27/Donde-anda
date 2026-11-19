// Valores de ajuste de las estimaciones. ÚNICO lugar donde se tocan (#14); se calibran con el piloto (#35).

/**
 * Piso de tiempo detenido en cada parada intermedia, en segundos.
 * Si en la ruta 0 frenó 10 s (o no frenó), se toman 30 s: otro día puede subir más gente.
 */
export const MARGEN_DETENIDO_SEG = 30

/** Cuánto se estira cada tramo entre paradas (semáforos, tránsito), en %. */
export const MARGEN_TRAMO_PORCENTAJE = 10

/** Diferencia máxima, en minutos, para considerar que el colectivo va "a tiempo". */
export const TOLERANCIA_A_TIEMPO_MIN = 2
