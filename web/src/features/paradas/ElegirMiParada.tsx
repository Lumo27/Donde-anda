import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LocateFixed } from 'lucide-react'
import { Boton } from '../../components/Boton'
import { Pantalla } from '../../components/Pantalla'
import { Selector } from '../../components/Selector'
import type { Parada, Tramo } from '../../types/modelos'
import { enOrden } from '../puntualidad/calculos'
import { useRecorrido } from '../../services/datos'
import { paradaMasCercana, textoDistancia } from './cercania'
import { useMiParada } from './useMiParada'

// Elegir "mi parada" (#26, #38). Tres caminos: buscar la más cercana con la ubicación, elegir la zona
// y después la parada, o ver todas. Aparece la primera vez y desde "Cambiar mi parada".
// Privacidad: la ubicación se pide UNA vez, se usa acá en el teléfono y no se guarda ni se envía.

type Vista = { tipo: 'zonas' } | { tipo: 'zona'; tramo: Tramo } | { tipo: 'todas' }

const botonLista =
  'flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-acento'

const enlace =
  'inline-flex min-h-12 items-center gap-1 rounded-lg font-bold text-petroleo underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-acento'

function mensajeDeError(error: GeolocationPositionError | null): string {
  if (error?.code === 1) return 'No diste permiso para usar tu ubicación. Elegí tu zona más abajo.'
  if (error?.code === 3) return 'Tardó demasiado en encontrar tu ubicación. Probá de nuevo o elegí tu zona.'
  return 'No pudimos saber dónde estás. Elegí tu zona más abajo.'
}

export default function ElegirMiParada() {
  const datos = useRecorrido()
  const actual = useMiParada((s) => s.paradaId)
  const elegir = useMiParada((s) => s.elegir)
  const navegar = useNavigate()
  const [seleccion, setSeleccion] = useState<string | null>(actual)
  const [buscando, setBuscando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  // Si ya tenía parada, arranca mostrando su zona.
  const zonaDe = (orden: number) => datos?.recorrido.tramos.find((t) => orden >= t.desde && orden <= t.hasta)
  const [vista, setVista] = useState<Vista>(() => {
    const parada = datos?.paradas.find((p) => p.id === actual)
    const tramo = parada && zonaDe(parada.orden)
    return tramo ? { tipo: 'zona', tramo } : { tipo: 'zonas' }
  })

  if (!datos) return <Pantalla>Cargando…</Pantalla>

  // La última parada es la facu: ahí nadie espera el colectivo de ida.
  const paradas = enOrden(datos.paradas).slice(0, -1)
  const opciones = (lista: Parada[]) =>
    lista.map((p) => ({ valor: p.id, etiqueta: p.nombre, detalle: p.id === actual ? 'tu parada' : undefined }))
  const delTramo = (t: Tramo) => paradas.filter((p) => p.orden >= t.desde && p.orden <= t.hasta)

  const buscarCercana = () => {
    if (!('geolocation' in navigator) || !window.isSecureContext) {
      setAviso('Este navegador no deja usar la ubicación acá. Elegí tu zona más abajo.')
      return
    }
    setBuscando(true)
    setAviso(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBuscando(false)
        const cercana = paradaMasCercana(paradas, { lat: coords.latitude, lng: coords.longitude })
        if (!cercana) {
          setAviso('Todavía no tenemos la ubicación de las paradas. Elegí tu zona más abajo.')
          return
        }
        setSeleccion(cercana.parada.id)
        const tramo = zonaDe(cercana.parada.orden)
        setVista(tramo ? { tipo: 'zona', tramo } : { tipo: 'todas' })
        setAviso(
          `La más cercana es ${cercana.parada.nombre} (${textoDistancia(cercana.metros)}). Revisá que sea la tuya y tocá "Listo".`,
        )
        // Que se vea la parada marcada aunque esté abajo de todo en la lista de su zona.
        setTimeout(() => {
          document
            .querySelector(`input[value="${cercana.parada.id}"]`)
            ?.scrollIntoView?.({ block: 'center' })
        }, 50)
      },
      (error) => {
        setBuscando(false)
        setAviso(mensajeDeError(error))
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    )
  }

  const confirmar = () => {
    if (!seleccion) return
    elegir(seleccion)
    navegar('/')
  }

  return (
    <Pantalla volverA={actual ? '/' : undefined}>
      <div>
        <h1 className="text-2xl font-extrabold">¿Dónde tomás el colectivo?</h1>
        <p className="mt-1 text-gray-700">Te avisamos cuánto falta para que llegue ahí. Se guarda solo en tu teléfono.</p>
      </div>

      <div className="flex flex-col gap-2">
        <Boton variante="secundario" onClick={buscarCercana} disabled={buscando}>
          <LocateFixed aria-hidden className="h-5 w-5" strokeWidth={2.5} />
          {buscando ? 'Buscando dónde estás…' : 'Buscar la parada más cercana'}
        </Boton>
        <p className="text-sm text-gray-700">
          Tu ubicación se usa una sola vez, en tu teléfono. No se guarda ni se envía.
        </p>
        <p role="status" aria-live="polite" className={aviso ? 'rounded-lg bg-gray-100 p-3 font-bold' : ''}>
          {aviso}
        </p>
      </div>

      {vista.tipo === 'zonas' && (
        <section aria-labelledby="titulo-zonas" className="flex flex-col gap-2">
          <h2 id="titulo-zonas" className="text-lg font-bold">
            ¿De qué zona estás más cerca?
          </h2>
          <ul className="flex flex-col gap-2">
            {datos.recorrido.tramos.map((t) => (
              <li key={t.nombre}>
                <button type="button" className={botonLista} onClick={() => setVista({ tipo: 'zona', tramo: t })}>
                  <span>
                    <span className="block font-bold">{t.nombre}</span>
                    <span className="block text-sm text-gray-700">{delTramo(t).length} paradas</span>
                  </span>
                  <ChevronRight aria-hidden className="h-5 w-5 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={enlace} onClick={() => setVista({ tipo: 'todas' })}>
            Ver todas las paradas <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </section>
      )}

      {vista.tipo !== 'zonas' && (
        <section className="flex flex-col gap-3">
          <button type="button" className={enlace} onClick={() => setVista({ tipo: 'zonas' })}>
            <ChevronLeft aria-hidden className="h-4 w-4" /> Elegir otra zona
          </button>
          <Selector
            leyenda={vista.tipo === 'zona' ? vista.tramo.nombre : 'Todas las paradas'}
            opciones={opciones(vista.tipo === 'zona' ? delTramo(vista.tramo) : paradas)}
            valor={seleccion}
            onCambio={setSeleccion}
          />
          <Boton onClick={confirmar} disabled={!seleccion}>
            Listo
          </Boton>
        </section>
      )}
    </Pantalla>
  )
}
