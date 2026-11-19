import { create } from 'zustand'
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { firebase } from './firebase'
import { DATOS_LOCALES } from './fuente'

// Login con Google (#20). Sirve para que solo reporten estudiantes reales.
// 🔒 Privacidad: de la sesión la app solo sabe SI hay alguien logueado. No lee ni guarda nombre, mail ni foto,
// y los "Me subí" no llevan ningún dato de quién los hizo (ver docs/modelo-datos.md, "Privacidad").

type Sesion = { cargando: boolean; logueado: boolean; error: string | null }

// En modo local no hay login: se entra directo.
const useSesionStore = create<Sesion>(() =>
  DATOS_LOCALES ? { cargando: false, logueado: true, error: null } : { cargando: true, logueado: false, error: null },
)

const MENSAJE_ERROR = 'No pudimos entrar con Google. Revisá tu conexión y probá de nuevo.'

let escuchando = false
function escucharSesion() {
  if (escuchando || DATOS_LOCALES) return
  escuchando = true
  const { auth } = firebase()
  onAuthStateChanged(auth, (usuario) => {
    useSesionStore.setState({ cargando: false, logueado: usuario !== null })
  })
  // Si se vuelve de la página de Google (login por redirección), acá aparece si falló.
  getRedirectResult(auth).catch((error) => {
    console.error('[donde-anda] Login:', error)
    useSesionStore.setState({ error: MENSAJE_ERROR })
  })
}

/** ¿Hay sesión? `cargando` es true mientras Firebase se fija si ya había una abierta. */
export function useSesion(): Sesion {
  escucharSesion()
  return useSesionStore()
}

/**
 * En el celular (y con la app instalada) la ventanita de Google se bloquea o se pierde: ahí se va a la
 * página de Google en la misma pestaña y se vuelve sola. En la compu, ventanita.
 */
function convieneRedireccion(): boolean {
  const instalada = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
  const celular = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1
  return instalada || celular
}

export async function loginConGoogle(): Promise<void> {
  const { auth } = firebase()
  const proveedor = new GoogleAuthProvider()
  proveedor.setCustomParameters({ prompt: 'select_account' })
  useSesionStore.setState({ error: null })
  if (convieneRedireccion()) {
    await signInWithRedirect(auth, proveedor)
    return
  }
  try {
    await signInWithPopup(auth, proveedor)
  } catch (error) {
    const codigo = (error as { code?: string }).code
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
