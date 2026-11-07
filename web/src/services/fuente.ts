// ¿De dónde salen los datos? Firestore en la app real; local (docs/ruta0/ + memoria, sin login) en los tests
// y si se arranca con VITE_DATOS=local (ej. `VITE_DATOS=local npm run dev`, para trabajar sin internet).
export const DATOS_LOCALES = import.meta.env.MODE === 'test' || import.meta.env.VITE_DATOS === 'local'
