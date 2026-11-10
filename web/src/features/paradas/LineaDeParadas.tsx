import { useLayoutEffect, useRef, useState } from 'react'
import { Bus, Star } from 'lucide-react'
import type { Parada } from '../../types/modelos'
import { formatearHora } from '../estado/formato'
import { filaEnVista, type ItemVista } from '../estado/vistaRecorrido'
import type { Colectivo } from '../puntualidad/colectivos'

// El recorrido como una línea vertical, con los colectivos moviéndose (#29, #36, #37, #40).
// Muestra las filas de `items`: todas las paradas (lista completa) o solo algunas, con "⋯ N paradas"
// donde se saltean (inicio). Para cada parada: la hora del PRÓXIMO colectivo en pasar.

type Props = {
  paradas: Parada[] // en orden
  colectivos: Colectivo[]
  miParadaId: string | null
  items: ItemVista[]
}

/** Altura (en px, dentro de la lista) del centro de cada punto de la línea. Se mide después de dibujar. */
function useCentrosDePuntos(cantidad: number) {
  const lista = useRef<HTMLOListElement>(null)
  const puntos = useRef<(HTMLSpanElement | null)[]>([])
  const [centros, setCentros] = useState<number[]>([])

  useLayoutEffect(() => {
    const medir = () => {
      const base = lista.current?.getBoundingClientRect().top ?? 0
      const nuevos = puntos.current.slice(0, cantidad).map((p) => {
        const r = p?.getBoundingClientRect()
        return r ? r.top + r.height / 2 - base : 0
      })
      setCentros((viejos) => (viejos.join() === nuevos.join() ? viejos : nuevos))
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  })

  return { lista, puntos, centros }
}

/** Posición del colectivo en el recorrido: índice de parada con decimales (0 = cabecera). */
const enRecorrido = (c: Colectivo) => (c.posicion.tipo === 'en_viaje' ? c.posicion.desde + c.posicion.fraccion : 0)

export function LineaDeParadas({ paradas, colectivos, miParadaId, items }: Props) {
  const { lista, puntos, centros } = useCentrosDePuntos(items.length)
  const medido = centros.length === items.length && items.length > 0
  const variosColectivos = colectivos.length > 1
  const ultima = paradas.length - 1

  const alturaDe = (c: Colectivo) => {
    const { fila } = filaEnVista(items, enRecorrido(c))
    const k = Math.floor(fila)
    const siguiente = centros[Math.min(k + 1, centros.length - 1)]
    return centros[k] + (fila - k) * (siguiente - centros[k])
  }

  return (
    <ol ref={lista} className="relative flex flex-col">
      {/* La línea y los colectivos son decorativos: lo mismo se dice en texto. */}
      {medido && (
        <span
          aria-hidden
          className="absolute left-4 w-1 -translate-x-1/2 rounded-full bg-gray-300"
          style={{ top: centros[0], height: centros[centros.length - 1] - centros[0] }}
        />
      )}
      {medido &&
        colectivos.map((c) => (
          <span
            key={c.horario}
            aria-hidden
            className={[
              'absolute left-4 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg shadow-md ring-2 ring-white transition-[top] duration-1000 ease-linear',
              c.posicion.tipo === 'por_salir' ? 'border-2 border-dashed border-tinta bg-white' : 'bg-acento',
            ].join(' ')}
            style={{ top: alturaDe(c) }}
          >
            <Bus className="h-5 w-5 text-tinta" strokeWidth={2.5} />
          </span>
        ))}

      {items.map((item, fila) => {
        const punto = (el: HTMLSpanElement | null) => {
          puntos.current[fila] = el
        }

        if (item.tipo === 'salto') {
          const cantidad = item.hasta - item.desde + 1
          const adentro = colectivos.filter((c) => filaEnVista(items, enRecorrido(c)).fila === fila)
          return (
            <li key={`salto-${item.desde}`} className="relative flex min-h-12 items-center gap-3 px-2 py-1">
              <span aria-hidden ref={punto} className="relative h-4 w-4 shrink-0 rounded-full border-2 border-dashed border-gray-400 bg-white" />
              <p className="text-sm text-gray-700">
                ⋯ {cantidad} {cantidad === 1 ? 'parada' : 'paradas'} más
                {adentro.length > 0 && ` · por acá va el de las ${adentro.map((c) => c.horario).join(' y el de las ')}`}
              </p>
            </li>
          )
        }

        const i = item.indice
        const parada = paradas[i]
        const esMia = parada.id === miParadaId
        // El próximo colectivo que todavía no pasó por esta parada.
        const proximo = colectivos
          .map((c) => ({ c, llegada: c.proyeccion.pasos[i]?.yaPaso ? null : c.proyeccion.pasos[i]?.llegada }))
          .filter((x): x is { c: Colectivo; llegada: Date } => !!x.llegada)
          .sort((a, b) => a.llegada.getTime() - b.llegada.getTime())[0]
        const reportadoAca = colectivos.find((c) => c.ultimoReporte?.paradaId === parada.id)
        const yaPaso = !proximo

        const etiquetas = [
          reportadoAca &&
            `se subió alguien a las ${formatearHora(reportadoAca.ultimoReporte!.creadoEn)}` +
              (variosColectivos ? ` (el de las ${reportadoAca.horario})` : ''),
          esMia && 'tu parada',
          proximo && variosColectivos && `próximo: el de las ${proximo.c.horario}`,
          yaPaso && 'ya pasó',
          i === ultima && 'llegada a la facu',
        ].filter(Boolean)

        return (
          <li
            key={parada.id}
            className={[
              'relative flex min-h-14 items-center gap-3 rounded-xl px-2 py-2',
              esMia ? 'border-2 border-tinta bg-gray-100' : '',
            ].join(' ')}
          >
            <span
              aria-hidden
              ref={punto}
              className={[
                'relative h-4 w-4 shrink-0 rounded-full border-2',
                yaPaso ? 'border-gray-400 bg-white' : reportadoAca ? 'border-acento bg-acento' : 'border-tinta bg-tinta',
              ].join(' ')}
            />
            <div className="min-w-0 flex-1">
              <p className={['flex items-center gap-1', yaPaso ? 'text-gray-600' : 'font-bold'].join(' ')}>
                {esMia && <Star aria-hidden className="h-4 w-4 shrink-0 fill-acento text-tinta" />}
                <span className="font-normal text-gray-600">{parada.orden}.</span> {parada.nombre}
              </p>
              {etiquetas.length > 0 && <p className="text-sm text-gray-700">{etiquetas.join(' · ')}</p>}
            </div>
            <p className={['tabular-nums', yaPaso ? 'text-gray-600' : 'font-bold'].join(' ')}>
              {proximo ? `~${formatearHora(proximo.llegada)}` : ''}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
