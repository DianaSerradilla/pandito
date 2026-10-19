import { paths } from '../../paths'
import { ButtonLink } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { SplitButton } from '../../components/ui/SplitButton'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { FeaturedCard } from './FeaturedCard'
import { FeaturedStack } from './FeaturedStack'
import { ScrollSticker } from './ScrollSticker'
import { featuredItems } from './featuredItems'

// REQ-WEB-HOME-008, composition after "Recent werk" on extrafazant.nl: tinta background, small
// line, big title, stack of framed cards that opens as you scroll, a button to the full list and a
// round seal in the corner.
// Typography plays with the three manual families: DM Sans (small line), Anton ("LOS") and Rock Salt
// ("Destacados", in orange: the manual allows Rock Salt in orange on ink, and it always counts as
// large text). Rock Salt is meant for short comments and signatures in the manual; using it for
// this title is a team decision.
// PROVISIONAL COPY: the small line is key message 2 of the manual, literal. The title is new.
// The button goes to the catalog; the "destacados" filter is wired in the catalog requirements
// (REQ-WEB-CATALOG-003), so for now the query param is only a marker.
// The data is placeholder (see featuredItems.ts).
const allFeaturedHref = `${paths.catalog}?filtro=destacados`

function Intro() {
  return (
    <div className="shrink-0 text-center">
      <p className="mx-auto max-w-xs text-balance font-medium md:max-w-md md:text-lg">
        Cada pieza es pensada, trabajada y curada.
      </p>
      {/* Roomy on purpose: Rock Salt's strokes reach below the baseline, so the line height and the
          gaps leave air around the title. */}
      <h2
        id="destacados-title"
        className="mt-5 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 pb-2 leading-[1.25] md:mt-6 md:gap-x-8"
      >
        <span className="font-display text-display uppercase">Los</span>
        <span className="font-script text-script-title text-naranja">Destacados</span>
      </h2>
    </div>
  )
}

function AllFeaturedButton() {
  return (
    <SplitButton tone="crema" to={allFeaturedHref}>
      Ver todos los destacados
    </SplitButton>
  )
}

export function FeaturedSection() {
  const reduce = usePrefersReducedMotion()

  return (
    // Full-bleed tinta background with crema text (an approved pair). surface-dark switches the
    // focus ring to yellow so it stays visible on dark.
    <div className="surface-dark relative left-1/2 w-screen -translate-x-1/2 bg-tinta text-crema">
      {featuredItems.length === 0 ? (
        <section aria-labelledby="destacados-title" className="px-4 py-32 md:px-8">
          <Intro />
          <div className="mx-auto mt-10 max-w-xl text-tinta">
            <StatusMessage
              kind="empty"
              title="Sin destacados por ahora"
              action={
                <ButtonLink to={paths.catalog} variant="secondary">
                  Ver catálogo
                </ButtonLink>
              }
            />
          </div>
        </section>
      ) : reduce ? (
        // Reduced motion: no pinning, no sliding. All cards in a plain grid.
        <section aria-labelledby="destacados-title" className="relative py-20 md:py-32">
          <Container>
            <Intro />
            <ul className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-2">
              {featuredItems.map((item) => (
                <li key={item.slug} className="aspect-[4/3]">
                  <FeaturedCard item={item} />
                </li>
              ))}
            </ul>
            <div className="mt-12 flex justify-center">
              <AllFeaturedButton />
            </div>
          </Container>
          <ScrollSticker className="pointer-events-none absolute bottom-4 right-4 size-24 md:bottom-8 md:right-8 md:size-32" />
        </section>
      ) : (
        <FeaturedStack intro={<Intro />} action={<AllFeaturedButton />} />
      )}
    </div>
  )
}
