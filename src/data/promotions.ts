// Pack promotions read from the database (public_promotions), as pure code: the row mapper and the
// pricing rules. No network, no React, no store: everything here can be read and checked on its own.
//
// The server does NOT apply promotions (submit_web_request stores list prices), so what this computes
// is an estimate the team confirms on WhatsApp.

// ---- Rows, as the public view returns them ------------------------------------------------------
export type PromoRow = {
  name: string
  size_code: string | null
  material_code: string | null
  quantity: number | string | null
  price: number | string | null
  sort_order: number | null
  kind: string | null
  finish_code: string | null
  discount_percent: number | string | null
  product_slugs: string[] | null
}

/** A promotion, ready to be applied.
 *  - basic: `quantity` stickers that match the filters (null = any) get the discount.
 *  - special: `quantity` stickers taken from the hand-picked designs in `slugs` get the discount. When
 *    `quantity` equals the number of designs the buyer takes ALL of them (one of each); when it is
 *    smaller, ASSUMPTION: any `quantity` units of those designs (a design may repeat). */
export type Promotion = {
  key: string
  name: string
  kind: 'basic' | 'special'
  quantity: number
  sizeCode: string | null
  materialCode: string | null
  finishCode: string | null
  /** Final price of the whole pack. Exactly one of `price` and `percent` is set. */
  price: number | null
  /** Discount off the list price of the units of the pack. */
  percent: number | null
  slugs: string[]
}

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** Valid promotions only, in a stable order (sort order, then name). A row that cannot be applied is
 *  left out instead of guessed: no quantity, no price or percent, a special without designs or with
 *  more units than designs (a design was unpublished since). */
export function mapPromotions(rows: PromoRow[]): Promotion[] {
  const mapped: (Omit<Promotion, 'key'> & { sortOrder: number })[] = []
  for (const row of rows) {
    const quantity = toNumber(row.quantity)
    if (quantity === null || !Number.isInteger(quantity) || quantity < 1) continue
    const kind = row.kind === 'special' ? 'special' : 'basic'
    const price = toNumber(row.price)
    const percent = toNumber(row.discount_percent)
    if ((price === null) === (percent === null)) continue
    if (price !== null && price < 0) continue
    if (percent !== null && (percent <= 0 || percent > 100)) continue
    const slugs = [...new Set(row.product_slugs ?? [])]
    if (kind === 'special' && (slugs.length === 0 || quantity > slugs.length)) continue
    mapped.push({
      name: row.name,
      kind,
      quantity,
      sizeCode: kind === 'basic' ? row.size_code : null,
      materialCode: kind === 'basic' ? row.material_code : null,
      finishCode: kind === 'basic' ? row.finish_code : null,
      price,
      percent,
      slugs: kind === 'special' ? slugs : [],
      sortOrder: row.sort_order ?? 0,
    })
  }
  return mapped
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'))
    .map((promo, index): Promotion => ({
      key: `promo-${index}`,
      name: promo.name,
      kind: promo.kind,
      quantity: promo.quantity,
      sizeCode: promo.sizeCode,
      materialCode: promo.materialCode,
      finishCode: promo.finishCode,
      price: promo.price,
      percent: promo.percent,
      slugs: promo.slugs,
    }))
}

// ---- Pricing ------------------------------------------------------------------------------------
/** One sticker of the order, with the price of its variant. */
export type PromoUnit = { slug: string; materialCode: string; finishCode: string; sizeCode: string; price: number }

export type AppliedPack = { promo: Promotion; packPrice: number; times: number }
export type PromoOutcome = {
  /** One entry per promotion and pack price (a percentage can give different prices per pack). */
  applied: AppliedPack[]
  /** What the packs take off the list prices. Never negative, never more than the units cost. */
  discount: number
  /** For the nearest incomplete promotions: how many more stickers would complete a pack. */
  hints: { promo: Promotion; missing: number }[]
}

type Slot = { unit: PromoUnit; index: number }
type Pack = { chosen: Slot[]; list: number; packPrice: number }

const matches = (promo: Promotion, unit: PromoUnit) =>
  (promo.sizeCode === null || promo.sizeCode === unit.sizeCode) &&
  (promo.materialCode === null || promo.materialCode === unit.materialCode) &&
  (promo.finishCode === null || promo.finishCode === unit.finishCode)

/** Does a promotion apply to this variant of a piece? (For the product page.) */
export const promoCovers = (promo: Promotion, unit: Omit<PromoUnit, 'price'>) =>
  promo.kind === 'special' ? promo.slugs.includes(unit.slug) : matches(promo, { ...unit, price: 0 })

