import { Star } from 'lucide-react'
import { Pantalla } from '../../components/Pantalla'
import { useRecorrido, useUltimoReporte } from '../../services/datos'
import { formatearHora } from '../estado/formato'
import { useAhora } from '../estado/useAhora'
import { enOrden } from '../puntualidad/calculos'
import { proyectarColectivo } from '../puntualidad/proyeccion'
import { useMiParada } from './useMiParada'

// Listado de paradas con la hora estimada de paso (#29).

export default function ListaParadas() {
  const datos = useRecorrido()
  const ultimoReporte = useUltimoReporte(datos?.recorrido.id ?? '')
  const miParadaId = useMiParada((s) => s.paradaId)
  const ahora = useAhora()

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

  return (
    <Pantalla volverA="/">
      <div>
        <h1 className="text-2xl font-extrabold">Paradas</h1>
        <p className="font-bold text-gray-700">{recorrido.nombre}</p>
        <p className="text-gray-700">{fuente}</p>
      </div>

      <ol className="flex flex-col">
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
                className={[
                  'h-4 w-4 shrink-0 rounded-full border-2',
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
