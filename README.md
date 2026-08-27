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

## Roadmap

- [ ] Registrar la ruta 0 (paradas + horarios del primer recorrido completo)
- [ ] Calcular tiempo promedio por parada y tiempo total estimado
- [ ] Mostrar a los usuarios el horario estimado de salida y de llegada a cada parada
- [ ] Botón "Subí" para reportar ubicación en tiempo real
- [ ] Vista para los demás usuarios de por dónde anda el colectivo en vivo
- [ ] (Futuro) Estimar cuánto se paga desde la parada del usuario hasta la facultad

## Estado del proyecto

🚧 En etapa de idea / diseño inicial. Todavía no hay código.
