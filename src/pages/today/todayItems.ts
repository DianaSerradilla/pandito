// REQ-WEB-HOY-001..004. SAMPLE DATA: the real event and its products come from the internal panel
// (Supabase) later, and HOY must show only what belongs to the active event. Until then this file
// stands in for it, so the page can be designed and tested.

export type TodayStatus = 'active' | 'inactive' | 'expired' | 'empty'

/** The event that is on today. `status` decides which state the page shows (HOY-004). */
export const todayEvent: { status: TodayStatus; name: string; context: string } = {
  status: 'active',
  // PROVISIONAL COPY, to be replaced by the event's own name and context.
  name: 'Evento de ejemplo',
  context: 'Lugar y horario a confirmar.',
}

export type TodayTone = 'azul' | 'naranja' | 'amarillo' | 'tinta'

export type TodayItem = {
  slug: string
  name: string
  /** Small line under the name (what it is). */
  kind: string
  /** Categories it belongs to (see `todayFilterGroups`). */
  tags: string[]
  /** Transparent image of the piece; the colored tile behind it is `tone`. */
  image: string
  /** Add a cream die-cut border with CSS, for artwork that has none of its own. */
  cut?: boolean
  tone: TodayTone
  /** Price in pesos. SAMPLE VALUES: the real prices come from the internal panel and still need the
   *  team's approval; never publish these. */
  price: number
  /** A short description of the piece. Optional: while it is missing, the page says nothing about it
   *  beyond its name and topics (nothing is invented). */
  description?: string
  /** Surfaces it is suggested for. Optional: it falls back to the general list (data/sampleUses.ts). */
  uses?: string[]
  /** It comes in several materials and sizes: the price is "desde", and it is bought from its own
   *  page, where the options are chosen. */
  hasVariants?: boolean
  /** What "Agregar" puts in the order for a piece with options: its first material and size. The
   *  card says which, and the piece's own page is where the others are chosen. */
  defaultOrder?: { line: string; options: string }
}

export type TodayFilterOption = { key: string; label: string }

/** A list of options in the filter column (e.g. Categoría). Several can be picked inside a group
 *  (any of them); the groups combine (all of them), as in any online shop. */
export type TodayFilterGroup<T extends TodayItem = TodayItem> = {
  key: string
  label: string
  options: TodayFilterOption[]
  /** Which of this group's option keys an item has. */
  pick: (item: T) => string[]
}

// PLACEHOLDER FILTERS: the team has not decided what goes in the filter column yet. Add, remove or
// rename groups and options here; the column, the mobile sheet, the counters and the chips adapt.
export const todayFilterGroups: TodayFilterGroup[] = [
  {
    key: 'categoria',
    label: 'Categoría',
    options: [
      { key: 'stickers', label: 'Stickers' },
      { key: 'termos', label: 'Termos' },
      { key: 'packs', label: 'Packs' },
    ],
    pick: (item) => item.tags,
  },
  {
    key: 'color',
    label: 'Color',
    options: [
      { key: 'azul', label: 'Azul' },
      { key: 'naranja', label: 'Naranja' },
      { key: 'amarillo', label: 'Amarillo' },
      { key: 'tinta', label: 'Negro' },
    ],
    pick: (item) => [item.tone],
  },
]

// PLACEHOLDER pieces made from brand art (public/stickers, public/brand and public/images).
export const todayItems: TodayItem[] = [
  { slug: 'hoy-01', name: 'Isotipo', kind: 'Sticker', tags: ['stickers'], image: '/stickers/isotipo-disc.svg', tone: 'naranja', price: 1500 },
  { slug: 'hoy-02', name: 'Ojo', kind: 'Sticker', tags: ['stickers'], image: '/stickers/star-eye.svg', tone: 'azul', price: 1500 },
  { slug: 'hoy-03', name: 'Pando', kind: 'Sticker', tags: ['stickers', 'packs'], image: '/brand/pando.svg', cut: true, tone: 'amarillo', price: 1500 },
  { slug: 'hoy-04', name: 'Logotipo', kind: 'Sticker grande', tags: ['stickers'], image: '/stickers/logotipo-label.svg', tone: 'tinta', price: 2500 },
  { slug: 'hoy-05', name: 'De compras', kind: 'Termo', tags: ['termos'], image: '/images/pando-camina.png', tone: 'azul', price: 9000 },
  { slug: 'hoy-06', name: 'Clic', kind: 'Pack de 3', tags: ['packs'], image: '/images/pando-camara.png', tone: 'naranja', price: 3500 },
  { slug: 'hoy-07', name: 'Señalar', kind: 'Sticker', tags: ['stickers'], image: '/brand/pando-mano-senalar.svg', cut: true, tone: 'tinta', price: 1500 },
  { slug: 'hoy-08', name: 'Zapatilla', kind: 'Termo', tags: ['termos'], image: '/images/pando-zapatilla.png', tone: 'amarillo', price: 9000 },
  { slug: 'hoy-09', name: 'Todos juntos', kind: 'Pack de 5', tags: ['packs', 'stickers'], image: '/stickers/isotipo-disc.svg', tone: 'azul', price: 5500 },
  { slug: 'hoy-10', name: 'Isotipo azul', kind: 'Sticker', tags: ['stickers'], image: '/stickers/isotipo-disc.svg', tone: 'azul', price: 1500 },
  { slug: 'hoy-11', name: 'Ojo naranja', kind: 'Sticker', tags: ['stickers'], image: '/stickers/star-eye.svg', tone: 'naranja', price: 1500 },
  { slug: 'hoy-12', name: 'Pando tinta', kind: 'Sticker', tags: ['stickers', 'packs'], image: '/brand/pando.svg', cut: true, tone: 'tinta', price: 1500 },
  { slug: 'hoy-13', name: 'Logotipo azul', kind: 'Sticker grande', tags: ['stickers'], image: '/stickers/logotipo-label.svg', tone: 'azul', price: 2500 },
  { slug: 'hoy-14', name: 'De compras 2', kind: 'Termo', tags: ['termos'], image: '/images/pando-camina.png', tone: 'amarillo', price: 9000 },
  { slug: 'hoy-15', name: 'Clic 2', kind: 'Pack de 3', tags: ['packs'], image: '/images/pando-camara.png', tone: 'tinta', price: 3500 },
]

/** "$ 1.500", the way prices are written in Argentina. */
export const formatPrice = (pesos: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(pesos)
