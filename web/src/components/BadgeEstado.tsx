import { CircleCheck, FastForward, Timer } from 'lucide-react'
import type { EstadoPuntualidad } from '../features/puntualidad/puntualidad'
import { textoEstado } from './textoEstado'

// Estado del colectivo (#25): siempre texto + ícono + color, nunca solo color (accesibilidad, #07).

type Props = {
  estado: EstadoPuntualidad
  /** Positivo = atrasado, negativo = adelantado (como lo devuelve calcularEstado). */
  minutosDiferencia: number
}

const config = {
  a_tiempo: { Icono: CircleCheck, clases: 'border-green-700 bg-green-50 text-green-900' },
  atrasado: { Icono: Timer, clases: 'border-red-700 bg-red-50 text-red-900' },
  adelantado: { Icono: FastForward, clases: 'border-sky-700 bg-sky-50 text-sky-900' },
}

export function BadgeEstado({ estado, minutosDiferencia }: Props) {
  const { Icono, clases } = config[estado]
  return (
    <span
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-4 text-base font-bold ${clases}`}
    >
      <Icono aria-hidden className="h-5 w-5 shrink-0" strokeWidth={2.5} />
      {textoEstado(estado, minutosDiferencia)}
    </span>
  )
}
