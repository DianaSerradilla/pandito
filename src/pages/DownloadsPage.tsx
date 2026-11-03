import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'
import { useDownloads } from '../data/useDownloads'
import { DownloadCard } from './downloads/DownloadCard'
import { ShopListing } from './shop/ShopListing'

// Free downloads (REQ-WEB-DOWNLOAD-001): wallpapers for phone and computer, WhatsApp stickers and
// whatever else the team approves later. It is the same listing as the Catalog (search, filters,
// grid) with its own card: a preview, format, resolution and a direct download, no price and no
// order. Connected to Supabase the resources come from public_downloads (loading, failed and empty
// states included, see data/useDownloads.ts); without it they are SAMPLE DATA. PROVISIONAL COPY.
const noun = { one: 'recurso', many: 'recursos' }

// DOWNLOAD-002. A stable link for a campaign or a DM: /descargas?recurso=<slug> opens the library with
// that resource up front. A slug that does not exist (a resource that was taken down) is ignored and
// the library opens as usual, and so does the page without a campaign. Other parameters, such as
// the utm_* ones a campaign link may carry, are accepted and do nothing: nothing is measured until
// the team approves the analytics (QUALITY-006).
const downloadParam = 'recurso'

export function DownloadsPage() {
  const { status, items, groups, retry } = useDownloads()
  const [params] = useSearchParams()
  const linked = status === 'ready' ? items.find((item) => item.slug === params.get(downloadParam)) : undefined
  const linkedRef = useRef<HTMLElement>(null)
  useEffect(() => {
    linkedRef.current?.focus()
  }, [linked])
  return (
    <div className="pb-20 pt-2 md:pb-28 md:pt-8">
      <header className="mx-auto max-w-2xl text-center">
        <Script>Gratis</Script>
        <Heading id="descargas-title" as="h1" size="headline" family="sans" className="mt-3 text-balance">
          <span className="block font-normal">Descargas</span>
          <span className="block font-extrabold md:text-[1.2em]">para vos.</span>
        </Heading>
        <p data-reveal className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-tinta/80 md:text-lg">
          Fondos y stickers para tu celular y tu compu. Se bajan directo, sin cuenta y sin dejar tu mail.
        </p>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-tinta/75">Para uso personal, no comercial.</p>
      </header>

      {linked && (
        <section ref={linkedRef} tabIndex={-1} aria-labelledby="recurso-title" className="mx-auto mt-10 max-w-xs scroll-mt-24 outline-none">
          <h2 id="recurso-title" className="text-center font-display text-2xl uppercase">Lo que viniste a buscar</h2>
          <div className="mt-4">
            <DownloadCard item={linked} index={0} compact={false} />
          </div>
        </section>
      )}

      <div className="mt-10 lg:mt-14">
        <ShopListing
          items={status === 'empty' ? [] : items}
          status={status === 'loading' || status === 'error' ? status : 'ready'}
          onRetry={retry}
          groups={groups}
          noun={noun}
          sortKeys={['featured', 'name']}
          renderCard={(item, { index, compact }) => <DownloadCard item={item} index={index} compact={compact} />}
        />
      </div>
    </div>
  )
}
