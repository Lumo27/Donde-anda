import { useEffect, useState } from 'react'

/**
 * La hora actual. La pantalla se vuelve a dibujar cada `cadaMs` (por defecto 30 s) para que los
 * "faltan X min" se muevan solos. La hora se lee en cada render (no se guarda): así un "Me subí"
 * que acaba de llegar nunca queda "en el futuro" respecto de una hora vieja.
 */
export function useAhora(cadaMs = 30_000): Date {
  const [, setTic] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTic((t) => t + 1), cadaMs)
    return () => clearInterval(id)
  }, [cadaMs])
  return new Date()
}
