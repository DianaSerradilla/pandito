import { asset } from '../../lib/asset'
import { useEffect, useRef, type ReactNode } from 'react'
import type { FeaturedItem } from '../../data/publicCatalog'
import { FeaturedCard } from './FeaturedCard'
import { ScrollSticker } from './ScrollSticker'

// Featured stickers stuck on a laptop (a photo) while you scroll (team request, replaces the
// card stack). The section is pinned; each sticker, one after the other, comes in from the viewer's side
// (bigger, tilted, with a long soft shadow), slams onto the wall, gets a small press and stays
// there, flat, with a tight shadow. The scroll drives it, nothing repeats on its own.
// Easing is smoothed (lerp) so it follows the scroll without jumping.
const SCROLL_PER_STICKER = 0.8 // screens of scroll for each sticker
const HOLD = 0.12 // last share of the scroll, with everything already stuck
const APPROACH = 0.74 // share of each sticker's turn spent flying in; the rest is the press

// The metal of the notebook in the photo is seen at an angle, so a sticker is laid on that plane
// instead of facing the viewer: its own x axis follows the rows of keys (rising to the right) and its
// own y axis follows the depth of the notebook (falling to the right, shorter because it is seen
// obliquely). The two numbers of each axis are where a step of 1 along it lands on screen. Measured
// on public/images/featured-notebook.webp; with another photo these four numbers must be measured
// again.
const PLANE = { xx: 0.883, xy: -0.469, yx: 0.62, yy: 0.5 }

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

