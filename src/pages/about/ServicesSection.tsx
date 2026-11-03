import { asset } from '../../lib/asset'
import { useEffect, useRef, type RefObject } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { SafeImage } from '../../components/ui/SafeImage'

// The "what we do" blocks of the Estudio page, after extrafazant.nl/wat-we-doen. On wide screens the
// colored half is PINNED and does not move: only the text of each service scrolls by on the cream
// half, and the panel changes color and picture by blending (measured on the reference: the panels
// are `position: sticky; top: 0`, stacked, and their opacity follows the scroll; the text is not
// pinned). A sticker sits across the seam, scrolling with the text. On a phone each service
// stacks: text, then its picture.
// The three services follow the approved line "Cada pieza es pensada, trabajada y curada".
// PLACEHOLDER pictures and PROVISIONAL COPY: the team replaces both.
type Service = {
  eyebrow: string
  title: string
  text: string
  /** Colored panel. */
  bg: string
  /** Picture in the frame (transparent art over the dark frame). */
  image: string
  cut?: boolean
  /** Sticker across the seam, anchored to the right edge of the text block. */
  sticker: { src: string; className: string }
}

const services: Service[] = [
  {
    eyebrow: 'Primero, la idea.',
    title: 'Pensado',
    text: 'Antes de dibujar, pienso. Qué querés decir, dónde va a vivir el sticker y quién lo va a ver. Un buen diseño empieza con una buena pregunta, no con un lápiz. Así cada pieza tiene un porqué.',
    bg: 'bg-azul',
    image: asset('/images/pando-camara.png'),
    cut: true,
    sticker: { src: asset('/stickers/star-eye.svg'), className: 'top-[16%] w-36 -rotate-[12deg]' },
  },
  {
    eyebrow: 'Después, las manos.',
    title: 'Trabajado',
    text: 'Dibujo, pruebo, borro y vuelvo a dibujar. Lo que hago lo podés palpar: líneas con carácter, colores que se ven y un acabado que aguanta el uso de todos los días. Nada de plantillas.',
    bg: 'bg-amarillo',
    image: asset('/images/pando-zapatilla.png'),
    cut: true,
    sticker: { src: asset('/stickers/isotipo-disc.svg'), className: 'bottom-[14%] w-36 rotate-[10deg]' },
  },
  {
    eyebrow: 'Al final, el criterio.',
    title: 'Curado',
    text: 'No todo sale. Si una pieza no me convence, no se publica. Elijo lo que muestro y cómo lo muestro, para que cada sticker que llega a tus manos valga la pena. Hecho en Mendoza.',
    bg: 'bg-naranja',
    image: asset('/images/pando-camina.png'),
    cut: true,
    sticker: { src: asset('/stickers/logotipo-label.svg'), className: 'top-[18%] w-52 -rotate-[8deg]' },
  },
]

// The dark frame with the picture, the same on the phone and on the pinned panel.
function Frame({ service }: { service: Service }) {
  return (
    <div className="grid aspect-[4/5] w-[min(78%,24rem)] place-items-center overflow-hidden rounded-[0.25rem] bg-tinta md:w-[min(74%,33rem)]">
      <SafeImage
        src={service.image}
        alt=""
        fallback={null}
        draggable={false}
        loading="lazy"
        className={`h-[82%] w-auto max-w-[80%] select-none object-contain ${service.cut ? 'die-cut' : ''}`}
      />
    </div>
  )
}

// Docking (team request): scrolling down into this block, the page STOPS when the blue panel touches
// the top of the screen, and the next scroll is what starts the pinned sequence. A "snap" in CSS
// cannot do this (it lets a fast scroll go straight through), so the wheel is watched: if the next
// step would carry the block's top past the top of the screen, the scroll is put exactly on it
// and the wheel is ignored for a moment, so the inertia of a trackpad does not push it through.
// Wide screens with a wheel or trackpad only; keyboard and touch scroll as usual.
const DOCK_PAUSE = 800 // ms the wheel is ignored after docking

