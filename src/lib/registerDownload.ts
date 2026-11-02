import { supabase } from './supabase'

// Counts one click on "Descargar" (REQ-WEB-DOWNLOAD-002). Only the total per resource is kept: no
// email, no IP. It never gets in the visitor's way: a failure is ignored and the file still downloads.
const REAL_SLUG = /^[a-z0-9-]+$/i

export function registerDownload(slug: string): void {
  if (!supabase || !REAL_SLUG.test(slug)) return
  void Promise.resolve(supabase.rpc('register_download', { p_slug: slug })).catch(() => undefined)
}
