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

Cuando un estudiante se sube al colectivo, aprieta el botón **"Subí"** e indica en qué lugar/parada se subió. Eso queda registrado con el horario, y les sirve a los demás usuarios para saber en tiempo real por dónde anda el colectivo ese día — no solo la estimación teórica de la ruta 0, sino el dato real del momento.

### 3. ¿Está a tiempo o no?

Los promedios calculados en la ruta 0 son un piso, no una garantía: en la práctica cada parada varía (gente que tarda más en subir, semáforos, tráfico). Por eso a los tiempos promedio se les suma un margen de seguridad antes de usarlos — por ejemplo, si en promedio subir a alguien tarda 10 segundos, se toma una base de 30 segundos por parada en vez del valor "justo".

Con ese promedio ajustado, el horario de salida y la última parada reportada en vivo (vía "Subí"), se puede proyectar a qué hora debería estar el colectivo en cualquier punto de la ruta. Comparando esa proyección contra el horario actual, la app puede indicar si el colectivo va a tiempo, adelantado o atrasado.

## Roadmap

- [ ] Registrar la ruta 0 (paradas + horarios del primer recorrido completo)
- [ ] Calcular tiempo promedio por parada y tiempo total estimado
- [ ] Mostrar a los usuarios el horario estimado de salida y de llegada a cada parada
- [ ] Botón "Subí" para reportar ubicación en tiempo real
- [ ] Vista para los demás usuarios de por dónde anda el colectivo en vivo
- [ ] Margen de seguridad sobre los promedios y cálculo de puntualidad (a tiempo / adelantado / atrasado)
- [ ] (Futuro) Estimar cuánto se paga desde la parada del usuario hasta la facultad

## Estado del proyecto

🚧 En etapa de idea / diseño inicial. Todavía no hay código.
