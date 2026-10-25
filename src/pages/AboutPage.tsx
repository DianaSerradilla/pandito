import { useLayoutEffect, useRef } from 'react'
import { AboutIntro } from './about/AboutIntro'
import { OrbitHero } from './about/OrbitHero'
import { ServicesSection } from './about/ServicesSection'
import { ClosingSection } from './home/ClosingSection'

// Estudio (REQ-WEB-ABOUT-001..003). Structure after extrafazant.nl/wat-we-doen: a hero with a ring
// of stickers that turns around the title, a block of text, one screen for each thing the studio
// does, and the closing call to action. PROVISIONAL COPY and placeholder art, so the team can fill
// in the real information later. The services block docks to the top of the screen when you scroll
// into it (see ServicesSection).
//
// The fine grain of the Home covers the whole page, from the nav down to the end of the services
// (the dark closing block keeps its own look). One layer over everything, full width, that lets
// the mouse through.
export function AboutPage() {
  const bodyRef = useRef<HTMLDivElement>(null)

  // Distance from the top of the page to the start of the content, so the grain reaches the very top.
  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const measure = () =>
      body.style.setProperty('--grain-top', String(Math.round(body.getBoundingClientRect().top + window.scrollY)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={bodyRef} className="relative">
        <OrbitHero />
        <AboutIntro />
        <ServicesSection />
        <div
          aria-hidden="true"
          className="grain pointer-events-none absolute bottom-0 left-1/2 z-30 w-screen -translate-x-1/2 opacity-20"
          style={{ top: 'calc(var(--grain-top, 0) * -1px)' }}
        />
      </div>
      <ClosingSection />
    </>
  )
}
