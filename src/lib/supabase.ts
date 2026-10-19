import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Public client: only the anon key belongs in the browser, and access is
// limited by Supabase RLS policies. Never expose the service role key here.
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null
