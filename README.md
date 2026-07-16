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

## PM compliance tracker (`/compliance`)

Tracks PM compliance findings (e.g. a technician closing a PM out of compliance) and walks
them through the four-step disciplinary ladder: Documented Coaching → Written Warning →
Final Written Warning → Termination.

- `lib/compliance.js` — the step ladder (with links to the Google Doc / Form for each step,
  and the 6-month expiry rule for warnings), plus the logic that resolves a technician's
  current standing from their action history.
- `supabase/schema.sql` — creates the `pm_findings` and `discipline_actions` tables this page
  reads/writes. Run it once in the Supabase SQL Editor after creating the project (see
  above); until then the page still renders (steps, forms, reference links) but saving is
  disabled and says so.
- `app/compliance/actions.js` — Server Actions that insert findings/actions and revalidate
  the page. No auth exists yet, so `supabase/schema.sql`'s RLS policies allow any anon-key
  request to read/write — tighten this once leaders log in individually.
- **Outstanding**: the handbook table for which safety/policy violations justify skipping
  discipline steps hasn't been added yet — the page has a clearly marked placeholder in the
  "Skipping steps for egregious violations" section until that content is provided.

## Deploying

Push to `main` — connect this repo to a Vercel project (Framework Preset: Next.js) and it
builds automatically on every push.
