begin;

-- Display provenance is separate from immutable financial snapshots.
create table public.periodos_lotes_apertura (
  lote_id uuid primary key references public.lotes_apertura(id) on delete restrict,
  fecha_inicio_periodo date not null check (isfinite(fecha_inicio_periodo)),
  respaldo text not null check (length(trim(respaldo)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create function public.validar_periodo_lote()
returns trigger language plpgsql set search_path = '' as $$
declare lote record;
begin
  if tg_op <> 'INSERT' then raise exception 'El respaldo del periodo es inmutable'; end if;
  select l.fecha_inicio_original, a.fecha_corte, a.confirmada into strict lote
    from public.lotes_apertura l join public.aperturas_clientes a on a.id=l.apertura_id
    where l.id=new.lote_id;
  if not lote.confirmada or new.fecha_inicio_periodo < lote.fecha_inicio_original
    or new.fecha_inicio_periodo > lote.fecha_corte then
    raise exception 'Periodo incompatible con el lote confirmado';
  end if;
  return new;
end $$;
create trigger validar_periodo before insert or update or delete on public.periodos_lotes_apertura
  for each row execute function public.validar_periodo_lote();
alter table public.periodos_lotes_apertura enable row level security;
alter table public.periodos_lotes_apertura force row level security;
revoke all on public.periodos_lotes_apertura from public,anon,authenticated;
grant select(lote_id,fecha_inicio_periodo) on public.periodos_lotes_apertura to authenticated;
create policy "Titular consulta periodo propio" on public.periodos_lotes_apertura
  for select to authenticated using (exists (
    select 1 from public.lotes_apertura l where l.id=lote_id and l.cliente_id=(select auth.uid())
  ));
revoke all on function public.validar_periodo_lote() from public,anon,authenticated;

-- Enrich display only: the original totals and financial calculations stay intact.
create function public.resumen_diario_detallado_cliente()
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  resultado jsonb := public.resumen_diario_cliente();
  fila jsonb;
  detalle jsonb := '[]'::jsonb;
  inicio date;
  base numeric;
  corte date := (resultado->>'fecha')::date;
begin
  for fila in select value from jsonb_array_elements(resultado->'lotes') loop
    inicio := null;
    base := null;
    if fila->>'origen'='apertura' then
      select p.fecha_inicio_periodo, l.intereses_reportados into inicio,base
      from public.lotes_apertura l left join public.periodos_lotes_apertura p on p.lote_id=l.id
      where l.id=(fila->>'id')::uuid and l.cliente_id=auth.uid();
    else
      inicio := (fila->>'fecha_inicio')::date;
      base := 0;
    end if;
    detalle := detalle || jsonb_build_array(fila || jsonb_build_object(
      'fecha_inicio_periodo',inicio,
      'dias_periodo',corte-inicio,
      'interes_acumulado_periodo',(base+(fila->>'interes')::numeric)::text
    ));
  end loop;
  return resultado || jsonb_build_object('lotes',detalle);
end $$;
revoke all on function public.resumen_diario_detallado_cliente() from public,anon,authenticated;
grant execute on function public.resumen_diario_detallado_cliente() to authenticated;
commit;
