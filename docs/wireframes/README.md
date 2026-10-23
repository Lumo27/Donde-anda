# Wireframes — donde anda 🚌

Bocetos de baja fidelidad (tarjeta #10). Muestran **qué va en cada pantalla y en qué orden**, no el diseño final: colores, tipografía e íconos se definen en #25.

| Archivo | Pantalla | Tarjeta que la implementa |
|---|---|---|
| `00-login.png` | Login con Google + aviso de privacidad | #20 |
| `01-estado.png` | Inicio: último reporte, puntualidad, cuánto falta a mi parada, botón "Me subí" | #27 |
| `02-me-subi.png` | Elegir parada y confirmar (2 toques) | #28 |
| `03-paradas.png` | Listado de paradas con hora estimada | #29 |
| `04-mi-parada.png` | Elegir mi parada (primera vez) | #26 |

Los datos que aparecen son de la **ruta ficticia** (`docs/ruta0/ruta0-FICTICIA.csv`).

**Para modificarlos:** editar `scripts/generar-wireframes.py` y correr
`python3 scripts/generar-wireframes.py docs/wireframes`. Eso regenera los `.svg`. Para pasarlos a PNG, abrir el `.svg` en Chrome y sacar una captura, o usar Chrome headless.
