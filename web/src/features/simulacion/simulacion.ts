import type { Parada, Reporte } from '../../types/modelos'
import { enOrden, fechaEnArgentina, segundosHastaSalir } from '../puntualidad/calculos'

// Simulación de demo (#36): colectivos ficticios que van recorriendo la ruta y "estudiantes" ficticios
// que tocan "Me subí". Sirve para mostrar el prototipo sin Firebase ni gente real. No es la lógica de la app:
// la app solo ve los reportes, igual que con datos reales.

/** Paradas (por posición en el recorrido) donde "alguien" toca Me subí en cada viaje simulado. */
const POSICIONES_QUE_REPORTAN = [1, 3, 4, 6, 7]

/** Segundos de atraso que suma cada viaje en cada parada: el 1º va atrasándose, el 2º viene adelantado. */
const ATRASO_POR_PARADA_SEG = [60, -20, 30]

/**
 * Salidas de la demo, en minutos respecto de cuando se abre: el 1º salió hace 23 min, el 2º salió
 * 15 min después que el 1º (hace 8 min) y el 3º todavía no salió.
 */
const SALIDAS_RESPECTO_DEL_INICIO_MIN = [-23, -8, 37]

/** "HH:mm" en hora de Argentina (UTC-3). */
function horaArgentina(momento: Date): string {
  return new Date(momento.getTime() - 3 * 3600_000).toISOString().slice(11, 16)
}

/** Horarios de salida de la demo: dos colectivos ya en viaje (separados 15 min) y uno por salir. */
export function horariosDeSimulacion(inicio: Date): string[] {
  const minuto = Math.floor(inicio.getTime() / 60000) * 60000
  return SALIDAS_RESPECTO_DEL_INICIO_MIN.map((m) => horaArgentina(new Date(minuto + m * 60000)))
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
