import type { EstadoPuntualidad } from '../features/puntualidad/puntualidad'

/** "A tiempo" / "Atrasado 4 min" / "Adelantado 3 min". También lo usa el lector de pantalla. */
export function textoEstado(estado: EstadoPuntualidad, minutosDiferencia: number): string {
  if (estado === 'a_tiempo') return 'A tiempo'
  return `${estado === 'atrasado' ? 'Atrasado' : 'Adelantado'} ${Math.abs(minutosDiferencia)} min`
}
