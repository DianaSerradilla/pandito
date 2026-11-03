import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// Titles, signatures and a few key paragraphs (marked with data-reveal) fade in and rise a little
// the first time they come into view. One observer for the whole page; elements that render later
// (a lazy page, data that arrives) are picked up too. With reduced motion, or without
// IntersectionObserver, nothing is hidden and nothing moves. The hiding rule lives in index.css and
// only applies while <html> has the `reveal-on` class, so a visitor without scripts still sees all.
export function useReveal() {
  const { pathname } = useLocation()
  const reduce = usePrefersReducedMotion()
  const supported = typeof IntersectionObserver !== 'undefined'
  const active = supported && !reduce

  // Set before the first paint and kept across pages, so the next page never flashes visible first.
  useLayoutEffect(() => {
    if (!active) return
    const root = document.documentElement
    root.classList.add('reveal-on')
    return () => root.classList.remove('reveal-on')
  }, [active])

  useEffect(() => {
    if (!active) return
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          // Elements that appear together come in one after another, not all at once.
          el.style.setProperty('--reveal-delay', `${Math.min(order++, 4) * 70}ms`)
          el.setAttribute('data-revealed', '')
          observer.unobserve(el)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    const seen = new WeakSet<Element>()
    const scan = () => {
      document.querySelectorAll('main [data-reveal]:not([data-revealed])').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        observer.observe(el)
      })
    }
    scan()
    const main = document.getElementById('contenido')
    const mutations = main ? new MutationObserver(scan) : null
    if (main) mutations?.observe(main, { childList: true, subtree: true })
    return () => {
      mutations?.disconnect()
      observer.disconnect()
    }
  }, [active, pathname])
}
