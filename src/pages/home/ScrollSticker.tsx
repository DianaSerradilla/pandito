import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

// Round seal in the corner (reference: the "this is how we scroll" badge on extrafazant.nl).
// The ring of text turns with the page scroll, so it reads as "this is how I scroll".
// PROVISIONAL COPY in Pando's voice. Cream disc with ink text (tinta on crema is an approved pair)
// and the orange isotipo P in the middle (isotipo use for seals, per the manual).
// Static with prefers-reduced-motion. Decorative, so hidden from assistive tech.
const PHRASE = 'Así scrolleo yo'
const RING_ID = 'scroll-sticker-ring'

export function ScrollSticker({ className }: { className?: string }) {
  const reduce = usePrefersReducedMotion()
  const ringRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const ring = ringRef.current
    if (!ring || reduce) return
    let raf = 0
    const update = () => {
      raf = 0
      ring.setAttribute('transform', `rotate(${(window.scrollY * 0.3) % 360} 100 100)`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      ring.removeAttribute('transform')
    }
  }, [reduce])

  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      data-scroll-sticker
      className={className}
    >
      <circle cx="100" cy="100" r="98" className="fill-crema" />
      <g ref={ringRef}>
        <defs>
          <path id={RING_ID} d="M100 100 m-70 0 a70 70 0 1 1 140 0 a70 70 0 1 1 -140 0" />
        </defs>
        <text fontSize="22" letterSpacing="2" className="fill-tinta font-display">
          <textPath href={`#${RING_ID}`} textLength="436" lengthAdjust="spacing">
            {`${PHRASE} · ${PHRASE} ·`}
          </textPath>
        </text>
      </g>
      <circle cx="100" cy="100" r="40" fill="none" strokeWidth="3" className="stroke-tinta" />
      <image href="/brand/isotipo-naranja.svg" x="84" y="76" width="32" height="48" />
    </svg>
  )
}
