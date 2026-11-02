import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'
import { catalogSearchText, useCatalog } from '../data/publicCatalog'
import { useCatalogStatus } from '../data/useCatalogStatus'
import { CatalogTopicFilter } from './catalog/CatalogTopicFilter'
import { ShopListing } from './shop/ShopListing'

// Catalog (REQ-WEB-CATALOG-*), PROTOTYPE. The same shop as HOY (search, sort, filters, order bar)
// with a filter column built for many topics: Color is a short list, and Tema has a
// search, the popular topics and the rest grouped by family (see catalog/CatalogTopicFilter.tsx).
// Only stickers for now. When posters arrive, each product type gets its own route and its own
// short filter groups; the listing and the cards do not change. The pieces and the topics come from
// Supabase when it is connected (loading, failed and empty states included); without it they are
// SAMPLE DATA. PROVISIONAL COPY.
export function CatalogPage() {
  const { status, retry } = useCatalogStatus()
  const catalog = useCatalog()
  return (
    <div className="pb-28 pt-2 md:pb-32 md:pt-8">
      <header className="mx-auto max-w-2xl text-center">
        <Script>Stickers</Script>
        <Heading id="catalogo-title" as="h1" size="headline" family="sans" className="mt-3 text-balance">
          <span className="block font-normal">Todo el</span>
          <span className="block font-extrabold md:text-[1.2em]">catálogo.</span>
        </Heading>
        <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-tinta/80 md:text-lg">
          Buscá por tema o por color. Si no ves lo tuyo, escribime y lo pensamos juntos.
        </p>
      </header>

      <div className="mt-10 lg:mt-14">
        <ShopListing
          items={status === 'empty' ? [] : catalog.items}
          status={status === 'loading' || status === 'error' ? status : 'ready'}
          onRetry={retry}
          groups={catalog.filterGroups}
          searchText={catalogSearchText}
          cleanCards
          renderGroup={{ tema: (context) => <CatalogTopicFilter {...context} /> }}
        />
      </div>
    </div>
  )
}
