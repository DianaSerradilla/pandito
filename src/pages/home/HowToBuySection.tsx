import { site } from '../../config/site'
import { Heading } from '../../components/ui/Heading'
import { Script } from '../../components/ui/Script'
import { Section } from '../../components/ui/Section'
import { SplitButtonAnchor } from '../../components/ui/SplitButton'

// REQ-WEB-HOME-009, composition after "Wat we doen" on extrafazant.nl: small line, big title and
// three framed, tilted cards, with a button below. The steps are the team's:
//   1. look at the catalog and build the cart  2. send the order on WhatsApp  3. pick it up at the
// delivery zone. PROVISIONAL COPY in Pando's voice: the small line ("Así de simple") comes from the
// manual; titles and descriptions are new. It never promises online payment, guaranteed stock or a
// confirmed order: step 2 says WhatsApp is where availability and delay are confirmed.
// The button asks the team's doubts via WhatsApp (the REQ allows another action "as defined").
// Card images are not available, so the image slot carries the step number (a real sequence).
// Frame colors keep to approved text pairs: crema on azul and on tinta. On naranja the title is
// large crema (allowed) and the description is tinta (4.53:1, not a listed pair: to confirm).
type Step = {
  number: string
  title: string
  text: string
  frame: string
  textColor: string
  placement: string
}

const steps: Step[] = [
  {
    number: '1',
    title: 'Elegí',
    text: 'Mirá el catálogo y armá tu carrito.',
    frame: 'bg-azul',
    textColor: 'text-crema',
    placement: '-rotate-[2.5deg] md:translate-y-2',
  },
  {
    number: '2',
    title: 'Pedí',
    text: 'Mandame tu pedido por WhatsApp y te confirmo disponibilidad y demora.',
    frame: 'bg-naranja',
    textColor: 'text-tinta',
    placement: 'rotate-[1deg] md:-translate-y-6 md:rotate-0',
  },
  {
    number: '3',
    title: 'Retirá',
    text: 'Pasás por la zona de entregas, en el día y horario que elegiste.',
    frame: 'bg-tinta',
    textColor: 'text-crema',
    placement: 'rotate-[2deg] md:translate-y-8 md:rotate-[1.5deg]',
  },
]

export function HowToBuySection() {
  return (
    <Section labelledBy="como-comprar-title" screen airy>
      <div className="text-center">
        <Script>Así de simple</Script>
        <Heading id="como-comprar-title" as="h2" size="display" family="sans" className="mt-2">
          <span className="font-normal">Cómo </span>
          <span className="font-extrabold">comprar</span>
        </Heading>
      </div>

      <ol className="mx-auto mt-16 grid max-w-[72rem] gap-10 md:mt-20 md:grid-cols-3 md:items-start md:gap-8">
        {steps.map((step) => (
          <li
            key={step.number}
            className={`mx-auto w-full max-w-[20rem] transition-[rotate,scale] duration-300 ease-soft hover:scale-[1.03] hover:rotate-0 md:max-w-none ${step.placement}`}
          >
            <div className={`rounded-ui p-3 md:p-4 ${step.frame} ${step.textColor}`}>
              {/* Image slot: shows the step number until real images exist. */}
              <div className="grid aspect-[4/5] place-items-center rounded-[3px] bg-crema">
                <span aria-hidden="true" className="font-script text-[9rem] leading-none text-naranja">
                  {step.number}
                </span>
              </div>
              <div className="px-1 pb-3 pt-5 text-center">
                <h3 className="font-display text-title uppercase text-crema">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[17rem] text-balance">{step.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-20 flex justify-center md:mt-24">
        <SplitButtonAnchor
          href={site.whatsappUrl}
          aria-label="¿Dudas? Escribime por WhatsApp (se abre en una pestaña nueva)"
        >
          ¿Dudas?
        </SplitButtonAnchor>
      </div>
    </Section>
  )
}
