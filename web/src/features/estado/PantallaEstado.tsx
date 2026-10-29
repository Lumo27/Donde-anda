import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { BadgeEstado } from '../../components/BadgeEstado'
import { Pantalla } from '../../components/Pantalla'
import { Tarjeta } from '../../components/Tarjeta'
import { useRecorrido, useReportes } from '../../services/datos'
import { useMiParada } from '../paradas/useMiParada'
import { BotonMeSubi } from '../reportes/BotonMeSubi'
import { aplicarMargen, enOrden, resumenRecorrido } from '../puntualidad/calculos'
import { colectivosEnRecorrido, proximoAMiParada } from '../puntualidad/colectivos'
import { calcularEstado } from '../puntualidad/puntualidad'
import { duracion, formatearHora, haceCuanto } from './formato'
import { RecorridoEnLinea } from './RecorridoEnLinea'
import { useAhora } from './useAhora'

// Pantalla principal (#27): responde "¿dónde anda y cuánto le falta?" sin navegar. Sigue a todos los
// colectivos que están en viaje (#37).

const enlace =
  'inline-flex min-h-12 items-center gap-1 rounded-lg font-bold text-petroleo underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-acento'

export default function PantallaEstado() {
  const datos = useRecorrido()
  const reportes = useReportes(datos?.recorrido.id ?? '')
  const ultimoReporte = reportes[reportes.length - 1] ?? null
  const miParadaId = useMiParada((s) => s.paradaId)
  const ahora = useAhora()

  if (!datos || !miParadaId) return <Pantalla>Cargando…</Pantalla>
  const { recorrido, paradas } = datos
  const nombreDe = (id: string) => paradas.find((p) => p.id === id)?.nombre ?? id

  const { horariosSalida } = recorrido
  const colectivos = colectivosEnRecorrido({ reportes, paradas, horariosSalida, ahora })
  // El último reporte se muestra si es de un colectivo que sigue en viaje.
  const delReporte = colectivos.find((c) => c.ultimoReporte === ultimoReporte)
  const enVivo = delReporte && ultimoReporte
  const estado = enVivo ? calcularEstado(ultimoReporte, horariosSalida, paradas) : null
  const estimacion = proximoAMiParada({ reportes, paradas, horariosSalida, ahora, miParadaId }, colectivos)
  const resumen = resumenRecorrido(aplicarMargen(paradas))

  return (
    <Pantalla>
      <h1 className="sr-only">¿Dónde anda el {recorrido.linea}?</h1>
      <Tarjeta titulo="Por dónde va (estimado)">
        <RecorridoEnLinea
          paradas={enOrden(paradas)}
          colectivos={colectivos}
          miParadaId={miParadaId}
        />
      </Tarjeta>
      <Tarjeta titulo="Último reporte">
        {enVivo ? (
          <>
            <p className="text-lg font-bold">Alguien se subió en {nombreDe(ultimoReporte.paradaId)}</p>
            <p className="text-gray-700">
              {haceCuanto(ultimoReporte.creadoEn, ahora)} · {formatearHora(ultimoReporte.creadoEn)} · el de las{' '}
              {delReporte.horario}
            </p>
            {estado && (
              <div className="mt-3">
                <BadgeEstado estado={estado.estado} minutosDiferencia={estado.minutosDiferencia} />
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-lg font-bold">Sin reportes en vivo</p>
            <p className="text-gray-700">Mostramos el horario estimado. Si te subís, tocá "Me subí" para avisar al resto.</p>
          </>
        )}
      </Tarjeta>

      <Tarjeta titulo={`Tu parada: ${nombreDe(miParadaId)}`} destacada>
        <div aria-live="polite">
          {!estimacion ? (
            <p className="text-2xl font-extrabold">No hay más colectivos hoy</p>
          ) : (
            <>
              <p className="text-3xl font-extrabold">
                {estimacion.minutos === 0
                  ? 'Está llegando'
                  : estimacion.minutos < 60
                    ? `Llega en ~${estimacion.minutos} min`
                    : `Llega ~${formatearHora(estimacion.llegada)}`}
              </p>
              <p className="text-gray-700">
                {estimacion.tipo === 'en_vivo'
                  ? `El de las ${estimacion.horario}, según su último reporte`
                  : `El de las ${estimacion.horario}, estimado por horario`}
                {estimacion.minutos < 60 && ` · ~${formatearHora(estimacion.llegada)}`}
              </p>
            </>
          )}
        </div>
        <Link to="/mi-parada" className={enlace}>
          Cambiar mi parada <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </Tarjeta>

      <div className="text-gray-700">
        <p>Salidas de hoy: {horariosSalida.join(' · ')}</p>
        <p>
          {resumen.cantidadParadas} paradas · ~{duracion(resumen.segundosTotales)} de recorrido
        </p>
        <Link to="/paradas" className={enlace}>
          Ver todas las paradas <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-auto pt-2">
        <BotonMeSubi
          recorridoId={recorrido.id}
          miParadaId={miParadaId}
          // Se puede subir en cualquier parada menos la última (la facu).
          opciones={enOrden(paradas)
            .slice(0, -1)
            .map((p) => ({ valor: p.id, etiqueta: p.nombre, detalle: p.id === miParadaId ? 'tu parada' : undefined }))}
        />
      </div>
    </Pantalla>
  )
}
