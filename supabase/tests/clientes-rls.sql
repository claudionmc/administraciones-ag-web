-- Run AFTER the migration, in the SQL Editor with the postgres role.
-- Uses synthetic accounts; rolls back all changes, even on successful checks.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'rls-a@example.invalid'),
  ('00000000-0000-0000-0000-0000000000b2', 'rls-b@example.invalid');
insert into public.clientes (id, activo) values
  ('00000000-0000-0000-0000-0000000000a1', true),
  ('00000000-0000-0000-0000-0000000000b2', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
do $$ begin
  if (select count(*) from public.clientes) <> 1 then
    raise exception 'FAIL: client must see exactly one row';
  end if;
  if exists (select 1 from public.clientes where id = '00000000-0000-0000-0000-0000000000b2') then
    raise exception 'FAIL: cross-client read';
  end if;
  begin
    update public.clientes set activo = false;
    raise exception 'FAIL: client can write';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
update public.clientes set activo = false where id = '00000000-0000-0000-0000-0000000000a1';
set local role authenticated;
do $$ begin
  if exists (select 1 from public.clientes) then
    raise exception 'FAIL: inactive client can read';
  end if;
end $$;

set local role anon;
do $$ begin
  begin
    perform 1 from public.clientes;
    raise exception 'FAIL: anonymous role can read';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
