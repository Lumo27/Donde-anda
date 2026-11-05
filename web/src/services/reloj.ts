// Hora de la app. Todo lo que necesite "ahora" (pantallas, reportes, bloqueo de "Me subí") la pide acá
// y no a `new Date()` suelto: así hay un único lugar para cambiarla (por ejemplo, para una simulación).

export function ahora(): Date {
  return new Date()
}
