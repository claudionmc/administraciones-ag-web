import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientDashboard, type Opening, type OpeningLot, type InterestBreakdown } from "@/components/client-dashboard";
import { clientAccessEnabled, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Área de clientes", robots: { index: false, follow: false } };

export default async function ClientsPage() {
  if (!clientAccessEnabled()) redirect("/acceso-clientes");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/acceso-clientes");
  const { data: client, error: profileError } = await supabase.from("clientes")
    .select("id").eq("id", user.id).eq("activo", true).maybeSingle();
  if (profileError || !client) redirect("/acceso-clientes");
  const [identity, balance] = await Promise.all([
    supabase.from("clientes").select("nombres, apellidos, rut").eq("id", user.id).eq("activo", true).maybeSingle(),
    supabase.from("aperturas_clientes")
      .select("id, fecha_corte, capital_vigente, intereses_pendientes, intereses_ganados_totales, saldo_neto_apertura")
      .eq("cliente_id", user.id).eq("confirmada", true).maybeSingle(),
  ]);
  const opening = balance.error ? null : balance.data as Opening | null;
  const [detail, breakdown] = opening ? await Promise.all([supabase.from("lotes_apertura")
    .select("id, orden_fifo, fecha_inicio_original, capital_vigente, tasa_anual")
    .eq("cliente_id", user.id).eq("apertura_id", opening.id)
    .order("fecha_inicio_original").order("orden_fifo"),
    supabase.from("desgloses_apertura")
      .select("intereses_capitalizados, intereses_pagados, impuestos, cargos, intereses_netos")
      .eq("apertura_id", opening.id).maybeSingle(),
  ]) : [null, null];
  return <ClientDashboard profile={identity.error ? null : identity.data}
    opening={opening} lots={detail?.error ? [] : (detail?.data ?? []) as OpeningLot[]}
    breakdown={breakdown?.error ? null : (breakdown?.data ?? null) as InterestBreakdown | null}
    breakdownUnavailable={Boolean(breakdown?.error)}
    unavailable={Boolean(balance.error)} lotsUnavailable={Boolean(detail?.error)} />;
}
