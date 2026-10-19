import { useEffect, type RefObject } from 'react'
import { useCursorMotion } from '../../hooks/useCursorMotion'

const LETTER_RADIUS = 90 // px around the cursor that lifts letters
const LETTER_LIFT = 0.05 // em: a barely-there lift (about 5 px on a 100 px headline)
// How far the pupil may travel, in SVG units, so it stays inside the white of the eye.
const PUPIL_X = 22
const PUPIL_Y = 12

// Hero motion (team decisions, see REQ-WEB-HOME-005):
//  - Pando's EYES follow the cursor anywhere on screen while the hero is visible. The rest of
//    Pando stays still: only the pupil moves.
//  - Headline letters lift very slightly when the cursor passes near them.
// Only on devices with a fine pointer and hover, and never with prefers-reduced-motion (REQ-WEB-HOME-006).
// Touch and reduced motion get the static state: eyes centered, letters in place, content fully
// readable. The preference is followed live (see useCursorMotion).
//
// Repetition policy: nothing here loops, replays or runs on its own. Both effects only respond to
// the cursor, only while the hero is on screen, and settle back when it leaves. There is no
// entrance animation to replay on navigation or scroll.
export function useHeroMotion(ref: RefObject<HTMLElement | null>) {
  const enabled = useCursorMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || !enabled) return

    const letters = [...root.querySelectorAll<HTMLElement>('[data-letter]')]
    const lift = letters.map(() => 0)
    const pupil = root.querySelector<SVGPathElement>('[data-pando-pupil]')
    const eye = root.querySelector<SVGPathElement>('[data-pando-eye]')
    let cx = 0
    let cy = 0
    let active = false // cursor is on the page and the hero is visible
    let visible = true
    let hasCursor = false
    let ox = 0
    let oy = 0
    let raf = 0

    const tick = () => {
      let moving = false

      // Eyes: the pupil looks toward the cursor and returns to the center when it leaves.
      if (pupil && eye) {
        let tox = 0
        let toy = 0
        if (active) {
          const r = eye.getBoundingClientRect()
          const vx = cx - (r.left + r.width / 2)
          const vy = cy - (r.top + r.height / 2)
          const dist = Math.hypot(vx, vy) || 1
          const strength = Math.min(1, dist / 260)
          tox = (vx / dist) * strength * PUPIL_X
          toy = (vy / dist) * strength * PUPIL_Y
        }
        ox += (tox - ox) * 0.2
        oy += (toy - oy) * 0.2
        if (Math.abs(tox - ox) > 0.05 || Math.abs(toy - oy) > 0.05) moving = true
        pupil.setAttribute('transform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)})`)
      }

      // Letters: each one lifts a hair when the cursor is close, and settles back after.
      letters.forEach((el, i) => {
        let target = 0
        if (active) {
          const r = el.getBoundingClientRect()
          const d = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2))
          target = Math.max(0, 1 - d / LETTER_RADIUS) ** 1.5
        }
        lift[i] += (target - lift[i]) * 0.2
        if (Math.abs(target - lift[i]) > 0.002) moving = true
        el.style.translate = `0 ${(-lift[i] * LETTER_LIFT).toFixed(4)}em`
      })

      raf = moving ? requestAnimationFrame(tick) : 0
    }

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      cx = e.clientX
      cy = e.clientY
      hasCursor = true
      active = visible
      start()
    }
    const onLeave = () => {
      active = false
      hasCursor = false
      start()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      active = visible && hasCursor
      start()
    })
    observer.observe(root)

    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      observer.disconnect()
      cancelAnimationFrame(raf)
      // Back to the static state (also when the preference changes while the page is open).
      letters.forEach((el) => el.style.removeProperty('translate'))
      pupil?.removeAttribute('transform')
    }
  }, [ref, enabled])
}
