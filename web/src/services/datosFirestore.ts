import { useMemo } from 'react'
import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { useAhora } from '../features/estado/useAhora'
import { fechaEnArgentina } from '../features/puntualidad/calculos'
import type { Parada, Recorrido, Reporte } from '../types/modelos'
import type { DatosRecorrido } from './datosLocales'
import { firebase } from './firebase'
import { ahora } from './reloj'

// Fuente de datos de FIRESTORE (#18, #21, #22): la que usa la app real. Mismas funciones que datosLocales.ts.
// Escucha en vivo el recorrido, sus paradas y los "Me subí" del día. Arranca cuando hay sesión (las reglas
// no dejan leer sin login) y se corta al cerrar sesión.

const RECORRIDO_ID = '510-ida'

type Estado = {
  recorrido: Recorrido | null
  paradas: Parada[] | null
  reportes: Reporte[]
  error: string | null
}
const useEstado = create<Estado>(() => ({ recorrido: null, paradas: null, reportes: [], error: null }))

let iniciado = false
let cortar: Unsubscribe[] = []

function alFallar(error: Error) {
  console.error('[donde-anda] Firestore:', error)
  useEstado.setState({ error: 'No pudimos conectarnos. Revisá tu conexión.' })
}

/** Empieza a escuchar Firestore cada vez que alguien inicia sesión. Se llama una sola vez. */
export function iniciar() {
  if (iniciado) return
  iniciado = true
  const { auth, db } = firebase()
  onAuthStateChanged(auth, (usuario) => {
    cortar.forEach((f) => f())
    cortar = []
    if (!usuario) {
      useEstado.setState({ recorrido: null, paradas: null, reportes: [], error: null })
      return
    }

    cortar.push(
      onSnapshot(
        doc(db, 'recorridos', RECORRIDO_ID),
        (s) => useEstado.setState({ recorrido: s.exists() ? ({ id: s.id, ...s.data() } as Recorrido) : null }),
        alFallar,
      ),
      onSnapshot(
        query(collection(db, 'recorridos', RECORRIDO_ID, 'paradas'), orderBy('orden')),
        (s) => useEstado.setState({ paradas: s.docs.map((d) => ({ id: d.id, ...d.data() }) as Parada) }),
        alFallar,
      ),
    )

    // Solo los reportes de hoy (hora de Argentina): son los únicos que importan para saber dónde anda.
    const inicioDelDia = new Date(`${fechaEnArgentina(ahora())}T00:00:00-03:00`)
    cortar.push(
      onSnapshot(
        query(
          collection(db, 'reportes'),
          where('recorridoId', '==', RECORRIDO_ID),
          where('creadoEn', '>=', Timestamp.fromDate(inicioDelDia)),
          orderBy('creadoEn'),
        ),
        (s) =>
          useEstado.setState({
            reportes: s.docs.map((d) => {
              // Un reporte recién creado todavía no tiene la hora del servidor: se usa una estimada.
              const r = d.data({ serverTimestamps: 'estimate' })
              return {
                id: d.id,
                recorridoId: r.recorridoId,
                paradaId: r.paradaId,
                creadoEn: (r.creadoEn as Timestamp).toDate(),
              }
            }),
          }),
        alFallar,
      ),
    )
  })
}

export function useRecorrido(): DatosRecorrido | null {
  const recorrido = useEstado((s) => s.recorrido)
  const paradas = useEstado((s) => s.paradas)
  return useMemo(() => (recorrido && paradas?.length ? { recorrido, paradas } : null), [recorrido, paradas])
}

/** Mensaje si no se pudo conectar, para mostrarlo en vez de "Cargando…" para siempre. */
export function useErrorDeDatos(): string | null {
  return useEstado((s) => s.error)
}

export function useReportes(recorridoId: string): Reporte[] {
  const momento = useAhora()
  const reportes = useEstado((s) => s.reportes)
  return reportes.filter((r) => r.recorridoId === recorridoId && r.creadoEn <= momento)
}

export function useUltimoReporte(recorridoId: string): Reporte | null {
  const reportes = useReportes(recorridoId)
  return reportes[reportes.length - 1] ?? null
}

/** Guarda un "Me subí" con EXACTAMENTE recorrido, parada y hora del servidor (las reglas rechazan cualquier otra cosa). */
export async function crearReporte(recorridoId: string, paradaId: string): Promise<void> {
  await addDoc(collection(firebase().db, 'reportes'), { recorridoId, paradaId, creadoEn: serverTimestamp() })
}
