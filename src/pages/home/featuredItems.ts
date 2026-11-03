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
  /** Where it lands on desktop (the photo box is a square there). */
  desktop: StickerSpot
  /** Final tilt in degrees. */
  rotate: number
  /** Where it comes from before sticking (px, relative to its final spot) and how much it spins. */
  from: { x: number; y: number; spin: number }
}

// The team's own designs (public/images/destacados), placed on the notebook photo
// (public/images/featured-notebook.webp, square): they land on the flat metal of the palm rest and
// the trackpad. Four carry their own white die-cut border, so `cut` stays off for them; the cats
// are a plain rectangle, so `cut` adds the cream border with CSS. The order is the order in which
// they stick while scrolling: the last one lands on top.
// Desktop: the box is the whole photo, so x, y and width are % of the photo. Mobile: the box is 4:5
// and trims a tenth of the photo on each side, so x is (photo x - 10) / 0.8 and width is the desktop
// width / 0.8; the top of the box fades into the dark background, so the stickers sit a bit lower.
// The spots were computed so no two stickers touch (at least ~1.4% of the photo apart), all stay
// inside the metal and visible on mobile. `rotate` is the tilt inside the plane of the notebook (see
// PLANE in FeaturedStack): the stickers also follow the angle of the notebook. If you change the
// size of a sticker, check again that it does not touch its neighbors.
// The names are PROVISIONAL: they only show on hover until the real pieces come from the catalog.
export const featuredItems: FeaturedItem[] = [
  {
    slug: 'destacado-caramelo',
    name: 'Caramelo calavera',
    image: asset('/images/destacados/r571.png'),
    x: 59.5,
    y: 70.8,
    width: 26.6,
    desktop: { x: 57.6, y: 70.8, width: 21.3 },
    rotate: -6,
    from: { x: -90, y: -60, spin: -26 },
  },
  {
    slug: 'destacado-rostro',
    name: 'Rostro con velo',
    image: asset('/images/destacados/r551.png'),
    x: 35.7,
    y: 58.5,
    width: 16.8,
    desktop: { x: 38.5, y: 58.5, width: 13.4 },
    rotate: 8,
    from: { x: 90, y: -70, spin: 28 },
  },
  {
    slug: 'destacado-gatos',
    name: 'Gatos',
    image: asset('/images/destacados/r261.png'),
    cut: true,
    x: 49,
    y: 45.7,
    width: 21,
    desktop: { x: 49.2, y: 45.7, width: 16.8 },
    rotate: 5,
    from: { x: -100, y: 70, spin: -20 },
  },
  {
    slug: 'destacado-mano',
    name: 'Mano esqueleto',
    image: asset('/images/destacados/r71.png'),
    x: 78.6,
    y: 44.2,
    width: 12.6,
    desktop: { x: 72.9, y: 44.2, width: 10.1 },
    rotate: -10,
    from: { x: 60, y: 90, spin: 26 },
  },
  {
    slug: 'destacado-libertad',
    name: 'Libertad calavera',
    image: asset('/images/destacados/r501.png'),
    x: 75.6,
    y: 57.3,
    width: 19.6,
    desktop: { x: 70.5, y: 57.3, width: 15.7 },
    rotate: -7,
    from: { x: 100, y: 70, spin: 20 },
  },
]
