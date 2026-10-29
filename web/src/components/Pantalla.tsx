import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, MapPin, RotateCcw, TriangleAlert } from 'lucide-react'
import { formatearHora } from '../features/estado/formato'
import { useAhora } from '../features/estado/useAhora'
import { SIMULACION_ACTIVA, useRecorrido } from '../services/datos'
import { velocidadDelReloj } from '../services/reloj'

// Marco común de todas las pantallas: encabezado, cartel de datos de prueba y ancho de celular.

/** Cartel de la demo (#36): avisa que es una simulación, a qué velocidad corre y la hora simulada. */
function BannerSimulacion() {
  const ahora = useAhora()
  const velocidad = velocidadDelReloj()
  return (
    <div
      role="note"
      className="flex items-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-50 py-1 pl-3 pr-1 text-sm font-bold text-amber-900"
    >
      <TriangleAlert aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      <p className="flex-1">
        Simulación de prueba{velocidad !== 1 && ` ×${velocidad}`} · {formatearHora(ahora)}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex min-h-10 items-center gap-1 rounded-md px-2 underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-acento"
      >
        <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={2.5} />
        Reiniciar
      </button>
    </div>
  )
}

type Props = {
  children: ReactNode
  /** Si se pasa, muestra "‹ Volver" a esa ruta. */
  volverA?: string
}

export function Pantalla({ children, volverA }: Props) {
  const datos = useRecorrido()
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white text-tinta">
      <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        {volverA ? (
          <Link
            to={volverA}
            className="-ml-2 flex min-h-12 items-center gap-1 rounded-lg px-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-acento"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={2.5} />
            Volver
          </Link>
        ) : (
          <p className="flex items-center gap-2 text-xl font-extrabold">
            <MapPin aria-hidden className="h-6 w-6 text-acento" strokeWidth={2.5} />
            Donde anda?
          </p>
        )}
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {SIMULACION_ACTIVA ? (
          <BannerSimulacion />
        ) : (
          datos?.recorrido.ficticia && (
            <p
              role="note"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-900"
            >
              <TriangleAlert aria-hidden className="h-4 w-4" strokeWidth={2.5} />
              Datos de prueba (ruta ficticia)
            </p>
          )
        )}
        {children}
      </main>
    </div>
  )
}
