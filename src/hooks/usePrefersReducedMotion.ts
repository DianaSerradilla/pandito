import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const q = window.matchMedia(QUERY)
  q.addEventListener('change', onChange)
  return () => q.removeEventListener('change', onChange)
}

// True when the person asked the system for reduced motion. Followed live. Use it for motion that
// does not depend on the cursor (for cursor-driven motion see useCursorMotion).
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
