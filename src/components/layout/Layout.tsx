import { Outlet } from 'react-router'
import { Container } from '../ui/Container'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-ui focus:bg-crema focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1">
        <Container className="py-10">
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
