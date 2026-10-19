import { navLabels, paths } from '../../paths'

// Header navigation. "Cómo comprar" lives only in the footer.
export const mainNav = [
  { to: paths.home, label: navLabels.home },
  { to: paths.about, label: navLabels.about },
  { to: paths.catalog, label: navLabels.catalog },
  { to: paths.today, label: navLabels.today },
] as const

export const cartNav = { to: paths.cart, label: navLabels.cart } as const

export const footerNav: { to: string; label: string }[] = [
  ...mainNav.map((item) =>
    item.to === paths.today ? { to: item.to, label: navLabels.todayFooter } : item,
  ),
  { to: paths.howToBuy, label: navLabels.howToBuy },
  cartNav,
]
