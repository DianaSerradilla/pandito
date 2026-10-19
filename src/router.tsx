import { createBrowserRouter, type RouteObject } from 'react-router'
import { paths } from './paths'
import { Layout } from './components/layout/Layout'
import { AboutPage } from './pages/AboutPage'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { HomePage } from './pages/HomePage'
import { HowToBuyPage } from './pages/HowToBuyPage'
import { ProductPage } from './pages/ProductPage'
import { TodayPage } from './pages/TodayPage'

// Internal reference for tokens and base components. Registered only in development,
// so it never exists in the production build.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/_tokens',
        lazy: async () => ({
          Component: (await import('./pages/DesignTokensPage')).DesignTokensPage,
        }),
      },
    ]
  : []

// Every public page renders inside the shared layout (REQ-WEB-BASE-003).
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.about, element: <AboutPage /> },
      { path: paths.catalog, element: <CatalogPage /> },
      { path: paths.product, element: <ProductPage /> },
      { path: paths.today, element: <TodayPage /> },
      { path: paths.howToBuy, element: <HowToBuyPage /> },
      { path: paths.cart, element: <CartPage /> },
      ...devRoutes,
    ],
  },
])
