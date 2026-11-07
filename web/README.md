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
| `VITE_DATOS=local npm run dev` | La app con datos locales y sin login (para trabajar sin internet) |

## Publicar (desde la raíz del repo)

Hace falta `npx firebase-tools login` una vez, con la cuenta dueña del proyecto `donde-anda-26cc1`.

| Comando | Qué hace |
|---|---|
| `cd web && npm run build && cd .. && npx firebase-tools deploy --only hosting` | Publica la app en https://donde-anda-26cc1.web.app |
| `npx firebase-tools deploy --only firestore` | Sube las reglas de seguridad y los índices |
| `npx tsx scripts/cargar-ruta-firestore.mts` | Vuelve a cargar el recorrido en Firestore (ej. después de medir la ruta 0) |
