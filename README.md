# PM-AUDITS

Disciplinary-action accountability app for IL01 (Aurora, IL). Every technician maps to the
leader responsible for their PM compliance findings and discipline actions, grouped by shift
(FHD / FHS / FHN / BHD / BHS / BHN) and role (Lead Tech, KT, IAT, RT, T-1/2/3).

## Stack

- [Next.js](https://nextjs.org) (App Router, JavaScript) — deploys to Vercel with zero config.
- [Supabase](https://supabase.com) — stores `pm_findings` and `discipline_actions`.
  `lib/supabaseClient.js` is a guarded client factory that resolves to `null` until
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, so the app still
  renders (with saving disabled and a banner saying so) before Supabase is configured.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Pages

- **`/`** — landing page. One card per leader (name, shift badges, team size) with a glowing
  notification badge showing how many of their team's findings are still awaiting a
  discipline action. Click a leader to open their page. Also links to Trends and Submit.
- **`/leaders/[slug]`** — one leader's page, two areas:
  - **Team** — findings awaiting action for this leader's people, then the full roster
    grouped by shift; click any technician to see their finding/action history and log a
    new discipline action.
  - **How to apply disciplinary action** — the four-step ladder (with links to the
    Documented Coaching doc / Progressive Discipline form and the 6-month warning expiry),
    the handbook's occurrence-count table for skipping steps on egregious violations, and
    the conversation-wording guide. Identical on every leader's page.
- **`/trends`** — findings/actions totals across every leader: findings by leader (with how
  many are still open), and discipline actions by step, site-wide.
- **`/submit`** — a standalone finding form for any technician; it's saved with that
  technician's leader already attached, so it shows up in the right leader's queue.

`/compliance` (the old single-page layout) redirects to `/` for anyone with the old link
bookmarked.

## Data

- `lib/roster.js` — the static roster (`LEADERS`), shaped to map 1:1 onto future
  `leaders`/`technicians` tables. `getSummary()` derives technician/leader/vacancy counts;
  `leaderSlug()` / `getLeaderBySlug()` handle the `/leaders/[slug]` routing.
- `lib/compliance.js` — the four-step ladder (`DISCIPLINE_STEPS`, with each step's form link,
  instructions, and expiry), the handbook's skip-level table (`VIOLATION_TABLE`), the wording
  guide link, and the logic that resolves a technician's current discipline standing from
  their action history (`currentStepFor`).
- `lib/complianceData.js` — `loadComplianceData()` fetches all findings/actions from
  Supabase once per request; `unactionedFindings()` filters to findings with no linked
  discipline action yet — that's what drives every notification badge and the Trends "open"
  counts. There's no separate read/unread state: a finding stops counting as outstanding the
  moment a leader logs a real discipline action against it, not just from being viewed.
- `lib/actions.js` — Server Actions (`logFinding`, `logAction`) that insert into Supabase and
  revalidate the whole app so counts update everywhere immediately.
- `supabase/schema.sql` — creates the `pm_findings` and `discipline_actions` tables. Run it
  once in the Supabase SQL Editor. No auth exists yet, so its RLS policies allow any anon-key
  request to read/write — tighten this once leaders log in individually.

## Adding/updating Supabase

1. Create a Supabase project, run `supabase/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in the Project URL and anon/publishable key
   (Project Settings → API in Supabase).
3. Add the same two env vars in the Vercel project settings (Production, Preview, and
   Development), then redeploy — `NEXT_PUBLIC_` vars are baked in at build time, so a new
   deploy is required after adding or changing them.

## Deploying

Push to `main` — connect this repo to a Vercel project (Framework Preset: Next.js) and it
builds automatically on every push.
