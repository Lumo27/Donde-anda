import { useCallback, useEffect, useState } from 'react'
import { Bus } from 'lucide-react'
import { Boton } from '../../components/Boton'
import type { Opcion } from '../../components/Selector'
import { crearReporte } from '../../services/datos'
import { ahora as horaActual } from '../../services/reloj'
import { useAhora } from '../estado/useAhora'
import { guardarUltimoReporteLocal, leerUltimoReporteLocal, minutosDeBloqueo } from './bloqueo'
import { ModalElegirParada } from './ModalElegirParada'

// Botón "Me subí" (#28): tocar → elegir parada (viene la mía) → confirmar. 2 toques.

type Props = {
  recorridoId: string
  opciones: Opcion[]
  miParadaId: string | null
}

export function BotonMeSubi({ recorridoId, opciones, miParadaId }: Props) {
  const ahora = useAhora()
  const [ultimoReporte, setUltimoReporte] = useState<Date | null>(leerUltimoReporteLocal)
  const [abierto, setAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const bloqueo = minutosDeBloqueo(ultimoReporte, ahora)

  const cerrar = useCallback(() => setAbierto(false), [])

  // El "¡Gracias!" se va solo a los 6 segundos.
  useEffect(() => {
    if (!mensaje) return
    const id = setTimeout(() => setMensaje(null), 6000)
    return () => clearTimeout(id)
  }, [mensaje])

  const confirmar = async (paradaId: string) => {
    setEnviando(true)
    try {
      await crearReporte(recorridoId, paradaId)
      const momento = horaActual()
      guardarUltimoReporteLocal(momento)
      setUltimoReporte(momento)
      setAbierto(false)
      setMensaje('¡Gracias! Solo guardamos la parada y la hora.')
    } catch {
      setMensaje('No se pudo enviar. Revisá la conexión y probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p role="status" className="min-h-6 text-center font-bold text-green-800">
        {mensaje}
      </p>
      <Boton grande onClick={() => setAbierto(true)} disabled={bloqueo > 0}>
        <Bus aria-hidden className="h-7 w-7" strokeWidth={2.5} />
        Me subí
      </Boton>
      {bloqueo > 0 && (
        <p className="text-center text-sm text-gray-700">
          Ya avisaste. Podés volver a reportar en {bloqueo} min.
        </p>
      )}
      {abierto && (
        <ModalElegirParada
          opciones={opciones}
          paradaInicial={miParadaId}
          enviando={enviando}
          onConfirmar={confirmar}
          onCancelar={cerrar}
        />
      )}
    </div>
  )
}
