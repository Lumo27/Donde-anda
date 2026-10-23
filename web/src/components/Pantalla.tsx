import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, MapPin, TriangleAlert } from 'lucide-react'
import { useRecorrido } from '../services/datos'

// Marco común de todas las pantallas: encabezado, cartel de datos de prueba y ancho de celular.

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

      {datos?.recorrido.ficticia && (
        <p
          role="note"
          className="mx-4 mt-3 flex items-center justify-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-900"
        >
          <TriangleAlert aria-hidden className="h-4 w-4" strokeWidth={2.5} />
          Datos de prueba (ruta ficticia)
        </p>
      )}

      <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
    </div>
  )
}
