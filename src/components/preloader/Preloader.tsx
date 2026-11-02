import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

// Preloader (team request: reproduce the opening of extrafazant.nl, in orange, about 3 seconds).
// The whole screen starts in a single color and a thick marker stroke scribbles it away, back and
// forth across the screen, until the page underneath is fully revealed (an SVG mask). The exact
// timing of the reference could not be measured; these values are our own.
//
// Timeline (about 3 s): HOLD in plain orange (or until fonts and page are ready, whichever is
// later, with a safety cap) -> DRAW the scribble -> TAIL, then the cover is removed.
// While it runs the page is inert and does not scroll. With prefers-reduced-motion it is skipped.
// The orange cover also exists in index.html (#preloader-seed) to avoid a flash before React mounts.
const HOLD = 800
const DRAW = 2200
const TAIL = 300
const MAX_WAIT = 3500
const W = 1600
const H = 900
const MASK_ID = 'preloader-mask'
const FILTER_ID = 'preloader-rough'

// One fat marker stroke that sweeps the screen back and forth (boustrophedon) and rubs the orange
// out, so the cover looks like it is being scribbled away. The stroke is wider than the distance
// between passes, so nothing is left behind. Wavy rows and rough edges (see the filter in the mask)
// keep it hand-made. Deterministic: no randomness, so every load looks the same.
const ROWS = 6
const PITCH = 165
const FIRST_Y = 40
const X_OUT = 1780
const STROKE = 250

function scribble() {
  const points: string[] = []
  const add = (x: number, y: number) =>
    points.push(`${points.length ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
  for (let r = 0; r < ROWS; r++) {
    const y = FIRST_Y + r * PITCH
    const ltr = r % 2 === 0
    const phase = r * 1.7
    const steps = 40
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = ltr ? -180 + t * (X_OUT + 180) : X_OUT - t * (X_OUT + 180)
      add(x, y + Math.sin(t * Math.PI * 3 + phase) * 34 + Math.sin(t * Math.PI * 7 + phase) * 9)
    }
    if (r < ROWS - 1) {
      const edge = ltr ? X_OUT : -180
      const dir = ltr ? 1 : -1
      for (let i = 1; i < 12; i++) {
        const a = (i / 12) * Math.PI
        add(edge + dir * Math.sin(a) * 90, y + PITCH / 2 - Math.cos(a) * (PITCH / 2))
      }
    }
  }
  return points.join(' ')
}

export function Preloader() {
  const reduce = usePrefersReducedMotion()
  const [done, setDone] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const d = useMemo(() => scribble(), [])

  // The overlay below takes over from the static seed in the same commit (no flash either way).
  useLayoutEffect(() => {
    document.getElementById('preloader-seed')?.remove()
  }, [])

  useEffect(() => {
    if (reduce || done) return
    const root = document.getElementById('root')
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    root?.setAttribute('inert', '')
    html.style.overflow = 'hidden'
    performance.mark('preloader:start')

    let cancelled = false
    let animation: Animation | undefined
    let closing: number | undefined

    const pageReady = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', () => resolve(), { once: true })
    })
    const minHold = new Promise<void>((resolve) => window.setTimeout(resolve, HOLD))
    const safetyCap = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT))
    // Last resort: whatever happens with the animation (hidden tab, unsupported API), the cover is
    // removed, so the page can never stay covered or inert.
    const failsafe = window.setTimeout(() => {
      if (!cancelled) setDone(true)
    }, MAX_WAIT + DRAW + TAIL + 1000)

    Promise.race([Promise.all([document.fonts.ready, pageReady, minHold]), safetyCap]).then(() => {
      const path = pathRef.current
      if (cancelled || !path) return
      path.style.opacity = '1'
      animation = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: DRAW,
        easing: 'cubic-bezier(0.4, 0, 0.35, 1)',
        fill: 'forwards',
      })
      animation.finished
        .then(() => {
          closing = window.setTimeout(() => {
            if (!cancelled) {
              performance.mark('preloader:end')
              setDone(true)
            }
          }, TAIL)
        })
        .catch(() => {})
    })

    return () => {
      cancelled = true
      animation?.cancel()
      if (closing) window.clearTimeout(closing)
      window.clearTimeout(failsafe)
      root?.removeAttribute('inert')
      html.style.overflow = previousOverflow
    }
  }, [reduce, done])

  if (reduce || done) return null

  return createPortal(
    <div role="status" aria-label="Cargando" className="fixed inset-0 z-[100]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id={FILTER_ID} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="46" />
          </filter>
          <mask id={MASK_ID}>
            <rect width={W} height={H} fill="white" />
            <path
              ref={pathRef}
              d={d}
              pathLength={1}
              fill="none"
              stroke="black"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={1}
              strokeDashoffset={1}
              filter={`url(#${FILTER_ID})`}
              style={{ opacity: 0 }}
            />
          </mask>
        </defs>
        <rect width={W} height={H} className="fill-naranja" mask={`url(#${MASK_ID})`} />
      </svg>
    </div>,
    document.body,
  )
}
