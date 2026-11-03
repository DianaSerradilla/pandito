import { asset } from '../../lib/asset'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Heading } from '../../components/ui/Heading'
import { Script } from '../../components/ui/Script'
import { SafeImage } from '../../components/ui/SafeImage'

// Estudio hero, after extrafazant.nl/wat-we-doen: a centered title with stickers that keep turning
// slowly around it. Team adjustments to the reference: the pieces are the team's own designs (12 of
// the 24 delivered in public/images/estudio), big and far apart, the turn is slow, and the path
// hugs the text without ever crossing behind it. The path is a rounded rectangle (a superellipse)
// sized from the measured text block and the pieces. To look loose rather than lined up, pieces
// ride three paths between the tightest one around the text and the widest one the screen allows,
// are spaced unevenly, and are tilted by different amounts. None is cut off at the top or the
// bottom. The widest path has its sides just inside the screen, and two pieces ride a wider one
// that swings past the screen edge, so now and then one leaves and comes back.
// The turn is driven by time and pauses while the hero is off screen. With prefers-reduced-motion
// the pieces stay still, all on screen. PROVISIONAL COPY for the title and text.
const SPEED = 20 // pixels per second along the path (counterclockwise on screen)
const SHAPE = 3.5 // 2 is an ellipse; higher is closer to a rectangle with rounded corners
const PAD = 10 // px of air between a piece and the text or the edge of the hero
const STRAYS = new Set([3, 8]) // pieces that now and then swing past the screen edge
const SAMPLES = 480 // points used to measure the path
const LOOPS = 3 // paths between the tightest (0) and the widest (LOOPS - 1)
const LOOP_OF = [2, 0, 1, 2, 0, 1, 1, 2, 0, 2, 1, 0] // path of each piece

type Piece = {
  src: string
  /** wide: a wordmark or flag. The rest are about as wide as tall. */
  fit: 'normal' | 'wide'
  tilt: number
  /** Where it sits along its path, 0..1: evenly spaced, then nudged so the gaps differ. */
  along: number
}

const tilts = [-14, 9, 16, -18, 11, -9, 7, -15, 13, -7, 18, -12]

// File name and, when it is not about square, its shape. The order mixes shapes and colors.
const designs: [file: string, fit?: Piece['fit']][] = [
  ['pl-01-batmanflores1'],
  ['r161', 'wide'],
  ['r111'],
  ['r141'],
  ['r331', 'wide'],
  ['r191'],
  ['r571'],
  ['r291'],
  ['r361'],
  ['r381'],
  ['r91'],
  ['r231'],
]

const pieces: Piece[] = designs.map(([file, fit = 'normal'], i) => ({
  src: asset(`/images/estudio/${file}.png`),
  fit,
  tilt: tilts[i % tilts.length],
  along: (i + (((i * 0.618034 * 7) % 1) - 0.5) * 0.55) / designs.length,
}))

// Sized by the narrower of the screen width and height, so big pieces still leave room for the text.
const sizes: Record<Piece['fit'], string> = {
  normal: 'w-[clamp(4rem,min(10.5vw,18svh),12rem)]',
  wide: 'w-[clamp(6rem,min(15.5vw,26svh),17rem)]',
}

// A closed path around the center, measured so a point can be found by distance travelled.
type Loop = { x: number[]; y: number[]; length: number[] }

function buildLoop(halfWidth: number, halfHeight: number): Loop {
  const x: number[] = []
  const y: number[] = []
  const length: number[] = []
  const power = 2 / SHAPE
  for (let k = 0; k <= SAMPLES; k++) {
    const angle = (k / SAMPLES) * Math.PI * 2
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    x.push(halfWidth * Math.sign(c) * Math.abs(c) ** power)
    y.push(halfHeight * Math.sign(s) * Math.abs(s) ** power)
    length.push(k === 0 ? 0 : length[k - 1] + Math.hypot(x[k] - x[k - 1], y[k] - y[k - 1]))
  }
  return { x, y, length }
}

function pointAt(loop: Loop, distance: number): [number, number] {
  const total = loop.length[SAMPLES]
  const d = ((distance % total) + total) % total
  let low = 0
  let high = SAMPLES
  while (high - low > 1) {
    const mid = (low + high) >> 1
    if (loop.length[mid] <= d) low = mid
    else high = mid
  }
  const span = loop.length[high] - loop.length[low] || 1
  const t = (d - loop.length[low]) / span
  return [loop.x[low] + (loop.x[high] - loop.x[low]) * t, loop.y[low] + (loop.y[high] - loop.y[low]) * t]
}

