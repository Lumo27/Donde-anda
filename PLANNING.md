# Planificación — donde anda 🚌

## Problema

Los estudiantes que dependen de un colectivo para llegar a la facultad no tienen forma confiable de saber cuándo va a pasar cerca de su parada. Hoy la única información circula por el boca a boca o grupos de WhatsApp: no está centralizada, depende de que alguien avise a tiempo, y no dice si el colectivo va con demora.

## Solución

Una app colaborativa: los propios estudiantes que viajan en el colectivo reportan, de forma anónima, en qué parada se subieron (botón "Me subí" + parada). Ese dato en vivo se compara contra una ruta de referencia ("ruta 0") armada una sola vez con tiempos reales por parada, más un margen de seguridad sobre esos promedios. Con eso, cualquier usuario puede ver a qué hora sale el colectivo, cuánto tarda en llegar a su parada, y si va a tiempo, adelantado o atrasado.

## Idea de negocio

Para el MVP no hay monetización: es una herramienta gratuita, de uso comunitario, para resolver un problema puntual del día a día de los estudiantes de una facultad/línea específica. El valor está en la utilidad real y en validar que el modelo de estimación (ruta 0 + reportes en vivo) funciona con usuarios reales.

Caminos posibles a futuro, sin comprometerse ahora: extender a más líneas/recorridos y ofrecerlo a otras facultades o centros de estudiantes; sumar el cálculo de cuánto se paga el viaje según la parada; explorar funciones premium (alertas personalizadas) si la base de usuarios crece.

## Alcance del MVP

**Adentro:**
- Una sola línea/recorrido de colectivo (el que se usa para llegar a la facultad).
- Ruta 0: paradas en orden + horarios reales, tiempo promedio por parada y tiempo total estimado, con margen de seguridad aplicado.
- Botón "Me subí": el usuario reporta en qué parada se subió. Se guarda solo la parada y la hora, sin ningún dato personal.
- "Mi parada": cada usuario configura su parada (queda guardada solo en su teléfono) y ve cuánto falta para que el colectivo llegue ahí.
- Vista de estado actual: última parada reportada, horario estimado de paso por cada parada, y si el colectivo va a tiempo, adelantado o atrasado.
- Login con Google, para que solo reporten estudiantes reales. El reporte no dice quién lo hizo, igual que un Google Form que pide cuenta pero no registra el mail. Las reglas de Firestore impiden guardar en un reporte cualquier campo que no sea parada y hora, y no existe ninguna colección de usuarios.
- App instalable (PWA) en Android y iPhone.

**Afuera del MVP (backlog futuro):**
- Más de una línea o recorrido.
- Cálculo de cuánto se paga el viaje según la parada.
- Notificaciones push.
- Mapa en vivo con geolocalización continua (el MVP usa reportes puntuales por parada, no tracking GPS continuo).

## Stack técnico

Se reutiliza el mismo stack de Splitwaisito (trabajo integrador de Aplicaciones Móviles): React 18 + Vite + TypeScript, Tailwind, Zustand, React Router, Firebase (Auth con Google + Firestore + Hosting), como PWA instalable sin stores. Detalle completo y convenciones en `CLAUDE.md`.

## Planificación por etapas

El proyecto se divide en 8 etapas (E0 a E7) en 7 semanas, del 26/10 al 11/12/2026. Cada etapa cierra un **viernes** y tiene un resultado concreto que se puede mostrar. Las tarjetas de Trello llevan la etapa en el nombre (`#12 · E2 · …`) y su fecha de entrega.

| Etapa | Semana | Cierra | Tarjetas | Resultado al terminar |
|---|---|---|---|---|
| ✔ **Trabajo de campo** | hasta 9/10 | — | #01–#04 | Stack elegido, encuesta (22 respuestas), flyers, plan de acción |
| **E0 · Diagnóstico** | 26/10 – 30/10 | vie 30/10 | #05, #06, #07 | `docs/diagnostico.md` (resultados + comunidad, a quiénes ayuda y a quiénes excluye, recursos) y `docs/criterios.md` (usabilidad, accesibilidad, escalabilidad, sostenibilidad) |
| **E1 · Definición** | 26/10 – 30/10 | vie 30/10 | #08, #09, #10, #11 | Recorrido de la 510 escrito, modelo de datos, wireframes y decisión de privacidad |
| **E2 · Ruta 0 en la calle** | 2/11 – 6/11 | vie 6/11 | #12 | Al menos 1 viaje completo medido en `docs/ruta0/*.csv` |
| **E3 · Base técnica** | 2/11 – 6/11 | vie 6/11 | #15, #16, #17, #19, #20 | App vacía que se instala, conectada a Firebase, con login con Google y reglas de seguridad |
| **E4 · Datos y cálculos** | 9/11 – 13/11 | vie 13/11 | #13, #14, #18, #21, #22, #23, #24 | Ruta 0 cargada; "Me subí" se guarda y se escucha en vivo; puntualidad y "cuánto falta" con tests |
| **E5 · Pantallas** | 16/11 – 20/11 | vie 20/11 | #25, #26, #27, #28, #29 | App usable de punta a punta en el navegador |
| **E6 · Publicación y pruebas** | 23/11 – 27/11 | vie 27/11 | #30, #31, #32 | App publicada con URL, revisión de accesibilidad hecha y probada en Android + iPhone |
| **E7 · Piloto** | 30/11 – 11/12 | #33 vie 27/11 · #34 vie 4/12 · #35 vie 11/12 | #33, #34, #35 | Piloto con 8–15 estudiantes, resultados en `docs/piloto/` y márgenes ajustados |
| Después del piloto | — | — | F1–F5 | Decidir qué ideas futuras siguen, según lo aprendido |

**Cómo se trabaja:**
- **E0 y E1 van juntas**, porque son documentos y decisiones y se pueden repartir.
- **E2 y E3 van en paralelo:** mientras alguien sale a viajar y medir la ruta 0, otro arma la base técnica. E4 necesita las dos terminadas.
- **Primero manda la etapa** y, dentro de ella, el número de tarjeta. Antes de arrancar una tarjeta, todo lo de "Depende de" tiene que estar en Done.
- **Cada tarjeta pasa por Review:** la revisa otro integrante contra el "Está terminada cuando" antes de ir a Done.
- **Si una etapa se atrasa**, se corren las siguientes. No se saltea la revisión ni se arranca algo con dependencias abiertas.
- **Puntos de control para la materia:** al cierre de E1 (diagnóstico + definición), de E5 (demo funcionando) y de E7 (resultados del piloto).

El detalle de cada tarea está en el board de Trello ["Donde anda?"](https://trello.com/b/3LpAep4B/donde-anda): columnas To Do / In Progress / Review / Done, la tarjeta #00 con las reglas del tablero, las tarjetas #01–#35 y las ideas futuras F1–F5.
