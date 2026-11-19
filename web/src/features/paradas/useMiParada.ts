import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// "Mi parada" (#26). Se guarda SOLO en el teléfono (localStorage): nunca se sube a Firebase.

type EstadoMiParada = {
  paradaId: string | null
  elegir: (paradaId: string) => void
}

export const useMiParada = create<EstadoMiParada>()(
  persist(
    (set) => ({
      paradaId: null,
      elegir: (paradaId) => set({ paradaId }),
    }),
    { name: 'donde-anda:mi-parada', partialize: (s) => ({ paradaId: s.paradaId }) },
  ),
)
