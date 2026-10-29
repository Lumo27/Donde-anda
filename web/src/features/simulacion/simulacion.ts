import type { Parada, Reporte } from '../../types/modelos'
import { enOrden, fechaEnArgentina, segundosHastaSalir } from '../puntualidad/calculos'

// Simulación de demo (#36): colectivos ficticios que van recorriendo la ruta y "estudiantes" ficticios
// que tocan "Me subí". Sirve para mostrar el prototipo sin Firebase ni gente real. No es la lógica de la app:
// la app solo ve los reportes, igual que con datos reales.

/** Paradas (por posición en el recorrido) donde "alguien" toca Me subí en cada viaje simulado. */
const POSICIONES_QUE_REPORTAN = [1, 3, 4, 6, 7]

/** Segundos de atraso que suma cada viaje en cada parada: el 1º va atrasándose, el 2º viene adelantado. */
const ATRASO_POR_PARADA_SEG = [80, -20, 30]

/** Cuánto antes de "ahora" salió el colectivo que ya está en viaje al abrir la demo. */
const MINUTOS_DE_VIAJE_AL_INICIAR = 23
const MINUTOS_ENTRE_SALIDAS = 45
const CANTIDAD_DE_SALIDAS = 3

/** "HH:mm" en hora de Argentina (UTC-3). */
function horaArgentina(momento: Date): string {
  return new Date(momento.getTime() - 3 * 3600_000).toISOString().slice(11, 16)
}

/** Horarios de salida de la demo: el primero ya salió hace un rato y los demás vienen después. */
export function horariosDeSimulacion(inicio: Date): string[] {
  const minuto = new Date(Math.floor(inicio.getTime() / 60000) * 60000)
  const primera = minuto.getTime() - MINUTOS_DE_VIAJE_AL_INICIAR * 60000
  return Array.from({ length: CANTIDAD_DE_SALIDAS }, (_, i) =>
    horaArgentina(new Date(primera + i * MINUTOS_ENTRE_SALIDAS * 60000)),
  )
}

/**
 * Todos los "Me subí" ficticios de los viajes de la demo, ordenados por hora. Algunos ya pasaron al iniciar
 * y el resto va "apareciendo" a medida que avanza el reloj (la app filtra los que todavía no ocurrieron).
 */
export function reportesSimulados(
  recorridoId: string,
  paradas: Parada[],
  horariosSalida: string[],
  inicio: Date,
): Reporte[] {
  const ordenadas = enOrden(paradas)
  const salidas = segundosHastaSalir(ordenadas)
  const fecha = fechaEnArgentina(inicio)

  return horariosSalida
    .flatMap((hhmm, viaje) => {
      const salida = new Date(`${fecha}T${hhmm}:00-03:00`).getTime()
      const atraso = ATRASO_POR_PARADA_SEG[viaje % ATRASO_POR_PARADA_SEG.length]
      return POSICIONES_QUE_REPORTAN.filter((i) => i < ordenadas.length - 1).map((i) => ({
        id: `sim-${viaje}-${i}`,
        recorridoId,
        paradaId: ordenadas[i].id,
        creadoEn: new Date(salida + (salidas[i] + atraso * i) * 1000),
      }))
    })
    .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime())
}
