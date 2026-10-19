import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

// Divider between the hero and the Manifiesto: a curved strip of paper tape, edge to edge, with a
// short phrase that runs along the curve (reference: sweet-tape.com). It sits over the boundary and
// over the cropped bottom of Pando, so the cut is never visible.
//
// How the cut stays hidden: the tape is centered on the boundary and its half-thickness is larger
// than the wave amplitude, so the boundary line is always inside the band.
//
// Motion (team decision, an exception to "nothing loops"): the text travels slowly along the curve.
// It stops with prefers-reduced-motion (static tape) and pauses while off screen.
// Phrase: key message 4 of the manual, "Hecho en Mendoza". Provisional. Crema on tinta is an
// approved pair. Decorative, so hidden from assistive tech.
const PHRASE = 'HECHO EN MENDOZA'
const SPEED = 45 // px per second: calm
const PATH_ID = 'tape-curve'

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

// Smooth wave from past the left edge to past the right edge.
function wavePath(width: number, height: number, amplitude: number) {
  const wavelength = Math.max(560, width * 0.8)
  const points: string[] = []
  for (let x = -80; x <= width + 80; x += 10) {
    const y = height / 2 + amplitude * Math.sin((x / wavelength) * Math.PI * 2 - 0.6)
    points.push(`${points.length ? 'L' : 'M'}${x} ${y.toFixed(1)}`)
  }
  return points.join(' ')
}

// One repetition of the phrase; the dot is orange (orange on ink is an approved use).
function Unit() {
  return (
    <>
      <tspan>{PHRASE}</tspan>
      <tspan className="fill-naranja">{'  ●  '}</tspan>
    </>
  )
}

export function TapeDivider() {
  const reduce = usePrefersReducedMotion()
  const width = useViewportWidth()
  const wide = width >= 768
  const thickness = wide ? 88 : 60
  const amplitude = wide ? 34 : 16 // always below thickness / 2, see the note above
  const fontSize = wide ? 38 : 26
  const height = thickness + amplitude * 2 + 40
  const d = useMemo(() => wavePath(width, height, amplitude), [width, height, amplitude])

  const wrapRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const measureRef = useRef<SVGTextElement>(null)
  const textPathRef = useRef<SVGTextPathElement>(null)
  const [unit, setUnit] = useState(0)
  const [pathLength, setPathLength] = useState(0)

  // Measure one repetition and the curve, to know how many copies fill it and when it loops.
  useEffect(() => {
    let cancelled = false
    const measure = () => {
      if (cancelled) return
      setUnit(measureRef.current?.getComputedTextLength() ?? 0)
      setPathLength(pathRef.current?.getTotalLength() ?? 0)
    }
    measure()
    document.fonts.ready.then(measure)
    return () => {
      cancelled = true
    }
  }, [d, fontSize])

  const copies = unit > 0 ? Math.ceil(pathLength / unit) + 2 : 8

  // Slide the text along the curve, looping seamlessly every `unit` pixels.
  useEffect(() => {
    const wrap = wrapRef.current
    const textPath = textPathRef.current
    if (reduce || unit <= 0 || !wrap || !textPath) return
    let raf = 0
    let last = 0
    let shift = 0
    let visible = true

    const frame = (t: number) => {
      if (last) shift = (shift + (SPEED * (t - last)) / 1000) % unit
      last = t
      textPath.setAttribute('startOffset', String(-shift))
      raf = visible ? requestAnimationFrame(frame) : 0
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    })
    observer.observe(wrap)
    raf = requestAnimationFrame(frame)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      textPath.setAttribute('startOffset', '0')
    }
  }, [reduce, unit])

  return (
    // Full-bleed wrapper. The negative margins equal half the height, so the tape sits centered on
    // the boundary without adding layout height. pointer-events-none keeps the hero clickable.
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none relative left-1/2 z-10 w-screen -translate-x-1/2 overflow-hidden"
      style={{ height, marginBlock: -height / 2 }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
        <path
          ref={pathRef}
          id={PATH_ID}
          d={d}
          fill="none"
          strokeWidth={thickness}
          className="stroke-tinta"
        />
        {/* Invisible copy used only to measure one repetition. */}
        <text
          ref={measureRef}
          visibility="hidden"
          fontSize={fontSize}
          letterSpacing={2}
          className="font-display"
        >
          <Unit />
        </text>
        <text
          fontSize={fontSize}
          letterSpacing={2}
          dy={fontSize * 0.35}
          className="fill-crema font-display"
        >
          <textPath ref={textPathRef} href={`#${PATH_ID}`} startOffset={0}>
            {Array.from({ length: copies }, (_, i) => (
              <Unit key={i} />
            ))}
          </textPath>
        </text>
      </svg>
    </div>
  )
}
