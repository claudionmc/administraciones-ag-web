begin;

-- Optional historical breakdown. Missing rows mean unknown, never zero.
create table public.desgloses_apertura (
  apertura_id uuid primary key references public.aperturas_clientes(id) on delete restrict,
  intereses_capitalizados numeric not null check (intereses_capitalizados >= 0 and intereses_capitalizados < 'Infinity'::numeric),
  intereses_pagados numeric not null check (intereses_pagados >= 0 and intereses_pagados < 'Infinity'::numeric),
  impuestos numeric not null check (impuestos >= 0 and impuestos < 'Infinity'::numeric),
  cargos numeric not null check (cargos >= 0 and cargos < 'Infinity'::numeric),
  intereses_netos numeric not null check (intereses_netos >= 0 and intereses_netos < 'Infinity'::numeric)
);

create function public.validar_desglose_apertura()
returns trigger language plpgsql set search_path = '' as $$
declare apertura public.aperturas_clientes; desglose public.desgloses_apertura;
begin
  if tg_table_name = 'aperturas_clientes' then
    if not new.confirmada then return new; end if;
    apertura := new;
    select * into desglose from public.desgloses_apertura where apertura_id = new.id;
    if not found then return new; end if;
  else
    if tg_op = 'UPDATE' and new.apertura_id <> old.apertura_id then
      raise exception 'La identidad del desglose es inmutable';
    end if;
    if tg_op = 'DELETE' then
      select * into strict apertura from public.aperturas_clientes where id = old.apertura_id for update;
    else
      select * into strict apertura from public.aperturas_clientes where id = new.apertura_id for update;
    end if;
    if apertura.confirmada then raise exception 'El desglose confirmado es inmutable'; end if;
    if tg_op = 'DELETE' then return old; end if;
    desglose := new;
  end if;
  if apertura.intereses_ganados_totales is null or apertura.intereses_pendientes is null
    or desglose.intereses_netos <> apertura.intereses_ganados_totales - desglose.impuestos - desglose.cargos
    or desglose.intereses_netos <> desglose.intereses_capitalizados + desglose.intereses_pagados + apertura.intereses_pendientes then
    raise exception 'El desglose de intereses no concilia con la apertura';
  end if;
  return new;
end $$;

create trigger validar_desglose before insert or update or delete on public.desgloses_apertura
  for each row execute function public.validar_desglose_apertura();
create trigger validar_desglose_al_confirmar before update on public.aperturas_clientes
  for each row execute function public.validar_desglose_apertura();

alter table public.desgloses_apertura enable row level security;
alter table public.desgloses_apertura force row level security;
revoke all on public.desgloses_apertura from public, anon, authenticated;
grant select on public.desgloses_apertura to authenticated;
create policy "Leer desglose propio confirmado" on public.desgloses_apertura for select to authenticated
  using (exists (select 1 from public.aperturas_clientes a
    where a.id = apertura_id and a.cliente_id = (select auth.uid()) and a.confirmada));
revoke all on function public.validar_desglose_apertura() from public, anon, authenticated;

commit;
