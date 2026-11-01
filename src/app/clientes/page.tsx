import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientDashboard, type Opening, type OpeningLot, type InterestBreakdown } from "@/components/client-dashboard";
import { clientAccessEnabled, createClient } from "@/lib/supabase/server";
import { DailyBalance, type DailyBalanceData } from "@/components/daily-balance";
import { InvestmentClosings } from "@/components/investment-closings";

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
  const [identity, balance, daily] = await Promise.all([
    supabase.from("clientes").select("nombres, apellidos, rut").eq("id", user.id).eq("activo", true).maybeSingle(),
    supabase.from("aperturas_clientes")
      .select("id, fecha_corte, capital_vigente, intereses_pendientes, intereses_ganados_totales, saldo_neto_apertura")
      .eq("cliente_id", user.id).eq("confirmada", true).maybeSingle(),
    supabase.rpc("resumen_diario_detallado_cliente").then(result =>
      result.error?.code === "PGRST202" ? supabase.rpc("resumen_diario_cliente") : result),
  ]);
  const opening = balance.error ? null : balance.data as Opening | null;
  const [detail, breakdown, documentary, documentaryLots] = opening ? await Promise.all([supabase.from("lotes_apertura")
    .select("id, orden_fifo, fecha_inicio_original, capital_vigente, tasa_anual")
    .eq("cliente_id", user.id).eq("apertura_id", opening.id)
    .order("fecha_inicio_original").order("orden_fifo"),
    supabase.from("desgloses_apertura")
      .select("intereses_capitalizados, intereses_pagados, impuestos, cargos, intereses_netos")
      .eq("apertura_id", opening.id).maybeSingle(),
    supabase.from("aperturas_clientes").select("intereses_capitalizados_reportados")
      .eq("cliente_id", user.id).eq("id", opening.id).eq("confirmada", true).maybeSingle(),
    supabase.from("lotes_apertura").select("id, intereses_reportados, total_reportado")
      .eq("cliente_id", user.id).eq("apertura_id", opening.id),
  ]) : [null, null, null, null];
  const lots = (detail?.error ? [] : (detail?.data ?? [])) as OpeningLot[];
  const displayedLots = lots.map(lot => ({ ...lot,
    ...(!documentaryLots?.error ? documentaryLots?.data?.find(item => item.id === lot.id) : undefined),
  }));
  return <ClientDashboard profile={identity.error ? null : identity.data}
    closings={!balance.error && !opening ? <InvestmentClosings userId={user.id} /> : null}
    daily={<DailyBalance balance={daily.error ? null : daily.data as DailyBalanceData | null} />}
    opening={opening ? { ...opening, intereses_capitalizados_reportados:
      documentary?.error ? null : documentary?.data?.intereses_capitalizados_reportados ?? null } : null}
    lots={displayedLots}
    breakdown={breakdown?.error ? null : (breakdown?.data ?? null) as InterestBreakdown | null}
    breakdownUnavailable={Boolean(breakdown?.error)}
    unavailable={Boolean(balance.error)} lotsUnavailable={Boolean(detail?.error)} />;
}
