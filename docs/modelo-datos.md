# Modelo de datos — donde anda 🚌

Qué se guarda, dónde y por qué. La base es **Cloud Firestore** (Firebase).

Hay tres cosas: **recorridos**, sus **paradas** y los **reportes** "Me subí". **No hay colección de usuarios**: la app no guarda datos personales (ver [Privacidad](#privacidad)).

```
recorridos/{recorridoId}                       ← una línea + sentido (ej. "510-ida")
recorridos/{recorridoId}/paradas/{paradaId}    ← sus paradas, con los tiempos de la ruta 0
reportes/{reporteId}                           ← cada "Me subí": parada + hora, nada más
```

---

## Colecciones

### `recorridos/{recorridoId}`

Un recorrido es una línea en un sentido. El MVP tiene uno solo: `510-ida` (ver [`recorrido.md`](recorrido.md)).

| Campo | Tipo | Ejemplo | Para qué |
|---|---|---|---|
| `nombre` | string | `"510 → Parque Industrial"` | Lo que se muestra en pantalla |
| `linea` | string | `"510"` | Número de línea |
| `sentido` | string | `"ida"` | Ida / vuelta |
| `horariosSalida` | string[] | `["07:00", "08:30"]` | Horas de salida desde la cabecera (`HH:mm`, hora de Argentina) |
| `ficticia` | boolean | `true` | Si es `true`, la app muestra el cartel "Datos de prueba" |

### `recorridos/{recorridoId}/paradas/{paradaId}`

Una parada del recorrido, con los tiempos medidos en la ruta 0. El `paradaId` es un texto corto y fijo (ej. `alberti`, `del-viso`), para que los reportes viejos sigan apuntando bien aunque se recargue la ruta.

| Campo | Tipo | Ejemplo | Para qué |
|---|---|---|---|
| `orden` | number | `4` | Posición en el recorrido (1 = cabecera) |
| `nombre` | string | `"Alberti"` | Lo que se muestra |
| `referencia` | string | `"Alberti y Ruta 8"` | Para ubicarla (opcional) |
| `segundosDesdeAnterior` | number | `310` | Tiempo de viaje desde que el colectivo **salió** de la parada anterior hasta que **llegó** a esta. En la cabecera es `0` |
| `segundosDetenido` | number | `50` | Cuánto se quedó parado en esta parada |

**Cómo salen estos números del CSV de la ruta 0** (`docs/ruta0/*.csv`):
- `segundosDesdeAnterior` = `hora_llegada` de esta parada − `hora_salida` de la anterior.
- `segundosDetenido` = `hora_salida` − `hora_llegada` de esta parada.

Se guardan los valores **medidos**, sin margen. El margen de seguridad se aplica en la app, al calcular (`web/src/features/puntualidad/config.ts`). Así se puede ajustar sin recargar datos.

### `reportes/{reporteId}`

Cada vez que alguien toca "Me subí". Es **anónimo**: tiene exactamente estos tres campos y ninguno más.

| Campo | Tipo | Ejemplo | Para qué |
|---|---|---|---|
| `recorridoId` | string | `"510-ida"` | En qué recorrido |
| `paradaId` | string | `"del-viso"` | En qué parada se subió |
| `creadoEn` | timestamp | hora del servidor | Cuándo (lo pone Firebase, no el teléfono, para que no se pueda falsear) |

**No tiene:** nombre, mail, uid, foto, ubicación, modelo de teléfono ni nada que identifique a la persona.

---

## Qué se guarda en el teléfono (y nunca sale de ahí)

| Dato | Dónde | Para qué |
|---|---|---|
| Mi parada | `localStorage` (Zustand `persist`) | Calcular "cuánto falta para que llegue a tu parada" |
| Hora de mi último reporte | `localStorage` | No dejar reportar dos veces en 10 minutos |

---

## Tipos en el código

Se crean en `web/src/types/modelos.ts` (tarjeta #15 en adelante):

```ts
export interface Recorrido {
  id: string
  nombre: string
  linea: string
  sentido: 'ida' | 'vuelta'
  horariosSalida: string[]   // "HH:mm"
  ficticia: boolean
}

export interface Parada {
  id: string
  orden: number
  nombre: string
  referencia?: string
  segundosDesdeAnterior: number
  segundosDetenido: number
}

export interface Reporte {
  id: string
  recorridoId: string
  paradaId: string
  creadoEn: Date
}
```

---

## Privacidad

**Decisión (tarjeta #11):** para usar la app **hay que loguearse con Google**, pero el reporte "Me subí" **no dice quién lo hizo**. Es como un Google Form que pide iniciar sesión pero no registra el mail.

### Por qué hay login
- Para que solo reporten estudiantes reales y sea más difícil llenar la app de reportes falsos.
- Es un toque ("Entrar con Google"), sin crear contraseña.

### Por qué el reporte es anónimo
- Es lo que prometimos en los flyers y en la encuesta ("solo se registra la parada y la hora").
- Es una condición para que la gente lo use: los que no tocarían el botón hablan de **desconfianza** (ver [`diagnostico.md`](diagnostico.md), punto 1.7).
- La app muestra "Alguien se subió en Del Viso hace 3 min", **nunca** "Juan Pérez se subió en…".

### Cómo se garantiza

| Capa | Qué hace |
|---|---|
| **Modelo** | El reporte tiene solo `recorridoId`, `paradaId` y `creadoEn`. No existe colección `usuarios` |
| **Código** | `crearReporte()` solo manda esos 3 campos (#21). Nunca se copia `displayName`, `email` ni `photoURL` del usuario a Firestore ni a `localStorage`; si hace falta mostrarlos, se leen en el momento desde `auth.currentUser` |
| **Servidor** (`firestore.rules`, #19) | Rechaza cualquier reporte con un campo de más (`keys().hasOnly([...])`), aunque alguien modifique la app. Los reportes no se pueden editar ni borrar. Cualquier otra colección está bloqueada |
| **Firebase Auth** | Es el único lugar donde existe el mail, porque lo necesita para que funcione el login con Google. La app no lo lee ni lo copia |
| **Pantalla de login** | Explica: "Tu nombre y mail no se guardan en los reportes. Solo se registra la parada y la hora" |

### Anti-spam
- **En el MVP:** la app no deja reportar dos veces en 10 minutos (control en el teléfono) y hace falta estar logueado para escribir.
- **Si en el piloto hay abuso:** se agrega un control del lado del servidor con una Cloud Function. Ese control limitaría por cuenta sin guardar el uid en el reporte.

### Reglas de Firestore (esquema para #19)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /recorridos/{recorridoId} {
      allow read: if request.auth != null;
      allow write: if false;
      match /paradas/{paradaId} {
        allow read: if request.auth != null;
        allow write: if false;
      }
    }
    match /reportes/{reporteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.keys().hasOnly(['recorridoId', 'paradaId', 'creadoEn'])
        && request.resource.data.recorridoId is string
        && request.resource.data.paradaId is string
        && request.resource.data.creadoEn == request.time;
      allow update, delete: if false;
    }
    // Todo lo demás (ej. "usuarios") queda bloqueado por defecto.
  }
}
```
