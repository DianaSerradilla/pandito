import { asset } from '../lib/asset'
import { normalize } from '../lib/text'
import type { CatalogFamily, CatalogItem, CatalogTopic } from '../pages/catalog/catalogItems'
import type { FeaturedItem } from '../pages/home/featuredItems'
import type { TodayFilterGroup, TodayTone } from '../pages/today/todayItems'
import type { Availability } from './sampleAvailability'

// Pure mappers from the rows of the public views of Supabase to what the site draws. No network, no
// React: everything here can be read and checked on its own. The store (catalogStore.ts) reads the
// rows and calls `buildCatalog`.

// ---- Rows, as the public views return them (only what the web reads) --------------------------
export type ProductRow = {
  slug: string
  name: string
  description: string | null
  usage_suggestions: string | null
  featured: boolean | null
  featured_order: number | null
  created_at: string | null
  topic_slugs: string[] | null
}
export type ImageRow = {
  product_slug: string
  storage_path: string
  thumb_path: string | null
  sort_order: number | null
  is_cover: boolean | null
}
export type VariantRow = {
  product_slug: string
  material_code: string
  finish_code: string
  size_code: string
  price: number | string | null
  availability: string | null
  sort_order: number | null
  /** Needs migration 0016. Without it the piece is listed but cannot be saved as an order. */
  variant_id?: string | null
  width_mm?: number | null
  height_mm?: number | null
}
export type TopicRow = { slug: string; name: string; family: string | null; popular: boolean | null; sort_order: number | null }
export type SizeRow = { code: string; name: string; width_mm: number | null; height_mm: number | null }
export type NamedRow = { code: string; name: string }
export type SlotRow = { id: string; slot_date: string; starts_at: string; ends_at: string }

export type CatalogRows = {
  products: ProductRow[]
  images: ImageRow[]
  variants: VariantRow[]
  topics: TopicRow[]
  sizes: SizeRow[]
  materials: NamedRow[]
  finishes: NamedRow[]
}

// ---- What the site draws -----------------------------------------------------------------------
/** A delivery window the team offers (REQ-WEB-CART-004). */
export type DeliverySlot = { id: string; label: string }

/** One buyable combination of a piece. The line of the order is `slug|materialKey|sizeKey`. */
export type StoreVariant = {
  /** Undefined only when the database has not been given migration 0016 yet. */
  id: string | undefined
  slug: string
  line: string
  /** `${material_code}:${finish_code}`: the web's "material" is the pair. */
  materialKey: string
  materialLabel: string
  /** Name that drives the gallery's light effect ("brillante", "holografico"), if it has one. */
  effect: string | undefined
  sizeKey: string
  sizeName: string
  /** Longest side in cm, as the gallery's ruler needs it. */
  cm: number
  /** The size in words: "7,5 cm" (or the size's name when the database has no measures). */
  sizeLabel: string
  price: number
  availability: Availability
}

export type CatalogData = {
  items: CatalogItem[]
  topics: CatalogTopic[]
  families: CatalogFamily[]
  filterGroups: TodayFilterGroup<CatalogItem>[]
  featured: FeaturedItem[]
  variantsBySlug: Map<string, StoreVariant[]>
  variantsByLine: Map<string, StoreVariant>
  /** Full-size cover of each piece (the cards use the thumbnail). */
  fullImages: Map<string, string>
}

const tones: TodayTone[] = ['naranja', 'azul', 'amarillo', 'tinta']
/** Stable tone for a slug: the same piece always lands on the same color. */
export function toneOf(slug: string): TodayTone {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  return tones[hash % tones.length]
}

export const slugify = (text: string) =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const byOrder = (a: number | null | undefined, b: number | null | undefined) => (a ?? 0) - (b ?? 0)

/** Splits the free text of "usage suggestions" into short chips: lines, bullets, semicolons,
 *  commas and sentences. An empty result means "no list", and the page uses its general one. */
export function splitUses(text: string | null | undefined): string[] {
  if (!text) return []
  const parts = text
    .split(/[\r\n;•]+|,\s+|\.\s+/)
    .map((part) => part.replace(/^[\s\-*·]+/, '').replace(/[\s.]+$/, ''))
    .filter((part) => part !== '')
  return [...new Set(parts)].slice(0, 8)
}

export const formatCm = (cm: number) => `${cm.toLocaleString('es-AR')} cm`

