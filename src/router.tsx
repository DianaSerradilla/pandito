import { createBrowserRouter, type RouteObject } from 'react-router'
import { paths } from './paths'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

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

// Every page but the Home loads on demand, so the first visit downloads only what it shows.
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
              { path: paths.about, lazy: async () => ({ Component: (await import('./pages/AboutPage')).AboutPage }) },
              { path: paths.catalog, lazy: async () => ({ Component: (await import('./pages/CatalogPage')).CatalogPage }) },
              { path: paths.product, lazy: async () => ({ Component: (await import('./pages/ProductPage')).ProductPage }) },
              { path: paths.today, lazy: async () => ({ Component: (await import('./pages/TodayPage')).TodayPage }) },
              { path: paths.howToBuy, lazy: async () => ({ Component: (await import('./pages/HowToBuyPage')).HowToBuyPage }) },
              { path: paths.downloads, lazy: async () => ({ Component: (await import('./pages/DownloadsPage')).DownloadsPage }) },
              { path: paths.cart, lazy: async () => ({ Component: (await import('./pages/CartPage')).CartPage }) },
              ...devRoutes,
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL })
