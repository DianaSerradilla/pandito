import { useMemo } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isConnected, readAll } from './catalogStore'
import { downloadGroups, mapDownloads, type DownloadRow } from './downloadsMapper'
import { downloadFilterGroups, downloadItems, type DownloadItem } from './sampleDownloads'
import { useForcedStatus } from './useForcedStatus'
import { useRemote } from './useRemote'
import type { TodayFilterGroup } from '../pages/today/todayItems'

// REQ-WEB-DOWNLOAD-001. The free downloads. Connected, they are read from public_downloads when the
// page opens (their files live in the public `downloads` bucket); without Supabase they are the
// sample. The state is its own: the catalog failing does not matter here.
export type DownloadsView = {
  status: 'loading' | 'error' | 'empty' | 'ready'
  items: DownloadItem[]
  groups: TodayFilterGroup<DownloadItem>[]
  retry: () => void
}

async function loadDownloads(client: SupabaseClient): Promise<DownloadItem[]> {
  const rows = await readAll<DownloadRow>(client, 'public_downloads', ['sort_order', 'slug'])
  return mapDownloads(rows, (path, download) => client.storage.from('downloads').getPublicUrl(path, download ? { download: true } : undefined).data.publicUrl)
}

export function useDownloads(): DownloadsView {
  const remote = useRemote(loadDownloads)
  const forced = useForcedStatus()
  const items = remote.data
  const groups = useMemo(() => (items ? downloadGroups(items) : []), [items])

  if (!isConnected) return { status: forced ?? 'ready', items: downloadItems, groups: downloadFilterGroups, retry: remote.retry }

  const live = remote.state === 'ready' && (items?.length ?? 0) === 0 ? 'empty' : remote.state
  return { status: forced ?? live, items: items ?? [], groups, retry: remote.retry }
}