// Smallest half width at which the corner (ax, ay) still sits inside a path of half height `halfHeight`:
// (ax / X)^p + (ay / Y)^p = 1. Null when the text leaves no room for such a path.
function halfWidthClearing(ax: number, ay: number, halfHeight: number) {
  return ay < halfHeight ? ax / (1 - (ay / halfHeight) ** SHAPE) ** (1 / SHAPE) : null
}

export function OrbitHero() {
  const reduce = usePrefersReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    const text = textRef.current
    if (!hero || !text) return
    const items = [...hero.querySelectorAll<HTMLElement>('[data-orbit]')]
    let width = 0
    let height = 0
    let loops: Loop[] = []
    let wideLoop: Loop | undefined
    let halfSizes: { w: number; h: number }[] = []
    let raf = 0
    let visible = true
    let elapsed = 0
    let last = 0

    const measure = () => {
      const box = hero.getBoundingClientRect()
      const textBox = text.getBoundingClientRect()
      width = box.width
      height = box.height
      // Half size of the box each piece takes once tilted.
      halfSizes = items.map((el, i) => {
        const turn = (pieces[i].tilt * Math.PI) / 180
        const cos = Math.abs(Math.cos(turn))
        const sin = Math.abs(Math.sin(turn))
        return {
          w: (el.offsetWidth * cos + el.offsetHeight * sin) / 2,
          h: (el.offsetWidth * sin + el.offsetHeight * cos) / 2,
        }
      })
      const mean = (pick: (s: { w: number; h: number }) => number) =>
        halfSizes.reduce((sum, s) => sum + pick(s), 0) / halfSizes.length

      const pieceW = mean((s) => s.w)
      const pieceH = mean((s) => s.h)
      // The widest path: its sides just inside the screen, its top and bottom just inside the hero.
      const outerHeight = Math.max(height / 2 - pieceH - PAD, 1)
      const ax = textBox.width / 2 + pieceW + PAD
      const ay = textBox.height / 2 + pieceH + PAD
      const outerWidth = Math.max(width / 2 - pieceW - PAD, halfWidthClearing(ax, ay, outerHeight) ?? width * 1.2)
      // The tightest path: as close to the text as its size allows, when there is room for one.
      const tightHeight = Math.min(outerHeight, ay * 1.15)
      const tightWidth = halfWidthClearing(ax, ay, tightHeight)
      const inner = tightWidth === null ? { w: outerWidth, h: outerHeight } : { w: tightWidth, h: tightHeight }
      loops = Array.from({ length: LOOPS }, (_, k) => {
        const mix = k / (LOOPS - 1)
        return buildLoop(inner.w + (outerWidth - inner.w) * mix, inner.h + (outerHeight - inner.h) * mix)
      })
      wideLoop = buildLoop(Math.max(outerWidth, width / 2 + pieceW * 0.6), outerHeight)
    }
    const place = () => {
      if (!loops.length || !wideLoop) return
      items.forEach((el, i) => {
        const path = STRAYS.has(i) && !reduce ? wideLoop! : loops[LOOP_OF[i % LOOP_OF.length]]
        const total = path.length[SAMPLES]
        const [px, py] = pointAt(path, pieces[i].along * total - SPEED * elapsed)
        const size = halfSizes[i]
        // Never cut off at the top or the bottom, whatever the shape of the piece.
        const limitY = Math.max(height / 2 - size.h - PAD, 0)
        const y = Math.max(-limitY, Math.min(limitY, py))
        const limitX = Math.max(width / 2 - size.w - PAD, 0)
        const x = reduce ? Math.max(-limitX, Math.min(limitX, px)) : px
        // The tilt goes last: the CSS `rotate` property would turn the offset too and move the piece.
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${pieces[i].tilt}deg)`
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
    // A piece has no height until its image loads, so it is measured again whenever any piece, or
    // the text, changes size. Without this the first measure would let tall pieces touch the edge.
    const sizeObserver = new ResizeObserver(onResize)
    items.forEach((el) => sizeObserver.observe(el))
    sizeObserver.observe(text)
    start()
    return () => {
      observer.disconnect()
      sizeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [reduce])

  return (
    <header
      ref={heroRef}
      className="relative left-1/2 grid h-[calc(100svh-7rem)] min-h-[34rem] w-screen -translate-x-1/2 place-items-center"
    >
      {/* The stickers. Decorative. Clipped at the screen edge so a piece that is on its way out or
          in never widens the page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((piece, index) => (
          <div
            key={index}
            data-orbit
            className={`absolute left-1/2 top-1/2 ${sizes[piece.fit]}`}
          >
            <SafeImage
              src={piece.src}
              alt=""
              fallback={null}
              draggable={false}
              className="block h-auto w-full select-none"
            />
          </div>
        ))}
      </div>

      <div ref={textRef} className="relative z-10 mx-auto max-w-3xl px-4 text-center">
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
