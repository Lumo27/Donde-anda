import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'
import { firebaseConfig } from './firebaseConfig'

// Conexión con Firebase (#16). La usan services/auth.ts y services/datosFirestore.ts; las pantallas no la tocan.
// Se inicializa recién la primera vez que se pide, así los tests y el modo local no tocan Firebase.

let conexion: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null

export function firebase() {
  if (!conexion) {
    const app = initializeApp(firebaseConfig)
    conexion = {
      app,
      auth: getAuth(app),
      // Caché local: con poca señal la app sigue mostrando el recorrido y los últimos reportes que ya tenía.
      db: initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      }),
    }
  }
  return conexion
}
