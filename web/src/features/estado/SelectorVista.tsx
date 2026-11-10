import { Minus, Plus } from 'lucide-react'
import { useVistaRecorrido } from './useVistaRecorrido'
import type { ModoVista } from './vistaRecorrido'

// Elegir qué parte del recorrido ver en el inicio (#40). La elección se guarda en el teléfono.

const MODOS: { modo: ModoVista; texto: string; descripcion: string }[] = [
  { modo: 'cerca3', texto: '3 y 3', descripcion: '3 paradas antes y 3 después de la tuya' },
  { modo: 'cerca10', texto: '10 y 10', descripcion: '10 paradas antes y 10 después de la tuya' },
  { modo: 'personalizado', texto: 'Personalizado', descripcion: 'elegís cuántas antes y cuántas después' },
  { modo: 'todas', texto: 'Todas', descripcion: 'las 77 paradas' },
]

const foco = 'focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-acento'

function Contador({ etiqueta, valor, cambiar }: { etiqueta: string; valor: number; cambiar: (delta: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-sm font-bold">{etiqueta}</span>
      <button
        type="button"
        aria-label={`Una parada menos ${etiqueta.toLowerCase()}`}
        onClick={() => cambiar(-1)}
        className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-tinta ${foco}`}
      >
        <Minus aria-hidden className="h-5 w-5" strokeWidth={2.5} />
      </button>
      <span aria-live="polite" className="w-8 text-center text-lg font-extrabold tabular-nums">
        {valor}
      </span>
      <button
        type="button"
        aria-label={`Una parada más ${etiqueta.toLowerCase()}`}
        onClick={() => cambiar(1)}
        className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-tinta ${foco}`}
      >
        <Plus aria-hidden className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  )
}

export function SelectorVista() {
  const { modo, antes, despues, elegirModo, cambiar } = useVistaRecorrido()
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Qué paradas ver" className="flex flex-wrap gap-2">
        {MODOS.map((m) => (
          <button
            key={m.modo}
            type="button"
            aria-pressed={modo === m.modo}
            title={m.descripcion}
            onClick={() => elegirModo(m.modo)}
            className={[
              'min-h-12 rounded-full border-2 px-4 text-sm font-bold',
              modo === m.modo ? 'border-tinta bg-tinta text-white' : 'border-gray-300 bg-white text-tinta',
              foco,
            ].join(' ')}
          >
            {m.texto}
          </button>
        ))}
      </div>
      {modo === 'personalizado' && (
        <div className="flex flex-col gap-2">
          <Contador etiqueta="Antes" valor={antes} cambiar={(d) => cambiar('antes', d)} />
          <Contador etiqueta="Después" valor={despues} cambiar={(d) => cambiar('despues', d)} />
        </div>
      )}
    </div>
  )
}
