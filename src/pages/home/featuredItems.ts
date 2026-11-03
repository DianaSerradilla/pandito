import { asset } from '../../lib/asset'
export type StickerSpot = {
  /** Center of the sticker, in % of the photo box. */
  x: number
  y: number
  /** Width, in % of the photo box width. */
  width: number
}

export type FeaturedItem = {
  slug: string
  name: string
  /** Transparent image of the die-cut sticker (the border, if any, is part of the image). */
  image: string
  /** Shown on the label that appears on hover, if set. Left out until the team approves prices. */
  price?: string
  /** Add a cream die-cut border with CSS, for images that do not carry their own. */
  cut?: boolean
  /** Where it lands on mobile (the photo box is 4:5 there). */
  x: number
  y: number
  width: number
  /** Where it lands on desktop (the photo box is wide, two thirds of the screen). */
  desktop: StickerSpot
  /** Final tilt in degrees. */
  rotate: number
  /** Where it comes from before sticking (px, relative to its final spot) and how much it spins. */
  from: { x: number; y: number; spin: number }
}

// PLACEHOLDER stickers made from brand pieces (public/stickers and public/brand). The team replaces
// `image` with the real designs: PNG or SVG with a transparent background. If the file already has
// its white die-cut border baked in, leave `cut` off; otherwise set `cut: true`.
// The order is the order in which they stick while scrolling: the last one lands on top.
// Positions are set for the laptop photo (public/images/featured-laptop.jpg): they land on the
// palm rest. With another photo, move them with x, y and width (mobile) and `desktop` (desktop).
// Keep them inside the laptop: up to about 87% across and, on desktop, between 25% and 90% down.
export const featuredItems: FeaturedItem[] = [
  {
    slug: 'cat-01',
    name: 'Sticker isotipo',
    image: asset('/stickers/isotipo-disc.svg'),
    x: 76,
    y: 22,
    width: 23,
    desktop: { x: 74, y: 38, width: 21 },
    rotate: -8,
    from: { x: 90, y: -70, spin: 28 },
  },
  {
    slug: 'cat-02',
    name: 'Sticker Pando',
    image: asset('/brand/pando.svg'),
    cut: true,
    x: 52,
    y: 47,
    width: 18,
    desktop: { x: 52, y: 67, width: 15 },
    rotate: 4,
    from: { x: -100, y: -40, spin: -24 },
  },
  {
    slug: 'cat-03',
    name: 'Sticker logotipo',
    image: asset('/stickers/logotipo-label.svg'),
    x: 66,
    y: 62,
    width: 40,
    desktop: { x: 72, y: 76, width: 33 },
    rotate: -8,
    from: { x: 100, y: 70, spin: 20 },
  },
  {
    slug: 'cat-04',
    name: 'Sticker ojo',
    image: asset('/stickers/star-eye.svg'),
    x: 54,
    y: 24,
    width: 21,
    desktop: { x: 52, y: 36, width: 19 },
    rotate: 12,
    from: { x: -30, y: -100, spin: -30 },
  },
  {
    slug: 'cat-05',
    name: 'Sticker mano',
    image: asset('/brand/pando-mano-senalar.svg'),
    cut: true,
    x: 80,
    y: 43,
    width: 11,
    desktop: { x: 83, y: 52, width: 9.5 },
    rotate: 14,
    from: { x: 60, y: 90, spin: 26 },
  },
]
