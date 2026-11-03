import { asset } from '../../lib/asset'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { paths } from '../../paths'
import { site } from '../../config/site'
import { useTodayAvailable } from '../../data/useTodayAvailable'
import { useOrderCount } from '../../lib/orderStore'
import { Container } from '../ui/Container'
import { stickerBase, stickerSize, stickerTone, tilt } from '../ui/sticker'
import { cartNav, mainNav, withoutToday } from './navItems'

// Main nav "stickers pegados": each link is a sticker (see ui/sticker.ts). Orange is the
// protagonist: the active item is stuck in orange with cream text, hover turns orange.
// The active pair (crema on naranja, 3.51:1) is a team decision pending approval.
const tilts = ['-1deg', '0.75deg', '-0.5deg', '1deg']
const tiltAt = (i: number) => tilt(tilts[i % tilts.length])

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const orderCount = useOrderCount()
  const navItems = withoutToday(mainNav, useTodayAvailable())

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // A thin line appears under the bar once the page has moved, so it reads as a bar over the content.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)

  return (
    <header
      className={`sticky top-0 z-50 border-b-[1.5px] transition-colors duration-200 ${scrolled || open ? 'border-tinta/20 bg-crema' : 'border-transparent bg-transparent'}`}
    >
      <Container
        size="wide"
        className="flex items-center justify-between gap-2 py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4"
      >
        {/* Isotipo P: the manual's version for small sizes. Orange on cream. */}
        <Link to={paths.home} onClick={close} className="inline-flex min-w-11 shrink-0 items-center justify-self-start">
          <img src={asset('/brand/isotipo-naranja.svg')} alt={site.name} className="h-11 w-auto max-w-none" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-2.5 md:flex">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === paths.home}
              style={tiltAt(i)}
              className={({ isActive }) =>
                `${stickerBase} ${stickerSize.md} ${isActive ? stickerTone.current : stickerTone.paper}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <NavLink
            to={cartNav.to}
            onClick={close}
            style={tiltAt(3)}
            className={({ isActive }) =>
              `${stickerBase} ${stickerSize.md} ${isActive ? stickerTone.current : stickerTone.ink}`
            }
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-naranja group-hover:bg-tinta group-aria-[current=page]:bg-crema"
            />
            {cartNav.label}
            {orderCount > 0 && (
              <>
                <span aria-hidden="true" className="grid min-w-5 place-items-center rounded-full bg-naranja px-1 text-xs font-bold text-tinta">
                  {orderCount}
                </span>
                <span className="sr-only">, {orderCount === 1 ? '1 producto' : `${orderCount} productos`}</span>
              </>
            )}
          </NavLink>
          <button
            type="button"
            style={tiltAt(1)}
            className={`${stickerBase} ${stickerSize.md} ${stickerTone.paper} md:hidden`}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          id="menu-movil"
          aria-label="Principal"
          className="max-h-[calc(100svh-4.75rem)] overflow-y-auto overscroll-contain border-b-2 border-tinta px-4 pb-8 pt-2 md:hidden"
        >
          <ul className="flex flex-col items-start gap-4">
            {navItems.map((item, i) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === paths.home}
                  onClick={close}
                  style={tiltAt(i)}
                  className={({ isActive }) =>
                    `${stickerBase} ${stickerSize.menu} ${isActive ? stickerTone.current : stickerTone.paper}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
