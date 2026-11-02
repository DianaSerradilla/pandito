import { paths } from '../../paths'
import { ButtonLink } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { ArrowLink } from '../../components/ui/ArrowLink'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { FeaturedCard } from './FeaturedCard'
import { FeaturedStack } from './FeaturedStack'
import { ScrollSticker } from './ScrollSticker'
import { isConnected, useFeaturedItems } from '../../data/publicCatalog'

// There is no "most requested" list yet (it will come from real sales), so this goes to the whole catalog.
const allFeaturedHref = paths.catalog

function Intro({ desktopLeft = false }: { desktopLeft?: boolean }) {
  return (
    <div className={`shrink-0 text-center ${desktopLeft ? 'md:text-left' : ''}`}>
      <p className={`mx-auto max-w-xs text-balance font-medium text-crema/85 md:max-w-md md:text-base ${desktopLeft ? 'md:mx-0' : ''}`}>
        Mis mejores diseñitos.
      </p>
      <h2
        id="destacados-title"
        className={`mt-4 text-center leading-[0.86] md:mt-5 ${desktopLeft ? 'md:text-left' : ''}`}
      >
        <span className="block font-display text-[clamp(2.5rem,4.2vw,4.5rem)] uppercase">Lo que más me</span>
        <span className="mt-1 block font-script text-[clamp(3rem,6vw,5.5rem)] text-naranja md:mt-2">piden</span>
      </h2>
    </div>
  )
}

function AllFeaturedButton() {
  return (
    <ArrowLink to={allFeaturedHref} mark>
      Ver los más pedidos
    </ArrowLink>
  )
}

export function FeaturedSection() {
  const reduce = usePrefersReducedMotion()
  const featuredItems = useFeaturedItems()

  // Connected, no featured pieces (still loading, none chosen, or the read failed) means no section:
  // an empty "most requested" block would promise something that is not there.
  if (isConnected && featuredItems.length === 0) return null

  return (
    <div className="surface-dark relative left-1/2 w-screen -translate-x-1/2 bg-tinta text-crema">
      {featuredItems.length === 0 ? (
        <section aria-labelledby="destacados-title" className="relative px-4 py-32 md:px-8">
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
        <section aria-labelledby="destacados-title" className="relative py-20 md:py-32">
          <Container>
            <Intro />
            <ul className="mx-auto mt-14 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-12">
              {featuredItems.map((item) => (
                <li
                  key={item.slug}
                  className="w-36 md:w-44"
                  style={{ transform: `rotate(${item.rotate}deg)` }}
                >
                  <FeaturedCard item={item} />
                </li>
              ))}
            </ul>
            <div className="mt-12 flex justify-center">
              <AllFeaturedButton />
            </div>
          </Container>
          <ScrollSticker className="pointer-events-none absolute bottom-4 left-4 size-24 md:bottom-8 md:left-8 md:size-24" />
        </section>
      ) : (
        <FeaturedStack
          items={featuredItems}
          intro={
            <div>
              <Intro desktopLeft />
              <div className="mt-8 md:mt-10">
                <AllFeaturedButton />
              </div>
            </div>
          }
        />
      )}
    </div>
  )
}





