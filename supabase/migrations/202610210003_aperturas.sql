begin;

-- Opening balances are independent of the first investment model: legacy
-- statements keep their original decimals and are never recalculated here.
create table public.aperturas_clientes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null unique references public.clientes(id) on delete restrict,
  fecha_corte date not null default date '2026-09-30' check (fecha_corte = date '2026-09-30'),
  fecha_inicio_operacion date not null default date '2026-10-01' check (fecha_inicio_operacion = date '2026-10-01'),
  moneda text not null default 'CLP' check (moneda = 'CLP'),
  fuente_referencia text not null check (length(trim(fuente_referencia)) between 1 and 240),
  fuente_sha256 text not null check (fuente_sha256 ~ '^[a-f0-9]{64}$'),
  saldo_reportado_original numeric not null check (saldo_reportado_original >= 0 and saldo_reportado_original < 'Infinity'::numeric),
  capital_vigente numeric check (capital_vigente >= 0 and capital_vigente < 'Infinity'::numeric),
  intereses_pendientes numeric check (intereses_pendientes >= 0 and intereses_pendientes < 'Infinity'::numeric),
  -- Signed, documented reconciliation bridge. Do not deduct payments twice.
  ajuste_neto_historico numeric check (ajuste_neto_historico > '-Infinity'::numeric and ajuste_neto_historico < 'Infinity'::numeric),
  saldo_neto_apertura numeric check (saldo_neto_apertura >= 0 and saldo_neto_apertura < 'Infinity'::numeric),
  intereses_ganados_totales numeric check (intereses_ganados_totales >= 0 and intereses_ganados_totales < 'Infinity'::numeric),
  estado_intereses text not null default 'pendiente' check (estado_intereses in ('pendiente', 'reportado', 'conciliado')),
  notas_conciliacion text,
  responsable_revision text,
  confirmada boolean not null default false,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, cliente_id),
  check (estado_intereses = 'pendiente' or intereses_ganados_totales is not null)
);

-- Only residual principal accrues NEW interest from 01/10/2026. Original start
-- date sets FIFO priority; it must not restart accrual from the historical date.
create table public.lotes_apertura (
  id uuid primary key default gen_random_uuid(),
  apertura_id uuid not null,
  cliente_id uuid not null,
  referencia_origen text not null check (length(trim(referencia_origen)) between 1 and 120),
  fecha_inicio_original date not null check (isfinite(fecha_inicio_original)),
  orden_fifo integer not null check (orden_fifo > 0),
  capital_original numeric not null check (capital_original > 0 and capital_original < 'Infinity'::numeric),
  capital_vigente numeric not null check (capital_vigente >= 0 and capital_vigente <= capital_original),
  tasa_anual numeric not null check (tasa_anual >= 0 and tasa_anual < 'Infinity'::numeric),
  created_at timestamptz not null default now(),
  foreign key (apertura_id, cliente_id) references public.aperturas_clientes(id, cliente_id) on delete restrict,
  unique (apertura_id, referencia_origen),
  unique (apertura_id, orden_fifo)
);

