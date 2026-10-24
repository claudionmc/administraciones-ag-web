begin;

-- Optional identity, provisioned administratively. Existing own-account RLS
-- applies; no client write permissions or real personal data are added.
alter table public.clientes
  add column nombres text check (nombres is null or length(trim(nombres)) between 1 and 120),
  add column apellidos text check (apellidos is null or length(trim(apellidos)) between 1 and 160),
  add column rut text check (rut is null or rut ~ '^[0-9]{7,8}-[0-9Kk]$');

commit;
