import { catalogItems, materials, sizes, todayItems, variantPrice, type CatalogItem, type TodayItem } from '../../data/publicCatalog'
import { priceOrder } from './promos'

// Lookups for the product page and the order. SAMPLE DATA: both lists stand in for the products
// table (Supabase) until the panel exists. A line of the order is the piece's slug, or
// `slug|material|size` when the piece has options (see `lineKey`).
export type Product = { item: TodayItem; topics: string[] }

export function findProduct(slug: string): Product | undefined {
  const fromCatalog = catalogItems.find((item) => item.slug === slug)
  if (fromCatalog) return { item: fromCatalog, topics: fromCatalog.topics }
  const fromToday = todayItems.find((item) => item.slug === slug)
  return fromToday ? { item: fromToday, topics: [] } : undefined
}

/** What a line of the order is: the piece, its options in words and its price. */
export function lineInfo(key: string) {
  const [slug, materialKey, sizeKey] = key.split('|')
  const product = findProduct(slug)
  if (!product) return undefined
  const material = materials.find((entry) => entry.key === materialKey)
  const size = sizes.find((entry) => entry.key === sizeKey)
  return {
    item: product.item,
    options: material && size ? `${material.label}, ${size.cm} cm` : '',
    price: material && size ? variantPrice(material.key, size.key) : product.item.price,
  }
}

/** The order priced with its pack promotions (see promos.ts). */
export const orderPricing = (order: Readonly<Record<string, number>>) => priceOrder(order, lineInfo)

export const orderTotal = (order: Readonly<Record<string, number>>) => orderPricing(order).total

/** "Te pueden gustar": the pieces that share the most topics with this one, then its color. It
 *  looks only at pieces of the same list, so a catalog sticker never recommends an event piece. */
export function recommended(product: Product, limit = 4): TodayItem[] {
  const pool: TodayItem[] = catalogItems.some((item) => item.slug === product.item.slug) ? catalogItems : todayItems
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
