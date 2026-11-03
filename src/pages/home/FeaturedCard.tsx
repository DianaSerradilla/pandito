import { Link } from 'react-router'
import { SafeImage } from '../../components/ui/SafeImage'
import { getCatalog, type FeaturedItem } from '../../data/publicCatalog'
import { paths } from '../../paths'

// One featured sticker: just the die-cut shape, no frame or rectangle behind it.
export function FeaturedCard({ item }: { item: FeaturedItem }) {
  return (
    <Link
      to={getCatalog().items.some((entry) => entry.slug === item.slug) ? `/catalogo/${item.slug}` : paths.catalog}
      aria-label={`Ver ${item.name}`}
      className="block w-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-amarillo focus-visible:outline-offset-4"
    >
      <SafeImage
        loading="lazy"
        decoding="async"
        src={item.image}
        alt=""
        draggable={false}
        fallback={
          <span className="grid aspect-square w-full place-items-center rounded-ui border-[1.5px] border-dashed border-crema/70 p-2 text-center font-display text-sm uppercase leading-none text-crema">
            {item.name}
          </span>
        }
        className={`block h-auto w-full select-none ${item.cut ? 'die-cut-thick' : ''}`}
      />
    </Link>
  )
}
