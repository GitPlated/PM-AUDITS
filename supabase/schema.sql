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