function useWallScroll(ref: React.RefObject<HTMLElement | null>, featuredItems: FeaturedItem[]) {
  useEffect(() => {
    const section = ref.current
    if (!section) return
    const stickers = [...section.querySelectorAll<HTMLElement>('[data-wall-sticker]')]
    const n = stickers.length
    let target = 0
    let current = 0
    let raf = 0

    const read = () => {
      const bounds = section.getBoundingClientRect()
      const range = bounds.height - window.innerHeight
      target = range > 0 ? clamp(-bounds.top / range) : 0
    }

    // Stickers that are not moving (not started yet, or already stuck) are not touched again: the
    // filter and the blend on every frame are expensive, and only the one in flight needs them.
    const lastP: number[] = []

    const apply = (progress: number) => {
      const u = (progress * n) / (1 - HOLD)
      stickers.forEach((el, index) => {
        const item = featuredItems[index]
        if (!item) return
        const p = clamp(u - index)
        if (lastP[index] === p) return
        lastP[index] = p
        const a = clamp(p / APPROACH)
        const e = a * a // accelerates into the wall
        const lift = 1 - e
        const press = Math.sin(Math.PI * clamp((p - APPROACH) / (1 - APPROACH)))
        const scale = 1 + lift * 0.85 - 0.07 * press
        const rotation = item.rotate + lift * item.from.spin
        const stuck = p >= 1

        // The plane comes first (outermost): the sticker lies on the metal of the notebook, so its
        // own rotation and scale happen inside that plane.
        el.style.transform =
          `translate(-50%, -50%) matrix(${PLANE.xx}, ${PLANE.xy}, ${PLANE.yx}, ${PLANE.yy}, 0, 0) ` +
          `translate(${(lift * item.from.x).toFixed(1)}px, ${(lift * item.from.y).toFixed(1)}px) ` +
          `rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(4)})`
        el.style.opacity = p <= 0 ? '0' : clamp(a * 5).toFixed(3)
        // Stuck: a thin, tight contact shadow and slightly dimmed (glass takes some light off).
        el.style.filter =
          `brightness(${(0.92 + lift * 0.08).toFixed(3)}) ` +
          `drop-shadow(0 ${(1 + lift * 30).toFixed(1)}px ${(1.5 + lift * 25).toFixed(1)}px rgb(8 10 20 / ${(0.5 + lift * 0.1).toFixed(2)}))`
        el.style.zIndex = String(index + 1)
        el.style.pointerEvents = stuck ? 'auto' : 'none'
        el.toggleAttribute('inert', !stuck)
      })
    }

    // Each sticker carries a copy of the photo that is masked by its own shape (see `sticker-gloss`),
    // so the reflections of the glass pass over it. The copy must sit exactly where the photo is,
    // so size and offset are measured here (offset* ignores transforms) and refreshed on resize.
    const syncGloss = () => {
      stickers.forEach((el) => {
        const box = el.parentElement
        if (!box) return
        const w = box.offsetWidth
        const h = box.offsetHeight
        const photo = box.parentElement?.querySelector('img')
        const nw = photo?.naturalWidth || 4
        const nh = photo?.naturalHeight || 5
        // The photo fills the box like object-fit: cover, centered across and pinned to the top.
        const k = Math.max(w / nw, h / nh)
        const pw = nw * k
        const ph = nh * k
        el.style.setProperty('--photo-w', `${pw}px`)
        el.style.setProperty('--photo-h', `${ph}px`)
        el.style.setProperty('--photo-x', `${(w - pw) / 2 - (el.offsetLeft - el.offsetWidth / 2)}px`)
        el.style.setProperty('--photo-y', `${-(el.offsetTop - el.offsetHeight / 2)}px`)
      })
    }

    const frame = () => {
      read()
      current += (target - current) * 0.18
      apply(current)
      raf = Math.abs(target - current) > 0.0005 ? requestAnimationFrame(frame) : 0
    }
    const update = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onResize = () => {
      syncGloss()
      update()
    }

    syncGloss()
    read()
    current = target
    apply(current)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [ref, featuredItems])
}

export function FeaturedStack({ intro, items: featuredItems }: { intro: ReactNode; items: FeaturedItem[] }) {
  const ref = useRef<HTMLElement>(null)
  useWallScroll(ref, featuredItems)
  const n = featuredItems.length

  return (
    <section
      ref={ref}
      aria-labelledby="destacados-title"
      style={{ height: `calc(100svh * (1 + ${SCROLL_PER_STICKER} * ${n}))` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The wall is a photo (team request): the corner of a laptop, melting into the ink background
            on its left edge (mobile: on its top edge) with a gradient, and into it at the bottom,
            where the photo is black. The photo is square and the stickers are placed in % of this
            box. Desktop: the box is a square as tall as the screen (never wider than two thirds of
            it), so the stickers sit on the same spot of the photo at any screen shape. Mobile: a 4:5
            box at the bottom, which trims a tenth of the photo on each side. Keep the photo free of
            other stickers. */}
        <div className="absolute bottom-0 right-0 aspect-[4/5] h-[70svh] md:bottom-auto md:top-0 md:aspect-square md:h-[min(100svh,67vw)] md:w-auto">
          <img
            src={asset('/images/featured-notebook.webp')}
            alt=""
            aria-hidden="true"
            draggable={false}
            onLoad={() => window.dispatchEvent(new Event('resize'))}
            className="absolute inset-0 h-full w-full select-none object-cover object-top"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-tinta via-tinta/40 to-transparent to-45% md:bg-gradient-to-r md:from-tinta md:from-12% md:via-tinta/55 md:via-22% md:to-transparent md:to-45%"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px h-[14%] bg-gradient-to-t from-tinta to-transparent"
          />
          <ul className="absolute inset-0">
            {featuredItems.map((item) => (
              <li
                key={item.slug}
                data-wall-sticker
                className="group absolute left-(--mx) top-(--my) w-(--mw) will-change-transform hover:z-[60]! focus-within:z-[60]! md:left-(--dx) md:top-(--dy) md:w-(--dw)"
                style={
                  {
                    '--mx': `${item.x}%`,
                    '--my': `${item.y}%`,
                    '--mw': `${item.width}%`,
                    '--dx': `${item.desktop.x}%`,
                    '--dy': `${item.desktop.y}%`,
                    '--dw': `${item.desktop.width}%`,
                    opacity: 0,
                  } as React.CSSProperties
                }
              >
                <FeaturedCard item={item} />
                <span
                  aria-hidden="true"
                  className="sticker-gloss"
                  style={{
                    maskImage: `url(${item.image})`,
                    WebkitMaskImage: `url(${item.image})`,
                  }}
                />
                {/* Paper label stuck under the sticker, shown on hover or keyboard focus. The sticker
                    itself is already a link with its name, so this is only a visual extra. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 scale-90 -rotate-2 whitespace-nowrap rounded-ui bg-crema px-4 py-2 text-center text-base font-bold leading-tight text-tinta opacity-0 shadow-sticker transition-[opacity,scale] duration-300 ease-spring group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:scale-100 group-hover:opacity-100"
                >
                  {item.name}
                  {item.price ? <span className="block font-medium text-naranja">{item.price}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* This layer spans the whole screen, so it lets the mouse through to the stickers; only the
            text block takes it back (for the link). */}
        <div className="pointer-events-none relative z-10 flex h-full items-start px-4 pt-[14svh] md:items-center md:px-8 md:pt-0">
          <div className="w-full max-w-[88rem] md:mx-auto">
            <div className="pointer-events-auto md:max-w-[min(34rem,45vw)]">{intro}</div>
          </div>
        </div>
        <ScrollSticker className="pointer-events-none absolute bottom-2 left-2 z-10 size-14 md:bottom-8 md:left-8 md:size-28" />
        <p className="sr-only">
          Destacados: {featuredItems.map((i) => i.name).join(', ')}.
        </p>
      </div>
    </section>
  )
}
