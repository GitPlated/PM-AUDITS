# PM-AUDITS — Disciplinary Actions Tracker

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
  discipline action, plus an Admin card sized the same as the leader cards. Click a leader to
  open their page.
- **`/leaders/[slug]`** — one leader's page:
  - A large **How to apply disciplinary action** button at the top opens `/guide` (see below).
  - **Team** — a "Needs action" panel (visually called out — tinted/bordered — whenever it's
    non-empty) for findings awaiting a discipline action, then the full roster grouped by
    shift. Click any technician to see their discipline steps laid out left-to-right in the
    order they happened, their full finding/action history, and log a new action (see "Logging
    a discipline action" below).
- **`/guide`** — the four-step ladder as icon-led cards with connecting arrows, the handbook's
  skip-level table, and the wording guide, all in one graphically laid-out page. Optionally
  takes `?leader=<slug>` (set automatically from a leader's page) so the back link returns to
  that leader instead of the landing page. Content is identical regardless of which leader
  linked to it.
- **`/admin`** — everything that isn't scoped to one leader. Gated by its own separate password
  (see "Password gate" below). A large **+ Submit a finding** button at the top jumps straight
  to the submit form further down the same page.
  - **By technician** — every technician, grouped by leader, name on the left and their
    discipline actions laid out left-to-right as a row of step blocks on the right (oldest
    first) — the same step-track used on a leader's page, just for everyone at once. Click a
    technician to expand the full history, including findings.
  - **Discipline actions by step** — how many actions have been logged at each step, org-wide,
    with a click-to-expand list of who and when.
  - **Submit a finding** — a standalone finding form for any technician; it's saved with that
    technician's leader already attached, so it shows up in the right leader's queue.
  - **Documented coaching uploads** — every photo of a completed Documented Coaching form,
    uploaded from a leader's page (see below), most recent first.

`/compliance`, `/trends`, and `/submit` redirect to `/` or `/admin` for anyone with an old
link bookmarked.

## Logging a discipline action

The action form on a leader's page (`components/ActionForm.js`) walks through the process
rather than just being a plain form:

1. Every field is disabled except **Step** until a step is picked.
2. Picking a step immediately shows what has to happen first, right next to the dropdown:
   - **Documented Coaching** — print the Documented Coaching doc, have the conversation, then
     upload a photo of the completed form. On a phone, the file input's `capture="environment"`
     opens the camera directly instead of a file picker.
   - **Written Warning / Final Written Warning / Termination** — a link to the Progressive
     Discipline form, with instructions to fill it out and forward the email confirmation to
     your manager / senior maintenance manager.
3. The rest of the fields (date, skip reason, notes) unlock once a step is picked. **Notes**
   is required with a live word counter and won't submit under 10 words
   (`MIN_ACTION_NOTES_WORDS` in `lib/compliance.js`), checked both client- and server-side.
4. **Signed by** is filled in automatically from whichever leader's page the form is on — it's
   not a free-text field, so it can't be typed over.
5. On submit, a coaching photo uploads to the `coaching-forms` Supabase Storage bucket (see
   `supabase/storage.sql`) and its public URL is stored on the `discipline_actions` row, which
   is what populates the Admin page's coaching-uploads section.

## Password gate

`middleware.js` gates every request behind two independent, shared passwords — not per-user
accounts, just a keep-casual-visitors-out gate, consistent with the rest of the app's
no-auth-yet stance:

- **Site password** (`SITE_PASSWORD` env var) — required for the entire app. Unauthenticated
  visitors land on `/login`; a correct submission sets an httpOnly cookie
  (`pmaudits_site_ok`, 30 days) and sends them on to wherever they were headed.
- **Admin password** (`ADMIN_PASSWORD` env var) — required in addition, only for `/admin` and
  its sub-paths. Same pattern, a separate cookie (`pmaudits_admin_ok`), separate login page
  (`/admin-login`).

Both env vars are required server-side only (no `NEXT_PUBLIC_` prefix — they're never sent to
the browser). If either is unset, that gate fails closed: no password submitted will ever
match `undefined`, so the app stays locked rather than silently open. Set both in Vercel
(Production, Preview, Development) alongside the Supabase vars below, then redeploy.

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
- `supabase/schema.sql` — creates the `pm_findings` and `discipline_actions` tables (including
  `discipline_actions.coaching_photo_url`). Run it once in the Supabase SQL Editor. No auth
  exists yet, so its RLS policies allow any anon-key request to read/write — tighten this once
  leaders log in individually.
- `supabase/storage.sql` — creates the public `coaching-forms` Storage bucket that coaching
  photos upload to, with the same open-policy stance as the tables above.

## Adding/updating Supabase

1. Create a Supabase project, run `supabase/schema.sql` and `supabase/storage.sql` in its SQL
   Editor.
2. Copy `.env.example` to `.env.local` and fill in the Project URL and anon/publishable key
   (Project Settings → API in Supabase).
3. Add the same two env vars — plus `SITE_PASSWORD` and `ADMIN_PASSWORD` (see "Password gate"
   above) — in the Vercel project settings (Production, Preview, and Development), then
   redeploy. `NEXT_PUBLIC_` vars are baked in at build time, so a new deploy is required after
   adding or changing them; the password vars are read at request time by middleware, but
   redeploying after adding them is still the simplest way to make sure they've taken effect.

## Deploying

Push to `main` — connect this repo to a Vercel project (Framework Preset: Next.js) and it
builds automatically on every push.
