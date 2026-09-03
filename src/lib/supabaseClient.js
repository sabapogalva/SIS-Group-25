import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev instead of silently breaking every Supabase call.
  console.error(
    'Missing Supabase environment variables. Copy .env.example to .env ' +
      'and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'See docs/backend/environment-setup.md.'
  )
}

// Single shared Supabase client for the whole app.
// Only ever uses the public anon key here — the service_role key must
// never be bundled into frontend code (it bypasses Row Level Security).
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
