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

## Carpetas

```
src/
  components/   → componentes visuales reutilizables (#25)
  features/     → una carpeta por funcionalidad: auth, estado, paradas, reportes, puntualidad
  services/     → conexión con Firebase (#16, #20, #21, #22)
  types/        → modelos.ts: Recorrido, Parada, Reporte (ver docs/modelo-datos.md)
```
