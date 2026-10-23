import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boton } from '../../components/Boton'
import { Pantalla } from '../../components/Pantalla'
import { Selector } from '../../components/Selector'
import { enOrden } from '../puntualidad/calculos'
import { useRecorrido } from '../../services/datos'
import { useMiParada } from './useMiParada'

// Elegir "mi parada" (#26). Aparece la primera vez y desde "Cambiar mi parada" en la pantalla de estado.

export default function ElegirMiParada() {
  const datos = useRecorrido()
  const actual = useMiParada((s) => s.paradaId)
  const elegir = useMiParada((s) => s.elegir)
  const [seleccion, setSeleccion] = useState<string | null>(actual)
  const navegar = useNavigate()

  if (!datos) return <Pantalla>Cargando…</Pantalla>

  // La última parada es la facu: ahí nadie espera el colectivo de ida.
  const opciones = enOrden(datos.paradas)
    .slice(0, -1)
    .map((p) => ({ valor: p.id, etiqueta: p.nombre, detalle: p.id === actual ? 'tu parada' : undefined }))

  const confirmar = () => {
    if (!seleccion) return
    elegir(seleccion)
    navegar('/')
  }

  return (
    <Pantalla volverA={actual ? '/' : undefined}>
      <div>
        <h1 className="text-2xl font-extrabold">¿Dónde tomás el colectivo?</h1>
        <p className="mt-1 text-gray-700">Te avisamos cuánto falta para que llegue ahí.</p>
        <p className="text-gray-700">Se guarda solo en tu teléfono.</p>
      </div>
      <Selector
        leyenda="Tu parada"
        leyendaOculta
        opciones={opciones}
        valor={seleccion}
        onCambio={setSeleccion}
      />
      <Boton onClick={confirmar} disabled={!seleccion} className="mt-2">
        Listo
      </Boton>
    </Pantalla>
  )
}
