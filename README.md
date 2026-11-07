# donde anda 🚌

App para estudiantes que necesitan saber dónde anda el colectivo que los lleva a la facultad: cuándo sale, cuánto tarda, y en qué parada está en este momento — reportado por los propios usuarios en tiempo real.

## La idea

Hoy los estudiantes no tienen forma de saber si el colectivo ya pasó, cuánto falta para que llegue a su parada, o si conviene salir de casa ahora o esperar. La idea es resolver eso con dos partes: una **ruta de referencia** (armada una sola vez, con datos reales) y un **reporte en vivo** que hacen los propios usuarios al subir.

## Cómo funciona

### 1. Armar la ruta 0 (una sola vez)

Alguien viaja en el colectivo desde el inicio del recorrido y va registrando cada parada con su horario. Ese primer viaje registrado es la "ruta 0": la lista de paradas en orden, con el tiempo que tardó en llegar a cada una desde el origen.

Con esos datos se puede calcular:

- **Tiempo promedio por parada**: se suman los tiempos entre paradas y se divide por la cantidad de paradas.
- **Tiempo total estimado del recorrido**: tiempo promedio por parada × cantidad de paradas.

Esto le da a cualquier usuario una estimación de a qué hora sale el colectivo y cuánto tarda en llegar a cada punto de la ruta si nada lo frena en el camino (tráfico, semáforos, etc.).

### 2. Reporte en vivo (uso diario)

Cuando un estudiante se sube al colectivo, aprieta el botón **"Me subí"** e indica en qué lugar/parada se subió. Eso queda registrado con el horario, y les sirve a los demás usuarios para saber en tiempo real por dónde anda el colectivo ese día — no solo la estimación teórica de la ruta 0, sino el dato real del momento.

### 3. ¿Está a tiempo o no?

Los promedios calculados en la ruta 0 son un piso, no una garantía: en la práctica cada parada varía (gente que tarda más en subir, semáforos, tráfico). Por eso a los tiempos promedio se les suma un margen de seguridad antes de usarlos — por ejemplo, si en promedio subir a alguien tarda 10 segundos, se toma una base de 30 segundos por parada en vez del valor "justo".

Con ese promedio ajustado, el horario de salida y la última parada reportada en vivo (vía "Me subí"), se puede proyectar a qué hora debería estar el colectivo en cualquier punto de la ruta. Comparando esa proyección contra el horario actual, la app puede indicar si el colectivo va a tiempo, adelantado o atrasado.

## La app

👉 **https://donde-anda-26cc1.web.app** (se instala desde el navegador: Android → menú ⋮ → "Instalar app"; iPhone → Compartir → "Agregar a inicio").

## Estado del proyecto

La app funciona de punta a punta con el **recorrido real del 510 Ramal 9** (Estación Alberti → Sede Parque Industrial, salidas 06:50, 12:20 y 16:20) pero con **tiempos estimados** hasta medir la ruta 0, y con reportes que quedan en memoria. Ver [`docs/recorrido.md`](docs/recorrido.md). Falta conectarla a Firebase para que los "Me subí" se compartan entre celulares.

- [x] Diagnóstico, criterios de la materia, recorrido, modelo de datos, privacidad y wireframes (`docs/`)
- [x] Cálculos: tiempos de la ruta 0, margen de seguridad, puntualidad y "cuánto falta para mi parada"
- [x] Seguir varios colectivos en viaje a la vez
- [x] Pantallas: elegir mi parada, inicio con el recorrido, botón "Me subí" y lista de paradas
- [x] PWA instalable, accesibilidad (Lighthouse 100) y 83 tests
- [x] Reglas de seguridad de Firestore escritas (`firestore.rules`)
- [x] Firebase: login con Google, recorrido cargado, reportes compartidos en vivo y app publicada (#16, #18–#22, #31)
- [ ] Medir la ruta 0 real (#12)
- [ ] Publicar, probar en celulares y piloto (#31 a #35)

## Cómo levantarla

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm test         # tests
```

Más comandos en [`web/README.md`](web/README.md). Cómo se trabaja (ramas, commits, tablero) en [`CLAUDE.md`](CLAUDE.md) y en la tarjeta **#00** del [Trello](https://trello.com/b/3LpAep4B/donde-anda).

## Por dónde seguir

1. **Crear el proyecto de Firebase (#16).** Es lo que destraba casi todo lo que queda. Los pasos están en la tarjeta.
2. **Conectar la app a Firebase.** Todo pasa por un solo archivo, [`web/src/services/datos.ts`](web/src/services/datos.ts): hoy usa datos locales y adentro dice qué reemplazar en cada función (#18, #21, #22). Las pantallas no se tocan.
3. **Login con Google (#20)** y subir las reglas ya escritas (#19).
4. **En paralelo, en la calle:** medir la ruta 0 real (#12) y reemplazar los tiempos estimados de `docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv`.

## ⚠️ Problema conocido: el login con Google falla en el celular

En la notebook el login anda (probado el 7/11: se hizo un "Me subí" y en Firestore quedó **solo** recorrido, parada y hora ✅). **En el celular la app se cae al tocar "Entrar con Google"** (#20, #32).

Por dónde seguir:
1. **Ver el error:** conectar el celular a la compu y abrir la consola (Android: `chrome://inspect`; iPhone: Safari → Desarrollo). Anotar qué celular, navegador y si la app estaba instalada o abierta en el navegador.
2. **Causa más probable:** el login usa una ventanita (`signInWithPopup`), que muchos navegadores de celular bloquean o cortan. Hoy solo se pasa a `signInWithRedirect` si el error es "popup bloqueado" (`web/src/services/auth.ts`).
3. **Arreglo recomendado por Firebase:** en el celular usar siempre `signInWithRedirect` y que el `authDomain` sea el mismo dominio de la app:
   - En `web/src/services/firebaseConfig.ts`: `authDomain: 'donde-anda-26cc1.web.app'`.
   - En Google Cloud Console → APIs y servicios → Credenciales → el cliente OAuth "Web client (auto created by Google Service)" → agregar `https://donde-anda-26cc1.web.app/__/auth/handler` en "URI de redireccionamiento autorizados".
   - Volver a publicar y probar en Android y en iPhone (instalada y sin instalar).

> La simulación de colectivos que se usó para mostrar el prototipo no está en el código. Quedó guardada en el tag `demo-simulacion` (`git checkout demo-simulacion`) por si hace falta para una presentación.
