begin;

-- Keep existing September openings unchanged; allow other documented cutoffs.
-- Starting operation AT cutoff counts one elapsed day on the following date.
-- The older cutoff+1 convention remains supported for existing accounts.
alter table public.aperturas_clientes
  drop constraint aperturas_clientes_fecha_corte_check,
  drop constraint aperturas_clientes_fecha_inicio_operacion_check,
  add constraint apertura_corte_finito check (isfinite(fecha_corte)),
  add constraint apertura_inicio_valido check (isfinite(fecha_inicio_operacion)
    and fecha_inicio_operacion in (fecha_corte, fecha_corte + 1)),
  add column intereses_capitalizados_reportados numeric
    check (intereses_capitalizados_reportados >= 0
      and intereses_capitalizados_reportados < 'Infinity'::numeric
      and intereses_capitalizados_reportados <= intereses_ganados_totales);

-- Source display amounts are independent of subsequent interest calculations.
-- Preserve source rounding; never force printed totals to match by changing dates.
alter table public.lotes_apertura
  add column intereses_reportados numeric check (intereses_reportados >= 0 and intereses_reportados < 'Infinity'::numeric),
  add column total_reportado numeric check (total_reportado >= 0 and total_reportado < 'Infinity'::numeric);

grant select (intereses_capitalizados_reportados) on public.aperturas_clientes to authenticated;
grant select (intereses_reportados, total_reportado) on public.lotes_apertura to authenticated;
-- Existing own-active-account RLS and immutable-confirmed-opening triggers apply.
commit;
