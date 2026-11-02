import { isConnected, reloadCatalog, useCatalog } from './publicCatalog'
import { useForcedStatus } from './useForcedStatus'

// REQ-WEB-CATALOG-004. The state of the public catalog read: ready, loading or failed. Connected, it
// is the real state of the read from Supabase and `retry` reads it again; without the variables the
// catalog is local, so it is always ready. The pages that read their own data (HOY, the downloads)
// have their own state (useToday, useDownloads). In development only, `?estado=carga`,
// `?estado=error` or `?estado=vacio` force a state (see useForcedStatus.ts).
export type CatalogStatus = 'ready' | 'loading' | 'error' | 'empty'

export function useCatalogStatus(): { status: CatalogStatus; retry: () => void } {
  const catalog = useCatalog()
  const forced = useForcedStatus()
  const loaded: CatalogStatus = catalog.items.length === 0 ? 'empty' : 'ready'
  const live: CatalogStatus = catalog.status === 'ready' ? loaded : catalog.status
  return { status: forced ?? live, retry: isConnected ? reloadCatalog : () => window.location.reload() }
}
