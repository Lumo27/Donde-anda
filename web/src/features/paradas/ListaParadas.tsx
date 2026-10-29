import { useLayoutEffect, useRef, useState } from 'react'
import { Bus, Star } from 'lucide-react'
import { Pantalla } from '../../components/Pantalla'
import { useRecorrido, useUltimoReporte } from '../../services/datos'
import { formatearHora } from '../estado/formato'
import { useAhora } from '../estado/useAhora'
import { enOrden } from '../puntualidad/calculos'
import { posicionEstimada } from '../puntualidad/posicion'
import { proyectarColectivo } from '../puntualidad/proyeccion'
import { textoPosicion } from '../estado/textoPosicion'
import { useMiParada } from './useMiParada'

// Listado de paradas con la hora estimada de paso (#29) y el colectivo bajando por la línea (#36).

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

export default function ListaParadas() {
  const datos = useRecorrido()
  const ultimoReporte = useUltimoReporte(datos?.recorrido.id ?? '')
  const miParadaId = useMiParada((s) => s.paradaId)
  const ahora = useAhora()
  const { lista, puntos, centros } = useCentrosDePuntos(datos?.paradas.length ?? 0)

  if (!datos) return <Pantalla volverA="/">Cargando…</Pantalla>
  const { recorrido } = datos
  const paradas = enOrden(datos.paradas)
  const proyeccion = proyectarColectivo({ ultimoReporte, paradas, horariosSalida: recorrido.horariosSalida, ahora })
  const pasos = proyeccion.fuente === 'sin_servicio' ? [] : proyeccion.pasos

  const fuente =
    proyeccion.fuente === 'en_vivo'
      ? 'En vivo, según el último reporte'
      : proyeccion.fuente === 'por_horario'
        ? `Estimado por horario (sale ${formatearHora(proyeccion.salida)})`
        : 'No hay más colectivos hoy'

  // Dónde va el colectivo, en px dentro de la lista (null = no se dibuja).
  const posicion = posicionEstimada(proyeccion, ahora)
  const ultima = paradas.length - 1
  const yColectivo =
    centros.length === paradas.length
      ? posicion.tipo === 'en_viaje'
        ? centros[posicion.desde] + posicion.fraccion * (centros[posicion.desde + 1] - centros[posicion.desde])
        : posicion.tipo === 'por_salir'
          ? centros[0]
          : null
      : null

  return (
    <Pantalla volverA="/">
      <div>
        <h1 className="text-2xl font-extrabold">Paradas</h1>
        <p className="font-bold text-gray-700">{recorrido.nombre}</p>
        <p className="text-gray-700">{fuente}</p>
        <p className="mt-2 font-bold">{textoPosicion(paradas, posicion)}</p>
      </div>

      <ol ref={lista} className="relative flex flex-col">
        {/* La línea del recorrido y el colectivo, por detrás/encima de los puntos (decorativo). */}
        {centros.length === paradas.length && (
          <span
            aria-hidden
            className="absolute left-4 w-1 -translate-x-1/2 rounded-full bg-gray-300"
            style={{ top: centros[0], height: centros[ultima] - centros[0] }}
          />
        )}
        {yColectivo !== null && (
          <span
            aria-hidden
            className="absolute left-4 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-acento text-tinta shadow-md ring-2 ring-white transition-[top] duration-1000 ease-linear"
            style={{ top: yColectivo }}
          >
            <Bus className="h-5 w-5" strokeWidth={2.5} />
          </span>
        )}
        {paradas.map((parada, i) => {
          const paso = pasos[i]
          const esMia = parada.id === miParadaId
          const esReportada = proyeccion.fuente === 'en_vivo' && proyeccion.paradaReportadaId === parada.id
          const yaPaso = paso?.yaPaso && !esReportada
          const esUltima = i === paradas.length - 1

          const etiquetas = [
            esReportada && 'último reporte: se subió alguien acá',
            esMia && 'tu parada',
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
              {/* Línea del recorrido: punto lleno = todavía no pasó o es el reportado. */}
              <span
                aria-hidden
                ref={(el) => {
                  puntos.current[i] = el
                }}
                className={[
                  'relative h-4 w-4 shrink-0 rounded-full border-2',
                  yaPaso ? 'border-gray-400 bg-white' : esReportada ? 'border-acento bg-acento' : 'border-tinta bg-tinta',
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
                {paso?.llegada ? `${esReportada ? '' : '~'}${formatearHora(paso.llegada)}` : ''}
              </p>
            </li>
          )
        })}
      </ol>
      <p className="text-sm text-gray-700">~ = hora estimada.</p>
    </Pantalla>
  )
}
