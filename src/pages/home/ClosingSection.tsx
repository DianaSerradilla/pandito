import { useRef } from 'react'
import { site } from '../../config/site'
import { SplitButtonAnchor } from '../../components/ui/SplitButton'
import { StickerTrail } from './StickerTrail'

// Closing block (REQ-WEB-HOME-001), composition after the closing section of extrafazant.nl:
// a big two-line question, a short answer, one button, and stickers that pop out as the mouse moves.
// tinta background with crema text (an approved pair), the same ink as the footer so the two read
// as one dark block with no visible seam. The Rock Salt line is yellow on ink (approved).
// PROVISIONAL COPY in Pando's voice, from the team's idea ("¿Diseños personalizados? Sí, obvio.
// Pedilos."). The button opens WhatsApp in a new tab, like the "¿Dudas?" one.
export function ClosingSection() {
  const ref = useRef<HTMLElement>(null)

  return (
    // -mb-10 cancels the 40 px bottom padding that the page layout adds under every page, so the
    // block touches the footer instead of leaving a cream strip between them.
    <div className="surface-dark relative left-1/2 -mb-10 w-screen -translate-x-1/2 bg-tinta text-crema">
      <section
        ref={ref}
        aria-labelledby="cierre-title"
        className="relative flex min-h-svh flex-col items-center justify-center px-4 py-32 text-center md:px-8"
      >
        <StickerTrail sectionRef={ref} />

        <div className="relative z-10 flex flex-col items-center">
          <h2 id="cierre-title" className="font-sans text-closing uppercase tracking-tight">
            <span className="block font-extrabold">¿Diseños</span>
            <span className="block font-normal">personalizados?</span>
          </h2>
          <p className="mt-6 font-script text-script text-amarillo">Sí, obvio. Pedilos.</p>
          <p className="mt-4 max-w-md text-balance md:text-lg">
            Contame qué tenés en mente y lo diseño yo.
          </p>
          <div className="mt-10">
            <SplitButtonAnchor
              href={site.whatsappUrl}
              tone="crema"
              aria-label="Pedí tu diseño personalizado por WhatsApp (se abre en una pestaña nueva)"
            >
              Pedí el tuyo
            </SplitButtonAnchor>
          </div>
        </div>
      </section>
    </div>
  )
}
