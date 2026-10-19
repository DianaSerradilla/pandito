import { useLayoutEffect, useRef } from 'react'
import { paths } from '../../paths'
import { ArrowLink } from '../../components/ui/ArrowLink'
import { Section } from '../../components/ui/Section'
import { HeroHeadline } from './HeroHeadline'
import { PandoBehind } from './PandoBehind'
import { useHeroMotion } from './useHeroMotion'

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  useHeroMotion(ref)

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
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute bottom-0 left-1/2 w-screen -translate-x-1/2 opacity-20"
        style={{ top: 'calc(var(--grain-top, 0) * -1px)' }}
      />
    </Section>
  )
}