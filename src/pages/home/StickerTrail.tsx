import { useEffect, useRef, type RefObject } from 'react'
import { useCursorMotion } from '../../hooks/useCursorMotion'

// Stickers that pop out along the mouse path (reference: the closing section of extrafazant.nl).
// Observed behavior, reproduced with our own values (the reference timing could not be measured):
// every ~110 px of mouse travel one sticker appears at the cursor, tilted at random, pops in,
// stays a moment and fades. A small pool of elements is reused, so nothing piles up.
// The stickers are PLACEHOLDERS made from brand pieces; swap `stickers` for the real designs.
// They sit on the ink background, where the orange logo and isotipo are approved. If this ever
// moves to azul or yellow, give the logo and isotipo a cream plate (the manual forbids them there).
// Only with a mouse and without prefers-reduced-motion; otherwise three static stickers are shown.
// Decorative, so hidden from assistive tech. Stickers sit behind the text.
const stickers = [
  { src: '/brand/isotipo-naranja.svg', width: 84 },
  { src: '/brand/logotipo-naranja.svg', width: 180 },
  { src: '/brand/pando.svg', width: 96 },
]
const POOL = 10
const SPACING = 110 // px of mouse travel between stickers
const LIFETIME = 1700 // ms

function StaticStickers() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src={stickers[1].src}
        alt=""
        className="die-cut absolute left-[5%] top-[14%] w-32 -rotate-[10deg] md:w-44"
      />
      <img
        src={stickers[2].src}
        alt=""
        className="die-cut absolute right-[7%] top-[18%] w-16 rotate-[9deg] md:w-24"
      />
      <img
        src={stickers[0].src}
        alt=""
        className="die-cut absolute bottom-[14%] left-[14%] w-14 rotate-[7deg] md:w-20"
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
      img.className = 'die-cut absolute left-0 top-0 h-auto opacity-0'
      layer.appendChild(img)
      return img
    })
    let next = 0
    let kind = 0
    let lastX = -1e9
    let lastY = -1e9

    const onMove = (e: PointerEvent) => {
      const box = layer.getBoundingClientRect()
      const x = e.clientX - box.left
      const y = e.clientY - box.top
      if (Math.hypot(x - lastX, y - lastY) < SPACING) return
      lastX = x
      lastY = y

      const el = pool[next]
      next = (next + 1) % POOL
      const sticker = stickers[kind]
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

    section.addEventListener('pointermove', onMove)
    return () => {
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
