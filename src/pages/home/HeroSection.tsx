import { useLayoutEffect, useRef } from 'react'
import { paths } from '../../paths'
import { ArrowLink } from '../../components/ui/ArrowLink'
import { Section } from '../../components/ui/Section'
import { HeroHeadline } from './HeroHeadline'
import { PandoBehind } from './PandoBehind'
import { useHeroMotion } from './useHeroMotion'

// REQ-WEB-HOME-002 + 003. Composition (team decision): Pando big on the left and cropped by the
// edge, text on the right, one small call to action with a single hand-drawn mark. PROVISIONAL COPY: the final hero copy is still pending. Both lines come from
// approved brand texts: the welcome phrase "Metete, es Pandito." and the promise
// "Un diseño original, con una calidad que se nota." (manual, Voz and La marca).
// The headline stays ink, not orange (team clarification).
// The hero height leaves room below it so the whole tape divider (band plus wave, about 80 px each
// side of the boundary on desktop, 46 px on mobile) is visible on the first screen instead of
// peeking half way. On very short screens the content wins and the tape moves below the fold.
export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  useHeroMotion(ref)

  // Distance from the top of the page to the top of the hero, so the grain can reach the top edge.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () =>
      el.style.setProperty('--grain-top', String(Math.round(el.getBoundingClientRect().top + window.scrollY)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])

  return (
    <Section
      ref={ref}
      labelledBy="hero-title"
      className="relative isolate flex min-h-[calc(100svh-12.75rem)] md:min-h-[calc(100svh-14.5rem)] flex-col items-start justify-center pb-56 pt-4 text-left md:pb-16 md:pt-8"
    >
      <PandoBehind />
      <div className="md:ml-auto md:w-[48%]">
        <p className="max-w-xs text-balance font-medium md:max-w-md md:text-lg">
          Un diseño original, con una calidad que se nota.
        </p>
        <HeroHeadline id="hero-title" lines={['Metete,', 'es Pandito.']} />
        <div className="mt-8">
          <ArrowLink to={paths.catalog} mark>
            Ver catálogo
          </ArrowLink>
        </div>
      </div>
      {/* Grain covers the nav and the hero as one surface, edge to edge, so there is no visible cut.
          It starts at the very top of the page (--grain-top, measured above) and ends at the hero
          boundary, where the tape divider sits on top of it. */}
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute bottom-0 left-1/2 w-screen -translate-x-1/2 opacity-20"
        style={{ top: 'calc(var(--grain-top, 0) * -1px)' }}
      />
    </Section>
  )
}
