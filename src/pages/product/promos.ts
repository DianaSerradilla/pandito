import { getCatalog, isConnected, materials, promoGroups, sizes, type Pack, type PromoGroup } from '../../data/publicCatalog'
import { applyPromotions, promoCovers, type PromoUnit, type Promotion } from '../../data/promotions'
import { formatPrice } from '../today/todayItems'

// Pack pricing (REQ-WEB-PROMO-*). `priceOrder` is the one entry point and has two sources:
//  - connected: the promotions of the database (data/promotions.ts has the rules). The pack price
//    replaces the list price of the stickers it covers, each sticker is in at most one pack, and the
//    server does not apply any of it: the total is an estimate the team confirms.
//  - sample (no Supabase): the old packs by size group (data/samplePromos.ts), PROTOTYPE. The pack
//    price replaces the size price of the stickers it covers; a material surcharge is still paid on
//    each sticker. Stickers that do not fill a pack are charged one by one, and the cheapest
//    combination always wins, so a pack never costs more than buying the same stickers separately.
export const promoGroupOf = (sizeKey: string) => promoGroups.find((group) => group.sizeKeys.includes(sizeKey))

export type PromoResult = {
  /** What the lines add up to without any pack. */
  subtotal: number
  /** What the packs take off. Never negative. */
  discount: number
  total: number
  applied: { group: PromoGroup; pack: Pack; times: number }[]
  /** For a group with stickers outside a pack: how many more would leave none outside. */
  hints: { group: PromoGroup; missing: number }[]
}

/** How a pack is called in the message and the summary: "pack de 3 chicos" (sample) or the name the
 *  team gave to the promotion. */
export const packLabel = (group: PromoGroup, pack: Pack) => (group.named ? group.label : `pack de ${pack.quantity} ${group.label}`)

export const hintLabel = (group: PromoGroup, missing: number) =>
  group.named ? `Sumá ${missing} más y completás «${group.label}».` : `Sumá ${missing} más de ${group.label} y completás un pack.`

const baseOf = (sizeKey: string) => sizes.find((size) => size.key === sizeKey)?.price ?? 0

/** Cheapest way to pay for these stickers (base prices, highest first) using the packs. */
function cheapest(prices: number[], packs: Pack[]) {
  const n = prices.length
  const cost = new Array<number>(n + 1).fill(0)
  const choice = new Array<Pack | null>(n + 1).fill(null)
  for (let i = n - 1; i >= 0; i--) {
    cost[i] = prices[i] + cost[i + 1]
    for (const pack of packs) {
      if (i + pack.quantity > n) continue
      const withPack = pack.price + cost[i + pack.quantity]
      if (withPack < cost[i]) {
        cost[i] = withPack
        choice[i] = pack
      }
    }
  }
  const used = new Map<number, number>()
  let loose = 0
  for (let i = 0; i < n; ) {
    const pack = choice[i]
    if (pack) {
      used.set(pack.quantity, (used.get(pack.quantity) ?? 0) + 1)
      i += pack.quantity
    } else {
      loose += 1
      i += 1
    }
  }
  return { cost: cost[0], used, loose }
}

type LineInfoOf = (key: string) => { price: number } | undefined

/** SAMPLE packs: the order priced by size groups. */
function priceWithSamplePacks(order: Readonly<Record<string, number>>, lineInfoOf: LineInfoOf): PromoResult {
  let subtotal = 0
  const bySize = new Map<string, number[]>()

  for (const [key, quantity] of Object.entries(order)) {
    const info = lineInfoOf(key)
    if (!info) continue
    subtotal += info.price * quantity
    const [, materialKey, sizeKey] = key.split('|')
    if (!sizeKey || !materials.some((material) => material.key === materialKey)) continue
    const list = bySize.get(sizeKey) ?? []
    for (let i = 0; i < quantity; i++) list.push(baseOf(sizeKey))
    bySize.set(sizeKey, list)
  }

  let discount = 0
  const applied: PromoResult['applied'] = []
  const hints: PromoResult['hints'] = []

  for (const group of promoGroups) {
    const prices = group.sizeKeys.flatMap((sizeKey) => bySize.get(sizeKey) ?? []).sort((a, b) => b - a)
    if (prices.length === 0) continue
    const { cost, used, loose } = cheapest(prices, group.packs)
    const full = prices.reduce((sum, price) => sum + price, 0)
    discount += full - cost

    for (const pack of group.packs) {
      const times = used.get(pack.quantity) ?? 0
      if (times === 0) continue
      applied.push({ group, pack, times })
    }

    if (loose > 0) {
      const lowest = prices[prices.length - 1]
      for (let extra = 1; extra <= 6; extra++) {
        if (cheapest([...prices, ...new Array<number>(extra).fill(lowest)], group.packs).loose === 0) {
          hints.push({ group, missing: extra })
          break
        }
      }
    }
  }

  return { subtotal, discount, total: subtotal - discount, applied, hints }
}

