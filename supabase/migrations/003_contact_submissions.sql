-- ─────────────────────────────────────────────────────────────────────────────
-- Déjà Vu OS — Migration 003: Contact Submissions
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists contact_submissions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'::uuid,
  naam            text not null,
  email           text not null,
  bericht         text not null,
  created_at      timestamptz not null default now()
);

alter table contact_submissions enable row level security;

-- Anyone (public) can submit the contact form
create policy "contact_public_insert" on contact_submissions
  for insert with check (true);

-- Only administrators can read submissions
create policy "contact_admin_select" on contact_submissions
  for select using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      join profiles p on p.id = ur.profile_id
      where p.auth_user_id = auth.uid() and r.slug = 'administrator'
    )
  );
