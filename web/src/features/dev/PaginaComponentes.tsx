import { useState } from 'react'
import { BadgeEstado } from '../../components/BadgeEstado'
import { Boton } from '../../components/Boton'
import { Selector } from '../../components/Selector'
import { Tarjeta } from '../../components/Tarjeta'

// Página de prueba de los componentes (#25). Solo existe en desarrollo: /componentes

export default function PaginaComponentes() {
  const [parada, setParada] = useState<string | null>('del-viso')
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-4 text-tinta">
      <h1 className="text-2xl font-extrabold">Componentes</h1>

      <Tarjeta titulo="Botones">
        <div className="flex flex-col gap-3">
          <Boton grande>🚌 Me subí</Boton>
          <Boton>Confirmar</Boton>
          <Boton variante="secundario">Cancelar</Boton>
          <Boton disabled>Deshabilitado</Boton>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Estados" destacada>
        <div className="flex flex-wrap gap-2">
          <BadgeEstado estado="a_tiempo" minutosDiferencia={1} />
          <BadgeEstado estado="atrasado" minutosDiferencia={4} />
          <BadgeEstado estado="adelantado" minutosDiferencia={-3} />
        </div>
      </Tarjeta>

      <Selector
        leyenda="¿Dónde tomás el colectivo?"
        opciones={[
          { valor: 'alberti', etiqueta: 'Alberti' },
          { valor: 'del-viso', etiqueta: 'Del Viso', detalle: 'tu parada' },
          { valor: 'parque-industrial', etiqueta: 'Parque Industrial' },
        ]}
        valor={parada}
        onCambio={setParada}
      />
    </main>
  )
}
