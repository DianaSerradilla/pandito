import { useEffect, useRef, type RefObject } from 'react'
import { site } from '../../config/site'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Heading } from '../../components/ui/Heading'
import { Script } from '../../components/ui/Script'
import { Section } from '../../components/ui/Section'
import { ArrowAnchor } from '../../components/ui/ArrowLink'

type Step = {
  number: string
  title: string
  text: string
  accent: string
  ink: string
  /** Pando for this step. PLACEHOLDER art: raster cut-outs from the Pando sheet, to be replaced by
   *  the vectorized ones (same names, or change `pando`). */
  pando: string
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Elegí',
    text: 'Dale una vuelta al catálogo y quedate con los que más te gusten.',
    accent: 'bg-azul',
    ink: 'text-crema',
    pando: '/images/pando-zapatilla.png', // choosing a sneaker
  },
  {
    number: '02',
    title: 'Escribime',
    text: 'Mandame una captura o una lista por WhatsApp. Sin vueltas.',
    accent: 'bg-naranja',
    ink: 'text-tinta',
    pando: '/images/pando-camara.png', // "mandame una captura"
  },
  {
    number: '03',
    title: 'Coordinamos',
    text: 'Te confirmo disponibilidad, demora y cuándo podés retirarlos.',
    accent: 'bg-tinta',
    ink: 'text-crema',
    pando: '/images/pando-camina.png', // off with his bag
  },
]

// A marker line that links the three steps. It hops from one step marker to the next in a
// hand-drawn arch and ends in an arrow pointing at the last one. The scroll draws it, with the
// arrowhead at the tip; each step lights up when the line reaches it, and the Pando of the step
// the line is at moves (a walking-in-place bob) while the others stand still. Desktop only: the
// section is pinned for a while so the scroll can drive it. On mobile, and with
// prefers-reduced-motion, the line is already drawn (desktop) or absent (mobile), every step is
// lit and nobody moves. Same naranja marker as the underline of the main links (manual: marcas
// de mano). The three Pandos need room beside the text, so they show from 1280 px up.
const LINE_W = 6
const GAP = 40 // px the line stays away from each marker
const HOLD = 0.2 // last share of the pinned scroll, with everything already drawn

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

