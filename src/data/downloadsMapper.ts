import { normalize } from '../lib/text'
import type { TodayFilterGroup } from '../pages/today/todayItems'
import type { DownloadItem, DownloadKind } from './sampleDownloads'

// Pure mappers from the rows of public_downloads to what the Downloads page draws. No network, no
// React.

export type DownloadRow = {
  slug: string
  title: string
  kind: string | null
  format: string | null
  resolution: string | null
  description: string | null
  usage_terms: string | null
  file_path: string | null
  preview_path: string | null
  sort_order: number | null
  topic_slugs: string[] | null
}

// The panel saves the kind as free text; these are the values its form offers
// (pandito-panel/src/pages/downloads/downloadKinds.ts), with the words the web uses for them.
const KINDS: { type: Exclude<DownloadKind, 'otro'>; label: string; filter: string }[] = [
  { type: 'celular', label: 'Fondo de celular', filter: 'Fondos de celular' },
  { type: 'computadora', label: 'Fondo de computadora', filter: 'Fondos de computadora' },
  { type: 'whatsapp', label: 'Sticker de WhatsApp', filter: 'Stickers de WhatsApp' },
]

/** The type and the label of a kind. A kind the web does not know is NOT hidden: it is listed as
 *  'otro' under its own words (so a new kind in the panel still shows up), and the filter offers it
 *  as "Otros". */
export function kindOf(kind: string | null): { type: DownloadKind; label: string } {
  const text = (kind ?? '').trim()
  const known = KINDS.find((entry) => entry.type === normalize(text))
  if (known) return { type: known.type, label: known.label }
  return { type: 'otro', label: text === '' ? 'Recurso' : text.charAt(0).toUpperCase() + text.slice(1) }
}

const IMAGE = /\.(png|jpe?g|webp|gif|svg|avif)$/i

/** The resources a visitor can download. A row with no file is left out (there is nothing to give).
 *  The preview is its own picture, or the file itself when that is an image. */
export function mapDownloads(rows: DownloadRow[], publicUrl: (path: string, download?: boolean) => string): DownloadItem[] {
  const items: DownloadItem[] = []
  const ordered = rows.toSorted((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.title.localeCompare(b.title, 'es'))
  for (const row of ordered) {
    if (!row.file_path) continue
    const { type, label } = kindOf(row.kind)
    const terms = row.usage_terms?.trim()
    items.push({
      slug: row.slug,
      name: row.title,
      kind: label,
      type,
      preview: row.preview_path ? publicUrl(row.preview_path) : IMAGE.test(row.file_path) ? publicUrl(row.file_path) : '',
      // `download`: the file is on another origin, where the browser ignores the link's `download`
      // attribute; the storage URL then asks for it to be saved instead of opened.
      file: publicUrl(row.file_path, true),
      format: row.format?.trim() ?? '',
      resolution: row.resolution?.trim() ?? '',
      terms: terms || undefined,
    })
  }
  return items
}

/** The "Tipo" filter, with only the types some resource has. */
export function downloadGroups(items: DownloadItem[]): TodayFilterGroup<DownloadItem>[] {
  const options: { key: string; label: string }[] = KINDS.filter((entry) => items.some((item) => item.type === entry.type)).map((entry) => ({ key: entry.type, label: entry.filter }))
  if (items.some((item) => item.type === 'otro')) options.push({ key: 'otro', label: 'Otros' })
  return options.length > 0 ? [{ key: 'tipo', label: 'Tipo', options, pick: (item) => [item.type] }] : []
}
