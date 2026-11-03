import { navLabels, paths } from '../paths'
import type { PageMeta } from '../lib/pageMeta'

// REQ-WEB-QUALITY-002. One unique title and description per public route. PROVISIONAL COPY: it only
// says what each page is, with no commercial or local claim (no shipping, city, quality or price
// promise), until the team approves its SEO copy. The product page builds its own from the sticker.
const brand = 'Pandito'

export const pageTitle = (name: string) => `${name} | ${brand}`

export const routeMeta: Record<string, PageMeta> = {
  [paths.home]: {
    title: 'Pandito Stickers',
    description: 'Soy Pando y esto es mi estudio. Stickers originales y de mansa calidad.',
  },
  [paths.about]: {
    title: pageTitle(navLabels.about),
    description: 'Quién es Pando y qué hace Pandito: pensar, diseñar y elegir cada sticker.',
  },
  [paths.catalog]: {
    title: pageTitle(navLabels.catalog),
    description: 'Todos los stickers de Pandito. Filtrá por tema, elegí tamaño y material y sumalos a tu pedido.',
  },
  [paths.today]: {
    title: pageTitle(navLabels.today),
    description: 'Los stickers del evento de hoy, para pedir desde tu celular.',
  },
  [paths.howToBuy]: {
    title: pageTitle(navLabels.howToBuy),
    description: 'Cómo pedir en Pandito: elegís tus stickers, armás el pedido y lo mandás por WhatsApp.',
  },
  [paths.downloads]: {
    title: pageTitle(navLabels.downloads),
    description: 'Fondos de pantalla y stickers de Pandito para bajar gratis, sin cuenta. Para uso personal.',
  },
  [paths.cart]: {
    title: pageTitle(navLabels.cart),
    description: 'Tu pedido de stickers antes de enviarlo por WhatsApp.',
    noindex: true,
  },
}
