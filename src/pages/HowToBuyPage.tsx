import { paths } from '../paths'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Script } from '../components/ui/Script'
import { HowToBuySection } from './home/HowToBuySection'
import { tones } from './today/tones'
import type { TodayTone } from './today/todayItems'

// How to buy (REQ-WEB-HOWTO-*). The three steps of the Home (choose, write, coordinate) and, under
// them, what a person needs to know before writing: the stickers in stock are confirmed by the
// team, anything else can be requested, and the delivery is at a meeting point. Nothing is bought
// on the site; everything is closed on WhatsApp. PROVISIONAL COPY: it says nothing about times,
// places or prices, because none of that is approved yet; the team fills it in.
const notes: { title: string; text: string; image: string; tone: TodayTone; cut?: boolean }[] = [
  {
    title: 'Hay en stock',
    text: 'Tengo muchos diseños listos para llevar. Igual, antes de que nos veamos te confirmo que lo que elegiste esté disponible.',
    image: '/stickers/isotipo-disc.svg',
    tone: 'azul',
  },
  {
    title: 'Si no está, se pide',
    text: '¿Querés un diseño agotado, otro tamaño u otro material? Se puede solicitar. Escribime y te cuento cuánto demora.',
    image: '/stickers/star-eye.svg',
    tone: 'amarillo',
  },
  {
    title: 'Nos vemos en un punto de encuentro',
    text: 'La entrega es en mano, en un punto de encuentro. El lugar y el momento los acordamos por WhatsApp.',
    image: '/brand/pando-mano-senalar.svg',
    tone: 'naranja',
    cut: true,
  },
]

export function HowToBuyPage() {
  return (
    <>
      <HowToBuySection headingAs="h1" />

      <section aria-labelledby="antes-title" className="mx-auto max-w-5xl pb-16 pt-16 md:pb-28 md:pt-24">
        <div className="text-center">
          <Script>Antes de escribir</Script>
          <h2 id="antes-title" className="mt-2 font-display text-4xl uppercase leading-none md:text-6xl">
            Lo que tenés que saber
          </h2>
        </div>

        <ul className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3 md:gap-6">
          {notes.map((note) => (
            <li
              key={note.title}
              className="flex flex-col rounded-ui border-[1.5px] border-tinta bg-crema p-3 shadow-sticker md:p-4"
            >
              <div
                aria-hidden="true"
                className={`grid aspect-[16/10] place-items-center md:aspect-[4/3] overflow-hidden rounded-[0.25rem] ${tones[note.tone]}`}
              >
                <img
                  src={note.image}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className={`max-h-[78%] w-[52%] select-none object-contain ${note.cut ? 'die-cut-thick' : ''}`}
                />
              </div>
              <h2 className="mt-4 font-display text-2xl uppercase leading-none md:text-3xl">{note.title}</h2>
              <p data-reveal className="mt-3 text-pretty text-base leading-relaxed text-tinta/85">{note.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <ArrowLink to={paths.catalog} mark>
            Elegir mis stickers
          </ArrowLink>
        </div>
      </section>
    </>
  )
}
