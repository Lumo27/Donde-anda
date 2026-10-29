// Reloj de la app. Normalmente es la hora real. En la simulación de demo (#36) puede correr más rápido,
// para ver avanzar el colectivo sin esperar los 55 minutos del viaje.
// Todo lo que necesite "ahora" (pantallas, reportes, bloqueo) tiene que pedirlo acá, no a `new Date()`.

let base = { real: 0, simulada: 0, velocidad: 1 } // con estos valores, ahora() = Date.now()

export function ahora(): Date {
  return new Date(base.simulada + (Date.now() - base.real) * base.velocidad)
}

/** Arranca el reloj simulado en `inicio` y lo hace correr `velocidad` veces más rápido que el real. */
export function configurarReloj(inicio: Date, velocidad: number): void {
  base = { real: Date.now(), simulada: inicio.getTime(), velocidad }
}

export function velocidadDelReloj(): number {
  return base.velocidad
}
