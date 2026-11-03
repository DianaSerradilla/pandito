import { asset } from '../../lib/asset'
import type { TodayFilterGroup, TodayItem, TodayTone } from '../today/todayItems'

// REQ-WEB-CATALOG-*. SAMPLE DATA: the real catalog comes from the internal panel (Supabase) later.
// The families and topics below are PLACEHOLDERS to test how a big list of topics behaves; grouping
// them is a curation decision for the team, not for the code. Today the catalog only has stickers;
// when posters arrive each product type brings its own short list of filters (the type is the
// first level, the topics and the rest are the second one).

export type CatalogTopic = {
  key: string
  label: string
  /** Key of its family (see `catalogFamilies`). */
  family: string
  /** Shown first, before "Ver todos los temas". */
  popular?: boolean
}

export type CatalogFamily = { key: string; label: string }

export type CatalogItem = TodayItem & { topics: string[] }

export const catalogFamilies: CatalogFamily[] = [
  { key: 'deportes', label: 'Deportes' },
  { key: 'animales', label: 'Animales' },
  { key: 'musica', label: 'Música' },
  { key: 'mendoza', label: 'Mendoza' },
  { key: 'cotidiano', label: 'Cotidiano' },
]

export const catalogTopics: CatalogTopic[] = [
  { key: 'futbol', label: 'Fútbol', family: 'deportes', popular: true },
  { key: 'basquet', label: 'Básquet', family: 'deportes' },
  { key: 'running', label: 'Running', family: 'deportes' },
  { key: 'ciclismo', label: 'Ciclismo', family: 'deportes' },
  { key: 'gatos', label: 'Gatos', family: 'animales', popular: true },
  { key: 'perros', label: 'Perros', family: 'animales', popular: true },
  { key: 'aves', label: 'Aves', family: 'animales' },
  { key: 'rock', label: 'Rock', family: 'musica', popular: true },
  { key: 'cumbia', label: 'Cumbia', family: 'musica' },
  { key: 'vinilos', label: 'Vinilos', family: 'musica' },
  { key: 'vino', label: 'Vino', family: 'mendoza', popular: true },
  { key: 'montana', label: 'Montaña', family: 'mendoza', popular: true },
  { key: 'cafe', label: 'Café', family: 'cotidiano' },
  { key: 'mate', label: 'Mate', family: 'cotidiano', popular: true },
  { key: 'plantas', label: 'Plantas', family: 'cotidiano' },
]

// Every sticker comes in every material and size (PLACEHOLDERS: the real options and prices are
// the team's to confirm). The price of a variant is the size's price plus the material's extra, and
// the listing shows the lowest one as "desde".
export type Variant = { key: string; label: string }
/** `cm` is the longest side of the sticker. PLACEHOLDER measures until the team gives the exact ones. */
export const sizes: (Variant & { price: number; cm: number })[] = [
  { key: 'chico', label: 'Chico', cm: 5, price: 1000 },
  { key: 'mediano', label: 'Mediano', cm: 8, price: 1250 },
  { key: 'grande', label: 'Grande', cm: 10, price: 1500 },
]

/** A line of the order: the piece's slug, then its material and size. */
export const lineKey = (slug: string, material: string, size: string) => `${slug}|${material}|${size}`
export const materials: (Variant & { extra: number; note: string })[] = [
  { key: 'mate', label: 'Vinilo mate', extra: 0, note: 'Sin brillo, tacto suave.' },
  { key: 'brillante', label: 'Vinilo brillante', extra: 200, note: 'Colores más vivos.' },
  { key: 'holografico', label: 'Holográfico', extra: 600, note: 'Cambia con la luz.' },
]
export const variantPrice = (materialKey: string, sizeKey: string) =>
  (sizes.find((size) => size.key === sizeKey)?.price ?? 0) +
  (materials.find((material) => material.key === materialKey)?.extra ?? 0)