/** A finish name that says "nothing": it adds no information to the material's label. */
const genericFinish = (name: string, code: string) =>
  /^(sin acabado|sin terminacion|sin|ninguno|ninguna|none|n\/a|-)$/.test(normalize(name)) || normalize(code) === 'none'

const effectOf = (text: string): string | undefined => {
  const t = normalize(text)
  if (t.includes('holo')) return 'holografico'
  if (t.includes('brill') || t.includes('gloss')) return 'brillante'
  return undefined
}

const availabilityOf = (value: string | null): Availability =>
  value === 'on_request' ? 'on-request' : value === 'unavailable' ? 'unavailable' : 'confirm'

export const optionsText = (materialLabel: string, sizeLabel: string) => `${materialLabel}, ${sizeLabel}`

/** The variants of ONE piece, ordered, with the web's material (material+finish) and size labels. */
export function mapVariants(
  slug: string,
  rows: VariantRow[],
  names: { materials: Map<string, string>; finishes: Map<string, string>; sizes: Map<string, SizeRow> },
): StoreVariant[] {
  const ordered = rows
    .filter((row) => row.price !== null && Number.isFinite(Number(row.price)))
    .toSorted(
      (a, b) =>
        byOrder(a.sort_order, b.sort_order) ||
        `${a.material_code}${a.finish_code}${a.size_code}`.localeCompare(`${b.material_code}${b.finish_code}${b.size_code}`),
    )

  // The finish is said only when the piece really offers more than one for that material.
  const finishCount = new Map<string, Set<string>>()
  for (const row of ordered) {
    const set = finishCount.get(row.material_code) ?? new Set<string>()
    set.add(row.finish_code)
    finishCount.set(row.material_code, set)
  }

  const labelOf = (row: VariantRow) => {
    const material = names.materials.get(row.material_code) ?? row.material_code
    const finish = names.finishes.get(row.finish_code) ?? row.finish_code
    const showFinish = (finishCount.get(row.material_code)?.size ?? 0) > 1 && !genericFinish(finish, row.finish_code)
    return showFinish ? `${material} · ${finish}` : material
  }

  // Two different pairs that end up with the same words get their finish code, so they stay apart.
  const keysByLabel = new Map<string, Set<string>>()
  for (const row of ordered) {
    const label = labelOf(row)
    const set = keysByLabel.get(label) ?? new Set<string>()
    set.add(`${row.material_code}:${row.finish_code}`)
    keysByLabel.set(label, set)
  }

  return ordered.map((row) => {
    const materialKey = `${row.material_code}:${row.finish_code}`
    const base = labelOf(row)
    const materialLabel = (keysByLabel.get(base)?.size ?? 0) > 1 ? `${base} (${row.finish_code})` : base
    const size = names.sizes.get(row.size_code)
    const sizeName = size?.name ?? row.size_code
    const longestMm = Math.max(row.width_mm ?? size?.width_mm ?? 0, row.height_mm ?? size?.height_mm ?? 0)
    const known = longestMm > 0
    const cm = known ? Math.round(longestMm) / 10 : 5
    return {
      id: row.variant_id ?? undefined,
      slug,
      line: `${slug}|${materialKey}|${row.size_code}`,
      materialKey,
      materialLabel,
      effect: effectOf(`${names.materials.get(row.material_code) ?? ''} ${names.finishes.get(row.finish_code) ?? ''} ${row.material_code} ${row.finish_code}`),
      sizeKey: row.size_code,
      sizeName,
      cm,
      sizeLabel: known ? formatCm(cm) : sizeName,
      price: Number(row.price),
      availability: availabilityOf(row.availability),
    }
  })
}

const pickAvailable = (variants: StoreVariant[]) => variants.filter((variant) => variant.availability !== 'unavailable')

