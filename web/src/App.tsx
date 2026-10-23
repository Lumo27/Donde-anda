import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { MapPin } from 'lucide-react'

// Pantallas provisorias. Se reemplazan por las reales en E5:
// "/" → PantallaEstado (#27) · "/paradas" → ListaParadas (#29)
function Provisoria({ titulo, tarjeta }: { titulo: string; tarjeta: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 bg-white p-6 text-tinta">
      <header className="flex items-center gap-2 border-b border-gray-200 pb-4">
        <MapPin aria-hidden className="h-6 w-6 text-acento" strokeWidth={2.5} />
        <h1 className="text-xl font-extrabold">Donde anda?</h1>
      </header>
      <h2 className="text-lg font-bold">{titulo}</h2>
      <p className="text-gray-600">Pantalla provisoria. Se construye en la tarjeta {tarjeta}.</p>
      <nav className="flex gap-4 font-semibold text-petroleo underline">
        <Link to="/">Estado</Link>
        <Link to="/paradas">Paradas</Link>
      </nav>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Provisoria titulo="Estado" tarjeta="#27" />} />
        <Route path="/paradas" element={<Provisoria titulo="Paradas" tarjeta="#29" />} />
      </Routes>
    </BrowserRouter>
  )
}
