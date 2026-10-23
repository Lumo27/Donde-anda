# CLAUDE.md — donde anda

Contexto técnico del proyecto para trabajar en este repo. El "por qué" del producto (problema, solución, alcance del MVP) está en `PLANNING.md`; la explicación funcional en `README.md`. Esto es solo lo técnico.

## Qué es

PWA gratuita para que estudiantes sepan dónde anda el colectivo que los lleva a la facultad: ruta de referencia ("ruta 0") con tiempos promedio + margen de seguridad, y reportes en vivo de los propios usuarios (botón "Me subí") para saber el estado real (a tiempo / adelantado / atrasado), y cuánto falta para que llegue a la parada de cada usuario. Instalable desde el navegador (Android y iPhone), sin pasar por ninguna store.

Es el proyecto del Grupo 3 (Comisión 4) del Taller de formulación y desarrollo de proyectos sociocomunitarios. La materia pone el foco en la comunidad y el problema, en a quiénes ayuda y a quiénes excluye la solución, en qué recursos necesita, y evalúa 4 criterios: usabilidad, accesibilidad, escalabilidad y sostenibilidad. Comunidad: estudiantes que usan la línea 510 para llegar a la sede Parque Industrial.

El backlog está en el Trello ["Donde anda?"](https://trello.com/b/3LpAep4B/donde-anda). Las tarjetas están numeradas (#NN) y agrupadas por etapa (E0–E7), y cada una indica en qué carpeta y archivo se hace. Las etapas y el calendario están en `PLANNING.md`.

Reutiliza el mismo stack que Splitwaisito (trabajo integrador de Aplicaciones Móviles) para no reinventar setup.

## Stack técnico

- Frontend: React 18 + Vite + TypeScript (modo strict)
- Estilos: Tailwind CSS
- Estado/cache local: Zustand + middleware `persist`
- Ruteo: React Router v6
- Fechas: date-fns · Íconos: lucide-react
- PWA: vite-plugin-pwa (manifest + service worker con Workbox)
- Backend/datos: Firebase — Authentication (Google), Firestore, Hosting, Cloud Functions (solo si hace falta)

## Privacidad (regla dura)

Para usar la app hay que loguearse con Google. Sirve para que solo reporten estudiantes reales. Pero el reporte "Me subí" es anónimo: guarda **solo** `recorridoId`, `paradaId` y `creadoEn` (hora del servidor). Ni nombre, ni mail, ni uid, ni ubicación. Es como un Google Form que pide cuenta pero no registra el mail.
- No hay entidad ni colección Usuario en Firestore. El mail queda solo dentro de Firebase Auth.
- No copiar `displayName`, `email` ni `photoURL` a Firestore ni a `localStorage`. Si hace falta mostrarlos, se leen en el momento de `auth.currentUser`.
- `firestore.rules`: todo requiere `request.auth != null`. En `reportes` se rechaza cualquier campo extra (`keys().hasOnly(...)`) y no se puede editar ni borrar. Cualquier otra colección está denegada.
- "Mi parada" se guarda en el teléfono (Zustand `persist`) y nunca se sube.
- Anti-spam en el MVP: el cliente no deja reportar dos veces en 10 minutos.

Diferencias respecto a Splitwaisito (no se usan en este proyecto, al menos no en el MVP):
- Sin Storage ni cámara — no hay fotos que subir.
- Sin `navigator.geolocation` / GPS continuo — el alcance del MVP es reportes puntuales por parada ("Me subí"), no tracking en vivo. Si más adelante se suma el mapa en vivo (backlog futuro), ahí se evalúa geolocalización.
- `recharts` solo si termina haciendo falta algún gráfico (por ejemplo, comparar puntualidad histórica); no asumir que se necesita desde el arranque.

## Estructura del repo

```
/web            → frontend (Vite + React + TS)
  /src
    /components → sistema de diseño base (Botón, Tarjeta, Badge de estado, Input) + reutilizables
    /features   → una carpeta por feature: auth (PantallaLogin), estado, paradas, reportes (botón "Me subí"), puntualidad
    /services   → integración con Firebase (firebase.ts, auth.ts, firestore.ts)
    /types      → modelos.ts (Recorrido, Parada, Reporte)
/functions      → Cloud Functions (si hace falta calcular puntualidad o agregar reportes del lado server)
/scripts        → scripts sueltos (ej. cargar-ruta0.ts)
/docs           → documentos no-código: diagnóstico, criterios, recorrido, ruta0/*.csv, wireframes, piloto
firestore.rules, firebase.json
```

Modelo Firestore: `recorridos/{id}` (nombre, linea, horariosSalida) → `paradas/{id}` (orden, nombre, segundosDesdeAnterior, segundosDetenido); `reportes/{id}` (recorridoId, paradaId, creadoEn). Los cálculos (`features/puntualidad/calculos.ts`, `puntualidad.ts`, `eta.ts`) son funciones puras con tests en Vitest. Los márgenes van en `features/puntualidad/config.ts`.

## Conceptos de dominio (ver PLANNING.md / README.md para el detalle completo)

- **Ruta 0**: primer recorrido registrado (paradas en orden + horario real de cada una + cuánto se detiene en cada una). Base para calcular el tiempo total, la cantidad de paradas, el tiempo de cada tramo y la hora estimada en cada parada. Proyectar con el tiempo acumulado real de cada parada, no con "promedio × cantidad".
- **Margen de seguridad**: los promedios de la ruta 0 se ajustan al alza antes de usarlos (ej. si subir tarda 10s en promedio, se toma una base de 30s) para no subestimar tiempos reales.
- **Reporte en vivo**: cada vez que un usuario aprieta "Me subí" e indica su parada, queda un registro anónimo (parada + hora) que sirve para proyectar dónde debería estar el colectivo ahora.
- **Mi parada**: la parada que el usuario configura. La app calcula cuánto falta desde la última parada reportada hasta esa.
- **Puntualidad**: comparación entre la proyección (ruta 0 + margen + horario actual) y el último reporte en vivo, para mostrar si el colectivo va a tiempo, adelantado o atrasado.

## MVP (alcance actual, ver PLANNING.md)

Una sola línea/recorrido. Sin multi-línea, sin costo del viaje, sin notificaciones push, sin mapa en vivo con GPS continuo — todo eso es backlog futuro, no lo asumas al codear el MVP.
