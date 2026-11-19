import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { BadgeEstado } from '../../components/BadgeEstado'
import { Pantalla } from '../../components/Pantalla'
import { Tarjeta } from '../../components/Tarjeta'
import { useRecorrido, useReportes } from '../../services/datos'
import { distanciaPorRecorrido, textoDistancia } from '../paradas/cercania'
import { LineaDeParadas } from '../paradas/LineaDeParadas'
import { useMiParada } from '../paradas/useMiParada'
import { BotonMeSubi } from '../reportes/BotonMeSubi'
import { aplicarMargen, enOrden, horariosDelDia, resumenRecorrido } from '../puntualidad/calculos'
import { colectivosEnRecorrido, proximoAMiParada } from '../puntualidad/colectivos'
import { calcularEstado } from '../puntualidad/puntualidad'
import { duracion, formatearHora, haceCuanto } from './formato'
import { SelectorVista } from './SelectorVista'
import { useAhora } from './useAhora'
import { useVistaRecorrido } from './useVistaRecorrido'
import { alcanceDelModo, itemsVisibles } from './vistaRecorrido'

// Pantalla principal (#27, #40). Arriba el recorrido, solo con las paradas que la persona eligió ver;
// abajo los avisos: cuándo llega el próximo a su parada, el último reporte y las salidas del día.
// Sigue a todos los colectivos que están en viaje (#37).

const enlace =
  'inline-flex min-h-12 items-center gap-1 rounded-lg font-bold text-petroleo underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-acento'

/** "a 4 paradas · 1,2 km" (la distancia, si se conoce la ubicación de las paradas del tramo). */
function textoFaltan(paradasQueFaltan: number, metros: number | null): string {
  const paradasTexto = paradasQueFaltan === 1 ? 'a 1 parada' : `a ${paradasQueFaltan} paradas`
  return metros === null ? paradasTexto : `${paradasTexto} · ${textoDistancia(metros).replace(/^a /, '')}`
}

