import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { paths } from './src/paths.ts'

// REQ-WEB-QUALITY-003. robots.txt and sitemap.xml are written at build time from the route list, so
// they cannot drift from the router. Absolute URLs need the final domain: set VITE_SITE_URL (for
// example https://pandito.example) in the deployment environment. While it is empty (the domain is
// still pending) the sitemap is skipped and robots.txt carries no Sitemap line, instead of a made-up
// address. Left out on purpose: the cart (noindex), /api and the dev-only /_tokens, which does not
// exist in the production build. PENDING: product pages come in once the catalog is read from
// Supabase at build time.
const indexableRoutes = [paths.home, paths.about, paths.catalog, paths.today, paths.howToBuy, paths.downloads]
const blockedRoutes = [paths.cart, '/api/']

function seoFiles(siteUrl: string): Plugin {
  return {
    name: 'pandito-seo-files',
    apply: 'build',
    generateBundle() {
      const base = siteUrl.replace(/\/+$/, '')
      const robots = ['User-agent: *', 'Allow: /', ...blockedRoutes.map((route) => `Disallow: ${route}`)]
      if (base) robots.push('', `Sitemap: ${base}/sitemap.xml`)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })

      if (!base) return
      const urls = indexableRoutes.map((route) => `  <url><loc>${base}${route === '/' ? '/' : route}</loc></url>`)
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
    },
  }
}

// https://vite.dev/config/
// VITE_BASE is the path the site is served from: "/" at a domain root (the default), "/pandito/" on a
// GitHub Pages project site. The router and every public file URL read it through BASE_URL.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE || '/',
    plugins: [react(), tailwindcss(), seoFiles(env.VITE_SITE_URL ?? '')],
    server: {
      // Forward /api calls to the local Node server (see server/index.js).
      proxy: {
        '/api': 'http://localhost:3001',
      },
    },
  }
})
