import { Link } from 'react-router'
import { OrderControl } from '../shop/OrderControl'
import { tones } from './tones'
import { formatPrice, type TodayItem } from './todayItems'

// A product of the event's catalog, laid out like a shop listing: a picture that links to the piece,
// its name and kind, the price, and the control to add it to the order. A piece with options
// (material, size) is added with its first ones, and the card says which; the others are chosen on
// its own page. The
// link and the order controls are siblings (never a button inside a link), every control is at
// least 44 px tall, and each one says which piece it is about, since a screen reader hears them
// out of context.
type Props = {
  item: TodayItem
  index: number
  compact?: boolean
  /** Just the sticker on the page: no frame, no colored tile (the Catalog). */
  clean?: boolean
  /** Sends a sentence to the page's live region, so the change is heard. */
  onAnnounce: (text: string) => void
}

export function TodayCard({ item, index, compact = false, clean = false, onAnnounce }: Props) {
  const href = `/catalogo/${item.slug}`
  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className={`today-card flex h-full flex-col ${clean ? '' : 'rounded-ui border-[1.5px] border-tinta bg-crema p-2 shadow-sticker md:p-3'}`}
    >
      <Link to={href} data-product className="group block rounded-[0.25rem] focus-visible:outline-offset-4">
        <div className={`relative grid aspect-square place-items-center ${clean ? '' : `overflow-hidden rounded-[0.25rem] ${tones[item.tone]}`}`}>
          <img
            src={item.image}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            className={`select-none object-contain transition-transform duration-500 ease-spring group-hover:scale-105 ${clean ? 'absolute inset-[8%] size-[84%]' : 'max-h-[78%] w-[68%]'} ${item.cut ? 'die-cut-thick' : ''}`}
          />
        </div>
        <h3
          className={`mt-3 font-display text-xl uppercase leading-none tracking-[-0.01em] group-hover:underline group-hover:decoration-naranja group-hover:decoration-2 group-hover:underline-offset-4 ${compact ? '' : 'md:text-2xl'}`}
        >
          {item.name}
          <span className="sr-only">, {item.kind}</span>
        </h3>
      </Link>

      <p className="mt-1.5 text-sm font-medium text-tinta/75" aria-hidden={item.defaultOrder ? undefined : true}>
        {item.defaultOrder ? item.defaultOrder.options : item.kind}
      </p>

      <div className="mt-auto pt-3">
        <p className="text-lg font-bold tabular-nums">
          <span className="sr-only">Precio: </span>
          {formatPrice(item.price)}
        </p>
      </div>

      <div className="mt-3">
        <OrderControl
          line={item.defaultOrder?.line ?? item.slug}
          name={item.defaultOrder ? `${item.name}, ${item.defaultOrder.options}` : item.name}
          onAnnounce={onAnnounce}
        />
      </div>
    </article>
  )
}
