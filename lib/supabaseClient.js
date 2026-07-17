import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// null until NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set
// (see .env.example) — callers should check for null before querying.
//
// The explicit `cache: 'no-store'` fetch override matters: Vercel's Data Cache
// can otherwise cache these requests independent of a page's `force-dynamic`
// setting, and that cache doesn't clear on redeploy — so findings/actions can
// appear frozen at whatever they were on the first successful fetch.
export const supabase = url && anonKey
  ? createClient(url, anonKey, {
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    })
  : null
