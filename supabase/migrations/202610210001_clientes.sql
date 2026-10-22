begin;

-- Email and password hashes are managed exclusively by Supabase auth.users.
create table public.clientes (
  id uuid primary key references auth.users(id) on delete cascade,
  activo boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.clientes enable row level security;
alter table public.clientes force row level security;
revoke all on public.clientes from public, anon, authenticated;
grant select on public.clientes to authenticated;

create policy "Clientes consultan solo su cuenta activa"
  on public.clientes for select to authenticated
  using ((select auth.uid()) = id and activo = true);

-- Provision accounts manually in the dashboard; no public write policies.
-- No trigger auto-enrolls users: an auth account alone grants no portal access.
commit;
