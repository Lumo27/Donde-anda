import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Pantalla } from './components/Pantalla'
import ElegirMiParada from './features/paradas/ElegirMiParada'
import { useMiParada } from './features/paradas/useMiParada'
import { useRecorrido } from './services/datos'

// Solo en desarrollo: página para ver los componentes sueltos (#25).
const PaginaComponentes = import.meta.env.DEV ? lazy(() => import('./features/dev/PaginaComponentes')) : null

// Pantallas provisorias. Se reemplazan por las reales en E5:
// "/" → PantallaEstado (#27) · "/paradas" → ListaParadas (#29)
function Provisoria({ titulo, tarjeta }: { titulo: string; tarjeta: string }) {
  return (
    <Pantalla>
      <h1 className="text-lg font-bold">{titulo}</h1>
      <p className="text-gray-600">Pantalla provisoria. Se construye en la tarjeta {tarjeta}.</p>
    </Pantalla>
  )
}

/** Si todavía no eligió "mi parada" (o la que tenía ya no existe), lo manda a elegirla primero. */
function RequiereMiParada({ children }: { children: ReactNode }) {
  const datos = useRecorrido()
  const paradaId = useMiParada((s) => s.paradaId)
  if (!datos) return null
  const existe = datos.paradas.some((p) => p.id === paradaId)
  return existe ? children : <Navigate to="/mi-parada" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mi-parada" element={<ElegirMiParada />} />
        <Route
          path="/"
          element={
            <RequiereMiParada>
              <Provisoria titulo="Estado" tarjeta="#27" />
            </RequiereMiParada>
          }
        />
        <Route
          path="/paradas"
          element={
            <RequiereMiParada>
              <Provisoria titulo="Paradas" tarjeta="#29" />
            </RequiereMiParada>
          }
        />
        {PaginaComponentes && (
          <Route
            path="/componentes"
            element={
              <Suspense fallback={null}>
                <PaginaComponentes />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
