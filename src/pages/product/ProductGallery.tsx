import { useState, type CSSProperties } from 'react'
import { SafeImage } from '../../components/ui/SafeImage'
import { tones } from '../today/tones'
import type { TodayItem } from '../today/todayItems'

// The photos of a piece, which follow the options that are chosen so the person sees what they will
// get: the material changes how the sticker catches the light, and the size changes how big it is
// next to a ruler and on a notebook. Three views, one at a time, with arrows and buttons (never
// automatic, so nobody has to chase them); the one on screen is announced. The pictures are
// PLACEHOLDERS built from the sticker's art and the sample photo; the scale of the notebook view is
// approximate (it assumes the 16-inch laptop of the photo). Real photos per material replace them.
type Props = {
  item: TodayItem
  material: { key: string; label: string }
  size: { label: string; cm: number }
}

const RULER_CM = 15 // what the ruler of the "Tamaño real" view spans
const LAPTOP_PX_PER_CM = 8.3 // % of the photo's width that one cm covers in the notebook view

const maskOf = (image: string): CSSProperties => ({
  maskImage: `url(${image})`,
  WebkitMaskImage: `url(${image})`,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
})

// The sticker with its material: glossy gets a band of light, holographic a rainbow sheen, matte
// is left as it is. The light is clipped to the sticker's own shape.
function StickerArt({ item, material, className, style }: { item: TodayItem; material: string; className: string; style?: CSSProperties }) {
  // If the picture does not load, the sticker's name takes its place and the material effects are
  // left out: they are masked by that same picture and would otherwise cover the whole square.
  const [failedImage, setFailedImage] = useState<string | undefined>()
  if (failedImage === item.image) {
    return (
      <div className={className} style={style}>
        <span className="grid size-full place-items-center rounded-ui border-[1.5px] border-dashed border-tinta bg-crema/80 p-2 text-center font-display text-lg uppercase leading-none">
          {item.name}
        </span>
      </div>
    )
  }
  return (
    <div className={className} style={style}>
      <img
        src={item.image}
        alt=""
        draggable={false}
        onError={() => setFailedImage(item.image)}
        className={`size-full select-none object-contain ${item.cut ? 'die-cut-thick' : ''}`}
      />
      {material === 'brillante' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            ...maskOf(item.image),
            mixBlendMode: 'soft-light',
            backgroundImage: 'linear-gradient(118deg, transparent 26%, rgb(255 255 255 / 0.9) 46%, transparent 64%)',
          }}
        />
      )}
      {material === 'holografico' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            ...maskOf(item.image),
            mixBlendMode: 'overlay',
            opacity: 0.85,
            backgroundImage:
              'linear-gradient(115deg, #ff6ad5, #7b8cff 22%, #5ff2d6 45%, #fff27a 68%, #ff9a6a 86%, #ff6ad5)',
          }}
        />
      )}
    </div>
  )
}

function Ruler() {
  return (
    <div aria-hidden="true" className="absolute inset-x-[6%] bottom-[19%]">
      <div className="relative h-0.5 bg-tinta" />
      {Array.from({ length: RULER_CM + 1 }, (_, cm) => (
        <div
          key={cm}
          className="absolute top-0 w-0.5 -translate-x-1/2 bg-tinta"
          style={{ left: `${(cm / RULER_CM) * 100}%`, height: cm % 5 === 0 ? '0.9rem' : '0.5rem' }}
        >
          {cm % 5 === 0 && (
            <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 text-xs font-semibold tabular-nums">{cm}</span>
          )}
        </div>
      ))}
      <span className="absolute right-0 top-full mt-5 text-xs font-semibold">cm</span>
    </div>
  )
}

export function ProductGallery({ item, material, size }: Props) {
  const [index, setIndex] = useState(0)

  const slides = [
    { key: 'vista', label: 'El sticker', alt: `${item.name}, ${material.label}, ${size.cm} cm.` },
    { key: 'escala', label: 'Tamaño real', alt: `${item.name} mide ${size.cm} cm, junto a una regla de ${RULER_CM} cm.` },
    { key: 'uso', label: 'En una notebook', alt: `${item.name} de ${size.cm} cm pegado en una notebook.` },
  ]
  const current = slides[index]
  const go = (next: number) => setIndex((next + slides.length) % slides.length)

  return (
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label="Fotos del sticker"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(index + 1)
        if (event.key === 'ArrowLeft') go(index - 1)
      }}
    >
      <p role="status" className="sr-only">
        Imagen {index + 1} de {slides.length}: {current.label}. {current.alt}
      </p>

      <div
        className={`relative aspect-square overflow-hidden rounded-ui border-[1.5px] border-tinta shadow-sticker ${current.key === 'escala' ? 'bg-crema' : current.key === 'uso' ? 'bg-tinta' : tones[item.tone]}`}
      >
        {/* The picture. Its own box, so the buttons below are not hidden inside an image role. */}
        <div role="img" aria-label={current.alt} className="absolute inset-0">
          {current.key === 'vista' && (
            <StickerArt item={item} material={material.key} className="absolute left-1/2 top-[46%] size-[68%] -translate-x-1/2 -translate-y-1/2" />
          )}

          {current.key === 'escala' && (
            <>
              <StickerArt
                item={item}
                material={material.key}
                className="absolute bottom-[19%] left-[6%] aspect-square"
                style={{ width: `${(size.cm / RULER_CM) * 88}%`, marginBottom: '0.15rem' }}
              />
              <Ruler />
              <p className="absolute left-[6%] top-[6%] font-display text-4xl uppercase leading-none md:text-5xl">{size.cm} cm</p>
            </>
          )}

          {current.key === 'uso' && (
            <>
              <SafeImage
                src="/images/featured-laptop.jpg"
                alt=""
                draggable={false}
                fallback={<div className="absolute inset-0 bg-tinta" />}
                className="absolute inset-0 size-full object-cover"
              />
              <StickerArt
                item={item}
                material={material.key}
                className="absolute aspect-square drop-shadow-[0_2px_3px_rgb(0_0_0/0.45)]"
                style={{ left: '50%', top: '48%', width: `${size.cm * LAPTOP_PX_PER_CM}%`, transform: 'translate(-50%, -50%) rotate(-6deg)' }}
              />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Foto anterior"
          className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-ui border-[1.5px] border-tinta bg-crema hover:bg-naranja"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Foto siguiente"
          className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-ui border-[1.5px] border-tinta bg-crema hover:bg-naranja"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 3 5 5-5 5" />
          </svg>
        </button>

        {/* Where you are: one dot for each photo, inside the carousel. Each is a 44 px target. */}
        <div role="group" aria-label="Elegir foto" className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center rounded-ui border-[1.5px] border-tinta bg-crema px-1">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              aria-label={slide.label}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className="grid size-11 cursor-pointer place-items-center"
            >
              <span
                aria-hidden="true"
                className={`block h-2.5 rounded-full border-[1.5px] border-tinta transition-[width,background-color] duration-200 ${i === index ? 'w-6 bg-tinta' : 'w-2.5 bg-crema'}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
