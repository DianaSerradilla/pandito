import { useCallback, useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Reads something from Supabase when the page that needs it opens, and again on "Probar de nuevo".
// For what is not kept in the catalog snapshot (HOY changes by the hour, the downloads are their own
// list). `load` must be a stable function (declare it at module level). Without the Supabase
// variables nothing is requested and the state is `ready` with no data, so the caller serves its
// sample.
export type RemoteState<T> = { state: 'loading' | 'error' | 'ready'; data: T | undefined; retry: () => void }

type Settled<T> = { attempt: number; ok: true; data: T } | { attempt: number; ok: false }

export function useRemote<T>(load: (client: SupabaseClient) => Promise<T>): RemoteState<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  useEffect(() => {
    if (!supabase) return
    let current = true
    load(supabase)
      .then((data) => {
        if (current) setSettled({ attempt, ok: true, data })
      })
      .catch(() => {
        if (current) setSettled({ attempt, ok: false })
      })
    return () => {
      current = false
    }
  }, [attempt, load])

  if (!supabase) return { state: 'ready', data: undefined, retry }
  if (!settled || settled.attempt !== attempt) return { state: 'loading', data: undefined, retry }
  return settled.ok ? { state: 'ready', data: settled.data, retry } : { state: 'error', data: undefined, retry }
}
