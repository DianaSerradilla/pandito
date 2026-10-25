import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Heading } from '../../components/ui/Heading'
import { Script } from '../../components/ui/Script'
import { ScrollSticker } from '../home/ScrollSticker'
import { SafeImage } from '../../components/ui/SafeImage'

// Estudio hero, after extrafazant.nl/wat-we-doen: a centered title with a ring of stickers and
// photos that keeps turning slowly around it. Measured on the reference: 12 pieces evenly spaced
// (every 30 degrees) on an ellipse about 0.42 of the screen width by 0.37 of the hero height, going
// round once every ~38 s (9.6 degrees per second), most of them 115 px and a few wider (173 px).
// The turn is driven by time, it pauses while the hero is off screen, and it is skipped (the ring
// stays still) with prefers-reduced-motion. PLACEHOLDER pieces made from brand art and the sample
// photos; the team replaces them. PROVISIONAL COPY for the title and text.
const SPEED = -9.56 // degrees per second (counterclockwise on screen)
const RX = 0.4167 // horizontal radius, in widths of the hero
const RY = 0.37 // vertical radius, in heights of the hero

type Piece = {
  kind: 'sticker' | 'tile' | 'badge'
  src?: string
  /** Cream die-cut border with CSS, for art that has none of its own. */
  cut?: boolean
  wide?: boolean
  tilt: number
}

const pieces: Piece[] = [
  { kind: 'badge', tilt: 0 },
  { kind: 'sticker', src: '/stickers/isotipo-disc.svg', tilt: -8 },
  { kind: 'tile', src: '/images/pando-sticker-wall.png', wide: true, tilt: 4 },
  { kind: 'sticker', src: '/brand/pando-mano-senalar.svg', cut: true, tilt: 12 },
  { kind: 'sticker', src: '/stickers/star-eye.svg', tilt: -10 },
  { kind: 'sticker', src: '/images/pando-camina.png', cut: true, tilt: 6 },
  { kind: 'sticker', src: '/stickers/logotipo-label.svg', wide: true, tilt: -6 },
  { kind: 'tile', src: '/images/featured-laptop.jpg', tilt: -4 },
  { kind: 'sticker', src: '/images/pando-camara.png', cut: true, tilt: -7 },
  { kind: 'sticker', src: '/brand/pando.svg', cut: true, tilt: 9 },
  { kind: 'tile', src: '/images/pando-sticker-hand.png', tilt: 5 },
  { kind: 'sticker', src: '/images/pando-zapatilla.png', cut: true, tilt: -5 },
]

export function OrbitHero() {
  const reduce = usePrefersReducedMotion()
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const items = [...hero.querySelectorAll<HTMLElement>('[data-orbit]')]
    let width = 0
    let height = 0
    let raf = 0
    let visible = true
    let elapsed = 0
    let last = 0

    const measure = () => {
      const box = hero.getBoundingClientRect()
      width = box.width
      height = box.height
    }
    const place = () => {
      items.forEach((el, i) => {
        const angle = ((-30 - i * 30 + SPEED * elapsed) * Math.PI) / 180
        const x = width * RX * Math.cos(angle)
        const y = height * RY * Math.sin(angle)
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      })
    }
    const frame = (now: number) => {
      raf = 0
      if (!visible) return
      elapsed += last ? (now - last) / 1000 : 0
      last = now
      place()
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (reduce || raf || !visible) return
      last = 0
      raf = requestAnimationFrame(frame)
    }

    measure()
    place()
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    observer.observe(hero)
    const onResize = () => {
      measure()
      place()
    }
    window.addEventListener('resize', onResize)
    start()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [reduce])

  return (
    <header
      ref={heroRef}
      className="relative left-1/2 grid h-[calc(100svh-7rem)] min-h-[34rem] w-screen -translate-x-1/2 place-items-center"
    >
      {/* The ring. Behind the text, decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {pieces.map((piece, index) => {
          const size = piece.wide ? 'w-24 md:w-[173px]' : 'w-14 md:w-[115px]'
          return (
            <div
              key={index}
              data-orbit
              className={`absolute left-1/2 top-1/2 ${size}`}
              style={{ rotate: `${piece.tilt}deg` }}
            >
              {piece.kind === 'badge' ? (
                <ScrollSticker className="block h-auto w-full" />
              ) : (
                <SafeImage
                  src={piece.src}
                  alt=""
                  fallback={null}
                  draggable={false}
                  className={`block h-auto w-full select-none ${piece.kind === 'tile' ? 'rounded-[0.25rem] border-[3px] border-crema shadow-sticker' : ''} ${piece.cut ? 'die-cut' : ''}`}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <Script>Qué hago</Script>
        <Heading
          id="estudio-title"
          as="h1"
          size="display"
          family="sans"
          className="mt-3 whitespace-nowrap text-[clamp(2.1rem,9.5vw,6.5rem)]!"
        >
          <span className="font-extrabold">Todo se </span>
          <span className="font-normal">pega.</span>
        </Heading>
        <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-tinta/85 md:text-lg">
          Marcas, gente, atención. Pero no todo se queda pegado. Lo que diseño, sí.
        </p>
      </div>
    </header>
  )
}
