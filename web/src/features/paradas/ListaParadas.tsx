import { useLayoutEffect, useRef, useState } from 'react'
import { Bus, Star } from 'lucide-react'
import { Pantalla } from '../../components/Pantalla'
import { useRecorrido, useReportes } from '../../services/datos'
import { formatearHora } from '../estado/formato'
import { textoPosicion } from '../estado/textoPosicion'
import { useAhora } from '../estado/useAhora'
import { enOrden } from '../puntualidad/calculos'
import { colectivosEnRecorrido, type Colectivo } from '../puntualidad/colectivos'
import { useMiParada } from './useMiParada'

// Listado de paradas (#29): para cada parada, cuándo pasa el PRÓXIMO colectivo. Los colectivos en viaje
// se ven bajando por la línea (#36, #37).

/** Altura (en px, dentro de la lista) del centro de cada punto de parada. Se mide después de dibujar. */
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

/** Dónde dibujar un colectivo, en px dentro de la lista. */
function alturaDe(c: Colectivo, centros: number[]): number {
  if (c.posicion.tipo === 'por_salir') return centros[0]
  const { desde, fraccion } = c.posicion
  return centros[desde] + fraccion * (centros[desde + 1] - centros[desde])
}

export default function ListaParadas() {
  const datos = useRecorrido()
  const reportes = useReportes(datos?.recorrido.id ?? '')
  const miParadaId = useMiParada((s) => s.paradaId)
  const ahora = useAhora()
  const { lista, puntos, centros } = useCentrosDePuntos(datos?.paradas.length ?? 0)

  if (!datos) return <Pantalla volverA="/">Cargando…</Pantalla>
  const { recorrido } = datos
  const paradas = enOrden(datos.paradas)
  const colectivos = colectivosEnRecorrido({ reportes, paradas, horariosSalida: recorrido.horariosSalida, ahora })
  const ultima = paradas.length - 1
  const medido = centros.length === paradas.length

  return (
    <Pantalla volverA="/">
      <div>
        <h1 className="text-2xl font-extrabold">Paradas</h1>
        <p className="font-bold text-gray-700">{recorrido.nombre}</p>
        {colectivos.length === 0 ? (
          <p className="mt-2 font-bold">No hay más colectivos hoy</p>
        ) : (
          <ul className="mt-2">
            {colectivos.map((c) => (
              <li key={c.horario}>
                <span className="font-bold">El de las {c.horario}:</span> {textoPosicion(paradas, c.posicion)}
                {c.proyeccion.fuente === 'en_vivo' ? ' (en vivo)' : ' (por horario)'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ol ref={lista} className="relative flex flex-col">
        {/* La línea del recorrido y los colectivos (decorativo: lo mismo está en texto arriba). */}
        {medido && (
          <span
            aria-hidden
            className="absolute left-4 w-1 -translate-x-1/2 rounded-full bg-gray-300"
            style={{ top: centros[0], height: centros[ultima] - centros[0] }}
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
              style={{ top: alturaDe(c, centros) }}
            >
              <Bus className="h-5 w-5 text-tinta" strokeWidth={2.5} />
            </span>
          ))}

        {paradas.map((parada, i) => {
          const esMia = parada.id === miParadaId
          // El próximo colectivo que todavía no pasó por esta parada.
          const proximo = colectivos
            .map((c) => ({ c, llegada: c.proyeccion.pasos[i]?.yaPaso ? null : c.proyeccion.pasos[i]?.llegada }))
            .filter((x): x is { c: Colectivo; llegada: Date } => !!x.llegada)
            .sort((a, b) => a.llegada.getTime() - b.llegada.getTime())[0]
          const reportadoAca = colectivos.find((c) => c.ultimoReporte?.paradaId === parada.id)?.ultimoReporte
          const yaPaso = !proximo
          const esUltima = i === ultima

          const etiquetas = [
            reportadoAca && `se subió alguien acá a las ${formatearHora(reportadoAca.creadoEn)}`,
            esMia && 'tu parada',
            proximo && colectivos.length > 1 && `el de las ${proximo.c.horario}`,
            yaPaso && 'ya pasó',
            esUltima && 'llegada a la facu',
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
                ref={(el) => {
                  puntos.current[i] = el
                }}
                className={[
                  'relative h-4 w-4 shrink-0 rounded-full border-2',
                  yaPaso ? 'border-gray-400 bg-white' : reportadoAca ? 'border-acento bg-acento' : 'border-tinta bg-tinta',
                ].join(' ')}
              />
              <div className="min-w-0 flex-1">
                <p className={['flex items-center gap-1', yaPaso ? 'text-gray-600' : 'font-bold'].join(' ')}>
                  {esMia && <Star aria-hidden className="h-4 w-4 fill-acento text-tinta" />}
                  {parada.nombre}
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
      <p className="text-sm text-gray-700">~ = hora estimada del próximo colectivo en pasar.</p>
    </Pantalla>
  )
}
