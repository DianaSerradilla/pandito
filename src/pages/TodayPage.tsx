import { paths } from '../paths'
import { site } from '../config/site'
import { ButtonLink } from '../components/ui/Button'
import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'
import { StatusMessage } from '../components/ui/StatusMessage'
import { ShopListing } from './shop/ShopListing'
import { todayEvent, todayFilterGroups, todayItems, type TodayStatus } from '../data/publicCatalog'

// HOY (REQ-WEB-HOY-001..004): the digital version of the physical sample set, for the days Pandito
// sells at an event (a match, a street sale...). Opened from a QR on a phone, so it is designed
// for the phone first (two columns, as the team asked). It is a small online shop: the listing,
// filters, sort and order bar are shared with the Catalog (see shop/ShopListing.tsx).
// SAMPLE DATA and PROVISIONAL COPY: see today/todayItems.ts. It must show only the active event's
// pieces and never an old one.

const stateCopy: Record<Exclude<TodayStatus, 'active'>, { title: string; text: string }> = {
  inactive: {
    title: 'Hoy no hay evento',
    text: 'Cuando vuelva a haber uno, lo ves acá. Mientras tanto podés mirar todo el catálogo.',
  },
  expired: {
    title: 'Este evento ya pasó',
    text: 'El muestrario de hoy ya no está activo. Miralo completo en el catálogo.',
  },
  empty: {
    title: 'Todavía no cargué nada',
    text: 'Estoy preparando lo de hoy. Pasá en un rato o escribime por WhatsApp.',
  },
}

const textButton =
  'inline-flex cursor-pointer items-center rounded-ui border-[1.5px] border-tinta px-4 py-2 font-display uppercase tracking-wide hover:bg-tinta hover:text-crema'

export function TodayPage() {
  if (todayEvent.status !== 'active') {
    const copy = stateCopy[todayEvent.status]
    return (
      <div className="mx-auto max-w-xl py-10 md:py-20">
        <h1 className="sr-only">HOY</h1>
        <StatusMessage
          kind="empty"
          title={copy.title}
          action={
            <div className="flex flex-wrap gap-3">
              <ButtonLink to={paths.catalog} variant="secondary">
                Ver catálogo
              </ButtonLink>
              <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className={textButton}>
                WhatsApp
              </a>
            </div>
          }
        >
          {copy.text}
        </StatusMessage>
      </div>
    )
  }

  return (
    <div className="pb-28 pt-2 md:pb-32 md:pt-8">
      <header className="mx-auto max-w-2xl text-center">
        <Script>{todayEvent.name}</Script>
        <Heading id="hoy-title" as="h1" size="headline" family="sans" className="mt-3 text-balance">
          <span className="block font-normal">Lo que llevo</span>
          <span className="block font-extrabold md:text-[1.2em]">hoy.</span>
        </Heading>
        <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-tinta/80 md:text-lg">
          {todayEvent.context} Elegí desde acá lo que viste en el puesto.
        </p>
      </header>

      <div className="mt-10 lg:mt-14">
        <ShopListing items={todayItems} groups={todayFilterGroups} cleanCards />
      </div>
    </div>
  )
}
