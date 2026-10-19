import { Link } from 'react-router'
import type { FeaturedItem } from './featuredItems'

// One featured sticker: just the die-cut shape, no frame or rectangle behind it.
export function FeaturedCard({ item }: { item: FeaturedItem }) {
  return (
    <Link
      to={`/catalogo/${item.slug}`}
      aria-label={`Ver ${item.name}`}
      className="block w-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-amarillo focus-visible:outline-offset-4"
    >
      <img
        src={item.image}
        alt=""
        draggable={false}
        className={`block h-auto w-full select-none ${item.cut ? 'die-cut-thick' : ''}`}
      />
    </Link>
  )
}
