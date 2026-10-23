import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { BadgeEstado } from '../../components/BadgeEstado'
import { Pantalla } from '../../components/Pantalla'
import { Tarjeta } from '../../components/Tarjeta'
import { useRecorrido, useUltimoReporte } from '../../services/datos'
import { useMiParada } from '../paradas/useMiParada'
import { BotonMeSubi } from '../reportes/BotonMeSubi'
import { aplicarMargen, enOrden, resumenRecorrido } from '../puntualidad/calculos'
import { estimarLlegadaAMiParada } from '../puntualidad/eta'
import { proyectarColectivo } from '../puntualidad/proyeccion'
import { calcularEstado } from '../puntualidad/puntualidad'
import { duracion, formatearHora, haceCuanto } from './formato'
import { useAhora } from './useAhora'

// Pantalla principal (#27): responde "¿dónde anda y cuánto le falta?" sin navegar.

const enlace =
  'inline-flex min-h-12 items-center gap-1 rounded-lg font-bold text-petroleo underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-acento'

export default function PantallaEstado() {
  const datos = useRecorrido()
  const ultimoReporte = useUltimoReporte(datos?.recorrido.id ?? '')
  const miParadaId = useMiParada((s) => s.paradaId)
  const ahora = useAhora()

  if (!datos || !miParadaId) return <Pantalla>Cargando…</Pantalla>
  const { recorrido, paradas } = datos
  const nombreDe = (id: string) => paradas.find((p) => p.id === id)?.nombre ?? id

  const proyeccion = proyectarColectivo({ ultimoReporte, paradas, horariosSalida: recorrido.horariosSalida, ahora })
  const enVivo = proyeccion.fuente === 'en_vivo' && ultimoReporte
  const estado = enVivo ? calcularEstado(ultimoReporte, recorrido.horariosSalida, paradas) : null
  const estimacion = estimarLlegadaAMiParada({
    ultimoReporte,
    miParadaId,
    paradas,
    horariosSalida: recorrido.horariosSalida,
    ahora,
  })
  const resumen = resumenRecorrido(aplicarMargen(paradas))
  const llegadaFacu = proyeccion.fuente === 'sin_servicio' ? null : proyeccion.pasos[proyeccion.pasos.length - 1].llegada

  return (
    <Pantalla>
      <Tarjeta titulo="Último reporte">
        {enVivo ? (
          <>
            <p className="text-lg font-bold">Alguien se subió en {nombreDe(ultimoReporte.paradaId)}</p>
            <p className="text-gray-700">
              {haceCuanto(ultimoReporte.creadoEn, ahora)} · {formatearHora(ultimoReporte.creadoEn)}
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
          {!estimacion || estimacion.tipo === 'sin_servicio' ? (
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
                  ? 'Según el último reporte'
                  : `Estimado por horario (sale ${formatearHora(estimacion.salida)})`}
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
        {proyeccion.fuente !== 'sin_servicio' && proyeccion.salida && llegadaFacu && (
          <p>
            Salida {formatearHora(proyeccion.salida)} · Llegada a la facu ~{formatearHora(llegadaFacu)}
          </p>
        )}
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
