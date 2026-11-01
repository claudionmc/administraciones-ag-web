-- Synthetic fixture, run as postgres after all migrations. Always rolls back.
begin;
insert into auth.users(id, email) values
  ('61000000-0000-0000-0000-000000000001', 'history-a@example.invalid'),
  ('61000000-0000-0000-0000-000000000002', 'history-b@example.invalid');
insert into public.clientes(id, activo) values
  ('61000000-0000-0000-0000-000000000001', true),
  ('61000000-0000-0000-0000-000000000002', true);
insert into public.inversiones(id, cliente_id, referencia, capital, fecha_inicio, tasa_anual, origen)
values ('62000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001',
  'Synthetic reset', 10000, '2025-01-01', 0.10, 'aporte');
insert into public.valorizaciones_inversiones(id, cliente_id, inversion_id, fecha_corte)
values ('63000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001',
  '62000000-0000-0000-0000-000000000001', '2026-01-01');
do $$ begin
  if not exists(select 1 from public.valorizaciones_inversiones
    where id = '63000000-0000-0000-0000-000000000001'
      and intereses_ganados_historicos is null and intereses_pagados_al_reinicio is null
      and interes_pendiente = 1000 and total = 11000) then
    raise exception 'FAIL: unknown history must remain null';
  end if;
end $$;
update public.valorizaciones_inversiones set intereses_pagados_al_reinicio = 300
where id = '63000000-0000-0000-0000-000000000001';
do $$ declare invalid numeric; begin
  if not exists(select 1 from public.valorizaciones_inversiones
    where id = '63000000-0000-0000-0000-000000000001'
      and intereses_ganados_historicos = 1300 and intereses_pagados_al_reinicio = 300
      and interes_acumulado = 1000 and interes_pendiente = 1000 and total = 11000) then
    raise exception 'FAIL: historical payout deducted twice or total incorrect';
  end if;
  foreach invalid in array array[-1::numeric, 0.5::numeric, 'Infinity'::numeric, 'NaN'::numeric] loop
    begin
      update public.valorizaciones_inversiones set intereses_pagados_al_reinicio = invalid
      where id = '63000000-0000-0000-0000-000000000001';
      raise exception 'FAIL: invalid payment accepted';
    exception when check_violation then null;
    end;
  end loop;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000001', true);
do $$ begin
  if not exists(select 1 from public.valorizaciones_inversiones where intereses_ganados_historicos = 1300) then
    raise exception 'FAIL: own history not visible';
  end if;
  begin
    update public.valorizaciones_inversiones set intereses_pagados_al_reinicio = 999;
    raise exception 'FAIL: client wrote history';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000002', true);
do $$ begin
  if exists(select 1 from public.valorizaciones_inversiones) then raise exception 'FAIL: other history visible'; end if;
end $$;
reset role;
update public.clientes set activo = false where id = '61000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000001', true);
do $$ begin
  if exists(select 1 from public.valorizaciones_inversiones) then raise exception 'FAIL: inactive history visible'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform intereses_ganados_historicos from public.valorizaciones_inversiones;
    raise exception 'FAIL: anonymous read accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
