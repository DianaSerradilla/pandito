import { useMemo } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { todayEvent, todayFilterGroups, todayItems, type TodayFilterGroup, type TodayItem, type TodayStatus } from '../pages/today/todayItems'
import { isConnected, reloadCatalog, readAll, useCatalog } from './catalogStore'
import { buildToday, type TodayEventRow, type TodayRows, type TodayVariantRow } from './todayMapper'
import { useForcedStatus } from './useForcedStatus'
import { useRemote } from './useRemote'

// REQ-WEB-HOY-001..004. What the HOY page draws. Connected, the event and its variants are read from
// the public views when the page opens (not kept in the catalog: HOY changes hour by hour) and joined
// with the catalog, so every HOY piece is a real, orderable one. Without Supabase it is the sample.
export type TodayView = {
  status: 'loading' | 'error' | 'ready'
  event: { status: TodayStatus; name: string; context: string }
  items: TodayItem[]
  groups: TodayFilterGroup[]
  retry: () => void
}

async function loadToday(client: SupabaseClient): Promise<TodayRows> {
  const [events, variants] = await Promise.all([
    client.from('public_today_event').select('*').order('event_date'),
    readAll<TodayVariantRow>(client, 'public_today_variants', ['sort_order', 'product_slug', 'material_code', 'finish_code', 'size_code']),
  ])
  if (events.error) throw events.error
  return { events: (events.data ?? []) as TodayEventRow[], variants }
}

export function useToday(): TodayView {
  const catalog = useCatalog()
  const remote = useRemote(loadToday)
  const forced = useForcedStatus()
  const rows = remote.data
  const built = useMemo(() => (rows && catalog.status === 'ready' ? buildToday(rows, catalog) : undefined), [rows, catalog])

  if (!isConnected) {
    const status = forced === 'loading' || forced === 'error' ? forced : 'ready'
    const event = forced === 'empty' ? { ...todayEvent, status: 'empty' as const } : todayEvent
    return { status, event, items: todayItems, groups: todayFilterGroups, retry: remote.retry }
  }

  const failed = catalog.status === 'error' || remote.state === 'error'
  const waiting = catalog.status === 'loading' || remote.state === 'loading'
  const status = forced === 'loading' || forced === 'error' ? forced : failed ? 'error' : waiting ? 'loading' : 'ready'
  const retry = () => {
    if (catalog.status === 'error') reloadCatalog()
    remote.retry()
  }
  const event = built ?? { status: 'inactive' as const, name: '', context: '' }
  return {
    status,
    event: forced === 'empty' ? { ...event, status: 'empty' } : event,
    items: built?.items ?? [],
    groups: built?.groups ?? [],
    retry,
  }
}
