-- Synthetic source rounding, capitalization included in principal, and new deposit.
-- Run as postgres after all migrations. Everything rolls back.
begin;
insert into auth.users(id,email) values
 ('81000000-0000-0000-0000-000000000001','document-a@example.invalid'),
 ('81000000-0000-0000-0000-000000000002','document-b@example.invalid');
insert into public.clientes(id,activo) values
 ('81000000-0000-0000-0000-000000000001',true),
 ('81000000-0000-0000-0000-000000000002',true);
insert into public.aperturas_clientes(id,cliente_id,fecha_corte,fecha_inicio_operacion,
 fuente_referencia,fuente_sha256,saldo_reportado_original,capital_vigente,
 intereses_pendientes,ajuste_neto_historico,saldo_neto_apertura,intereses_ganados_totales,
 intereses_capitalizados_reportados,estado_intereses,notas_conciliacion,responsable_revision)
select '82000000-0000-0000-0000-000000000001'::uuid,'81000000-0000-0000-0000-000000000001'::uuid,
 (current_timestamp at time zone 'America/Santiago')::date-1,
 (current_timestamp at time zone 'America/Santiago')::date-1,
 'Synthetic source',repeat('b',64),13000,12000,1000,0,13000,3000,2000,'conciliado',
 'Synthetic: printed detail differs by two pesos; preserve source summary','Synthetic reviewer';
insert into public.lotes_apertura(apertura_id,cliente_id,referencia_origen,
 fecha_inicio_original,orden_fifo,capital_original,capital_vigente,tasa_anual,intereses_reportados,total_reportado)
select '82000000-0000-0000-0000-000000000001'::uuid,'81000000-0000-0000-0000-000000000001'::uuid,
 'Original',fecha_corte-100,1,10000,10000,0.10,700,10700 from public.aperturas_clientes
 where id='82000000-0000-0000-0000-000000000001'
union all select '82000000-0000-0000-0000-000000000001','81000000-0000-0000-0000-000000000001',
 'Capitalized',fecha_corte-20,2,2000,2000,0.07,299,2298 from public.aperturas_clientes
 where id='82000000-0000-0000-0000-000000000001';
update public.aperturas_clientes set confirmada=true where id='82000000-0000-0000-0000-000000000001';
insert into public.inversiones(id,cliente_id,referencia,capital,fecha_inicio,tasa_anual,origen)
values ('83000000-0000-0000-0000-000000000001','81000000-0000-0000-0000-000000000001',
 'New deposit',800,(current_timestamp at time zone 'America/Santiago')::date,0.0761,'aporte');
insert into public.valorizaciones_inversiones(cliente_id,inversion_id,fecha_corte)
values ('81000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000001',
 (current_timestamp at time zone 'America/Santiago')::date);
do $$ begin
 if not exists(select 1 from public.valorizaciones_inversiones
   where inversion_id='83000000-0000-0000-0000-000000000001' and dias=0 and interes_acumulado=0 and total=800) then
   raise exception 'FAIL: deposit earns interest on initial date';
 end if;
 if (select sum(total_reportado) from public.lotes_apertura where apertura_id='82000000-0000-0000-0000-000000000001') <> 12998
   or (select saldo_neto_apertura from public.aperturas_clientes where id='82000000-0000-0000-0000-000000000001') <> 13000 then
   raise exception 'FAIL: printed rounding must remain separate';
 end if;
 begin
   update public.aperturas_clientes set intereses_capitalizados_reportados=1 where id='82000000-0000-0000-0000-000000000001';
   raise exception 'FAIL: confirmed summary changed';
 exception when raise_exception then
   if sqlerrm <> 'La apertura confirmada es inmutable' then raise; end if;
 end;
 begin
   update public.lotes_apertura set total_reportado=0 where apertura_id='82000000-0000-0000-0000-000000000001';
   raise exception 'FAIL: confirmed detail changed';
 exception when raise_exception then
   if sqlerrm <> 'Los lotes de apertura confirmada son inmutables' then raise; end if;
 end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','81000000-0000-0000-0000-000000000001',true);
do $$ declare r jsonb; begin
 r:=public.resumen_diario_cliente();
 if r->>'capital'<>'12800' or r->>'saldo_estimado'<>'13803'
   or r->>'intereses_nuevos'<>'3' or r->>'intereses_totales'<>'3003'
   or jsonb_array_length(r->'lotes')<>3 then
   raise exception 'FAIL: wrong baseline or capitalized interest counted twice';
 end if;
 if not exists(select 1 from jsonb_array_elements(r->'lotes') l
   where l->>'origen'='aporte' and l->>'dias'='0' and l->>'interes'='0') then
   raise exception 'FAIL: daily deposit must have zero interest';
 end if;
 if not exists(select 1 from public.aperturas_clientes where intereses_capitalizados_reportados=2000)
   or not exists(select 1 from public.lotes_apertura where total_reportado=2298) then
   raise exception 'FAIL: own source columns unavailable';
 end if;
end $$;
select set_config('request.jwt.claim.sub','81000000-0000-0000-0000-000000000002',true);
do $$ begin
 if exists(select 1 from public.lotes_apertura where total_reportado is not null)
   or exists(select 1 from public.aperturas_clientes where intereses_capitalizados_reportados is not null) then
   raise exception 'FAIL: source columns leaked';
 end if;
end $$;
reset role;
rollback;
