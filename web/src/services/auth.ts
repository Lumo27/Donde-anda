import { create } from 'zustand'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { firebase } from './firebase'
import { DATOS_LOCALES } from './fuente'

// Login con Google (#20). Sirve para que solo reporten estudiantes reales.
// 🔒 Privacidad: de la sesión la app solo sabe SI hay alguien logueado. No lee ni guarda nombre, mail ni foto,
// y los "Me subí" no llevan ningún dato de quién los hizo (ver docs/modelo-datos.md, "Privacidad").

type Sesion = { cargando: boolean; logueado: boolean }

// En modo local no hay login: se entra directo.
const useSesionStore = create<Sesion>(() => (DATOS_LOCALES ? { cargando: false, logueado: true } : { cargando: true, logueado: false }))

let escuchando = false
function escucharSesion() {
  if (escuchando || DATOS_LOCALES) return
  escuchando = true
  onAuthStateChanged(firebase().auth, (usuario) => {
    useSesionStore.setState({ cargando: false, logueado: usuario !== null })
  })
}

/** ¿Hay sesión? `cargando` es true mientras Firebase se fija si ya había una abierta. */
export function useSesion(): Sesion {
  escucharSesion()
  return useSesionStore()
}

export async function loginConGoogle(): Promise<void> {
  const { auth } = firebase()
  const proveedor = new GoogleAuthProvider()
  proveedor.setCustomParameters({ prompt: 'select_account' })
  try {
    await signInWithPopup(auth, proveedor)
  } catch (error) {
    const codigo = (error as { code?: string }).code
    // Algunos navegadores (ej. iPhone con la app instalada) bloquean la ventanita: se hace en la misma pestaña.
    if (codigo === 'auth/popup-blocked' || codigo === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, proveedor)
      return
    }
    throw error
  }
}

export async function cerrarSesion(): Promise<void> {
  if (DATOS_LOCALES) return
  await signOut(firebase().auth)
}
