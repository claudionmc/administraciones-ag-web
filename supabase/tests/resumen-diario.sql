-- Synthetic-only tests. Run as postgres after all migrations; always rolls back.
begin;
insert into auth.users (id, email) values
 ('00000000-0000-0000-0000-0000000000d1', 'daily-a@example.invalid'),
 ('00000000-0000-0000-0000-0000000000d2', 'daily-b@example.invalid');
insert into public.clientes (id, activo) values
 ('00000000-0000-0000-0000-0000000000d1', true),
 ('00000000-0000-0000-0000-0000000000d2', true);
insert into public.inversiones (cliente_id, referencia, capital, fecha_inicio, tasa_anual, origen) values
 ('00000000-0000-0000-0000-0000000000d1', 'first', 250000, (current_timestamp at time zone 'America/Santiago')::date - 1, 0.1001, 'aporte'),
 ('00000000-0000-0000-0000-0000000000d1', 'second', 1750000, (current_timestamp at time zone 'America/Santiago')::date, 0.1001, 'aporte'),
 ('00000000-0000-0000-0000-0000000000d1', 'future', 999999, (current_timestamp at time zone 'America/Santiago')::date + 1, 0.1001, 'aporte'),
 ('00000000-0000-0000-0000-0000000000d2', 'private', 365000, (current_timestamp at time zone 'America/Santiago')::date - 10, 0.1, 'aporte');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);
do $$ declare r jsonb; begin
  r := public.resumen_diario_cliente();
  if r->>'fecha' <> ((current_timestamp at time zone 'America/Santiago')::date)::text
    or r->>'capital' <> '2000000' or r->>'intereses_nuevos' <> '69'
    or r->>'saldo_estimado' <> '2000069' or jsonb_array_length(r->'lotes') <> 2
    or r->'lotes'->1->>'dias' <> '0' then
    raise exception 'FAIL: dates, rounding, future exclusion or isolation: %', r;
  end if;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d2', true);
do $$ declare r jsonb; begin
  r := public.resumen_diario_cliente();
  if r->>'capital' <> '365000' or r->>'intereses_nuevos' <> '1000' then
    raise exception 'FAIL: second account isolation';
  end if;
end $$;
reset role;
-- A confirmed opening preserves decimal adjustments and excludes its old
-- investment row from new contributions (no double counting).
insert into auth.users (id, email) values
 ('00000000-0000-0000-0000-0000000000d3', 'daily-history@example.invalid');
insert into public.clientes (id, activo) values
 ('00000000-0000-0000-0000-0000000000d3', true);
insert into public.inversiones (cliente_id, referencia, capital, fecha_inicio, tasa_anual, origen) values
 ('00000000-0000-0000-0000-0000000000d3', 'legacy', 500000, '2026-01-01', 0.1, 'aporte'),
 ('00000000-0000-0000-0000-0000000000d3', 'new', 365000, (current_timestamp at time zone 'America/Santiago')::date - 1, 0.1, 'aporte');
insert into public.aperturas_clientes (
 id, cliente_id, fuente_referencia, fuente_sha256, saldo_reportado_original,
 capital_vigente, intereses_pendientes, ajuste_neto_historico, saldo_neto_apertura,
 intereses_ganados_totales, estado_intereses, notas_conciliacion, responsable_revision
) values (
 '00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000d3',
 'Synthetic fixture', repeat('a', 64), 365010.25,
 365000, 20.50, -10.25, 365010.25, 100.75, 'conciliado', 'Synthetic adjustment', 'Test'
);
insert into public.lotes_apertura (
 apertura_id, cliente_id, referencia_origen, fecha_inicio_original, orden_fifo,
 capital_original, capital_vigente, tasa_anual
) values (
 '00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000d3',
 'residual', '2026-01-01', 1, 500000, 365000, 0.1
);
update public.aperturas_clientes set confirmada = true
 where id = '00000000-0000-0000-0000-0000000000e3';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d3', true);
do $$ declare r jsonb; interes numeric; begin
  interes := 100 * ((current_timestamp at time zone 'America/Santiago')::date - date '2026-10-01') + 100;
  r := public.resumen_diario_cliente();
  if r->>'capital' <> '730000' or (r->>'intereses_nuevos')::numeric <> interes
    or (r->>'saldo_estimado')::numeric <> 730010.25 + interes
    or (r->>'intereses_totales')::numeric <> 100.75 + interes
    or jsonb_array_length(r->'lotes') <> 2 then
    raise exception 'FAIL: opening double count, adjustment or accrual restart: %', r;
  end if;
end $$;
reset role;
-- Any effective capitalization must block the unsupported projection.
insert into public.inversiones (id, cliente_id, referencia, capital, fecha_inicio, tasa_anual, origen) values
 ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000d1',
 'capitalization', 10, (current_timestamp at time zone 'America/Santiago')::date, 0.1001, 'capitalizacion');
insert into public.movimientos_inversiones (cliente_id, inversion_origen_id, inversion_destino_id, fecha, importe)
 select cliente_id, id, '00000000-0000-0000-0000-0000000000f1',
 (current_timestamp at time zone 'America/Santiago')::date, 10
 from public.inversiones where cliente_id = '00000000-0000-0000-0000-0000000000d1' and referencia = 'first';
set constraints all immediate;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);
do $$ declare rejected boolean := false; begin
  begin
    perform public.resumen_diario_cliente();
  exception when raise_exception then
    if sqlerrm not like 'Los movimientos requieren%' then raise; end if;
    rejected := true;
  end;
  if not rejected then raise exception 'FAIL: capitalization silently ignored'; end if;
end $$;
reset role;
update public.clientes set activo = false where id = '00000000-0000-0000-0000-0000000000d2';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d2', true);
do $$ begin
  begin
    perform public.resumen_diario_cliente();
    raise exception 'FAIL: inactive account accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
set local role anon;
do $$ begin
  begin
    perform public.resumen_diario_cliente();
    raise exception 'FAIL: anonymous access';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
