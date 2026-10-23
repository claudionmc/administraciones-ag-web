begin;

-- Initial scope: CLP, fixed annual rate per investment, simple ACT/365.
-- Decimal rates: 0.1001 means 10.01%. No client data belongs in migrations.
create function public.calcular_valorizacion_clp(
  capital numeric, tasa_anual numeric, fecha_inicio date, fecha_corte date,
  capitalizado numeric default 0
) returns table (dias integer, interes_acumulado numeric,
  interes_capitalizado numeric, interes_pendiente numeric, total numeric)
language plpgsql immutable set search_path = '' as $$
declare interes numeric;
begin
  if capital is null or not (capital > 0 and capital < 'Infinity'::numeric)
    or capital <> round(capital)
    or tasa_anual is null or not (tasa_anual >= 0 and tasa_anual < 'Infinity'::numeric)
    or fecha_inicio is null or fecha_corte is null
    or not isfinite(fecha_inicio) or not isfinite(fecha_corte)
    or fecha_corte < fecha_inicio
    or capitalizado is null or not (capitalizado >= 0 and capitalizado < 'Infinity'::numeric)
    or capitalizado <> round(capitalizado) then
    raise exception 'Datos inválidos para valorización CLP' using errcode = '22023';
  end if;
  interes := round(capital * tasa_anual * (fecha_corte - fecha_inicio) / 365, 0);
  if capitalizado > interes then
    raise exception 'La capitalización supera el interés acumulado al corte' using errcode = '22023';
  end if;
  return query select fecha_corte - fecha_inicio, interes, capitalizado,
    interes - capitalizado, capital + interes - capitalizado;
end $$;

create table public.inversiones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  referencia text not null check (length(trim(referencia)) between 1 and 120),
  moneda text not null default 'CLP' check (moneda = 'CLP'),
  capital numeric not null check (capital > 0 and capital < 'Infinity'::numeric and capital = round(capital)),
  fecha_inicio date not null check (isfinite(fecha_inicio)),
  tasa_anual numeric not null check (tasa_anual >= 0 and tasa_anual < 'Infinity'::numeric),
  convencion text not null default 'ACT/365' check (convencion = 'ACT/365'),
  origen text not null check (origen in ('aporte', 'capitalizacion')),
  created_at timestamptz not null default now(),
  unique (cliente_id, referencia),
  unique (id, cliente_id, moneda)
);

-- One row per source -> destination transfer of interest, never an external deposit.
-- Withdrawals and changes of rate are outside this first model.
create table public.movimientos_inversiones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  moneda text not null default 'CLP' check (moneda = 'CLP'),
  inversion_origen_id uuid not null,
  inversion_destino_id uuid not null,
  tipo text not null default 'capitalizacion' check (tipo = 'capitalizacion'),
  fecha date not null check (isfinite(fecha)),
  importe numeric not null check (importe > 0 and importe < 'Infinity'::numeric and importe = round(importe)),
  created_at timestamptz not null default now(),
  check (inversion_origen_id <> inversion_destino_id),
  foreign key (inversion_origen_id, cliente_id, moneda)
    references public.inversiones(id, cliente_id, moneda) on delete restrict,
  foreign key (inversion_destino_id, cliente_id, moneda)
    references public.inversiones(id, cliente_id, moneda) on delete restrict,
  unique (inversion_origen_id, inversion_destino_id)
);

create table public.valorizaciones_inversiones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  moneda text not null default 'CLP' check (moneda = 'CLP'),
  inversion_id uuid not null,
  fecha_corte date not null check (isfinite(fecha_corte)),
  -- Snapshot inputs and results are filled by the database, not the caller.
  capital numeric not null,
  tasa_anual numeric not null,
  dias integer not null check (dias >= 0),
  interes_acumulado numeric not null,
  interes_capitalizado numeric not null,
  interes_pendiente numeric not null,
  total numeric not null,
  created_at timestamptz not null default now(),
  foreign key (inversion_id, cliente_id, moneda)
    references public.inversiones(id, cliente_id, moneda) on delete restrict,
  unique (inversion_id, fecha_corte)
);

create function public.completar_valorizacion_inversion()
returns trigger language plpgsql set search_path = '' as $$
declare inv public.inversiones; cap numeric; v record;
begin
  select * into strict inv from public.inversiones where id = new.inversion_id for update;
  if new.cliente_id <> inv.cliente_id or new.moneda <> inv.moneda then
    raise exception 'La valorización no corresponde al cliente y moneda';
  end if;
  select coalesce(sum(importe), 0) into cap from public.movimientos_inversiones
    where inversion_origen_id = inv.id and fecha <= new.fecha_corte;
  select * into v from public.calcular_valorizacion_clp(
    inv.capital, inv.tasa_anual, inv.fecha_inicio, new.fecha_corte, cap);
  new.capital := inv.capital;
  new.tasa_anual := inv.tasa_anual;
  new.dias := v.dias;
  new.interes_acumulado := v.interes_acumulado;
  new.interes_capitalizado := v.interes_capitalizado;
  new.interes_pendiente := v.interes_pendiente;
  new.total := v.total;
  return new;
end $$;
create trigger completar_valorizacion before insert or update on public.valorizaciones_inversiones
  for each row execute function public.completar_valorizacion_inversion();

