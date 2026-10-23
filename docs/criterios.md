# Criterios — donde anda 🚌

La cátedra evalúa cuatro criterios. Acá bajamos cada uno a **decisiones concretas de la app** y a una **forma de medirlo**. Las mediciones se hacen en la tarjeta #30 (revisión de accesibilidad y usabilidad) y en el piloto (#34). Los resultados se cargan al final de este archivo.

Los datos de la encuesta que se citan están en [`diagnostico.md`](diagnostico.md).

---

## 1. Usabilidad

> Que cualquier estudiante la entienda y la use **sin explicación**, en la parada, con una mano y apurado.

| Qué significa para nosotros | Qué hacemos en la app | Cómo lo medimos |
|---|---|---|
| Responder "¿dónde anda?" apenas se abre | La pantalla de inicio muestra la última parada reportada, si va a tiempo y cuánto falta para **mi parada**, sin navegar (#27) | Lo principal entra sin hacer scroll en un celular de 360 px de ancho |
| Reportar tiene que ser instantáneo | "Me subí" → confirmar: **2 toques**, con mi parada ya preseleccionada (#28) | Prueba de pasillo (#30): 3 personas que no conocen la app lo logran sin ayuda en menos de 10 segundos |
| Entrar no puede ser una barrera | Login con Google de un toque, sin crear contraseña (#20) | Prueba de pasillo: nadie se traba en el login |
| Lenguaje de la comunidad | Textos cortos y en voseo ("Me subí", "Llega a tu parada en 7 min") | Revisión de textos con 2 compañeros ajenos al proyecto |
| Saber si la estimación es en vivo o teórica | Si no hay reportes del día, un cartel: "Sin reportes en vivo, mostrando el horario estimado" | Piloto: nadie confunde la estimación con un dato en vivo (pregunta en el formulario de feedback) |

**Dato de la encuesta que lo justifica:** 16 % dice que tocaría el botón "a veces, si me acuerdo" y 11 % no lo haría por pereza. Cada toque de más le resta reportes a la app.

---

## 2. Accesibilidad

> Que la puedan usar personas con distintas capacidades, equipos y conexiones.

| Qué significa para nosotros | Qué hacemos en la app | Cómo lo medimos |
|---|---|---|
| Se lee bien con sol, de noche y con baja visión | Contraste mínimo AA (4,5:1 en texto); textos en `rem`, que respetan el zoom del sistema (#25) | Chrome DevTools: chequeo de contraste en cada componente |
| Funciona con lector de pantalla | Botones con texto o `aria-label`; orden lógico de lectura; anuncio cuando cambia el estado | Recorrer la app con TalkBack (Android) o VoiceOver (iPhone) (#30) |
| No depende solo del color | El estado se muestra con **texto + ícono + color** ("⏱ Atrasado 4 min") (#25); las paradas ya pasadas dicen "ya pasó" | Revisión visual en escala de grises |
| Botones fáciles de tocar | Áreas táctiles de 48 px o más | Lighthouse → Accessibility de 90 o más (#30) |
| Anda en celulares viejos y con poca señal | PWA liviana, sin mapas ni GPS; guarda en caché la ruta 0 para mostrar el horario estimado sin conexión | Lighthouse → Performance en modo "Slow 4G" |
| Sin instalar nada desde una store | PWA: se instala desde el navegador en Android y iPhone (#17) | Instalada y probada en 1 Android y 1 iPhone reales (#32) |

---

## 3. Escalabilidad

> Que pueda crecer (más usuarios, más líneas, más sedes) **sin rehacer el sistema**.

| Qué significa para nosotros | Qué hacemos en la app | Cómo lo medimos |
|---|---|---|
| Sumar líneas o recorridos | Todo el modelo de datos se separa por `recorridoId` ([`modelo-datos.md`](modelo-datos.md)). Una línea nueva es cargar otra ruta 0 y agregar un selector (idea futura F1) | Agregar un segundo recorrido de prueba no obliga a cambiar el modelo ni las reglas |
| Más usuarios al mismo tiempo | Firebase (Firestore + Hosting) escala solo. Cada pantalla escucha un solo documento (el último reporte), no toda la colección | Consumo de lecturas en el panel de Firebase durante el piloto vs. el límite gratis (50.000 lecturas/día) |
| Los cálculos no dependen del servidor | Puntualidad y "cuánto falta" se calculan en el teléfono con funciones puras y testeadas | Tests automáticos (`npm test` en `web/`) |
| Ruta 0 actualizable | Si cambia el recorrido, se mide de nuevo y se recarga con un script, sin tocar código (#18) | Reemplazar la ruta ficticia por la real sin cambios de código |

---

## 4. Sostenibilidad

> Que el proyecto **siga funcionando** después de la cursada, sin plata y sin depender de que nosotros estemos.

| Qué significa para nosotros | Qué hacemos en la app | Cómo lo medimos |
|---|---|---|
| Costo cero para mantenerla | Plan gratuito de Firebase; sin servidores propios ni cuenta de desarrollador de stores (PWA) | Factura de Firebase en $0 durante el piloto |
| Los datos los genera la comunidad | Los reportes salen de los propios estudiantes; no hace falta que alguien del equipo esté cargando datos | Reportes por día en el piloto (#34), y cuántos los hicieron personas ajenas al equipo |
| Otros pueden continuarla | Código ordenado, documentación en el repo (`README.md`, `CLAUDE.md`, `PLANNING.md`, `docs/`), tablero de Trello con cada tarea explicada | Alguien ajeno al grupo puede levantar la app en local siguiendo el README |
| Traspaso a la comunidad | Propuesta de entregarla al centro de estudiantes o a otro grupo del taller al terminar la cursada | ⏳ Contacto hecho con el centro de estudiantes (a definir) |
| Confianza para que la sigan usando | Anonimato real del reporte (solo parada y hora), explicado en la app | Pregunta de confianza en el formulario de feedback del piloto |

---

## Resultados

⏳ Se completa en la tarjeta #30 (antes del piloto) y #34 (después del piloto).

| Criterio | Medición | Resultado | Fecha |
|---|---|---|---|
| Usabilidad | Prueba de pasillo (3 personas) | ⏳ Pendiente (la hace el grupo) | |
| Accesibilidad | Lighthouse Accessibility (celular, build de producción, `/mi-parada`) | **100**. Además Performance 100 y Best Practices 100 | 23/10/2026 |
| Accesibilidad | axe-core WCAG 2.1 AA en las 4 pantallas (inicio, Me subí, paradas, mi parada) | **0 problemas**. Se corrigieron 2 avisos: el cartel de datos de prueba quedaba fuera del `<main>` y el inicio no tenía `h1` | 23/10/2026 |
| Accesibilidad | TalkBack / VoiceOver | ⏳ Pendiente (necesita celular real) | |
| Escalabilidad | Lecturas por día en el piloto | | |
| Sostenibilidad | Costo de Firebase en el piloto | | |
