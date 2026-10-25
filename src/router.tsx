import { createBrowserRouter, type RouteObject } from 'react-router'
import { paths } from './paths'
import { Layout } from './components/layout/Layout'
import { AboutPage } from './pages/AboutPage'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { HomePage } from './pages/HomePage'
import { HowToBuyPage } from './pages/HowToBuyPage'
import { NotFoundPage } from './pages/NotFoundPage'
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
// A route that does not exist, and a page that fails while drawing, both end in a friendly page
// with a way back (REQ-WEB-QUALITY-001), never in a blank screen or a trace. The inner error page
// keeps the header and footer; the outer one covers a failure of the layout itself.
export const router = createBrowserRouter([
  {
    errorElement: (
      <div className="px-4">
        <NotFoundPage kind="error" />
      </div>
    ),
    children: [
      {
        element: <Layout />,
        children: [
          {
            errorElement: <NotFoundPage kind="error" />,
            children: [
              { path: paths.home, element: <HomePage /> },
              { path: paths.about, element: <AboutPage /> },
              { path: paths.catalog, element: <CatalogPage /> },
              { path: paths.product, element: <ProductPage /> },
              { path: paths.today, element: <TodayPage /> },
              { path: paths.howToBuy, element: <HowToBuyPage /> },
              { path: paths.cart, element: <CartPage /> },
              ...devRoutes,
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
