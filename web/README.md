# web — app de donde anda

PWA en React 18 + Vite + TypeScript (strict) + Tailwind. El contexto del proyecto está en el `README.md` y el `CLAUDE.md` de la raíz del repo.

## Comandos (desde esta carpeta `web/`)

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias (la primera vez) |
| `npm run dev` | Levanta la app en http://localhost:5173 |
| `npm test` | Corre los tests (Vitest) en modo "watch" |
| `npx vitest run` | Corre los tests una sola vez |
| `npm run build` | Chequea tipos y arma la versión de producción en `dist/` |
| `npm run lint` | Revisa el código con ESLint |
| `npm run demo` | La app en **modo demo** (#36): colectivos ficticios en viaje y "Me subí" que llegan solos. Se abre también desde el celular por Wi-Fi |
| `npm run demo:pwa` | Lo mismo, pero como PWA de producción en http://IP-DE-LA-COMPU:4173 |

### Modo demo

Sirve para mostrar el prototipo sin Firebase ni gente real. Hay dos colectivos en viaje (el 2º salió 15 min después que el 1º) y uno por salir. El reloj corre 5 veces más rápido; se cambia con `?velocidad=1` (tiempo real) hasta `?velocidad=60` en la dirección. El botón "Reiniciar" del cartel vuelve a empezar.

La simulación **solo existe en modo demo**: `npm run dev` y `npm run build` no la incluyen, así que nunca llega a producción. El código está en `src/features/simulacion/`.

## Carpetas

```
src/
  components/   → componentes visuales reutilizables (#25)
  features/     → una carpeta por funcionalidad: auth, estado, paradas, reportes, puntualidad
  services/     → conexión con Firebase (#16, #20, #21, #22)
  types/        → modelos.ts: Recorrido, Parada, Reporte (ver docs/modelo-datos.md)
```
