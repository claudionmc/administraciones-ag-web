-- Run as postgres after migrations 001, 002 and 003. Synthetic data only.
begin;
insert into auth.users (id, email) values
 ('30000000-0000-0000-0000-000000000001', 'opening-a@example.invalid'),
 ('30000000-0000-0000-0000-000000000002', 'opening-b@example.invalid');
insert into public.clientes(id, activo) values
 ('30000000-0000-0000-0000-000000000001', true),
 ('30000000-0000-0000-0000-000000000002', true);
insert into public.aperturas_clientes(id, cliente_id, fuente_referencia, fuente_sha256, saldo_reportado_original) values
 ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'synthetic-a.xlsx', repeat('a', 64), 20300.25),
 ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'synthetic-b.xlsx', repeat('b', 64), 100);
insert into public.lotes_apertura(apertura_id, cliente_id, referencia_origen, fecha_inicio_original, orden_fifo, capital_original, capital_vigente, tasa_anual) values
 ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'C20', '2023-01-01', 20, 30000.25, 15000.25, 0.1001),
 ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'C21', '2025-01-01', 21, 5000, 5000, 0.0761);

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
do $$ begin
 if exists(select id from public.aperturas_clientes) or exists(select id from public.lotes_apertura) then
   raise exception 'FAIL: draft visible'; end if;
 begin
   update public.aperturas_clientes set confirmada = true;
   raise exception 'FAIL: client can confirm';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

do $$ declare rejected boolean; begin
 rejected := false;
 begin
   update public.aperturas_clientes set confirmada = true where id = '40000000-0000-0000-0000-000000000001';
 exception when raise_exception then
   if sqlerrm not like 'El capital de apertura no coincide%' then raise; end if;
   rejected := true;
 end;
 if not rejected then raise exception 'FAIL: unbalanced opening'; end if;
 rejected := false;
 begin
   insert into public.lotes_apertura(apertura_id, cliente_id, referencia_origen, fecha_inicio_original, orden_fifo, capital_original, capital_vigente, tasa_anual) values
   ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'wrong-owner', '2025-01-01', 99, 100, 100, 0.10);
 exception when raise_exception then
   if sqlerrm not like 'Cliente o fecha%' then raise; end if;
   rejected := true;
 end;
 if not rejected then raise exception 'FAIL: cross-owner lot'; end if;
 rejected := false;
 begin
   insert into public.lotes_apertura(apertura_id, cliente_id, referencia_origen, fecha_inicio_original, orden_fifo, capital_original, capital_vigente, tasa_anual) values
   ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'future', '2026-10-01', 99, 100, 100, 0.10);
 exception when raise_exception then
   if sqlerrm not like 'Cliente o fecha%' then raise; end if;
   rejected := true;
 end;
 if not rejected then raise exception 'FAIL: future lot in historical opening'; end if;
end $$;

update public.aperturas_clientes set capital_vigente=20000.25,
 intereses_pendientes=123.456, ajuste_neto_historico=-23.456, saldo_neto_apertura=20100.25,
 notas_conciliacion='Synthetic review: adjustment documented separately; original retained.',
 responsable_revision='Synthetic reviewer'
where id='40000000-0000-0000-0000-000000000001';
do $$ declare rejected boolean := false; begin
 begin
   update public.aperturas_clientes set confirmada=true where id='40000000-0000-0000-0000-000000000001';
 exception when raise_exception then
   if sqlerrm not like 'Falta conciliar%' then raise; end if;
   rejected := true;
 end;
 if not rejected then raise exception 'FAIL: unknown lifetime earnings treated as zero'; end if;
end $$;
update public.aperturas_clientes set intereses_ganados_totales=1500.10, estado_intereses='conciliado', confirmada=true
where id='40000000-0000-0000-0000-000000000001';

do $$ declare rejected boolean; begin
 if (select saldo_reportado_original from public.aperturas_clientes where id='40000000-0000-0000-0000-000000000001') <> 20300.25 then
   raise exception 'FAIL: historical statement overwritten'; end if;
 if (select sum(capital_vigente) from public.lotes_apertura) <> 20000.25 then
   raise exception 'FAIL: historical decimals lost'; end if;
 rejected := false;
 begin
   update public.lotes_apertura set capital_vigente=0;
 exception when raise_exception then
   if sqlerrm not like 'Los lotes de apertura confirmada%' then raise; end if;
   rejected := true;
 end;
 if not rejected then raise exception 'FAIL: confirmed lots editable'; end if;
 rejected := false;
 begin
   update public.aperturas_clientes set confirmada=false where id='40000000-0000-0000-0000-000000000001';
 exception when raise_exception then
   if sqlerrm not like 'La apertura confirmada%' then raise; end if;
   rejected := true;
 end;
 if not rejected then raise exception 'FAIL: confirmed opening editable'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
do $$ begin
 if (select count(id) from public.aperturas_clientes) <> 1 or (select count(id) from public.lotes_apertura) <> 2 then
   raise exception 'FAIL: confirmed owner cannot read'; end if;
 begin
   perform fuente_sha256 from public.aperturas_clientes;
   raise exception 'FAIL: private review metadata exposed';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
do $$ begin
 if exists(select id from public.aperturas_clientes) or exists(select id from public.lotes_apertura) then
   raise exception 'FAIL: another client can read opening'; end if;
end $$;
reset role;
update public.clientes set activo=false where id='30000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
do $$ begin
 if exists(select id from public.aperturas_clientes) or exists(select id from public.lotes_apertura) then
   raise exception 'FAIL: inactive client can read opening'; end if;
end $$;
set local role anon;
do $$ declare t text; begin
 foreach t in array array['aperturas_clientes','lotes_apertura'] loop
   begin
     execute format('select id from public.%I',t);
     raise exception 'FAIL: anonymous opening read';
   exception when insufficient_privilege then null; end;
 end loop;
end $$;
rollback;
