import * as local from './datosLocales'
import * as remoto from './datosFirestore'
import { DATOS_LOCALES } from './fuente'

// Fuente de datos de la app. Las pantallas piden todo acá y no saben de dónde viene:
// - Firestore (datosFirestore.ts) en la app real.
// - Local (datosLocales.ts) en los tests y con VITE_DATOS=local (desarrollo sin internet).
// Las dos tienen las mismas funciones.

export type { DatosRecorrido } from './datosLocales'

const fuente = DATOS_LOCALES ? local : remoto
if (!DATOS_LOCALES) remoto.iniciar()

export const useRecorrido = fuente.useRecorrido
export const useReportes = fuente.useReportes
export const useUltimoReporte = fuente.useUltimoReporte
export const crearReporte = fuente.crearReporte
/** null si todo bien; un mensaje si no se pudo conectar con Firestore. */
export const useErrorDeDatos: () => string | null = DATOS_LOCALES ? () => null : remoto.useErrorDeDatos
