import type { Parada } from '../../types/modelos'
import type { Posicion } from '../puntualidad/posicion'
import { formatearHora } from './formato'

/** "Va entre Alberti y Del Viso", "Sale de la cabecera a las 07:00"… (#36). También lo lee el lector de pantalla. */
export function textoPosicion(paradas: Parada[], posicion: Posicion): string {
  switch (posicion.tipo) {
    case 'en_viaje': {
      const desde = paradas[posicion.desde]?.nombre
      const hasta = paradas[posicion.desde + 1]?.nombre
      return posicion.fraccion < 0.15 ? `Saliendo de ${desde}` : `Va entre ${desde} y ${hasta}`
    }
    case 'por_salir':
      return `Sale de la cabecera a las ${formatearHora(posicion.salida)}`
    case 'llego':
      return 'Llegó a la facu'
    case 'sin_servicio':
      return 'No hay colectivos en viaje'
  }
}
