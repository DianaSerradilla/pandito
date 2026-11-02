import { useSearchParams } from 'react-router'

// In development only, `?estado=carga`, `?estado=error` or `?estado=vacio` force the loading, failed
// or empty state of a page that reads data, so each one can be designed and tested. The check is on
// `import.meta.env.DEV`, so none of it exists in the production build.
export type ForcedStatus = 'loading' | 'error' | 'empty'

export function useForcedStatus(): ForcedStatus | null {
  const [params] = useSearchParams()
  const forced = import.meta.env.DEV ? params.get('estado') : null
  return forced === 'carga' ? 'loading' : forced === 'error' ? 'error' : forced === 'vacio' ? 'empty' : null
}
