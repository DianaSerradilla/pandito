import { Link } from 'react-router'
import type { FeaturedItem } from './featuredItems'

const frames = {
  crema: 'bg-crema',
  amarillo: 'bg-amarillo',
  naranja: 'bg-naranja',
} as const

const tones = {
  tinta: 'bg-tinta',
  naranja: 'bg-naranja',
} as const

// One featured design: a colored frame around the image (or a marked placeholder), with the name
// in big Anton over it. Crema on naranja is only used at this large size (manual: large text only).
export function FeaturedCard({ item }: { item: FeaturedItem }) {
  return (
    <Link
      to={`/catalogo/${item.slug}`}
      className={`block h-full rounded-ui p-3.5 md:p-[18px] ${frames[item.frame]}`}
    >
      <div
        className={`relative grid h-full place-items-center overflow-hidden rounded-[3px] ${tones[item.tone]}`}
      >
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 48 48" aria-hidden="true" className="w-16 text-crema opacity-30" fill="currentColor">
            <circle cx="34" cy="14" r="5" />
            <path d="M4 40 18 20l10 13 6-8 10 15z" />
          </svg>
        )}
        <span className="absolute inset-x-0 bottom-4 px-4 text-center font-display text-title uppercase text-crema">
          {item.name}
        </span>
      </div>
    </Link>
  )
}
