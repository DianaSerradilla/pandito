// REQ-WEB-BASE-005 — the public data source of the site. When the Supabase variables are set, the
// public views are read: the catalog, the variants with their prices, the delivery windows and the
// pack promotions once, with the catalog (catalogStore.ts); the HOY event and its pieces each time
// the HOY page opens (useToday.ts); the downloads each time the Downloads page opens
// (useDownloads.ts). Without the variables everything below is the sample data and nothing is
// requested. The Home's wall keeps the sample's layout; only its pieces come from the database.
//
// RULE: a page, a component or a hook reads products, variants, promotions, delivery slots, the
// HOY event and the featured pieces ONLY from this file.
//
// WHAT IS PUBLIC: only what a visitor may see. There is no stock, no cost, no SKU, no supplier and
// no internal note in any type below, and the check at the end of this file fails the build if one
// is added to a product. Availability is shown to people only in words ("disponible para
// confirmar", "a pedido"), never as a number. The WhatsApp number lives in config/site.ts.
import { promoGroups as samplePromoGroups, type PromoGroup } from './samplePromos'
import { getCatalog, isConnected, useCatalog } from './catalogStore'
import type { CatalogItem } from '../pages/catalog/catalogItems'
import type { TodayItem } from '../pages/today/todayItems'

// The catalog is a value that changes once it loads: read it with the hook (components) or the
// getter (plain functions), never as a constant.
export { getCatalog, isConnected, loadCatalog, reloadCatalog, useCatalog } from './catalogStore'
export type { CatalogSnapshot } from './catalogStore'
export type { StoreVariant } from './catalogMapper'

// SAMPLE-only helpers: the options and prices of the sample catalog. Connected, the options and
// prices of a piece come from its variants (see product/productData.ts).
export { lineKey, materials, sizes, variantPrice } from '../pages/catalog/catalogItems'
export type { CatalogFamily, CatalogItem, CatalogTopic, Variant } from '../pages/catalog/catalogItems'

/** Topic labels, so the search also finds "gatos" in a piece called "Siesta". */
export const catalogSearchText = (item: CatalogItem) => {
  const { topics } = getCatalog()
  return item.topics.map((key) => topics.find((topic) => topic.key === key)?.label ?? '').join(' ')
}

/** The pieces on the Home's wall. Connected: the featured ones of the database (none while it loads
 *  or if there are none, and then the Home leaves the section out). */
export const useFeaturedItems = () => useCatalog().featured
export type { FeaturedItem, StickerSpot } from '../pages/home/featuredItems'

// SAMPLE HOY (without Supabase). Connected, the page reads the event with `useToday`.
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
// SAMPLE downloads (without Supabase). Connected, the page reads them with `useDownloads`.
export { downloadFilterGroups, downloadItems } from './sampleDownloads'
export type { DownloadItem, DownloadKind } from './sampleDownloads'
export { stickerUses } from './sampleUses'
export type { Pack, PromoGroup } from './samplePromos'

/** SAMPLE pack promotions (PROTOTYPE), by size group. Connected there are none here: the promotions
 *  of the database live in the catalog snapshot (`useCatalog().promotions`) and are priced by
 *  product/promos.ts. The server does not apply them: the total is an estimate the team confirms. */
export const promoGroups: PromoGroup[] = isConnected ? [] : samplePromoGroups

/** A delivery window the team offers (REQ-WEB-CART-004). Only the ones that are active and public
 *  are returned. Connected they come from `useDeliverySlots`; these are the SAMPLE windows used
 *  without Supabase. With none, the cart offers WhatsApp instead of promising a delivery. */
export type { DeliverySlot } from './catalogMapper'
export const deliverySlots: { id: string; label: string }[] = [
  { id: 'ejemplo-1', label: 'Franja de ejemplo 1 (a definir)' },
  { id: 'ejemplo-2', label: 'Franja de ejemplo 2 (a definir)' },
  { id: 'ejemplo-3', label: 'Franja de ejemplo 3 (a definir)' },
]

// Compile-time guard: if a product ever gets an internal field, this stops being `never` and the
// type check fails.
type InternalField = 'stock' | 'cost' | 'sku' | 'supplier' | 'notes' | 'internal'
type MustBeNever<T extends never> = T
export type NoInternalFieldsOnProducts = MustBeNever<Extract<keyof TodayItem, InternalField>>
