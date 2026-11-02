import { Outlet, useLocation } from 'react-router'
import { routeMeta } from '../../config/pageMeta'
import { usePageMeta } from '../../lib/pageMeta'
import { Container } from '../ui/Container'
import { Footer } from './Footer'
import { Header } from './Header'

// Pages with their own data (a product, the 404) set their own meta; the rest read it from the route.
function RouteMeta() {
  const { pathname } = useLocation()
  const meta = routeMeta[pathname]
  if (!meta) return null
  return <PageMetaTags meta={meta} />
}

function PageMetaTags({ meta }: { meta: Parameters<typeof usePageMeta>[0] }) {
  usePageMeta(meta)
  return null
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-ui focus:bg-crema focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <RouteMeta />
      <Header />
      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        <Container className="py-10">
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
