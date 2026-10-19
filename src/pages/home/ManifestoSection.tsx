import { paths } from '../../paths'
import { Heading } from '../../components/ui/Heading'
import { Script } from '../../components/ui/Script'
import { Section } from '../../components/ui/Section'
import { ArrowLink } from '../../components/ui/ArrowLink'
import { ManifestoMedia } from './ManifestoMedia'

// REQ-WEB-HOME-007. An editorial overlap on desktop lets the real collage set the scene while
// a cream reading plane protects the message from visual noise.
export function ManifestoSection() {
  return (
    <Section labelledBy="manifiesto-title" screen airy className="relative isolate md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-24">
        {/* Text comes first in the DOM for reading order; media leads visually on desktop. */}
        <div className="relative z-[1] flex flex-col items-center text-center md:order-2 md:items-start md:pl-6 md:text-left">
          <Script>Soy Pando</Script>
          <Heading
            id="manifiesto-title"
            as="h2"
            size="headline"
            family="sans"
            className="mt-2 max-w-[15ch] leading-[0.95] md:mt-0"
          >
            <span className="block font-normal">Lo genérico acá</span>
            <span className="block font-extrabold md:text-[1.2em]">no entra.</span>
          </Heading>
          <p className="mt-5 max-w-md text-balance md:max-w-[33rem] md:text-lg">
            Diseño stickers para que tu día no se parezca al de todos. Cada pieza la pienso, la
            trabajo y la curo yo. Si no me convence, no sale.
          </p>
          <div className="mt-6">
            <ArrowLink to={paths.about} mark>Conocé el estudio</ArrowLink>
          </div>
        </div>

        <div className="relative z-0 md:order-1 md:w-full">
          <ManifestoMedia
            photos={[
              {
                src: '/images/pando-sticker-hand.png',
                alt: 'Mano naranja de Pando sosteniendo stickers ante un cielo azul',
                tone: 'azul',
              },
              {
                src: '/images/pando-sticker-wall.png',
                alt: 'Stickers de Pando sobre una superficie azul',
                tone: 'tinta',
              },
            ]}
          />
        </div>
      </div>
      {/* Pando's pointing hand ("Señalar" pose, Figma node 74:272): the arm comes in from beyond the
          right edge of the screen, lying down (its cut end must never show), and the finger points at the call to action (team layout).
          Rotated around the base of the arm, which sits on the screen edge. The finger
          gives a small nudge now and then (motion-safe only). Desktop only: on mobile the centered
          text leaves no free corner for it. Decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[8%] z-[1] hidden h-0 w-0 md:block"
        style={{ right: 'calc(50% - 50vw - 5.5rem)' }}
      >
        <div className="absolute bottom-0 left-0 w-44 origin-bottom -translate-x-1/2 -rotate-[67deg] lg:w-56">
          <img
            src="/brand/pando-mano-senalar.svg"
            alt=""
            className="pando-point block w-full select-none"
          />
        </div>
      </div>
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 opacity-20" />
    </Section>
  )
}