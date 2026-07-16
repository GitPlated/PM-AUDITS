# PM-AUDITS

Disciplinary-action accountability dashboard for IL01 (Aurora, IL). Maps each technician
to the leader responsible for completing their disciplinary write-ups, grouped by shift
(FHD / FHS / FHN / BHD / BHS / BHN) and role (Lead Tech, KT, IAT, RT, T-1/2/3).

## Stack

- [Next.js](https://nextjs.org) (App Router, JavaScript) — deploys to Vercel with zero config.
- [Supabase](https://supabase.com) — not wired up yet. `lib/supabaseClient.js` is a guarded
  client factory that resolves to `null` until `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Data

`lib/roster.js` currently holds the roster as a static array (`LEADERS`), shaped to map
1:1 onto future `leaders` / `technicians` tables. `getSummary()` derives all the header
stats and the open-positions notice from that array, so counts never need to be
hand-edited when the roster changes — only `LEADERS` does.

## Adding Supabase later

1. Create a Supabase project, then copy `.env.example` to `.env.local` and fill in the two values.
2. Add the same two env vars in the Vercel project settings (Production + Preview).
3. Replace the static `LEADERS` import in `app/page.js` with a query through
   `lib/supabaseClient.js`.

## Deploying

Push to `main` — connect this repo to a Vercel project (Framework Preset: Next.js) and it
builds automatically on every push.
