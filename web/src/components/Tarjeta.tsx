import { useId, type ReactNode } from 'react'

// Caja para agrupar información (#25). Si tiene título, el lector de pantalla la anuncia como una sección con nombre.

type Props = {
  titulo?: string
  destacada?: boolean
  children: ReactNode
  className?: string
}

export function Tarjeta({ titulo, destacada = false, children, className = '' }: Props) {
  const idTitulo = useId()
  return (
    <section
      aria-labelledby={titulo ? idTitulo : undefined}
      className={[
        'rounded-2xl p-4',
        destacada ? 'border-2 border-tinta bg-white' : 'border border-gray-200 bg-gray-50',
        className,
      ].join(' ')}
    >
      {titulo && (
        <h2 id={idTitulo} className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-600">
          {titulo}
        </h2>
      )}
      {children}
    </section>
  )
}
