import { useEffect, useRef, type RefObject } from 'react'
import { useCursorMotion } from '../../hooks/useCursorMotion'
import { closingStickers as stickers } from './closingStickers'

// Stickers that pop out along the mouse path (reference: the closing section of extrafazant.nl).
// Observed behavior, reproduced with our own values (the reference timing could not be measured):
// every few hundred px of mouse travel one sticker appears at the cursor, tilted at random, pops in,
// stays a moment and fades. A small pool of elements is reused, so nothing piles up.
// The stickers are the team's own designs (see closingStickers.ts); they carry their own borders and
// sit on the ink background. They are downloaded the first time the pointer enters the section, so
// no piece pops out empty and nothing is fetched for a visitor who never gets there.
// Only with a mouse and without prefers-reduced-motion; otherwise three static stickers are shown.
// Decorative, so hidden from assistive tech. Stickers sit behind the text.
//
// Team adjustments: stickers come out less often (far apart and never too soon after the last one),
// are bigger, and never appear close to an edge of the section, so none is cut off. `aspect` is the
// height over the width of each piece, used to know how much room it needs.
const POOL = 12
const SPACING = 140 // px of mouse travel between stickers
const MIN_GAP = 220 // ms between one sticker and the next
const LIFETIME = 2400 // ms
const EDGE = 28 // px of clear space kept between a sticker and the edge of the section
const TILT_ROOM = 1.3 // a tilted sticker takes up a bit more than its own box

function StaticStickers() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src={stickers[6].src}
        alt=""
        className="absolute left-[5%] top-[14%] w-28 -rotate-[10deg] md:w-44"
      />
      <img
        src={stickers[2].src}
        alt=""
        className="absolute right-[7%] top-[18%] w-20 rotate-[9deg] md:w-32"
      />
      <img
        src={stickers[0].src}
        alt=""
        className="absolute bottom-[14%] left-[14%] w-16 rotate-[7deg] md:w-28"
      />
    </div>
  )
}

export function StickerTrail({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const live = useCursorMotion()
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const layer = layerRef.current
    if (!live || !section || !layer) return

    const pool = Array.from({ length: POOL }, () => {
      const img = document.createElement('img')
      img.alt = ''
      img.draggable = false
      img.className = 'absolute left-0 top-0 h-auto opacity-0'
      layer.appendChild(img)
      return img
    })
    let next = 0
    let kind = 0
    let lastX = -1e9
    let lastY = -1e9
    let lastTime = 0

    const onMove = (e: PointerEvent) => {
      const box = layer.getBoundingClientRect()
      const x = e.clientX - box.left
      const y = e.clientY - box.top
      if (Math.hypot(x - lastX, y - lastY) < SPACING) return
      if (e.timeStamp - lastTime < MIN_GAP) return

      // Not near an edge: the whole sticker, tilted, has to fit inside the section.
      const sticker = stickers[kind]
      const halfW = (sticker.width / 2) * TILT_ROOM + EDGE
      const halfH = ((sticker.width * sticker.aspect) / 2) * TILT_ROOM + EDGE
      if (x < halfW || x > box.width - halfW || y < halfH || y > box.height - halfH) return
      lastX = x
      lastY = y
      lastTime = e.timeStamp

      const el = pool[next]
      next = (next + 1) % POOL
      kind = (kind + 1) % stickers.length
      el.getAnimations().forEach((a) => a.cancel())
      el.src = sticker.src
      el.style.width = `${sticker.width}px`
      el.style.left = `${x}px`
      el.style.top = `${y}px`

      const rot = (Math.random() * 2 - 1) * 20
      const at = (scale: number, turn: number) =>
        `translate(-50%, -50%) scale(${scale}) rotate(${rot + turn}deg)`
      // Easing is set per segment (pop in, hold, fade out). A single easing on the whole animation
      // would squash the timeline and skip the hold.
      el.animate(
        [
          { opacity: 0, transform: at(0.2, -25), easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          { opacity: 1, transform: at(1.08, 0), offset: 0.16, easing: 'ease-out' },
          { opacity: 1, transform: at(1, 0), offset: 0.68, easing: 'ease-in' },
          { opacity: 0, transform: at(0.6, 10) },
        ],
        { duration: LIFETIME, easing: 'linear', fill: 'both' },
      )
    }

    const preload = () => stickers.forEach((s) => { new Image().src = s.src })

    section.addEventListener('pointerenter', preload, { once: true })
    section.addEventListener('pointermove', onMove)
    return () => {
      section.removeEventListener('pointerenter', preload)
      section.removeEventListener('pointermove', onMove)
      pool.forEach((el) => {
        el.getAnimations().forEach((a) => a.cancel())
        el.remove()
      })
    }
  }, [live, sectionRef])

  return live ? (
    <div ref={layerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />
  ) : (
    <StaticStickers />
  )
}
