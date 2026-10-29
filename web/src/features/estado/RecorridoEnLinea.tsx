import { Bus, Star } from 'lucide-react'
import type { Parada } from '../../types/modelos'
import type { Colectivo } from '../puntualidad/colectivos'
import { textoPosicion } from './textoPosicion'

// El recorrido como una línea, con los colectivos moviéndose (#36, #37). Es una ESTIMACIÓN (ruta 0 +
// último "Me subí" de cada uno), no GPS. El dibujo es decorativo: lo mismo se dice en texto.

type Props = {
  paradas: Parada[] // en orden
  colectivos: Colectivo[]
  miParadaId: string | null
}

// Márgenes laterales para que el primer y el último punto no queden cortados.
const enLinea = (proporcion: number) => `calc(0.75rem + ${proporcion} * (100% - 1.5rem))`
const progresoDe = (c: Colectivo) => (c.posicion.tipo === 'en_viaje' ? c.posicion.progreso : 0)

export function RecorridoEnLinea({ paradas, colectivos, miParadaId }: Props) {
  const ultima = paradas.length - 1
  // El tramo pintado es el del colectivo que va más adelante.
  const masAdelante = Math.max(0, ...colectivos.map(progresoDe))

  return (
    <div>
      {colectivos.length === 0 ? (
        <p className="font-bold">No hay colectivos en viaje</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {colectivos.map((c) => (
            <li key={c.horario}>
              <span className="font-bold">El de las {c.horario}:</span> {textoPosicion(paradas, c.posicion)}
            </li>
          ))}
        </ul>
      )}
      <div aria-hidden className="relative mt-2 h-16">
        <div className="absolute left-3 right-3 top-10 h-1.5 rounded-full bg-gray-300" />
        <div
          className="absolute left-3 top-10 h-1.5 rounded-full bg-petroleo transition-[width] duration-1000 ease-linear"
          style={{ width: `calc(${masAdelante} * (100% - 1.5rem))` }}
        />
        {paradas.map((p, i) => {
          const esMia = p.id === miParadaId
          return (
            <span
              key={p.id}
              className={[
                'absolute top-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-tinta',
                esMia ? 'h-5 w-5 bg-acento' : 'h-3.5 w-3.5 bg-white',
              ].join(' ')}
              style={{ left: enLinea(i / ultima) }}
            >
              {esMia && <Star className="h-3 w-3 fill-tinta text-tinta" />}
            </span>
          )
        })}
        {colectivos.map((c) => (
          <span
            key={c.horario}
            className={[
              'absolute top-0 flex h-8 items-center gap-1 rounded-lg px-1.5 text-xs font-extrabold shadow transition-[left,transform] duration-1000 ease-linear',
              c.posicion.tipo === 'por_salir' ? 'border-2 border-dashed border-tinta bg-white text-tinta' : 'bg-acento text-tinta',
            ].join(' ')}
            // Centrada sobre su posición, pero en las puntas se corre hacia adentro para no salirse de la tarjeta.
            style={{ left: enLinea(progresoDe(c)), transform: `translateX(-${progresoDe(c) * 100}%)` }}
          >
            <Bus className="h-4 w-4" strokeWidth={2.5} />
            {c.horario}
          </span>
        ))}
      </div>
      <div aria-hidden className="flex justify-between text-xs font-bold text-gray-700">
        <span>{paradas[0]?.nombre}</span>
        <span>{paradas[ultima]?.nombre}</span>
      </div>
    </div>
  )
}
