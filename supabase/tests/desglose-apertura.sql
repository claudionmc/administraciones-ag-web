-- Synthetic fixture, run as postgres after all migrations. Everything rolls back.
begin;
insert into auth.users (id, email) values
 ('51000000-0000-0000-0000-000000000001', 'breakdown@example.invalid'),
 ('51000000-0000-0000-0000-000000000002', 'other@example.invalid');
insert into public.clientes (id, activo) values
 ('51000000-0000-0000-0000-000000000001', true),
 ('51000000-0000-0000-0000-000000000002', true);
insert into public.aperturas_clientes (id, cliente_id, fuente_referencia, fuente_sha256,
 saldo_reportado_original, capital_vigente, intereses_pendientes, ajuste_neto_historico,
 saldo_neto_apertura, intereses_ganados_totales, estado_intereses, notas_conciliacion, responsable_revision)
values ('52000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001',
 'synthetic', repeat('a',64), 1100, 1000, 100, 0, 1100, 100, 'conciliado', 'Synthetic review', 'Synthetic reviewer');
insert into public.lotes_apertura (apertura_id, cliente_id, referencia_origen,
 fecha_inicio_original, orden_fifo, capital_original, capital_vigente, tasa_anual)
values ('52000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001',
 'synthetic', '2026-01-01', 1, 1000, 1000, 0.10);
do $$ begin
 begin
  insert into public.desgloses_apertura values ('52000000-0000-0000-0000-000000000001', 0, 1, 0, 0, 100);
  raise exception 'FAIL: inconsistent payment accepted';
 exception when raise_exception then
  if sqlerrm <> 'El desglose de intereses no concilia con la apertura' then raise; end if;
 end;
end $$;
insert into public.desgloses_apertura values ('52000000-0000-0000-0000-000000000001', 0, 0, 0, 0, 100);
set local role authenticated;
select set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000001', true);
do $$ begin
 if exists(select 1 from public.desgloses_apertura) then raise exception 'FAIL: draft visible'; end if;
end $$;
reset role;
-- Confirmation must re-check a breakdown after edits to its draft opening.
update public.aperturas_clientes set intereses_ganados_totales = 101
 where id = '52000000-0000-0000-0000-000000000001';
do $$ begin
 begin
  update public.aperturas_clientes set confirmada = true where id = '52000000-0000-0000-0000-000000000001';
  raise exception 'FAIL: stale breakdown confirmed';
 exception when raise_exception then
  if sqlerrm <> 'El desglose de intereses no concilia con la apertura' then raise; end if;
 end;
end $$;
update public.aperturas_clientes set intereses_ganados_totales = 100, confirmada = true
 where id = '52000000-0000-0000-0000-000000000001';
do $$ begin
 begin
  delete from public.desgloses_apertura where apertura_id = '52000000-0000-0000-0000-000000000001';
  raise exception 'FAIL: confirmed breakdown deleted';
 exception when raise_exception then
  if sqlerrm <> 'El desglose confirmado es inmutable' then raise; end if;
 end;
end $$;
set local role authenticated;
do $$ begin
 if (select count(*) from public.desgloses_apertura where intereses_pagados = 0 and impuestos = 0 and cargos = 0) <> 1 then
  raise exception 'FAIL: confirmed zeros unavailable'; end if;
 begin
  update public.desgloses_apertura set intereses_pagados = 1;
  raise exception 'FAIL: client write permitted';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000002', true);
do $$ begin
 if exists(select 1 from public.desgloses_apertura) then raise exception 'FAIL: another client can read'; end if;
end $$;
reset role;
update public.clientes set activo = false where id = '51000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000001', true);
do $$ begin
 if exists(select 1 from public.desgloses_apertura) then raise exception 'FAIL: inactive client can read'; end if;
end $$;
set local role anon;
do $$ begin
 begin
  perform 1 from public.desgloses_apertura;
  raise exception 'FAIL: anonymous access';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
