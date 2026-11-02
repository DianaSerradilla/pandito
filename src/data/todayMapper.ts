import type { CatalogItem } from '../pages/catalog/catalogItems'
import type { TodayFilterGroup, TodayItem, TodayStatus } from '../pages/today/todayItems'
import { optionsText, type CatalogData, type StoreVariant } from './catalogMapper'

// Pure mapper from the rows of the HOY views of Supabase to what the HOY page draws. No network, no
// React. A HOY piece is a catalog piece: its HOY lines use the same line keys as the catalog
// (`slug|material:finish|size`), so the cart and the saved order treat them like any other line.

// ---- Rows, as the public views return them ------------------------------------------------------
export type TodayEventRow = { name: string; event_date: string | null; location: string | null; hoy_ends_at: string | null }
export type TodayVariantRow = {
  product_slug: string
  material_code: string
  finish_code: string
  size_code: string
  sort_order: number | null
}
export type TodayRows = { events: TodayEventRow[]; variants: TodayVariantRow[] }

export type TodayData = {
  status: TodayStatus
  name: string
  context: string
  items: TodayItem[]
  groups: TodayFilterGroup[]
}

const lineOf = (row: TodayVariantRow) => `${row.product_slug}|${row.material_code}:${row.finish_code}|${row.size_code}`

/** "Sábado 14 de marzo" from the date ('2026-03-14') of the event, or '' if it is not a date. */
function dateText(value: string | null): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  const text = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  )
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "Plaza Independencia · Sábado 14 de marzo." (what the page says under the title). */
export function eventContext(event: TodayEventRow): string {
  const parts = [event.location?.trim(), dateText(event.event_date)].filter((part): part is string => !!part)
  return parts.length > 0 ? `${parts.join(' · ')}.` : ''
}

const topicsOf = (item: TodayItem) => (item as CatalogItem).topics ?? []

/** The HOY event and its pieces, joined with the catalog.
 *  - no event row: 'inactive' (the view cannot tell an ended event from one that never was);
 *  - an event with no public HOY piece that the catalog also lists: 'empty';
 *  - otherwise 'active'. Each piece is priced "from" its lowest HOY variant, and its card adds the
 *    first HOY variant (the first available one, if any, by the event's order). */
export function buildToday(rows: TodayRows, catalog: Pick<CatalogData, 'items' | 'topics' | 'variantsByLine'>): TodayData {
  const [event] = rows.events.toSorted((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? ''))
  if (!event) return { status: 'inactive', name: '', context: '', items: [], groups: [] }

  const catalogItems = new Map(catalog.items.map((item) => [item.slug, item]))
  const ordered = rows.variants.toSorted((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || lineOf(a).localeCompare(lineOf(b)))
  const pieces = new Map<string, { item: CatalogItem; variants: StoreVariant[] }>()
  for (const row of ordered) {
    const item = catalogItems.get(row.product_slug)
    const variant = catalog.variantsByLine.get(lineOf(row))
    if (!item || !variant) continue
    const piece = pieces.get(item.slug) ?? { item, variants: [] }
    piece.variants.push(variant)
    pieces.set(item.slug, piece)
  }

  const items: CatalogItem[] = [...pieces.values()].map(({ item, variants }) => {
    const buyable = variants.filter((variant) => variant.availability !== 'unavailable')
    const pool = buyable.length > 0 ? buyable : variants
    const first = pool[0]
    return {
      ...item,
      price: Math.min(...pool.map((variant) => variant.price)),
      hasVariants: variants.length > 1,
      defaultOrder: { line: first.line, options: optionsText(first.materialLabel, first.sizeLabel) },
    }
  })

  // Only the topics some HOY piece has. No made-up filter (the sample's color) is offered.
  const used = new Set(items.flatMap((item) => item.topics))
  const options = catalog.topics.filter((topic) => used.has(topic.key)).map(({ key, label }) => ({ key, label }))
  const groups: TodayFilterGroup[] = options.length > 0 ? [{ key: 'tema', label: 'Tema', options, pick: topicsOf }] : []

  return {
    status: items.length > 0 ? 'active' : 'empty',
    name: event.name,
    context: eventContext(event),
    items,
    groups,
  }
}
