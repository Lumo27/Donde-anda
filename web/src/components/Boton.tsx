import type { ButtonHTMLAttributes } from 'react'

// Botón base (#25). Mínimo 48 px de alto y foco visible al navegar con teclado (criterios de #07).

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'principal' | 'secundario'
  /** Más alto y con letra más grande: para la acción principal de la pantalla ("Me subí"). */
  grande?: boolean
}

const estilos = {
  principal: 'bg-tinta text-white hover:bg-tinta/90',
  secundario: 'border-2 border-tinta bg-white text-tinta hover:bg-gray-50',
}

export function Boton({ variante = 'principal', grande = false, className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={[
        'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 font-bold transition-colors',
        'focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-acento',
        'disabled:cursor-not-allowed disabled:opacity-50',
        grande ? 'min-h-[4.5rem] text-xl' : 'min-h-12 text-base',
        estilos[variante],
        className,
      ].join(' ')}
      {...props}
    />
  )
}
