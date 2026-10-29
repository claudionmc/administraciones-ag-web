begin;

-- Read-only projection, computed on demand under the caller's existing RLS.
-- No administrative key, scheduled writes or changes to confirmed history.
create function public.resumen_diario_cliente()
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  titular uuid := auth.uid();
  hoy date := (current_timestamp at time zone 'America/Santiago')::date;
  apertura record;
  resultado jsonb;
begin
  if titular is null or not exists (
    select 1 from public.clientes where id = titular and activo
  ) then
    raise exception 'Cuenta no disponible' using errcode = '42501';
  end if;

  select id, fecha_corte, fecha_inicio_operacion, capital_vigente,
    intereses_ganados_totales, saldo_neto_apertura
  into apertura from public.aperturas_clientes
  where cliente_id = titular and confirmada;

  -- Transfers affect accrual bases: never silently project through them.
  if exists (
    select 1 from public.movimientos_inversiones
    where cliente_id = titular and fecha <= hoy
      and (apertura.id is null or fecha > apertura.fecha_corte)
  ) then
    raise exception 'Los movimientos requieren conciliación antes del cálculo diario';
  end if;

  with fuentes as (
    select l.id, 'apertura'::text as origen,
      l.fecha_inicio_original as fecha_origen,
      apertura.fecha_inicio_operacion as fecha_inicio,
      l.capital_vigente as capital, l.tasa_anual
    from public.lotes_apertura l
    where l.cliente_id = titular and l.apertura_id = apertura.id
    union all
    select i.id, 'aporte'::text, i.fecha_inicio, i.fecha_inicio,
      i.capital, i.tasa_anual
    from public.inversiones i
    where i.cliente_id = titular and i.origen = 'aporte'
      and (apertura.id is null or i.fecha_inicio > apertura.fecha_corte)
  ), calculados as (
    select *, hoy - fecha_inicio as dias,
      round(capital * tasa_anual * (hoy - fecha_inicio) / 365, 0) as interes
    from fuentes where fecha_inicio <= hoy
  )
  select jsonb_build_object(
    'fecha', hoy,
    'capital', coalesce(sum(capital), 0)::text,
    'intereses_nuevos', coalesce(sum(interes), 0)::text,
    'intereses_totales', (coalesce(apertura.intereses_ganados_totales, 0)
      + coalesce(sum(interes), 0))::text,
    'saldo_estimado', (coalesce(sum(capital + interes), 0)
      + coalesce(apertura.saldo_neto_apertura - apertura.capital_vigente, 0))::text,
    'desde_apertura', apertura.id is not null,
    'lotes', coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'origen', origen, 'fecha_origen', fecha_origen,
      'fecha_inicio', fecha_inicio, 'capital', capital::text,
      'tasa_anual', tasa_anual::text, 'dias', dias, 'interes', interes::text
    ) order by fecha_origen, id), '[]'::jsonb)
  ) into resultado from calculados;
  return resultado;
end $$;

revoke all on function public.resumen_diario_cliente() from public, anon, authenticated;
grant execute on function public.resumen_diario_cliente() to authenticated;
commit;
