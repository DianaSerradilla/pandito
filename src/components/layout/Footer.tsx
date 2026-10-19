import { NavLink } from 'react-router'
import { site } from '../../config/site'
import { Container } from '../ui/Container'
import { Heading } from '../ui/Heading'
import { Scribble } from './Scribble'
import { footerNav } from './navItems'

const linkClass = 'group relative inline-block py-0.5'

const year = new Date().getFullYear()

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

export function Footer() {
  const social = [{ href: site.instagramUrl, label: 'Instagram' }].filter((l) => l.href)

  return (
    <footer className="surface-dark bg-tinta text-crema">
      <Container size="wide" className="pt-12 md:pt-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Cream logotype on ink: team decision (the manual's default on ink is orange). */}
          <img
            src="/brand/logotipo-crema.svg"
            alt={site.name}
            className="h-auto w-64 self-start md:w-80"
          />

          <nav aria-label="Navegación">
            <Heading as="h2" size="subtitle">Navegación</Heading>
            <ul className="mt-4 flex flex-col gap-1">
              {footerNav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
                    {({ isActive }) => (
                      <>
                        {item.label}
                        <Scribble active={isActive} />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <Heading as="h2" size="subtitle">Contacto</Heading>
            <ul className="mt-4 flex flex-col gap-1">
              <li>Mendoza, Argentina</li>
              {site.whatsappUrl && (
                <li>
                  <a
                    href={site.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    WhatsApp
                    <Scribble active={false} />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {social.length > 0 && (
            <div>
              <Heading as="h2" size="subtitle">Redes</Heading>
              <ul className="mt-4 flex flex-col gap-1">
                {social.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {l.label}
                      <Scribble active={false} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-crema/25 py-5 text-sm md:mt-16">
          <p>© {year} {site.name}</p>
          <p>Hecho en Mendoza</p>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Volver arriba"
            className="grid size-10 place-items-center rounded-ui bg-crema text-tinta hover:bg-amarillo"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 14V2M2.5 7.5 8 2l5.5 5.5" />
            </svg>
          </button>
        </div>
      </Container>
    </footer>
  )
}
