import { useState } from 'react'
import { Lock, MapPin } from 'lucide-react'
import { Boton } from '../../components/Boton'
import { loginConGoogle } from '../../services/auth'

// Pantalla de entrada (#20, wireframe 00). Un solo botón, sin formularios ni contraseña.

export default function PantallaLogin() {
  const [entrando, setEntrando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const entrar = async () => {
    setEntrando(true)
    setError(null)
    try {
      await loginConGoogle()
    } catch (e) {
      const codigo = (e as { code?: string }).code
      setError(
        codigo === 'auth/popup-closed-by-user' || codigo === 'auth/cancelled-popup-request'
          ? null
          : 'No pudimos entrar con Google. Revisá tu conexión y probá de nuevo.',
      )
    } finally {
      setEntrando(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-white p-6 text-center text-tinta">
      <MapPin aria-hidden className="h-14 w-14 text-acento" strokeWidth={2.5} />
      <div>
        <h1 className="text-3xl font-extrabold">Donde anda?</h1>
        <p className="mt-2 text-lg text-gray-700">Sabé por dónde viene el 510 y cuánto falta para tu parada.</p>
      </div>
      <Boton grande onClick={entrar} disabled={entrando}>
        {entrando ? 'Entrando…' : 'Entrar con Google'}
      </Boton>
      <p role="alert" className="min-h-6 font-bold text-red-800">
        {error}
      </p>
      <p className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-gray-800">
        <Lock aria-hidden className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2.5} />
        <span>
          <strong>Tu nombre y mail no se guardan en los reportes.</strong> Solo se registra la parada y la hora.
        </span>
      </p>
    </main>
  )
}
