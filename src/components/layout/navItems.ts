import { navLabels, paths } from '../../paths'

// Header navigation. "Cómo comprar" lives only in the footer.
export const mainNav = [
  { to: paths.home, label: navLabels.home },
  { to: paths.about, label: navLabels.about },
  { to: paths.catalog, label: navLabels.catalog },
  { to: paths.today, label: navLabels.today },
] as const

/** HOY only appears in the nav while there is an event with pieces for today (useTodayAvailable). */
export const withoutToday = <T extends { to: string }>(items: readonly T[], hasToday: boolean) =>
  hasToday ? items : items.filter((item) => item.to !== paths.today)

export const cartNav = { to: paths.cart, label: navLabels.cart } as const

export const footerNav: { to: string; label: string }[] = [
  ...mainNav.map((item) =>
    item.to === paths.today ? { to: item.to, label: navLabels.todayFooter } : item,
  ),
  { to: paths.howToBuy, label: navLabels.howToBuy },
  { to: paths.downloads, label: navLabels.downloads },
  cartNav,
]