const byPrice = (a: Slot, b: Slot) => b.unit.price - a.unit.price || a.index - b.index

/** One pack of a promotion out of the free units (highest price first), or null when it cannot be
 *  formed or would not save anything. The units that go into the pack are the dearest ones, which is
 *  also the biggest saving for a fixed price and for a percentage. */
function formPack(promo: Promotion, free: Slot[]): Pack | null {
  let chosen: Slot[]
  if (promo.kind === 'basic') {
    chosen = free.filter((slot) => matches(promo, slot.unit)).slice(0, promo.quantity)
  } else {
    const inGroup = free.filter((slot) => promo.slugs.includes(slot.unit.slug))
    if (promo.quantity === promo.slugs.length) {
      // All the designs together: the dearest unit of each one.
      chosen = []
      for (const slug of promo.slugs) {
        const slot = inGroup.find((entry) => entry.unit.slug === slug)
        if (slot) chosen.push(slot)
      }
    } else {
      chosen = inGroup.slice(0, promo.quantity)
    }
  }
  if (chosen.length !== promo.quantity) return null
  const list = chosen.reduce((sum, slot) => sum + slot.unit.price, 0)
  const packPrice = promo.price ?? Math.round((list * (100 - (promo.percent ?? 0))) / 100)
  // A pack that costs the same or more than the units alone is ignored.
  if (!(packPrice >= 0) || packPrice >= list) return null
  return { chosen, list, packPrice }
}

/** How many more stickers would make a pack of this promotion, or 0 when none of the free ones
 *  counts toward it (or a pack would already be possible). */
function missingFor(promo: Promotion, free: Slot[]): number {
  if (promo.kind === 'basic') {
    const have = free.filter((slot) => matches(promo, slot.unit)).length
    return have > 0 && have < promo.quantity ? promo.quantity - have : 0
  }
  const inGroup = free.filter((slot) => promo.slugs.includes(slot.unit.slug))
  const have = promo.quantity === promo.slugs.length ? new Set(inGroup.map((slot) => slot.unit.slug)).size : inGroup.length
  return have > 0 && have < promo.quantity ? promo.quantity - have : 0
}

const MAX_HINT = 6
const HINTS = 2

/** The units of the order priced with the promotions. Deterministic. Each unit goes in at most ONE
 *  pack. Packs are built greedily, the biggest saving (list price of the units minus pack price)
 *  first, and the same promotion can apply many times. Equal savings go to the earlier promotion. */
export function applyPromotions(units: PromoUnit[], promos: Promotion[]): PromoOutcome {
  let free: Slot[] = units.map((unit, index) => ({ unit, index })).sort(byPrice)
  const applied = new Map<string, AppliedPack>()
  let discount = 0

  for (;;) {
    let best: { promo: Promotion; pack: Pack } | null = null
    for (const promo of promos) {
      const pack = formPack(promo, free)
      if (pack && (!best || pack.list - pack.packPrice > best.pack.list - best.pack.packPrice)) best = { promo, pack }
    }
    if (!best) break
    const taken = new Set(best.pack.chosen)
    free = free.filter((slot) => !taken.has(slot))
    discount += best.pack.list - best.pack.packPrice
    const id = `${best.promo.key}|${best.pack.packPrice}`
    const previous = applied.get(id)
    applied.set(id, { promo: best.promo, packPrice: best.pack.packPrice, times: (previous?.times ?? 0) + 1 })
  }

  // Hints: a promotion that has some free units toward it, and would save if the missing ones (priced
  // like the cheapest of those) were added. The nearest ones first.
  const hints: PromoOutcome['hints'] = []
  for (const promo of promos) {
    const missing = missingFor(promo, free)
    if (missing === 0 || missing > MAX_HINT) continue
    const counting = free.filter((slot) => (promo.kind === 'basic' ? matches(promo, slot.unit) : promo.slugs.includes(slot.unit.slug)))
    const cheapest = counting[counting.length - 1]
    const present = new Set(counting.map((slot) => slot.unit.slug))
    const slugs =
      promo.kind === 'special' && promo.quantity === promo.slugs.length
        ? promo.slugs.filter((slug) => !present.has(slug))
        : new Array<string>(missing).fill(cheapest.unit.slug)
    const extra: Slot[] = slugs.map((slug, offset) => ({ unit: { ...cheapest.unit, slug }, index: units.length + offset }))
    if (formPack(promo, [...free, ...extra].sort(byPrice))) hints.push({ promo, missing })
  }
  hints.sort((a, b) => a.missing - b.missing)

  return { applied: [...applied.values()], discount, hints: hints.slice(0, HINTS) }
}