export const catalogFilterGroups: TodayFilterGroup<CatalogItem>[] = [
  {
    key: 'tema',
    label: 'Tema',
    options: catalogTopics.map(({ key, label }) => ({ key, label })),
    pick: (item) => item.topics,
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

// PLACEHOLDER art: the brand pieces repeated under different names and topics.
const art = [
  { image: asset('/stickers/isotipo-disc.svg'), cut: false },
  { image: asset('/stickers/star-eye.svg'), cut: false },
  { image: asset('/stickers/logotipo-label.svg'), cut: false },
  { image: asset('/brand/pando.svg'), cut: true },
  { image: asset('/brand/pando-mano-senalar.svg'), cut: true },
  { image: asset('/images/pando-camina.png'), cut: true },
  { image: asset('/images/pando-camara.png'), cut: true },
  { image: asset('/images/pando-zapatilla.png'), cut: true },
]
const tones: TodayTone[] = ['naranja', 'azul', 'amarillo', 'tinta']

// [name, topics] for each sample sticker; art, color and size rotate.
const samples: [string, string[]][] = [
  ['Gol de Pando', ['futbol']],
  ['Hincha', ['futbol']],
  ['Tribuna', ['futbol', 'rock']],
  ['Triple', ['basquet']],
  ['Kilómetro 10', ['running']],
  ['Pedal', ['ciclismo', 'montana']],
  ['Bici roja', ['ciclismo']],
  ['Gato de techo', ['gatos']],
  ['Siesta', ['gatos']],
  ['Bigotes', ['gatos', 'cafe']],
  ['Perro de plaza', ['perros']],
  ['Cola feliz', ['perros']],
  ['Paseo', ['perros', 'running']],
  ['Pájaro cantor', ['aves']],
  ['Cóndor', ['aves', 'montana']],
  ['Guitarra', ['rock']],
  ['Volumen 11', ['rock']],
  ['Cumbia nena', ['cumbia']],
  ['Baile', ['cumbia']],
  ['Disco girando', ['vinilos']],
  ['Lado B', ['vinilos', 'rock']],
  ['Malbec', ['vino']],
  ['Vendimia', ['vino', 'montana']],
  ['Copa llena', ['vino']],
  ['Cordillera', ['montana']],
  ['Aconcagua', ['montana']],
  ['Nieve', ['montana']],
  ['Cafecito', ['cafe']],
  ['Taza de lunes', ['cafe']],
  ['Mate amargo', ['mate']],
  ['Termo y mate', ['mate']],
  ['Ronda de mate', ['mate', 'perros']],
  ['Monstera', ['plantas']],
  ['Maceta', ['plantas']],
  ['Cactus', ['plantas', 'montana']],
  ['Regadera', ['plantas']],
  ['Pando en casa', ['cafe', 'plantas']],
  ['Pando mateando', ['mate', 'gatos']],
  ['Pando hincha', ['futbol']],
  ['Pando en bici', ['ciclismo']],
  ['Pando vendimia', ['vino']],
  ['Pando rockero', ['rock', 'vinilos']],
  ['Pando corre', ['running']],
  ['Pando y su gato', ['gatos']],
]

export const catalogItems: CatalogItem[] = samples.map(([name, topics], index) => {
  const piece = art[index % art.length]
  return {
    slug: `cat-${String(index + 1).padStart(2, '0')}`,
    name,
    kind: 'Sticker',
    tags: ['stickers'],
    image: piece.image,
    cut: piece.cut,
    tone: tones[(index + Math.floor(index / art.length)) % tones.length],
    price: variantPrice(materials[0].key, sizes[0].key),
    hasVariants: true,
    defaultOrder: {
      line: lineKey(`cat-${String(index + 1).padStart(2, '0')}`, materials[0].key, sizes[0].key),
      options: `${materials[0].label}, ${sizes[0].cm} cm`,
    },
    topics,
  }
})

/** Topic labels, so the search also finds "gatos" in a piece called "Siesta". */
export const catalogSearchText = (item: CatalogItem) =>
  item.topics.map((key) => catalogTopics.find((topic) => topic.key === key)?.label ?? '').join(' ')
