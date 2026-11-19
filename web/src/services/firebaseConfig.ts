// Configuración del proyecto de Firebase "donde-anda" (#16).
// No es secreta: viaja dentro de la app que cualquiera descarga. Lo que protege los datos son las reglas
// de seguridad (firestore.rules) y el login con Google. Por eso se commitea, para que el grupo la tenga.
// Dominios donde está publicada la app (Firebase Hosting). Ahí el login usa el MISMO dominio de la app
// (la página /__/auth/handler la sirve Hosting): si no, en el celular el navegador bloquea el login por ser
// "de otro sitio" (#20). En la compu (localhost) se usa el dominio de Firebase de siempre.
const DOMINIOS_HOSTING = ['donde-anda-26cc1.web.app', 'donde-anda-26cc1.firebaseapp.com']
const hostActual = typeof window === 'undefined' ? '' : window.location.hostname

export const firebaseConfig = {
  apiKey: 'AIzaSyDhhhZ_OvhByEmLFp62cyA8oZh86AuhaAI',
  authDomain: DOMINIOS_HOSTING.includes(hostActual) ? hostActual : 'donde-anda-26cc1.firebaseapp.com',
  projectId: 'donde-anda-26cc1',
  storageBucket: 'donde-anda-26cc1.firebasestorage.app',
  messagingSenderId: '70899543464',
  appId: '1:70899543464:web:65406fa2edc9c70ebbc19d',
}
