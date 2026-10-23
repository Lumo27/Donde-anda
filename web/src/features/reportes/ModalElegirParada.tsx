import { useEffect, useId, useRef, useState } from 'react'
import { Boton } from '../../components/Boton'
import { Selector, type Opcion } from '../../components/Selector'

// Ventana que sube desde abajo para elegir en qué parada se subió (#28).

type Props = {
  opciones: Opcion[]
  paradaInicial: string | null
  enviando: boolean
  onConfirmar: (paradaId: string) => void
  onCancelar: () => void
}

export function ModalElegirParada({ opciones, paradaInicial, enviando, onConfirmar, onCancelar }: Props) {
  const idTitulo = useId()
  const [seleccion, setSeleccion] = useState<string | null>(paradaInicial)
  const refConfirmar = useRef<HTMLButtonElement>(null)

  // Accesibilidad: el foco entra a la ventana y Escape la cierra.
  useEffect(() => {
    refConfirmar.current?.focus()
    const alApretar = (e: KeyboardEvent) => e.key === 'Escape' && onCancelar()
    document.addEventListener('keydown', alApretar)
    return () => document.removeEventListener('keydown', alApretar)
  }, [onCancelar])

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40" onClick={onCancelar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-3xl bg-white p-5 text-tinta"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 id={idTitulo} className="text-xl font-extrabold">
            ¿En qué parada te subiste?
          </h2>
          <p className="text-gray-700">Solo se guarda la parada y la hora.</p>
        </div>
        <Selector leyenda="Parada" leyendaOculta opciones={opciones} valor={seleccion} onCambio={setSeleccion} />
        <Boton ref={refConfirmar} onClick={() => seleccion && onConfirmar(seleccion)} disabled={!seleccion || enviando}>
          {enviando ? 'Enviando…' : 'Confirmar'}
        </Boton>
        <Boton variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
      </div>
    </div>
  )
}
