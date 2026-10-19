import { paths } from '../../paths'
import { Heading } from '../../components/ui/Heading'
import { Script } from '../../components/ui/Script'
import { Section } from '../../components/ui/Section'
import { SplitButton } from '../../components/ui/SplitButton'
import { ManifestoMedia } from './ManifestoMedia'

// REQ-WEB-HOME-007. PROVISIONAL COPY (not approved yet), built from approved manual texts:
// "Si no me convence, no sale" and "Lo firma Pando" (key message 5) are literal; the headline and
// the first sentence are new, derived from "Que lo genérico no tenga lugar en tu día".
// Photos are placeholders: pass `src` (and `alt`) to ManifestoMedia when real photos exist.
// Per the manual, faces only appear in real photos with permission.
// Headline: DM Sans, all regular except "no entra." in bold (team decision, after the reference).
export function ManifestoSection() {
  return (
    <Section labelledBy="manifiesto-title" screen airy>
      <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16">
        {/* Text first in the DOM (reading order); on desktop the media sits on the left. */}
        <div className="flex flex-col items-center text-center md:order-2">
          <Script>Soy Pando</Script>
          <Heading id="manifiesto-title" as="h2" size="headline" family="sans" className="mt-3">
            <span className="block font-normal">Lo genérico acá</span>
            <span className="block font-extrabold">no entra.</span>
          </Heading>
          <p className="mt-6 max-w-md text-balance md:max-w-lg md:text-lg">
            Diseño stickers para que tu día no se parezca al de todos. Cada pieza la pienso, la
            trabajo y la curo yo. Si no me convence, no sale.
          </p>
          <div className="mt-8">
            <SplitButton to={paths.about}>Conocé el estudio</SplitButton>
          </div>
        </div>

        <div className="md:order-1">
          <ManifestoMedia photos={[{ tone: 'azul' }, { tone: 'tinta' }]} />
        </div>
      </div>
    </Section>
  )
}
