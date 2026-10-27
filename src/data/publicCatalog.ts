// REQ-WEB-BASE-005 — the public data source of the site. PARTIAL: the contract is here, the
// connection to Supabase is not (it waits for the data model of the internal panel, REQs-PI).
//
// RULE: a page, a component or a hook reads products, variants, promotions, delivery slots, the
// HOY event and the featured pieces ONLY from this file. Today the values come from the sample
// files next to it (and under pages/catalog, pages/today and pages/home); when the model is
// approved, this is the one file that changes, to read the public views of Supabase instead.
//
// WHAT IS PUBLIC: only what a visitor may see. There is no stock, no cost, no SKU, no supplier and
// no internal note in any type below, and the check at the end of this file fails the build if one
// is added to a product. Availability is shown to people only in words ("disponible para
// confirmar", "a pedido"), never as a number. The WhatsApp number lives in config/site.ts.
import { catalogItems } from '../pages/catalog/catalogItems'
import { featuredItems as allFeaturedItems } from '../pages/home/featuredItems'
import type { TodayItem } from '../pages/today/todayItems'

export {
  catalogFamilies,
  catalogFilterGroups,
  catalogItems,
  catalogSearchText,
  catalogTopics,
  lineKey,
  materials,
  sizes,
  variantPrice,
} from '../pages/catalog/catalogItems'
export type { CatalogFamily, CatalogItem, CatalogTopic, Variant } from '../pages/catalog/catalogItems'

/** The featured pieces that are in the catalog: one that is no longer there is left out, so the Home
 *  never links to a page that does not exist (REQ-WEB-HOME-011). */
export const featuredItems = allFeaturedItems.filter((item) => catalogItems.some((entry) => entry.slug === item.slug))
export type { FeaturedItem, StickerSpot } from '../pages/home/featuredItems'

export { todayEvent, todayFilterGroups, todayItems } from '../pages/today/todayItems'
export type {
  TodayFilterGroup,
  TodayFilterOption,
  TodayItem,
  TodayStatus,
  TodayTone,
} from '../pages/today/todayItems'

export { availabilityOf } from './sampleAvailability'
export type { Availability } from './sampleAvailability'
export { downloadFilterGroups, downloadItems } from './sampleDownloads'
export type { DownloadItem, DownloadKind } from './sampleDownloads'
export { stickerUses } from './sampleUses'
export { promoGroups } from './samplePromos'
export type { Pack, PromoGroup } from './samplePromos'

/** A delivery window the team offers (REQ-WEB-CART-004). Only the ones that are active and public
 *  are returned. SAMPLE: placeholder windows until the panel publishes the real ones; with none, the
 *  cart offers WhatsApp instead of promising a delivery. */
export type DeliverySlot = { id: string; label: string }
export const deliverySlots: DeliverySlot[] = [
  { id: 'ejemplo-1', label: 'Franja de ejemplo 1 (a definir)' },
  { id: 'ejemplo-2', label: 'Franja de ejemplo 2 (a definir)' },
  { id: 'ejemplo-3', label: 'Franja de ejemplo 3 (a definir)' },
]

// Compile-time guard: if a product ever gets an internal field, this stops being `never` and the
// type check fails.
type InternalField = 'stock' | 'cost' | 'sku' | 'supplier' | 'notes' | 'internal'
type MustBeNever<T extends never> = T
export type NoInternalFieldsOnProducts = MustBeNever<Extract<keyof TodayItem, InternalField>>
