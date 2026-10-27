// Single source of truth for public routes and their visible names.
// Approved route list: REQ-WEB-BASE-002. No payment, account or admin routes.
export const paths = {
  home: '/',
  about: '/estudio',
  catalog: '/catalogo',
  product: '/catalogo/:slug',
  today: '/hoy',
  howToBuy: '/como-comprar',
  downloads: '/descargas',
  cart: '/mi-pedido',
} as const

// Visible names (Spanish only). The product page is not a nav destination.
export const navLabels = {
  home: 'Inicio',
  about: 'Estudio',
  catalog: 'Catálogo',
  today: 'HOY',
  todayFooter: 'Hoy', // footer only: not all caps
  howToBuy: 'Cómo comprar',
  downloads: 'Descargas',
  cart: 'Mi pedido',
} as const