function useDock(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = ref.current
    if (!section) return
    const wide = window.matchMedia('(min-width: 768px)')
    let lockedUntil = 0

    const onWheel = (event: WheelEvent) => {
      if (!wide.matches || event.ctrlKey) return
      const now = performance.now()
      if (now < lockedUntil) {
        event.preventDefault()
        return
      }
      if (event.deltaY <= 0) return
      const top = section.getBoundingClientRect().top
      // Above the dock and about to pass it.
      if (top > 1 && top - event.deltaY <= 1) {
        event.preventDefault()
        lockedUntil = now + DOCK_PAUSE
        window.scrollTo({ top: window.scrollY + top, behavior: 'auto' })
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [ref])
}

// The pinned panel changes color and picture by blending: panel i (the first one is always there)
// fades in over the previous one while the text of service i-1 leaves and the text of service i
// arrives, i.e. around the point where the two are half way. `p` is how many screens have been
// scrolled inside the block; the text of service i is centered when p = i. With
// prefers-reduced-motion the panels switch without blending.
function usePanelBlend(ref: RefObject<HTMLElement | null>, reduce: boolean) {
  useEffect(() => {
    const section = ref.current
    if (!section) return
    const panels = [...section.querySelectorAll<HTMLElement>('[data-panel]')]
    const wide = window.matchMedia('(min-width: 768px)')
    let raf = 0

    const apply = () => {
      raf = 0
      if (!wide.matches) return
      const p = -section.getBoundingClientRect().top / window.innerHeight
      panels.forEach((panel, i) => {
        if (i === 0) return
        const t = Math.min(1, Math.max(0, (p - (i - 0.75)) / 0.5))
        panel.style.opacity = String(reduce ? Math.round(t) : t)
      })
    }
    const update = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(raf)
    }
  }, [ref, reduce])
}

export function ServicesSection() {
  const ref = useRef<HTMLElement>(null)
  const reduce = usePrefersReducedMotion()
  useDock(ref)
  usePanelBlend(ref, reduce)

  return (
    <section
      ref={ref}
      aria-label="Lo que hago"
      className="relative left-1/2 w-screen -translate-x-1/2 md:grid md:grid-cols-2"
    >
      {/* The text. Above the panels (z-20) so the stickers can cross the seam. */}
      <div className="relative z-20">
        {services.map((service) => (
          <article key={service.title}>
            <div className="relative flex flex-col items-center justify-center px-6 py-20 text-center md:min-h-svh md:px-12 md:py-0">
              <p className="font-sans text-lg font-medium text-tinta/85 md:text-2xl">{service.eyebrow}</p>
              <h2 className="mt-2 font-display text-[clamp(4rem,9vw,7.5rem)] uppercase leading-[0.95]">
                {service.title}
              </h2>
              <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-tinta/85 md:text-lg">
                {service.text}
              </p>
              <SafeImage
                src={service.sticker.src}
                alt=""
                fallback={null}
                aria-hidden="true"
                draggable={false}
                className={`pointer-events-none absolute right-0 hidden translate-x-1/2 select-none md:block ${service.sticker.className}`}
              />
            </div>
            {/* Phone: the picture right under its text. */}
            <div className={`grid place-items-center px-6 py-14 md:hidden ${service.bg}`}>
              <Frame service={service} />
            </div>
          </article>
        ))}
      </div>

      {/* Wide screens: ONE pinned panel; the three colors and pictures sit on top of each other and
          blend into one another as the text scrolls (see usePanelBlend). Decorative. */}
      <div aria-hidden="true" className="relative z-10 hidden md:block" style={{ height: `${services.length * 100}svh` }}>
        <div className="sticky top-0 h-svh">
          {services.map((service, index) => (
            <div
              key={service.title}
              data-panel
              className={`absolute inset-0 grid place-items-center will-change-[opacity] ${service.bg}`}
              style={{ opacity: index === 0 ? 1 : 0 }}
            >
              <Frame service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
