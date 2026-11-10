import { Pantalla } from '../../components/Pantalla'
import { useRecorrido, useReportes } from '../../services/datos'
import { textoPosicion } from '../estado/textoPosicion'
import { useAhora } from '../estado/useAhora'
import { enOrden, horariosDelDia } from '../puntualidad/calculos'
import { colectivosEnRecorrido } from '../puntualidad/colectivos'
import { LineaDeParadas } from './LineaDeParadas'
import { useMiParada } from './useMiParada'

// Listado de TODAS las paradas (#29): para cada una, cuándo pasa el PRÓXIMO colectivo. Los colectivos en
// viaje se ven bajando por la línea (#36, #37). El inicio muestra solo una parte (#40).

export default function ListaParadas() {
  const datos = useRecorrido()
  const reportes = useReportes(datos?.recorrido.id ?? '')
  const miParadaId = useMiParada((s) => s.paradaId)
  const ahora = useAhora()

  if (!datos) return <Pantalla volverA="/">Cargando…</Pantalla>
  const { recorrido } = datos
  const paradas = enOrden(datos.paradas)
  const horariosSalida = horariosDelDia(recorrido, ahora)
  const colectivos = colectivosEnRecorrido({ reportes, paradas, horariosSalida, ahora })

  return (
    <Pantalla volverA="/">
      <div>
        <h1 className="text-2xl font-extrabold">Paradas</h1>
        <p className="font-bold text-gray-700">{recorrido.nombre}</p>
        {colectivos.length === 0 ? (
          <p className="mt-2 font-bold">{horariosSalida.length > 0 ? 'No hay más colectivos hoy' : 'Hoy no hay servicio'}</p>
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

      <LineaDeParadas
        paradas={paradas}
        colectivos={colectivos}
        miParadaId={miParadaId}
        items={paradas.map((_, indice) => ({ tipo: 'parada' as const, indice }))}
      />
      <p className="text-sm text-gray-700">~ = hora estimada del próximo colectivo en pasar.</p>
    </Pantalla>
  )
}
