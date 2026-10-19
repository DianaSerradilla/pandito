import { useEffect, useRef, type ReactNode } from 'react'
import { featuredItems } from './featuredItems'
import { FeaturedCard } from './FeaturedCard'
import { ScrollSticker } from './ScrollSticker'

// Pinned card stack (reference: "Recent werk" on extrafazant.nl). The section is tall and its
// content is sticky: while you scroll through it, the front card slides down and the next one
// behind it moves up to take its place. Cards behind only show a thin strip above the front one.
const PEEK = 22 // px each card behind rises above the one in front
const SHRINK = 0.045 // horizontal shrink per step behind
const SCROLL_PER_CARD = 0.85 // screens of scroll for each hand-over
const END = 0.9 // fraction of the scroll range where the last hand-over finishes

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

function useStackScroll(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = ref.current
    if (!section) return
    const cards = [...section.querySelectorAll<HTMLElement>('[data-stack-card]')]
    let target = 0
    let current = 0
    let raf = 0

    const read = () => {
      const r = section.getBoundingClientRect()
      const range = r.height - window.innerHeight
      target = range > 0 ? clamp(-r.top / range) : 0
    }

    const apply = (p: number) => {
      const t = clamp(p / END) * (cards.length - 1)
      cards.forEach((el, i) => {
        const u = t - i // < 0: still behind, 0: in front, 0..1: leaving, > 1: gone
        const out = el.offsetHeight + 60
        let y = 0
        let sx = 1
        let opacity = 1
        if (u <= 0) {
          const d = -u
          y = -Math.min(d, 3) * PEEK
          sx = 1 - Math.min(d, 3) * SHRINK
          opacity = clamp(3 - d)
        } else if (u < 1) {
          y = u * out
          // Stays opaque while sliding (a half-faded card looks muddy over the next one, most of
          // all on a dark background); it only fades once it is almost out of the frame.
          opacity = 1 - clamp((u - 0.88) / 0.12)
        } else {
          y = out
          opacity = 0
        }
        const front = Math.abs(u) < 0.5
        el.style.transform = `translateY(${y.toFixed(1)}px) scaleX(${sx.toFixed(4)})`
        el.style.opacity = opacity.toFixed(3)
        el.style.zIndex = String(cards.length - i)
        el.style.pointerEvents = front ? 'auto' : 'none'
        // Only the front card is reachable by keyboard and assistive tech.
        el.toggleAttribute('inert', !front)
      })
    }

    const frame = () => {
      read()
      current += (target - current) * 0.18
      apply(current)
      raf = Math.abs(target - current) > 0.0005 ? requestAnimationFrame(frame) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    read()
    current = target
    apply(current)
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    return () => {
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
      cancelAnimationFrame(raf)
    }
  }, [ref])
}

export function FeaturedStack({ intro, action }: { intro: ReactNode; action: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useStackScroll(ref)
  const n = featuredItems.length

  return (
    <section
      ref={ref}
      aria-labelledby="destacados-title"
      style={{ height: `calc(100svh * (1 + ${SCROLL_PER_CARD} * ${n - 1}))` }}
    >
      {/* overflow-hidden is safe here: it is on the sticky element itself, not on an ancestor. */}
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-4 py-4 md:py-8">
        {intro}
        {/* Space above the stack = the strips of the cards behind (up to 3 x PEEK = 66 px) plus air,
            so they never touch the title. The card size follows the real screen height: what is
            subtracted is the rest of the content (intro, strips, button, paddings), so on short
            screens the card shrinks instead of squeezing the layout. */}
        <ul className="relative mt-[90px] aspect-[4/3] w-[min(88vw,52rem,calc((100svh-22rem)*1.3333))] shrink-0 md:mt-28 md:aspect-video md:w-[min(88vw,52rem,calc((100svh-28.5rem)*1.7778))]">
          {featuredItems.map((item) => (
            <li
              key={item.slug}
              data-stack-card
              className="absolute inset-0 will-change-transform [transform-origin:50%_100%]"
            >
              <FeaturedCard item={item} />
            </li>
          ))}
        </ul>
        <div className="relative z-20 mt-6 shrink-0 md:mt-12">{action}</div>
        <ScrollSticker className="pointer-events-none absolute bottom-2 right-2 z-10 size-14 md:bottom-8 md:right-8 md:size-36" />
        {/* The stack is a visual device: assistive tech gets the whole list here. */}
        <p className="sr-only">
          Destacados: {featuredItems.map((i) => i.name).join(', ')}.
        </p>
      </div>
    </section>
  )
}
