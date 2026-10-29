import { useEffect, useState } from 'react'
import { ahora } from '../../services/reloj'

/**
 * La hora actual (del reloj de la app, que en la demo puede ir acelerado). La pantalla se vuelve a dibujar
 * cada `cadaMs` (por defecto 1 s) para que los "faltan X min" y el colectivo en la ruta se muevan solos.
 * La hora se lee en cada render (no se guarda): así un "Me subí" que acaba de llegar nunca queda
 * "en el futuro" respecto de una hora vieja.
 */
export function useAhora(cadaMs = 1000): Date {
  const [, setTic] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTic((t) => t + 1), cadaMs)
    return () => clearInterval(id)
  }, [cadaMs])
  return ahora()
}
