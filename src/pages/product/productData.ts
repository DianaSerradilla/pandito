import {
  availabilityOf,
  getCatalog,
  isConnected,
  lineKey,
  materials,
  sizes,
  todayItems,
  variantPrice,
  type Availability,
  type CatalogItem,
  type StoreVariant,
  type TodayItem,
} from '../../data/publicCatalog'
import { priceOrder } from './promos'
import { formatPrice } from '../today/todayItems'

// Lookups for the product page and the order. Connected, a piece and its variants come from the
// catalog read from Supabase (data/catalogStore.ts); without it they are the SAMPLE catalog. A line
// of the order is the piece's slug, or `slug|material|size` when it has options (see `lineKey`);
// connected, `material` is `${material_code}:${finish_code}` and `size` is the size code, and each
// full line is exactly one variant.
export type Product = { item: TodayItem; topics: string[] }

export function findProduct(slug: string): Product | undefined {
  const fromCatalog = getCatalog().items.find((item) => item.slug === slug)
  if (fromCatalog) return { item: fromCatalog, topics: fromCatalog.topics }
  // Connected, a HOY piece is a catalog piece (found above): the sample pieces do not exist.
  const fromToday = isConnected ? undefined : todayItems.find((item) => item.slug === slug)
  return fromToday ? { item: fromToday, topics: [] } : undefined
}

export type LineInfo = {
  item: TodayItem
  options: string
  price: number
  /** The variant to send when the order is saved. Missing for a sample piece (HOY without Supabase). */
  variantId?: string
}

/** What a line of the order is: the piece, its options in words and its price. */
export function lineInfo(key: string): LineInfo | undefined {
  const [slug, materialKey, sizeKey] = key.split('|')
  const product = findProduct(slug)
  if (!product) return undefined

  // A piece of the real catalog is priced by its variant, and a line without one does not exist.
  const catalog = getCatalog()
  if (isConnected && catalog.items.some((item) => item.slug === slug)) {
    const variant = catalog.variantsByLine.get(key)
    if (!variant) return undefined
    return { item: product.item, options: `${variant.materialLabel}, ${variant.sizeLabel}`, price: variant.price, variantId: variant.id }
  }

  const material = materials.find((entry) => entry.key === materialKey)
  const size = sizes.find((entry) => entry.key === sizeKey)
  return {
    item: product.item,
    options: material && size ? `${material.label}, ${size.cm} cm` : '',
    price: material && size ? variantPrice(material.key, size.key) : product.item.price,
  }
}

/** The order priced with its pack promotions (see promos.ts; connected, those of the database). */
export const orderPricing = (order: Readonly<Record<string, number>>) => priceOrder(order, lineInfo)

export const orderTotal = (order: Readonly<Record<string, number>>) => orderPricing(order).total

// ---- The options of a piece, for its page ---------------------------------------------------------
export type Choice = { key: string; label: string; hint: string }

/** One combination of material and size that the piece really comes in. */
export type VariantChoice = {
  line: string
  materialKey: string
  materialLabel: string
  /** Drives the gallery's light effect (see ProductGallery). */
  effect: string | undefined
  sizeKey: string
  sizeLabel: string
  cm: number
  price: number
  availability: Availability
}

export type ProductChoices = {
  initial: VariantChoice
  materials: Choice[]
  /** The sizes the piece comes in for that material: only the combinations that exist. */
  sizesFor: (materialKey: string) => Choice[]
  find: (materialKey: string, sizeKey: string) => VariantChoice | undefined
}

function fromStore(list: StoreVariant[]): ProductChoices {
  const all: VariantChoice[] = list.map((variant) => ({
    line: variant.line,
    materialKey: variant.materialKey,
    materialLabel: variant.materialLabel,
    effect: variant.effect,
    sizeKey: variant.sizeKey,
    sizeLabel: variant.sizeLabel,
    cm: variant.cm,
    price: variant.price,
    availability: variant.availability,
  }))
  const names = new Map(list.map((variant) => [variant.line, variant.sizeName]))
  const materialChoices: Choice[] = []
  for (const choice of all) {
    if (!materialChoices.some((entry) => entry.key === choice.materialKey)) {
      materialChoices.push({ key: choice.materialKey, label: choice.materialLabel, hint: '' })
    }
  }
  return {
    initial: all[0],
    materials: materialChoices,
    sizesFor: (materialKey) =>
      all
        .filter((choice) => choice.materialKey === materialKey)
        .map((choice) => ({ key: choice.sizeKey, label: choice.sizeLabel, hint: `${names.get(choice.line)} · ${formatPrice(choice.price)}` })),
    find: (materialKey, sizeKey) => all.find((choice) => choice.materialKey === materialKey && choice.sizeKey === sizeKey),
  }
}

function fromSample(slug: string): ProductChoices {
  const all: VariantChoice[] = materials.flatMap((material) =>
    sizes.map((size) => ({
      line: lineKey(slug, material.key, size.key),
      materialKey: material.key,
      materialLabel: material.label,
      effect: material.key,
      sizeKey: size.key,
      sizeLabel: `${size.cm} cm`,
      cm: size.cm,
      price: variantPrice(material.key, size.key),
      availability: availabilityOf(slug, material.key, size.key),
    })),
  )
  return {
    initial: all[0],
    materials: materials.map(({ key, label, note }) => ({ key, label, hint: note })),
    sizesFor: () => sizes.map(({ key, label, cm, price }) => ({ key, label: `${cm} cm`, hint: `${label} · ${formatPrice(price)}` })),
    find: (materialKey, sizeKey) => all.find((choice) => choice.materialKey === materialKey && choice.sizeKey === sizeKey),
  }
}

/** The options a piece comes in, or undefined for a piece without any (the HOY pieces). */
export function productChoices(slug: string): ProductChoices | undefined {
  const catalog = getCatalog()
  if (!catalog.items.some((item) => item.slug === slug)) return undefined
  if (!isConnected) return fromSample(slug)
  const list = catalog.variantsBySlug.get(slug)
  return list && list.length > 0 ? fromStore(list) : undefined
}

/** The picture for the product page: the full-size one when the catalog has it, else the card's. */
export const productImage = (item: TodayItem) => getCatalog().fullImages.get(item.slug) ?? item.image

/** "Te pueden gustar": the pieces that share the most topics with this one, then its color. It
 *  looks only at pieces of the same list, so a catalog sticker never recommends an event piece. */
export function recommended(product: Product, limit = 4): TodayItem[] {
  const { items } = getCatalog()
  const pool: TodayItem[] = items.some((item) => item.slug === product.item.slug) ? items : todayItems
  const score = (other: TodayItem) =>
    ((other as CatalogItem).topics ?? []).filter((topic) => product.topics.includes(topic)).length * 3 +
    (other.tone === product.item.tone ? 1 : 0)
  return pool
    .filter((other) => other.slug !== product.item.slug)
    .map((other, index) => ({ other, index, points: score(other) }))
    .sort((a, b) => b.points - a.points || a.index - b.index)
    .slice(0, limit)
    .map(({ other }) => other)
}