function useLineDraw(reduce: boolean, sectionRef: RefObject<HTMLElement | null>) {
  const bandRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const band = bandRef.current
    const list = listRef.current
    if (!section || !band || !list) return
    const svg = band.querySelector('svg')
    const line = band.querySelector<SVGPathElement>('[data-line]')
    const tip = band.querySelector<SVGGElement>('[data-line-tip]')
    const cards = [...list.querySelectorAll<HTMLElement>('[data-step]')]
    const markers = [...list.querySelectorAll<HTMLElement>('[data-step-marker]')]
    if (!svg || !line || !tip) return

    const wide = window.matchMedia('(min-width: 768px)')
    let total = 0
    let stopLengths: number[] = []
    let target = 0
    let current = 0
    let raf = 0

    // `count` steps are lit; the last lit one is the current one (its Pando moves).
    const setActive = (count: number) => {
      cards.forEach((card, i) => {
        card.toggleAttribute('data-active', i < count)
        card.toggleAttribute('data-current', i === count - 1)
      })
    }

    const apply = (progress: number) => {
      const length = progress * total
      line.style.strokeDashoffset = String(Math.max(0, total - length))
      const point = line.getPointAtLength(length)
      const ahead = line.getPointAtLength(Math.min(total, length + 3))
      const behind = line.getPointAtLength(Math.max(0, length - 3))
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
      tip.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${angle.toFixed(1)})`)
      tip.style.opacity = progress <= 0.004 ? '0' : '1'
      setActive(stopLengths.filter((len) => length >= len - 8).length)
    }

    const build = () => {
      const armed = wide.matches
      list.classList.toggle('how-armed', armed && !reduce)
      if (!armed) {
        setActive(cards.length)
        cards.forEach((card) => card.removeAttribute('data-current'))
        return false
      }
      const box = band.getBoundingClientRect()
      const w = box.width
      const h = box.height
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.setAttribute('width', String(w))
      svg.setAttribute('height', String(h))

      const xs = markers.map((m) => {
        const r = m.getBoundingClientRect()
        return r.left + r.width / 2 - box.left
      })
      // From the first marker, an arch to the second and another to the third, ending just
      // above it. Each arch rises a different amount so it feels drawn by hand.
      const base = h - 8
      const peaks = [h * 0.06, h * 0.16]
      const lean = [0.12, -0.1]
      let d = `M${(xs[0] + GAP * 0.55).toFixed(1)} ${base.toFixed(1)}`
      for (let i = 0; i < xs.length - 1; i++) {
        const x0 = xs[i] + GAP * 0.55
        const x1 = xs[i + 1] - GAP * (i === xs.length - 2 ? 0.1 : 0.55)
        const dx = x1 - x0
        d += `C${(x0 + dx * (0.2 + lean[i])).toFixed(1)} ${peaks[i].toFixed(1)} ${(x1 - dx * (0.2 - lean[i])).toFixed(1)} ${peaks[i].toFixed(1)} ${x1.toFixed(1)} ${(i === xs.length - 2 ? base + 2 : base).toFixed(1)}`
      }
      line.setAttribute('d', d)
      total = line.getTotalLength()
      line.style.strokeDasharray = String(total)

      // Where the line is at each marker: the start, the end of the first arch and the end.
      let firstEnd = 0
      {
        let lo = 0
        let hi = total
        const target1 = xs[1] - GAP * 0.55
        for (let i = 0; i < 24; i++) {
          const mid = (lo + hi) / 2
          if (line.getPointAtLength(mid).x < target1) lo = mid
          else hi = mid
        }
        firstEnd = hi
      }
      stopLengths = [0, firstEnd, total]
      return true
    }

    // The section is pinned on desktop: the progress is how far you are through its scroll.
    const read = () => {
      const r = section.getBoundingClientRect()
      const range = r.height - window.innerHeight
      target = range > 0 ? clamp(-r.top / range / (1 - HOLD)) : 0
    }

    const frame = () => {
      if (!wide.matches) {
        raf = 0
        return
      }
      read()
      current += (target - current) * 0.16
      apply(current)
      raf = Math.abs(target - current) > 0.0008 ? requestAnimationFrame(frame) : 0
    }
    const update = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const setup = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (!build()) return
      if (reduce) {
        apply(1)
        setActive(cards.length)
        cards.forEach((card) => card.removeAttribute('data-current'))
        return
      }
      read()
      current = target
      apply(current)
    }

    setup()
    const onResize = () => {
      setup()
      update()
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', onResize)
    const observer = new ResizeObserver(onResize)
    observer.observe(list)
    document.fonts?.ready.then(onResize).catch(() => {})
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
      cancelAnimationFrame(raf)
      list.classList.remove('how-armed')
    }
  }, [reduce, sectionRef])

  return { bandRef, listRef }
}

export function HowToBuySection() {
  const reduce = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { bandRef, listRef } = useLineDraw(reduce, sectionRef)

  // On desktop the section is pinned for 2.4 screens: the scroll draws the line and lights the steps.
  return (
    <Section
      ref={sectionRef}
      labelledBy="como-comprar-title"
      className="how-buy-section relative isolate p-0! md:h-[240svh]"
    >
      <div className="overflow-hidden py-12 md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-center md:py-0">
        <style>{`
          .how-armed [data-step] .how-marker,
          .how-armed [data-step] .how-body {
            transition: transform 420ms var(--ease-spring), opacity 300ms ease, filter 300ms ease;
          }
          .how-armed [data-step]:not([data-active]) .how-marker { transform: scale(0.8) rotate(-8deg); filter: grayscale(1); opacity: 0.45; }
          .how-armed [data-step]:not([data-active]) .how-body { opacity: 0.3; transform: translateY(10px); }
          .how-armed [data-step][data-active] .how-marker { transform: scale(1) rotate(0deg); }
          @keyframes how-pando-walk {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-9px) rotate(-1.6deg); }
            50% { transform: translateY(0) rotate(0deg); }
            75% { transform: translateY(-9px) rotate(1.6deg); }
          }
          @media (prefers-reduced-motion: no-preference) {
            .how-armed [data-step][data-current] .how-pando { animation: how-pando-walk 0.9s ease-in-out infinite; transform-origin: 50% 100%; }
          }
          @media (hover: hover) and (pointer: fine) {
            [data-step] .how-marker { transition: transform 180ms ease; }
            [data-step]:hover .how-marker { transform: rotate(8deg) scale(1.06); }
          }
        `}</style>

        <div className="mx-auto w-full max-w-[84rem]">
          <div className="mx-auto max-w-2xl text-center">
            <Script>Pedilo sin vueltas</Script>
            <Heading id="como-comprar-title" as="h2" size="headline" family="sans" className="mt-3 text-balance">
              <span className="block font-normal">Tres pasos</span>
              <span className="block font-extrabold md:text-[1.2em]">y ya está.</span>
            </Heading>
            <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-tinta/80 md:text-lg">
              Elegís tus stickers, me escribís y coordinamos. Así de simple.
            </p>
          </div>

          {/* The strip the line is drawn on. Decorative. */}
          <div ref={bandRef} aria-hidden="true" className="pointer-events-none relative mt-6 hidden h-24 md:block">
            <svg className="absolute inset-0 overflow-visible" fill="none">
              <defs>
                {/* A touch of roughness on the edge, like marker on paper. */}
                <filter id="how-line-rough" x="-5%" y="-20%" width="110%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
                </filter>
              </defs>
              <g filter="url(#how-line-rough)">
                <path
                  data-line
                  stroke="var(--color-naranja)"
                  strokeWidth={LINE_W}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <g data-line-tip style={{ opacity: 0 }}>
                  <path
                    d="M-13 -11 L1 0 L-13 11"
                    stroke="var(--color-naranja)"
                    strokeWidth={LINE_W}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </svg>
          </div>

          <ol ref={listRef} className="relative mt-10 grid gap-12 md:mt-0 md:grid-cols-3 md:gap-12">
            {steps.map((step, index) => (
              <li
                key={step.number}
                data-step
                className="relative flex flex-col items-center text-center md:items-start md:text-left xl:min-h-[17rem]"
              >
                <div className="flex items-center gap-4">
                  <span
                    data-step-marker
                    className={`how-marker grid size-16 place-items-center rounded-full font-script text-2xl shadow-sticker ring-4 ring-crema ${step.accent} ${step.ink}`}
                    style={{ rotate: `${index % 2 === 0 ? -4 : 5}deg` }}
                  >
                    {step.number}
                  </span>
                  <h3 className="font-display text-3xl uppercase tracking-[-0.02em] text-tinta md:text-4xl">{step.title}</h3>
                </div>
                <p className="how-body mt-5 max-w-[19rem] xl:max-w-[16rem] text-pretty leading-relaxed text-tinta/80 md:text-lg">{step.text}</p>

                {/* This step's Pando, standing at the bottom right of its column, below the line and
                    beside the text so nothing overlaps. Wide screens only. Decorative. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 hidden h-[11.5rem] w-[30%] xl:block"
                >
                  <img
                    src={step.pando}
                    alt=""
                    draggable={false}
                    className="how-pando h-full w-full select-none object-contain object-bottom"
                  />
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex justify-center md:mt-12">
            <ArrowAnchor
              href={site.whatsappUrl}
              mark
              aria-label="Empezar mi pedido por WhatsApp (se abre en una pestaña nueva)"
            >
              Empezar mi pedido
            </ArrowAnchor>
          </div>
        </div>
      </div>
    </Section>
  )
}