-- Serialize transfers on both investments. Dates and available interest are
-- validated for every transfer from the source, including backdated inserts.
create function public.validar_capitalizacion_inversion()
returns trigger language plpgsql set search_path = '' as $$
declare src public.inversiones; dst public.inversiones;
begin
  if tg_op <> 'INSERT' then
    raise exception 'Los movimientos son inmutables; revisar correcciones administrativamente';
  end if;
  perform 1 from public.inversiones
    where id in (new.inversion_origen_id, new.inversion_destino_id) order by id for update;
  select * into strict src from public.inversiones where id = new.inversion_origen_id;
  select * into strict dst from public.inversiones where id = new.inversion_destino_id;
  if dst.origen <> 'capitalizacion' or new.fecha <> dst.fecha_inicio
    or new.fecha <= src.fecha_inicio then
    raise exception 'Origen, destino o fecha de capitalización inválidos';
  end if;
  if exists (select 1 from public.valorizaciones_inversiones
    where inversion_id in (src.id, dst.id) and fecha_corte >= new.fecha) then
    raise exception 'No se puede alterar un cierre existente; revisar antes de cargar';
  end if;
  return new;
end $$;
create trigger validar_capitalizacion before insert or update or delete on public.movimientos_inversiones
  for each row execute function public.validar_capitalizacion_inversion();

-- Deferred reconciliation lets all source rows be imported in one transaction.
create function public.conciliar_capitalizacion_inversion()
returns trigger language plpgsql set search_path = '' as $$
declare inv public.inversiones; mov record;
begin
  if tg_table_name = 'inversiones' then
    select * into strict inv from public.inversiones where id = new.id;
  else
    select * into strict inv from public.inversiones where id = new.inversion_destino_id;
  end if;
  if inv.origen = 'capitalizacion' and inv.capital <> (
    select coalesce(sum(importe), 0) from public.movimientos_inversiones where inversion_destino_id = inv.id
  ) then raise exception 'El capital de destino no coincide con los intereses transferidos'; end if;
  for mov in
    select m.inversion_origen_id, m.fecha, i.capital, i.tasa_anual, i.fecha_inicio,
      sum(m.importe) over (partition by m.inversion_origen_id order by m.fecha) as acumulado
    from public.movimientos_inversiones m join public.inversiones i on i.id = m.inversion_origen_id
    where m.inversion_origen_id in (
      select inversion_origen_id from public.movimientos_inversiones where inversion_destino_id = inv.id
    )
  loop
    perform 1 from public.calcular_valorizacion_clp(
      mov.capital, mov.tasa_anual, mov.fecha_inicio, mov.fecha, mov.acumulado);
  end loop;
  return null;
end $$;
create constraint trigger conciliar_destino after insert on public.inversiones
  deferrable initially deferred for each row execute function public.conciliar_capitalizacion_inversion();
create constraint trigger conciliar_movimiento after insert on public.movimientos_inversiones
  deferrable initially deferred for each row execute function public.conciliar_capitalizacion_inversion();

-- Financial inputs remain immutable so historical snapshots stay reproducible.
create function public.bloquear_cambio_inversion()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Las inversiones son inmutables en esta fase; revisar correcciones administrativamente';
end $$;
create trigger bloquear_cambio before update or delete on public.inversiones
  for each row execute function public.bloquear_cambio_inversion();

create index inversiones_cliente on public.inversiones(cliente_id);
create index movimientos_cliente on public.movimientos_inversiones(cliente_id);
create index movimientos_origen_fecha on public.movimientos_inversiones(inversion_origen_id, fecha);
create index movimientos_destino on public.movimientos_inversiones(inversion_destino_id);
create index valorizaciones_cliente_corte on public.valorizaciones_inversiones(cliente_id, fecha_corte);

alter table public.inversiones enable row level security;
alter table public.inversiones force row level security;
alter table public.movimientos_inversiones enable row level security;
alter table public.movimientos_inversiones force row level security;
alter table public.valorizaciones_inversiones enable row level security;
alter table public.valorizaciones_inversiones force row level security;
revoke all on public.inversiones, public.movimientos_inversiones, public.valorizaciones_inversiones
  from public, anon, authenticated;
grant select on public.inversiones, public.movimientos_inversiones, public.valorizaciones_inversiones to authenticated;
create policy "Leer inversiones propias" on public.inversiones for select to authenticated
  using (cliente_id = (select auth.uid()) and exists (select 1 from public.clientes c where c.id = cliente_id and c.activo));
create policy "Leer movimientos propios" on public.movimientos_inversiones for select to authenticated
  using (cliente_id = (select auth.uid()) and exists (select 1 from public.clientes c where c.id = cliente_id and c.activo));
create policy "Leer valorizaciones propias" on public.valorizaciones_inversiones for select to authenticated
  using (cliente_id = (select auth.uid()) and exists (select 1 from public.clientes c where c.id = cliente_id and c.activo));
revoke all on function public.calcular_valorizacion_clp(numeric,numeric,date,date,numeric) from public, anon, authenticated;
revoke all on function public.completar_valorizacion_inversion(), public.validar_capitalizacion_inversion(),
  public.conciliar_capitalizacion_inversion(), public.bloquear_cambio_inversion() from public, anon, authenticated;
commit;
