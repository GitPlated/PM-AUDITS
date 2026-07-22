-- Run this once in the Supabase project's SQL Editor to create the tables
-- the PM compliance tracker (app/compliance) reads and writes.
--
-- No auth/leader-login exists yet, so these policies are wide open (anyone
-- with the anon key can read and insert). Tighten them once leaders sign in
-- individually.

create extension if not exists pgcrypto;

create table if not exists pm_findings (
  id uuid primary key default gen_random_uuid(),
  technician_name text not null,
  leader_name text not null,
  pm_task text not null,
  occurrence_date date not null,
  occurrence_url text,
  reason_given text,
  is_critical_pm boolean not null default false,
  reported_by text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists discipline_actions (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid references pm_findings (id) on delete set null,
  technician_name text not null,
  leader_name text not null,
  step text not null check (
    step in ('coaching', 'written_warning', 'final_written_warning', 'termination')
  ),
  action_date date not null,
  expires_at date,
  skip_reason text,
  notes text,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pm_findings_technician on pm_findings (technician_name);
create index if not exists idx_discipline_actions_technician on discipline_actions (technician_name);
create index if not exists idx_discipline_actions_finding on discipline_actions (finding_id);

alter table pm_findings enable row level security;
alter table discipline_actions enable row level security;

drop policy if exists "public read findings" on pm_findings;
create policy "public read findings" on pm_findings for select using (true);
drop policy if exists "public insert findings" on pm_findings;
create policy "public insert findings" on pm_findings for insert with check (true);

drop policy if exists "public read actions" on discipline_actions;
create policy "public read actions" on discipline_actions for select using (true);
drop policy if exists "public insert actions" on discipline_actions;
create policy "public insert actions" on discipline_actions for insert with check (true);

-- Added later: photo of the completed Documented Coaching form, uploaded to
-- the 'coaching-forms' storage bucket (see supabase/storage.sql).
alter table discipline_actions add column if not exists coaching_photo_url text;

-- Added later: delete policies (only select/insert existed before). Needed
-- for admin cleanup / resets. Still wide open, matching the no-auth stance.
drop policy if exists "public delete findings" on pm_findings;
create policy "public delete findings" on pm_findings for delete using (true);
drop policy if exists "public delete actions" on discipline_actions;
create policy "public delete actions" on discipline_actions for delete using (true);

-- Added later: update policies (only select/insert/delete existed before).
-- Needed for admin corrections (e.g. fixing reported_by attribution).
drop policy if exists "public update findings" on pm_findings;
create policy "public update findings" on pm_findings for update using (true) with check (true);
drop policy if exists "public update actions" on discipline_actions;
create policy "public update actions" on discipline_actions for update using (true) with check (true);

-- Added later: one discipline action can now cover multiple findings from the
-- same technician's work week (bundled into a single conversation) instead of
-- one action per finding. finding_id (singular) stays for old rows.
alter table discipline_actions add column if not exists finding_ids uuid[];

-- Added later: findings can be logged against a Reactive Work Order, not just
-- a Planned Maintenance task. Existing rows default to 'pm'.
alter table pm_findings add column if not exists finding_type text not null default 'pm';
alter table pm_findings drop constraint if exists pm_findings_finding_type_check;
alter table pm_findings add constraint pm_findings_finding_type_check check (finding_type in ('pm', 'reactive_wo'));

-- Added later: a leader can contest one or more findings in a bundle ("tech
-- not at fault"). This puts every finding sharing that technician's work week
-- on hold for discipline until Admin or the auditor reviews and resolves it —
-- confirming some/all findings still stand, dismissing the rest.
create table if not exists finding_contests (
  id uuid primary key default gen_random_uuid(),
  finding_ids uuid[] not null,
  technician_name text not null,
  leader_name text not null,
  justification text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  dismissed_finding_ids uuid[],
  resolution_notes text,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_finding_contests_technician on finding_contests (technician_name);
create index if not exists idx_finding_contests_status on finding_contests (status);

alter table finding_contests enable row level security;

drop policy if exists "public read contests" on finding_contests;
create policy "public read contests" on finding_contests for select using (true);
drop policy if exists "public insert contests" on finding_contests;
create policy "public insert contests" on finding_contests for insert with check (true);
drop policy if exists "public update contests" on finding_contests;
create policy "public update contests" on finding_contests for update using (true) with check (true);
