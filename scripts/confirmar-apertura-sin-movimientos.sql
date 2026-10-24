-- Run manually as postgres AFTER migrations 001/002/003 and 202610240001.
-- Replace only the email below. No password is needed.
-- Use ONLY for one initial contribution with NO withdrawals, interest payments,
-- capitalizations, taxes or charges, as explicitly confirmed by its owner.
-- This creates a historical opening; it does not activate post-cutoff accrual.
begin;
do $$
declare
  correo text := 'REEMPLAZAR_EMAIL';
  titular uuid;
  inversion public.inversiones;
  cierre record;
  apertura uuid;
  evidencia text;
begin
  select c.id into strict titular from public.clientes c
    join auth.users u on u.id = c.id where u.email = correo and c.activo;
  -- Serialize repeated submissions for this client. Existing openings are never changed.
  perform 1 from public.clientes where id = titular for update;
  if exists (select 1 from public.aperturas_clientes where cliente_id = titular) then
    raise exception 'Ya existe una apertura; no se modificó. Revisar su estado antes de continuar';
  end if;
  select * into strict inversion from public.inversiones where cliente_id = titular;
  if inversion.origen <> 'aporte' or inversion.fecha_inicio > date '2026-09-30'
    or exists (select 1 from public.movimientos_inversiones where cliente_id = titular) then
    raise exception 'Este script solo admite un aporte inicial sin movimientos';
  end if;
  select * into strict cierre from public.calcular_valorizacion_clp(
    inversion.capital, inversion.tasa_anual, inversion.fecha_inicio, date '2026-09-30', 0);
  evidencia := jsonb_build_object(
    'inversion', to_jsonb(inversion), 'corte', '2026-09-30',
    'metodo', 'Interés simple ACT/365 redondeado al peso',
    'pagos', 0, 'capitalizaciones', 0, 'impuestos', 0, 'cargos', 0,
    'confirmacion', 'Sin retiros, pagos, capitalizaciones, impuestos ni cargos: confirmado por titular'
  )::text;
  insert into public.aperturas_clientes (
    cliente_id, fuente_referencia, fuente_sha256, saldo_reportado_original,
    capital_vigente, intereses_pendientes, ajuste_neto_historico,
    saldo_neto_apertura, intereses_ganados_totales, estado_intereses,
    notas_conciliacion, responsable_revision
  ) values (
    titular, 'Declaración manual del titular y cálculo de aporte inicial ACT/365',
    encode(sha256(convert_to(evidencia, 'UTF8')), 'hex'), cierre.total,
    inversion.capital, cierre.interes_pendiente, 0,
    cierre.total, cierre.interes_acumulado, 'conciliado',
    evidencia, 'Confirmación del titular mediante ejecución administrativa'
  ) returning id into apertura;
  insert into public.lotes_apertura (
    apertura_id, cliente_id, referencia_origen, fecha_inicio_original,
    orden_fifo, capital_original, capital_vigente, tasa_anual
  ) values (
    apertura, titular, inversion.referencia, inversion.fecha_inicio,
    1, inversion.capital, inversion.capital, inversion.tasa_anual
  );
  insert into public.desgloses_apertura (
    apertura_id, intereses_capitalizados, intereses_pagados, impuestos, cargos, intereses_netos
  ) values (apertura, 0, 0, 0, 0, cierre.interes_acumulado);
  update public.aperturas_clientes set confirmada = true where id = apertura;
end $$;
commit;
