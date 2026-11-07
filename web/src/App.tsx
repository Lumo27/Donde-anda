import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Pantalla } from './components/Pantalla'
import PantallaLogin from './features/auth/PantallaLogin'
import PantallaEstado from './features/estado/PantallaEstado'
import ElegirMiParada from './features/paradas/ElegirMiParada'
import ListaParadas from './features/paradas/ListaParadas'
import { useMiParada } from './features/paradas/useMiParada'
import { useSesion } from './services/auth'
import { useErrorDeDatos, useRecorrido } from './services/datos'

// Solo en desarrollo: página para ver los componentes sueltos (#25).
const PaginaComponentes = import.meta.env.DEV ? lazy(() => import('./features/dev/PaginaComponentes')) : null

/** Sin sesión, la pantalla de entrada (#20). Mientras Firebase se fija si ya había sesión, un aviso. */
function RequiereSesion({ children }: { children: ReactNode }) {
  const { cargando, logueado } = useSesion()
  if (cargando) return <p className="p-6 text-center text-gray-700">Cargando…</p>
  return logueado ? children : <PantallaLogin />
}

/** Mientras llega el recorrido, un aviso; si no se pudo conectar, el motivo (nunca una pantalla en blanco). */
function RequiereRecorrido({ children }: { children: ReactNode }) {
  const datos = useRecorrido()
  const error = useErrorDeDatos()
  if (datos) return children
  return (
    <Pantalla>
      <p role="status" className="text-center text-gray-700">
        {error ?? 'Cargando el recorrido…'}
      </p>
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
      <RequiereSesion>
        <RequiereRecorrido>
          <Routes>
            <Route path="/mi-parada" element={<ElegirMiParada />} />
            <Route
              path="/"
              element={
                <RequiereMiParada>
                  <PantallaEstado />
                </RequiereMiParada>
              }
            />
            <Route
              path="/paradas"
              element={
                <RequiereMiParada>
                  <ListaParadas />
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
        </RequiereRecorrido>
      </RequiereSesion>
    </BrowserRouter>
  )
}
