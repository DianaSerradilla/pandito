import { asset } from '../../lib/asset'
import { useState } from 'react'
import { SafeImage } from '../../components/ui/SafeImage'
import { useCursorMotion } from '../../hooks/useCursorMotion'

// Two photo cards and a sticker, tilted and overlapping, as in the approved reference.
// Hover behavior (measured on the reference site, adapted):
//  - the element under the cursor grows 7.5%
//  - the other two shrink to 87-90% and slide away to the opposite side, rotating a hair
//  - the sticker behaves like photo 2 (the middle-size card): hovering it triggers the same state
// The pointer listeners live on the outer wrappers, which never move, so a sliding inner element
// cannot cause hover flicker. Cursor-driven only: touch and reduced motion get the static layout.
type Active = 'l' | 'm'
type Part = 'l' | 'm' | 's'

const states: Record<Active, Record<Part, string>> = {
  l: {
    l: 'scale(1.075)',
    m: 'translate(18.4%, -5.5%) rotate(-0.7deg) scale(0.87)',
    s: 'translate(33.9%, 2.3%) rotate(0.8deg) scale(0.9)',
  },
  m: {
    l: 'translate(-14.6%, 0) rotate(2.7deg) scale(0.87)',
    m: 'scale(1.075)',
    s: 'translate(-41.8%, 2.3%) rotate(-0.7deg) scale(0.9)',
  },
}

function Placeholder({ tone, label = 'Foto de ejemplo' }: { tone: 'azul' | 'tinta'; label?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`grid h-full w-full place-items-center text-crema ${tone === 'azul' ? 'bg-azul' : 'bg-tinta'}`}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" className="w-1/4 opacity-60" fill="currentColor">
        <circle cx="34" cy="14" r="5" />
        <path d="M4 40 18 20l10 13 6-8 10 15z" />
      </svg>
    </div>
  )
}

type PhotoProps = {
  /** Real photo. While it is missing, a clearly marked placeholder is shown. */
  src?: string
  alt?: string
  tone: 'azul' | 'tinta'
  thickBottom?: boolean
}

function PhotoCard({ src, alt = '', tone, thickBottom }: PhotoProps) {
  return (
    <div
      className={[
        'bg-white p-3 sm:p-4',
        thickBottom ? 'pb-10 sm:pb-14' : '',
      ].join(' ')}
    >
      <div className="aspect-[4/5] overflow-hidden">
        {src ? (
          <SafeImage
            loading="lazy"
            decoding="async"
            src={src}
            alt={alt}
            fallback={<Placeholder tone={tone} label="Foto no disponible" />}
            className="h-full w-full object-cover"
          />
        ) : (
          <Placeholder tone={tone} />
        )}
      </div>
    </div>
  )
}

export function ManifestoMedia({ photos }: { photos: [PhotoProps, PhotoProps] }) {
  const motion = useCursorMotion()
  const [active, setActive] = useState<Active | null>(null)

  const inner = (part: Part): React.CSSProperties => ({
    transform: motion && active ? states[active][part] : 'none',
  })
  const enter = (who: Active) => () => {
    if (motion) setActive(who)
  }
  const leave = () => setActive(null)
  const innerClass = 'transition-transform duration-500 ease-soft will-change-transform'

  return (
    <div className="relative mx-auto w-full max-w-[40rem] pb-12 md:mx-0 md:max-w-none md:pb-16">
      {/* Photo 1: large, tilted left */}
      <div className="w-[74%] -rotate-3" onPointerEnter={enter('l')} onPointerLeave={leave}>
        <div className={innerClass} style={inner('l')}>
          <PhotoCard {...photos[0]} />
        </div>
      </div>

      {/* Photo 2: medium, bottom right, tilted right, with a thick polaroid bottom */}
      <div
        className="absolute bottom-[-2%] right-[-2%] z-[1] w-[54%] rotate-[4deg]"
        onPointerEnter={enter('m')}
        onPointerLeave={leave}
      >
        <div className={innerClass} style={inner('m')}>
          <PhotoCard {...photos[1]} thickBottom />
        </div>
      </div>

      {/* Sticker: the brand logotype with a die-cut border. Triggers the same state as photo 2. */}
      <div
        className="absolute right-[13%] top-[11%] z-[2] w-[44%] -rotate-[8deg]"
        onPointerEnter={enter('m')}
        onPointerLeave={leave}
      >
        <div className={innerClass} style={inner('s')}>
          <img src={asset('/brand/logotipo-naranja.svg')} alt="" className="die-cut h-auto w-full" />
        </div>
      </div>
    </div>
  )
}
