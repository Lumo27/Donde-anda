import { useId } from 'react'

// Lista para elegir una opción, ej. una parada (#25). Usa radios nativos: funciona con teclado y lector de pantalla.

export type Opcion = {
  valor: string
  etiqueta: string
  /** Texto chico al lado, ej. "tu parada". */
  detalle?: string
}

type Props = {
  leyenda: string
  /** Si es true, la leyenda solo la escucha el lector de pantalla (cuando la pantalla ya tiene un título). */
  leyendaOculta?: boolean
  opciones: Opcion[]
  valor: string | null
  onCambio: (valor: string) => void
}

export function Selector({ leyenda, leyendaOculta = false, opciones, valor, onCambio }: Props) {
  const nombre = useId()
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={leyendaOculta ? 'sr-only' : 'mb-2 text-base font-bold'}>{leyenda}</legend>
      {opciones.map((o) => {
        const elegida = o.valor === valor
        return (
          <label
            key={o.valor}
            className={[
              'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acento',
              elegida ? 'border-tinta bg-gray-100 font-bold' : 'border-gray-300 bg-white',
            ].join(' ')}
          >
            <input
              type="radio"
              name={nombre}
              value={o.valor}
              checked={elegida}
              onChange={() => onCambio(o.valor)}
              className="h-5 w-5 shrink-0 accent-tinta"
            />
            <span className="text-base text-tinta">{o.etiqueta}</span>
            {o.detalle && <span className="ml-auto text-sm font-normal text-gray-700">{o.detalle}</span>}
          </label>
        )
      })}
    </fieldset>
  )
}
