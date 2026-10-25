import { materials, promoGroups, sizes, type Pack, type PromoGroup } from '../../data/publicCatalog'

// Pack pricing (REQ-WEB-PROMO-*), PROTOTYPE. The packs themselves are data (see data/samplePromos.ts);
// this file only prices an order with them. The pack price replaces the size price of the stickers it
// covers; a material surcharge is still paid on each sticker. Stickers that do not fill a pack are
// charged one by one, and the cheapest combination always wins, so a pack never costs more than
// buying the same stickers separately.
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

/** The order priced with its packs. `price` is each line's own price (size + material). */
export function priceOrder(
  order: Readonly<Record<string, number>>,
  lineInfoOf: (key: string) => { price: number } | undefined,
): PromoResult {
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
