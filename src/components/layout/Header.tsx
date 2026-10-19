import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { paths } from '../../paths'
import { site } from '../../config/site'
import { Container } from '../ui/Container'
import { stickerBase, stickerSize, stickerTone, tilt } from '../ui/sticker'
import { cartNav, mainNav } from './navItems'

// Main nav "stickers pegados": each link is a sticker (see ui/sticker.ts). Orange is the
// protagonist: the active item is stuck in orange with cream text, hover turns orange.
// The active pair (crema on naranja, 3.51:1) is a team decision pending approval.
const tilts = ['-1deg', '0.75deg', '-0.5deg', '1deg']
const tiltAt = (i: number) => tilt(tilts[i % tilts.length])

export function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="relative z-20">
      <Container
        size="wide"
        className="flex items-center justify-between gap-2 py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4"
      >
        {/* Isotipo P: the manual's version for small sizes. Orange on cream. */}
        <Link to={paths.home} onClick={close} className="shrink-0 justify-self-start">
          <img src="/brand/isotipo-naranja.svg" alt={site.name} className="h-11 w-auto max-w-none" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-2.5 md:flex">
          {mainNav.map((item, i) => (
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
          className="border-b-2 border-tinta px-4 pb-8 pt-2 md:hidden"
        >
          <ul className="flex flex-col items-start gap-4">
            {mainNav.map((item, i) => (
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