/** A promotion of the database, in the shape the cart already draws. */
const groupOf = (promo: Promotion): PromoGroup => ({ key: promo.key, label: promo.name, sizeKeys: [], packs: [], named: true })

/** The order priced with the promotions of the database. A line is `slug|material:finish|size`. */
function priceWithPromotions(order: Readonly<Record<string, number>>, lineInfoOf: LineInfoOf, promotions: Promotion[]): PromoResult {
  let subtotal = 0
  const units: PromoUnit[] = []
  // Sorted, so the same order always gives the same packs whatever the order the lines were added in.
  for (const key of Object.keys(order).sort()) {
    const quantity = order[key]
    const info = lineInfoOf(key)
    if (!info || !(quantity > 0)) continue
    subtotal += info.price * quantity
    const [slug, materialKey, sizeKey] = key.split('|')
    if (!materialKey || !sizeKey) continue
    const [materialCode, finishCode = ''] = materialKey.split(':')
    for (let i = 0; i < quantity; i++) units.push({ slug, materialCode, finishCode, sizeCode: sizeKey, price: info.price })
  }

  const outcome = applyPromotions(units, promotions)
  return {
    subtotal,
    discount: outcome.discount,
    total: subtotal - outcome.discount,
    applied: outcome.applied.map(({ promo, packPrice, times }) => ({
      group: groupOf(promo),
      pack: { quantity: promo.quantity, price: packPrice },
      times,
    })),
    hints: outcome.hints.map(({ promo, missing }) => ({ group: groupOf(promo), missing })),
  }
}

/** The order priced with its pack promotions. `price` is each line's own price. */
export function priceOrder(order: Readonly<Record<string, number>>, lineInfoOf: LineInfoOf): PromoResult {
  return isConnected ? priceWithPromotions(order, lineInfoOf, getCatalog().promotions) : priceWithSamplePacks(order, lineInfoOf)
}

// ---- What the product page says about packs ------------------------------------------------------
export type PackOffers = { heading: string; items: { key: string; text: string }[]; note: string }

const percentText = (percent: number) => `${percent.toLocaleString('es-AR')} %`

/** The promotions that cover this variant of a piece, for its page. Connected: the basic ones whose
 *  filters match it and the special ones that include the piece. */
export function packOffersFor(slug: string, materialKey: string, sizeKey: string): PackOffers | undefined {
  if (!isConnected) {
    const group = promoGroupOf(sizeKey)
    if (!group) return undefined
    return {
      heading: `Packs de ${group.label}`,
      items: group.packs.map((pack) => ({ key: String(pack.quantity), text: `${pack.quantity} por ${formatPrice(pack.price)}` })),
      note: 'Con cualquier diseño. Se aplican solos en Mi pedido. Precios de muestra, a confirmar.',
    }
  }
  const [materialCode, finishCode = ''] = materialKey.split(':')
  const unit = { slug, materialCode, finishCode, sizeCode: sizeKey }
  const items = getCatalog()
    .promotions.filter((promo) => promoCovers(promo, unit))
    .map((promo) => {
      const what =
        promo.kind === 'special'
          ? promo.quantity === promo.slugs.length
            ? `los ${promo.quantity} diseños juntos`
            : `${promo.quantity} de ${promo.slugs.length} diseños`
          : `${promo.quantity}`
      const deal = promo.price !== null ? `por ${formatPrice(promo.price)}` : `con ${percentText(promo.percent ?? 0)} de descuento`
      return { key: promo.key, text: `${promo.name}: ${what} ${deal}` }
    })
  if (items.length === 0) return undefined
  return { heading: 'Packs y promos', items, note: 'Se aplican solos en Mi pedido. Precios a confirmar.' }
}
