import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModoVista } from './vistaRecorrido'

// Qué parte del recorrido ver en el inicio (#40). Se guarda solo en el teléfono, como "mi parada".

type EstadoVista = {
  modo: ModoVista
  /** Para el modo "personalizado". */
  antes: number
  despues: number
  elegirModo: (modo: ModoVista) => void
  cambiar: (cual: 'antes' | 'despues', delta: number) => void
}

const MAXIMO = 30

export const useVistaRecorrido = create<EstadoVista>()(
  persist(
    (set) => ({
      modo: 'cerca3',
      antes: 5,
      despues: 5,
      elegirModo: (modo) => set({ modo }),
      cambiar: (cual, delta) => set((s) => ({ [cual]: Math.min(MAXIMO, Math.max(0, s[cual] + delta)) })),
    }),
    {
      name: 'donde-anda:vista-recorrido',
      partialize: ({ modo, antes, despues }) => ({ modo, antes, despues }),
    },
  ),
)
