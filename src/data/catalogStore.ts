import { useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { catalogFamilies, catalogFilterGroups, catalogItems, catalogTopics } from '../pages/catalog/catalogItems'
import { featuredItems as sampleFeatured } from '../pages/home/featuredItems'
import {
  buildCatalog,
  mapSlots,
  type CatalogData,
  type CatalogRows,
  type DeliverySlot,
  type ImageRow,
  type NamedRow,
  type ProductRow,
  type SizeRow,
  type SlotRow,
  type TopicRow,
  type VariantRow,
} from './catalogMapper'
import { mapPromotions, type PromoRow, type Promotion } from './promotions'

// REQ-WEB-BASE-005. The one place that reads the public catalog. Connected (the Supabase variables
// are set), it reads the public views once (products, variants, topics, delivery windows and the
// pack promotions) and keeps the result here; without them it serves the sample data and nothing is
// requested, so the site works exactly as before. The HOY event and the downloads are NOT kept here:
// they change on their own clock and are read when their page opens (useToday, useDownloads).
// Components read it with
// `useCatalog()`; plain functions (the order's prices, the lookups of the product page) read the
// current value with `getCatalog()`. The layout of the Home's featured wall is the sample's: only
// the pieces change.
export const isConnected = supabase !== null

export type CatalogLoad = 'loading' | 'error' | 'ready'
export type CatalogSnapshot = CatalogData & { status: CatalogLoad; slots: DeliverySlot[]; promotions: Promotion[] }

const EMPTY: CatalogSnapshot = {
  status: 'loading',
  promotions: [],
  items: [],
  topics: [],
  families: [],
  filterGroups: [],
  featured: [],
  variantsBySlug: new Map(),
  variantsByLine: new Map(),
  fullImages: new Map(),
  slots: [],
}

const SAMPLE: CatalogSnapshot = {
  ...EMPTY,
  status: 'ready',
  items: catalogItems,
  topics: catalogTopics,
  families: catalogFamilies,
  filterGroups: catalogFilterGroups,
  // A featured piece that is no longer in the catalog is left out, so the Home never links to a page
  // that does not exist (REQ-WEB-HOME-011).
  featured: sampleFeatured.filter((item) => catalogItems.some((entry) => entry.slug === item.slug)),
}

let snapshot: CatalogSnapshot = supabase ? EMPTY : SAMPLE
const listeners = new Set<() => void>()

function publish(next: CatalogSnapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The catalog as it is now. */
export const getCatalog = () => snapshot

export function useCatalog(): CatalogSnapshot {
  return useSyncExternalStore(subscribe, getCatalog, getCatalog)
}

// PostgREST caps a response (1000 rows by default), so the big views are read page by page, in a
// fixed order so no row is skipped or repeated between pages.
const PAGE = 1000

export async function readAll<T>(client: SupabaseClient, view: string, order: string[]): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    let query = client.from(view).select('*')
    for (const column of order) query = query.order(column)
    const { data, error } = await query.range(from, from + PAGE - 1)
    if (error) throw error
    const page = (data ?? []) as T[]
    rows.push(...page)
    if (page.length < PAGE) return rows
  }
}

async function fetchCatalog(client: SupabaseClient) {
  const [products, images, variants, topics, sizes, materials, finishes, slots, promotions] = await Promise.all([
    readAll<ProductRow>(client, 'public_products', ['slug']),
    readAll<ImageRow>(client, 'public_product_images', ['product_slug', 'sort_order', 'storage_path']),
    readAll<VariantRow>(client, 'public_variants', ['product_slug', 'material_code', 'finish_code', 'size_code']),
    readAll<TopicRow>(client, 'public_topics', ['slug']),
    readAll<SizeRow>(client, 'public_sizes', ['code']),
    readAll<NamedRow>(client, 'public_materials', ['code']),
    readAll<NamedRow>(client, 'public_finishes', ['code']),
    // The windows are a nicety: if they cannot be read the catalog still loads, with none offered.
    readAll<SlotRow>(client, 'public_delivery_slots', ['slot_date', 'starts_at']).catch(() => [] as SlotRow[]),
    // Same for the promotions: without them the total is the plain sum of the prices, an estimate.
    readAll<PromoRow>(client, 'public_promotions', ['sort_order', 'name']).catch(() => [] as PromoRow[]),
  ])
  const rows: CatalogRows = { products, images, variants, topics, sizes, materials, finishes }
  const imageUrl = (path: string) => client.storage.from('product-images').getPublicUrl(path).data.publicUrl
  return { ...buildCatalog(rows, imageUrl, sampleFeatured), slots: mapSlots(slots), promotions: mapPromotions(promotions) }
}

let loading = false

/** Reads the catalog from Supabase. Does nothing without the variables, or while a read is going. */
export function loadCatalog() {
  if (!supabase || loading) return
  loading = true
  const client = supabase
  fetchCatalog(client)
    .then((data) => publish({ ...data, status: 'ready' }))
    .catch(() => publish({ ...EMPTY, status: 'error' }))
    .finally(() => {
      loading = false
    })
}

/** "Probar de nuevo": goes back to loading and reads again. */
export function reloadCatalog() {
  if (!supabase || loading) return
  publish({ ...EMPTY, status: 'loading' })
  loadCatalog()
}

if (typeof window !== 'undefined') loadCatalog()
