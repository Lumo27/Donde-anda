import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PantallaEstado from './features/estado/PantallaEstado'
import ElegirMiParada from './features/paradas/ElegirMiParada'
import ListaParadas from './features/paradas/ListaParadas'
import { useMiParada } from './features/paradas/useMiParada'
import { useRecorrido } from './services/datos'

// Solo en desarrollo: página para ver los componentes sueltos (#25).
const PaginaComponentes = import.meta.env.DEV ? lazy(() => import('./features/dev/PaginaComponentes')) : null

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
    </BrowserRouter>
  )
}
