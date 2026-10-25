import { useSearchParams } from 'react-router'

// REQ-WEB-CATALOG-004. The state of the public catalog read: ready, loading or failed. Today the
// catalog is local, so it is always ready; when it comes from Supabase this hook returns the real
// state of that request and `retry` asks for it again. In development only, `?estado=carga`,
// `?estado=error` or `?estado=vacio` force a state so each one can be designed and tested; the
// check is on `import.meta.env.DEV`, so none of it exists in the production build.
export type CatalogStatus = 'ready' | 'loading' | 'error' | 'empty'

export function useCatalogStatus(): { status: CatalogStatus; retry: () => void } {
  const [params] = useSearchParams()
  const forced = import.meta.env.DEV ? params.get('estado') : null
  const status: CatalogStatus =
    forced === 'carga' ? 'loading' : forced === 'error' ? 'error' : forced === 'vacio' ? 'empty' : 'ready'
  return { status, retry: () => window.location.reload() }
}