create function public.validar_apertura_cliente()
returns trigger language plpgsql set search_path = '' as $$
declare suma numeric; cantidad bigint;
begin
  if tg_op = 'DELETE' then
    if old.confirmada then raise exception 'La apertura confirmada es inmutable'; end if;
    return old;
  end if;
  if tg_op = 'INSERT' then
    if new.confirmada then raise exception 'Crear primero la apertura en borrador'; end if;
    if new.confirmed_at is not null then raise exception 'El borrador no tiene fecha de confirmación'; end if;
    return new;
  end if;
  if old.confirmada then raise exception 'La apertura confirmada es inmutable'; end if;
  if new.id <> old.id or new.cliente_id <> old.cliente_id then
    raise exception 'La identidad de la apertura es inmutable';
  end if;
  if new.confirmada then
    select count(*), coalesce(sum(capital_vigente), 0) into cantidad, suma
      from public.lotes_apertura where apertura_id = new.id;
    if cantidad = 0 or new.capital_vigente is null or suma <> new.capital_vigente then
      raise exception 'El capital de apertura no coincide con los lotes';
    end if;
    if new.intereses_pendientes is null or new.ajuste_neto_historico is null
      or new.saldo_neto_apertura is null or new.intereses_ganados_totales is null
      or new.estado_intereses <> 'conciliado' then
      raise exception 'Falta conciliar saldos e intereses históricos';
    end if;
    if new.saldo_neto_apertura <> new.capital_vigente + new.intereses_pendientes + new.ajuste_neto_historico then
      raise exception 'El saldo neto de apertura no concilia';
    end if;
    if new.intereses_ganados_totales < new.intereses_pendientes then
      raise exception 'Los intereses pendientes superan el total histórico';
    end if;
    if nullif(trim(new.notas_conciliacion), '') is null
      or nullif(trim(new.responsable_revision), '') is null then
      raise exception 'Documentar la conciliación y su responsable';
    end if;
    new.confirmed_at := now();
  elsif new.confirmed_at is not null then
    raise exception 'El borrador no tiene fecha de confirmación';
  end if;
  return new;
end $$;
create trigger validar_apertura before insert or update or delete on public.aperturas_clientes
  for each row execute function public.validar_apertura_cliente();

create function public.validar_lote_apertura()
returns trigger language plpgsql set search_path = '' as $$
declare apertura public.aperturas_clientes;
begin
  if tg_op = 'UPDATE' and (new.apertura_id <> old.apertura_id or new.cliente_id <> old.cliente_id or new.id <> old.id) then
    raise exception 'La identidad del lote es inmutable';
  end if;
  if tg_op = 'DELETE' then
    select * into strict apertura from public.aperturas_clientes where id = old.apertura_id for update;
  else
    select * into strict apertura from public.aperturas_clientes where id = new.apertura_id for update;
  end if;
  -- The shared parent lock serializes lot edits with opening confirmation.
  if apertura.confirmada then raise exception 'Los lotes de apertura confirmada son inmutables'; end if;
  if tg_op = 'DELETE' then return old; end if;
  if new.cliente_id <> apertura.cliente_id or new.fecha_inicio_original > apertura.fecha_corte then
    raise exception 'Cliente o fecha del lote no corresponden a la apertura';
  end if;
  return new;
end $$;
create trigger validar_lote before insert or update or delete on public.lotes_apertura
  for each row execute function public.validar_lote_apertura();

create index lotes_apertura_fifo on public.lotes_apertura(apertura_id, fecha_inicio_original, orden_fifo);
create index lotes_apertura_cliente on public.lotes_apertura(cliente_id);
alter table public.aperturas_clientes enable row level security;
alter table public.aperturas_clientes force row level security;
alter table public.lotes_apertura enable row level security;
alter table public.lotes_apertura force row level security;
revoke all on public.aperturas_clientes, public.lotes_apertura from public, anon, authenticated;
-- Historical source references, review notes and hashes stay administrative.
grant select (id, cliente_id, fecha_corte, fecha_inicio_operacion, moneda,
  capital_vigente, intereses_pendientes, saldo_neto_apertura,
  intereses_ganados_totales, estado_intereses, confirmada)
  on public.aperturas_clientes to authenticated;
grant select (id, apertura_id, cliente_id, fecha_inicio_original, orden_fifo,
  capital_original, capital_vigente, tasa_anual) on public.lotes_apertura to authenticated;
create policy "Leer apertura propia confirmada" on public.aperturas_clientes for select to authenticated
  using (cliente_id = (select auth.uid()) and confirmada and
    exists (select 1 from public.clientes c where c.id = cliente_id and c.activo));
create policy "Leer lotes propios confirmados" on public.lotes_apertura for select to authenticated
  using (cliente_id = (select auth.uid()) and exists (
    select 1 from public.aperturas_clientes a where a.id = apertura_id and a.confirmada
  ));
revoke all on function public.validar_apertura_cliente(), public.validar_lote_apertura()
  from public, anon, authenticated;
commit;
