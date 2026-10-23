-- Run as postgres after both migrations. Synthetic data only; always ROLLBACK.
begin;
insert into auth.users (id, email) values
 ('10000000-0000-0000-0000-000000000001', 'invest-a@example.invalid'),
 ('10000000-0000-0000-0000-000000000002', 'invest-b@example.invalid');
insert into public.clientes (id, activo) values
 ('10000000-0000-0000-0000-000000000001', true),
 ('10000000-0000-0000-0000-000000000002', true);
insert into public.inversiones (id, cliente_id, referencia, capital, tasa_anual, fecha_inicio, origen) values
 ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Aporte A', 10000, 0.10, '2024-01-01', 'aporte'),
 ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Aporte B', 20000, 0.0761, '2024-01-01', 'aporte'),
 ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Capitalización A', 1000, 0.0761, '2024-12-31', 'capitalizacion');
insert into public.movimientos_inversiones (cliente_id, inversion_origen_id, inversion_destino_id, fecha, importe) values
 ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '2024-12-31', 1000);
set constraints all immediate;

do $$ declare rejected boolean := false; begin
 begin
   insert into public.inversiones (cliente_id, referencia, capital, tasa_anual, fecha_inicio, origen)
   values ('10000000-0000-0000-0000-000000000001', 'Destino sin respaldo', 500, 0.0761, '2025-01-01', 'capitalizacion');
 exception when raise_exception then
   if sqlerrm not like 'El capital de destino no coincide%' then raise; end if;
   rejected := true;
 end;
 if not rejected then raise exception 'FAIL: unbalanced destination accepted'; end if;
end $$;

do $$ declare v record; begin
 select * into v from public.calcular_valorizacion_clp(10000, 0.10, '2024-01-01', '2024-12-31', 1000);
 if v.dias <> 365 or v.interes_acumulado <> 1000 or v.interes_pendiente <> 0 or v.total <> 10000 then
   raise exception 'FAIL: ACT/365 or capitalization'; end if;
 select * into v from public.calcular_valorizacion_clp(10000, 0.10, '2024-01-01', '2025-01-01', 1000);
 if v.dias <> 366 or v.interes_acumulado <> 1003 or v.total <> 10003 then
   raise exception 'FAIL: leap year must retain denominator 365'; end if;
 select * into v from public.calcular_valorizacion_clp(1000, 0.0761, '2024-12-31', '2025-12-31', 0);
 if v.interes_acumulado <> 76 then raise exception 'FAIL: destination rate'; end if;
 select * into v from public.calcular_valorizacion_clp(100, 0.005, '2023-01-01', '2024-01-01', 0);
 if v.interes_acumulado <> 1 then raise exception 'FAIL: half peso rounding'; end if;
 select * into v from public.calcular_valorizacion_clp(100, 0.004, '2023-01-01', '2024-01-01', 0);
 if v.interes_acumulado * 2 <> 0 then raise exception 'FAIL: per-investment rounding'; end if;
 begin
   perform 1 from public.calcular_valorizacion_clp(100, 0.1, '2025-01-01', '2024-01-01', 0);
   raise exception 'FAIL: negative period';
 exception when invalid_parameter_value then null; end;
 begin
   perform 1 from public.calcular_valorizacion_clp(100, 0.1, '2024-01-01', '2025-01-01', 11);
   raise exception 'FAIL: excessive capitalization';
 exception when invalid_parameter_value then null; end;
 begin
   insert into public.movimientos_inversiones(cliente_id, inversion_origen_id, inversion_destino_id, fecha, importe)
   values ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '2024-12-31', 1);
   raise exception 'FAIL: cross-owner transfer';
 exception when foreign_key_violation then null; end;
end $$;

insert into public.valorizaciones_inversiones (cliente_id, inversion_id, fecha_corte) values
 ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2024-06-01'),
 ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2025-01-01'),
 ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '2025-01-01');
-- moneda defaults to CLP; snapshot values are computed by the trigger.
do $$ begin
 if (select interes_capitalizado from public.valorizaciones_inversiones where fecha_corte = '2024-06-01') <> 0 then
   raise exception 'FAIL: future transfers affected past close'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
do $$ begin
 if (select count(*) from public.inversiones) <> 2
   or (select count(*) from public.movimientos_inversiones) <> 1
   or (select count(*) from public.valorizaciones_inversiones) <> 2 then
   raise exception 'FAIL: ownership isolation'; end if;
 begin
   update public.inversiones set capital = 1;
   raise exception 'FAIL: client can modify principal';
 exception when insufficient_privilege then null; end;
 begin
   delete from public.movimientos_inversiones;
   raise exception 'FAIL: client can delete transfers';
 exception when insufficient_privilege then null; end;
 begin
   insert into public.valorizaciones_inversiones(cliente_id, inversion_id, fecha_corte)
   values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2025-02-01');
   raise exception 'FAIL: client can insert closes';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.clientes set activo = false where id = '10000000-0000-0000-0000-000000000001';
set local role authenticated;
do $$ begin
 if exists(select 1 from public.inversiones) or exists(select 1 from public.movimientos_inversiones)
   or exists(select 1 from public.valorizaciones_inversiones) then
   raise exception 'FAIL: inactive client can read'; end if;
end $$;
set local role anon;
do $$ declare t text; begin
 foreach t in array array['inversiones', 'movimientos_inversiones', 'valorizaciones_inversiones'] loop
   begin
     execute format('select 1 from public.%I', t);
     raise exception 'FAIL: anonymous access';
   exception when insufficient_privilege then null; end;
 end loop;
end $$;
rollback;
