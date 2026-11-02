import type { ListingItem, TodayFilterGroup } from '../pages/today/todayItems'

// REQ-WEB-DOWNLOAD-001 — free downloads. SAMPLE DATA: the final files, formats, resolutions and the
// terms of use are still pending from the team. The three pieces below reuse placeholder brand art
// (public/images), so the preview and the file are the same picture and the resolution is the real
// size of that file, not a promise about wallpapers. Replace them with the approved files.
/** 'otro' is only for a kind the web does not know (read from the database); the sample has none. */
export type DownloadKind = 'celular' | 'computadora' | 'whatsapp' | 'otro'

export type DownloadItem = ListingItem & {
  type: DownloadKind
  /** Terms of use of the resource, when the team wrote them (connected only). */
  terms?: string
  /** Picture shown on the card. */
  preview: string
  /** Direct file to download: no account, no email. */
  file: string
  format: string
  resolution: string
}

export const downloadItems: DownloadItem[] = [
  {
    slug: 'ejemplo-celular',
    name: 'Recurso de ejemplo 1',
    kind: 'Fondo de celular',
    type: 'celular',
    preview: '/images/pando-camina.png',
    file: '/images/pando-camina.png',
    format: 'PNG',
    resolution: '277 × 442 px',
  },
  {
    slug: 'ejemplo-computadora',
    name: 'Recurso de ejemplo 2',
    kind: 'Fondo de computadora',
    type: 'computadora',
    preview: '/images/pando-sticker-wall.png',
    file: '/images/pando-sticker-wall.png',
    format: 'PNG',
    resolution: '455 × 606 px',
  },
  {
    slug: 'ejemplo-whatsapp',
    name: 'Recurso de ejemplo 3',
    kind: 'Sticker de WhatsApp',
    type: 'whatsapp',
    preview: '/images/pando-zapatilla.png',
    file: '/images/pando-zapatilla.png',
    format: 'PNG',
    resolution: '204 × 282 px',
  },
]

export const downloadFilterGroups: TodayFilterGroup<DownloadItem>[] = [
  {
    key: 'tipo',
    label: 'Tipo',
    options: [
      { key: 'celular', label: 'Fondos de celular' },
      { key: 'computadora', label: 'Fondos de computadora' },
      { key: 'whatsapp', label: 'Stickers de WhatsApp' },
    ],
    pick: (item) => [item.type],
  },
]
