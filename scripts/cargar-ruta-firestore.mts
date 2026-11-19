/**
 * Carga el recorrido del MVP en Firestore (#18): recorridos/510-ida y sus paradas.
 *
 * Usa los mismos archivos y el mismo lector que la app:
 *   - docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv   (paradas y tiempos)
 *   - docs/ruta0/paradas-coordenadas.csv     (ubicación de cada parada)
 *   - web/src/services/recorrido510.ts       (horarios, días de servicio, zonas)
 * Borra las paradas que ya no están en el CSV, así un recorrido nuevo reemplaza al anterior.
 *
 * Las reglas de seguridad NO dejan escribir el recorrido desde la app (a propósito). Este script escribe
 * con el permiso de dueño del proyecto que da la herramienta de Firebase:
 *   1. npx firebase-tools login            (una vez, con la cuenta dueña del proyecto)
 *   2. npx firebase-tools projects:list    (renueva el permiso, que dura 1 hora)
 *   3. npx tsx scripts/cargar-ruta-firestore.mts
 * Cuando se mida la ruta 0 (#12): reemplazar el CSV y volver a correr este script.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { paradasDesdeCsv, sumarCoordenadas } from '../web/src/features/paradas/ruta0Csv'
import { RECORRIDO_510 } from '../web/src/services/recorrido510'

const PROYECTO = 'donde-anda-26cc1'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`
const raiz = join(import.meta.dirname, '..')

// Permiso de la herramienta de Firebase (lo guarda `firebase login`). No se imprime ni se guarda en otro lado.
const config = JSON.parse(readFileSync(join(homedir(), '.config/configstore/firebase-tools.json'), 'utf-8'))
const token: string | undefined = config.tokens?.access_token
if (!token || config.tokens.expires_at < Date.now() + 60_000) {
  console.error('El permiso de Firebase venció. Corré `npx firebase-tools projects:list` y volvé a probar.')
  process.exit(1)
}

// Valores en el formato de la API REST de Firestore.
type Valor = Record<string, unknown>
function aValor(v: unknown): Valor {
  if (typeof v === 'string') return { stringValue: v }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(aValor) } }
  if (v && typeof v === 'object') return { mapValue: { fields: aCampos(v as Record<string, unknown>) } }
  throw new Error(`Valor no soportado: ${String(v)}`)
}
function aCampos(o: Record<string, unknown>): Record<string, Valor> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, aValor(v)]))
}

async function api(ruta: string, opciones: RequestInit = {}) {
  const r = await fetch(ruta, {
    ...opciones,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`)
  return r.json()
}

const leer = (archivo: string) => readFileSync(join(raiz, archivo), 'utf-8')
const paradas = sumarCoordenadas(
  paradasDesdeCsv(leer('docs/ruta0/ruta0-RAMAL9-ESTIMADA.csv')),
  leer('docs/ruta0/paradas-coordenadas.csv'),
)
const { id: recorridoId, ...recorrido } = RECORRIDO_510
const docRecorrido = `projects/${PROYECTO}/databases/(default)/documents/recorridos/${recorridoId}`

// Paradas que hay hoy en Firestore (para borrar las que ya no estén).
const existentes: string[] = []
let pagina: string | undefined
do {
  const r = await api(`${BASE}/recorridos/${recorridoId}/paradas?pageSize=300${pagina ? `&pageToken=${pagina}` : ''}`)
  existentes.push(...(r.documents ?? []).map((d: { name: string }) => d.name))
  pagina = r.nextPageToken
} while (pagina)

const nuevas = new Set(paradas.map((p) => `${docRecorrido}/paradas/${p.id}`))
const writes = [
  { update: { name: docRecorrido, fields: aCampos(recorrido) } },
  ...paradas.map(({ id, ...p }) => ({ update: { name: `${docRecorrido}/paradas/${id}`, fields: aCampos(p) } })),
  ...existentes.filter((n) => !nuevas.has(n)).map((n) => ({ delete: n })),
]

await api(`${BASE}:commit`, { method: 'POST', body: JSON.stringify({ writes }) })
console.log(
  `✔ recorridos/${recorridoId}: ${paradas.length} paradas cargadas` +
    (writes.length - 1 - paradas.length ? `, ${writes.length - 1 - paradas.length} borradas` : '') +
    ` (${paradas.filter((p) => p.lat !== undefined).length} con ubicación)`,
)