export default function PantallaEstado() {
  const datos = useRecorrido()
  const reportes = useReportes(datos?.recorrido.id ?? '')
  const ultimoReporte = reportes[reportes.length - 1] ?? null
  const miParadaId = useMiParada((s) => s.paradaId)
  const { modo, antes, despues } = useVistaRecorrido()
  const ahora = useAhora()

  if (!datos || !miParadaId) return <Pantalla>Cargando…</Pantalla>
  const { recorrido } = datos
  const paradas = enOrden(datos.paradas)
  const indiceDe = (id: string) => paradas.findIndex((p) => p.id === id)
  const indiceMia = indiceDe(miParadaId)
  const miParada = paradas[indiceMia]

  const horariosSalida = horariosDelDia(recorrido, ahora)
  const hayServicioHoy = horariosSalida.length > 0
  const colectivos = colectivosEnRecorrido({ reportes, paradas, horariosSalida, ahora })
  const items = itemsVisibles(paradas.length, indiceMia, alcanceDelModo(modo, { antes, despues }))

  // Próximo colectivo a mi parada, y cuánto le falta (en paradas y km por recorrido).
  const estimacion = proximoAMiParada({ reportes, paradas, horariosSalida, ahora, miParadaId }, colectivos)
  const elProximo = estimacion && colectivos.find((c) => c.horario === estimacion.horario)
  const pasoPor = elProximo?.posicion.tipo === 'en_viaje' ? elProximo.posicion.desde : 0
  const faltan = textoFaltan(indiceMia - pasoPor, distanciaPorRecorrido(paradas, pasoPor, indiceMia))

  // Último reporte: se muestra si es de un colectivo que sigue en viaje.
  const delReporte = colectivos.find((c) => c.ultimoReporte === ultimoReporte)
  const enVivo = delReporte && ultimoReporte
  const paradaReportada = enVivo ? paradas[indiceDe(ultimoReporte.paradaId)] : null
  const estado = enVivo ? calcularEstado(ultimoReporte, horariosSalida, paradas) : null
  const resumen = resumenRecorrido(aplicarMargen(paradas))

  return (
    <Pantalla>
      <h1 className="sr-only">¿Dónde anda el {recorrido.linea}?</h1>

      <Tarjeta titulo="Recorrido (estimado)">
        <SelectorVista />
        <div className="mt-3">
          <LineaDeParadas paradas={paradas} colectivos={colectivos} miParadaId={miParadaId} items={items} />
        </div>
        <Link to="/paradas" className={enlace}>
          Ver la lista de paradas <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </Tarjeta>

      <Tarjeta titulo="Avisos" destacada>
        <div className="flex flex-col divide-y divide-gray-200">
          <section aria-label="Próximo a tu parada" aria-live="polite" className="pb-3">
            <p className="text-sm font-bold text-gray-700">
              Tu parada: {miParada.orden}. {miParada.nombre}
            </p>
            {!estimacion ? (
              <p className="text-2xl font-extrabold">{hayServicioHoy ? 'No hay más colectivos hoy' : 'Hoy no hay servicio'}</p>
            ) : (
              <>
                <p className="text-3xl font-extrabold">
                  {estimacion.minutos === 0 ? 'Está llegando' : `Llega ~${formatearHora(estimacion.llegada)}`}
                </p>
                {estimacion.minutos > 0 && (
                  <p className="text-lg font-bold">
                    {estimacion.minutos < 60
                      ? `en ${estimacion.minutos} min`
                      : `en ${duracion(estimacion.minutos * 60)}`}
                  </p>
                )}
                <p className="text-gray-700">
                  El de las {estimacion.horario} ·{' '}
                  {elProximo?.posicion.tipo === 'en_viaje' ? faltan : `sale de ${paradas[0].nombre} a las ${estimacion.horario}`}
                  {' · '}
                  {estimacion.tipo === 'en_vivo' ? 'según el último reporte' : 'estimado por horario'}
                </p>
              </>
            )}
          </section>

          <section aria-label="Último reporte" className="py-3">
            <p className="text-sm font-bold text-gray-700">Último reporte</p>
            {enVivo && paradaReportada ? (
              <>
                <p className="text-lg font-bold">
                  Parada {paradaReportada.orden}: {paradaReportada.nombre}
                </p>
                <p className="text-gray-700">
                  Alguien se subió {haceCuanto(ultimoReporte.creadoEn, ahora)} ({formatearHora(ultimoReporte.creadoEn)}) ·
                  el de las {delReporte.horario}
                </p>
                {estado && (
                  <div className="mt-2">
                    <BadgeEstado estado={estado.estado} minutosDiferencia={estado.minutosDiferencia} />
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-700">
                Sin reportes en vivo. Mostramos el horario estimado. Si te subís, tocá "Me subí" para avisar al resto.
              </p>
            )}
          </section>

          <section aria-label="Horarios" className="pt-3 text-gray-700">
            <p>{hayServicioHoy ? `Salidas de hoy: ${horariosSalida.join(' · ')}` : 'Hoy no hay servicio'}</p>
            <p>
              {resumen.cantidadParadas} paradas · ~{duracion(resumen.segundosTotales)} de recorrido
            </p>
            <Link to="/mi-parada" className={enlace}>
              Cambiar mi parada <ChevronRight aria-hidden className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </Tarjeta>

      {/* "Me subí" queda fijo abajo: siempre a mano aunque el recorrido sea largo. */}
      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-gray-200 bg-white/95 px-4 pb-4 pt-2 backdrop-blur">
        <BotonMeSubi
          recorridoId={recorrido.id}
          miParadaId={miParadaId}
          // Se puede subir en cualquier parada menos la última (la facu).
          opciones={paradas
            .slice(0, -1)
            .map((p) => ({ valor: p.id, etiqueta: p.nombre, detalle: p.id === miParadaId ? 'tu parada' : undefined }))}
        />
      </div>
    </Pantalla>
  )
}
