import { useSyncExternalStore } from 'react'

const REDUCE = '(prefers-reduced-motion: reduce)'
const FINE_HOVER = '(hover: hover) and (pointer: fine)'

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(REDUCE), window.matchMedia(FINE_HOVER)]
  queries.forEach((q) => q.addEventListener('change', onChange))
  return () => queries.forEach((q) => q.removeEventListener('change', onChange))
}

const getSnapshot = () =>
  window.matchMedia(FINE_HOVER).matches && !window.matchMedia(REDUCE).matches

// True only when cursor-driven motion is appropriate: a device with a mouse-like pointer and hover,
// and the person has NOT asked the system for reduced motion. It follows the preference live, so
// toggling it while the page is open turns the effects on or off right away.
export function useCursorMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
