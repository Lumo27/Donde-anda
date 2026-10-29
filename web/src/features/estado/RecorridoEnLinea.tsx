import { Bus, Star } from 'lucide-react'
import type { Parada } from '../../types/modelos'
import type { Posicion } from '../puntualidad/posicion'
import { textoPosicion } from './textoPosicion'

// El recorrido como una línea, con el colectivo moviéndose (#36). Es una ESTIMACIÓN (ruta 0 + último
// "Me subí"), no GPS. El dibujo es decorativo: lo mismo se dice en texto para el lector de pantalla.

type Props = {
  paradas: Parada[] // en orden
  posicion: Posicion
  miParadaId: string | null
}

// Márgenes laterales para que el primer y el último punto no queden cortados.
const enLinea = (proporcion: number) => `calc(0.75rem + ${proporcion} * (100% - 1.5rem))`

export function RecorridoEnLinea({ paradas, posicion, miParadaId }: Props) {
  const ultima = paradas.length - 1
  const progreso =
    posicion.tipo === 'en_viaje' ? posicion.progreso : posicion.tipo === 'llego' ? 1 : 0
  const hayColectivo = posicion.tipo === 'en_viaje' || posicion.tipo === 'por_salir'

  return (
    <div>
      <p className="font-bold">{textoPosicion(paradas, posicion)}</p>
      <div aria-hidden className="relative mt-2 h-16">
        {/* Línea completa y tramo ya recorrido */}
        <div className="absolute left-3 right-3 top-10 h-1.5 rounded-full bg-gray-300" />
        <div
          className="absolute left-3 top-10 h-1.5 rounded-full bg-petroleo transition-[width] duration-1000 ease-linear"
          style={{ width: `calc(${progreso} * (100% - 1.5rem))` }}
        />
        {/* Paradas */}
        {paradas.map((p, i) => {
          const esMia = p.id === miParadaId
          return (
            <span
              key={p.id}
              className={[
                'absolute top-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2',
                esMia ? 'h-5 w-5 border-tinta bg-acento' : 'h-3.5 w-3.5 border-tinta bg-white',
                i / ultima <= progreso ? 'border-petroleo' : '',
              ].join(' ')}
              style={{ left: enLinea(i / ultima) }}
            >
              {esMia && <Star className="h-3 w-3 fill-tinta text-tinta" />}
            </span>
          )
        })}
        {/* El colectivo */}
        {hayColectivo && (
          <span
            className="absolute top-0 flex h-8 -translate-x-1/2 items-center gap-1 rounded-lg bg-acento px-1.5 text-sm font-extrabold text-tinta shadow transition-[left] duration-1000 ease-linear"
            style={{ left: enLinea(progreso) }}
          >
            <Bus className="h-5 w-5" strokeWidth={2.5} />
            510
          </span>
        )}
      </div>
      <div aria-hidden className="flex justify-between text-xs font-bold text-gray-700">
        <span>{paradas[0]?.nombre}</span>
        <span>{paradas[ultima]?.nombre}</span>
      </div>
    </div>
  )
}