export function buildCatalog(
  rows: CatalogRows,
  imageUrl: (path: string) => string,
  featuredLayout: FeaturedItem[],
): CatalogData {
  const names = {
    materials: new Map(rows.materials.map((row) => [row.code, row.name])),
    finishes: new Map(rows.finishes.map((row) => [row.code, row.name])),
    sizes: new Map(rows.sizes.map((row) => [row.code, row])),
  }

  const variantRows = new Map<string, VariantRow[]>()
  for (const row of rows.variants) variantRows.set(row.product_slug, [...(variantRows.get(row.product_slug) ?? []), row])

  const imageRows = new Map<string, ImageRow[]>()
  for (const row of rows.images) imageRows.set(row.product_slug, [...(imageRows.get(row.product_slug) ?? []), row])

  const variantsBySlug = new Map<string, StoreVariant[]>()
  const variantsByLine = new Map<string, StoreVariant>()
  const fullImages = new Map<string, string>()
  const items: CatalogItem[] = []

  // Newest first; a piece with no buyable variant is left out (there is nothing to order).
  const products = rows.products.toSorted(
    (a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '') || a.name.localeCompare(b.name, 'es'),
  )

  for (const product of products) {
    const variants = mapVariants(product.slug, variantRows.get(product.slug) ?? [], names)
    if (variants.length === 0) continue
    variantsBySlug.set(product.slug, variants)
    for (const variant of variants) variantsByLine.set(variant.line, variant)

    const pictures = (imageRows.get(product.slug) ?? []).toSorted((a, b) => byOrder(a.sort_order, b.sort_order))
    const cover = pictures.find((picture) => picture.is_cover) ?? pictures[0]
    if (cover) fullImages.set(product.slug, imageUrl(cover.storage_path))

    const buyable = pickAvailable(variants)
    const pool = buyable.length > 0 ? buyable : variants
    const first = pool[0]
    const uses = splitUses(product.usage_suggestions)

    items.push({
      slug: product.slug,
      name: product.name,
      kind: 'Sticker',
      tags: ['Stickers'],
      // No picture yet: the brand's Pando stands in, so the card is never a broken image.
      image: cover ? imageUrl(cover.thumb_path ?? cover.storage_path) : asset('/brand/pando.svg'),
      cut: !cover,
      tone: toneOf(product.slug),
      price: Math.min(...pool.map((variant) => variant.price)),
      description: product.description?.trim() || undefined,
      uses: uses.length > 0 ? uses : undefined,
      hasVariants: variants.length > 1,
      defaultOrder: { line: first.line, options: optionsText(first.materialLabel, first.sizeLabel) },
      topics: product.topic_slugs ?? [],
    })
  }

  // Only the topics that some listed piece has, grouped by family.
  const used = new Set(items.flatMap((item) => item.topics))
  const topicRows = rows.topics
    .filter((topic) => used.has(topic.slug))
    .toSorted((a, b) => byOrder(a.sort_order, b.sort_order) || a.name.localeCompare(b.name, 'es'))
  const topics: CatalogTopic[] = topicRows.map((topic) => ({
    key: topic.slug,
    label: topic.name,
    family: slugify(topic.family ?? 'Otros'),
    popular: topic.popular === true,
  }))
  const families: CatalogFamily[] = []
  for (const topic of topicRows) {
    const key = slugify(topic.family ?? 'Otros')
    if (!families.some((family) => family.key === key)) families.push({ key, label: topic.family ?? 'Otros' })
  }

  // The tone is only the color of a tile the catalog does not even draw, so it is not a filter here.
  const filterGroups: TodayFilterGroup<CatalogItem>[] = [
    { key: 'tema', label: 'Tema', options: topics.map(({ key, label }) => ({ key, label })), pick: (item) => item.topics },
  ]

  // The home's wall has a fixed number of spots: the first featured pieces fill them, in order.
  const listed = new Set(items.map((item) => item.slug))
  const featured: FeaturedItem[] = rows.products
    .filter((product) => product.featured === true && listed.has(product.slug))
    .toSorted((a, b) => (a.featured_order ?? Infinity) - (b.featured_order ?? Infinity))
    .slice(0, featuredLayout.length)
    .map((product, index) => ({
      ...featuredLayout[index],
      slug: product.slug,
      name: product.name,
      image: fullImages.get(product.slug) ?? asset('/brand/pando.svg'),
      cut: !fullImages.has(product.slug),
    }))

  return { items, topics, families, filterGroups, featured, variantsBySlug, variantsByLine, fullImages }
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/** "Mié 12/03 · 18:00 a 19:00" from the date ('2026-03-12') and times ('18:00:00') of a slot. */
export function slotLabel(slot: SlotRow): string {
  const [year, month, day] = slot.slot_date.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${weekday} ${pad(day)}/${pad(month)} · ${slot.starts_at.slice(0, 5)} a ${slot.ends_at.slice(0, 5)}`
}

export function mapSlots(rows: SlotRow[]): DeliverySlot[] {
  return rows
    .toSorted((a, b) => a.slot_date.localeCompare(b.slot_date) || a.starts_at.localeCompare(b.starts_at))
    .map((slot) => ({ id: slot.id, label: slotLabel(slot) }))
}
