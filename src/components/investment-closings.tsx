import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";

const money = (value: number | string) => new Intl.NumberFormat("es-CL", {
  style: "currency", currency: "CLP", maximumFractionDigits: 0,
}).format(Number(value));

export async function InvestmentClosings({ userId }: { userId: string }) {
  const supabase = await createClient();
  const latest = await supabase.from("valorizaciones_inversiones")
    .select("fecha_corte").eq("cliente_id", userId)
    .order("fecha_corte", { ascending: false }).limit(1).maybeSingle();
  const cutoff = latest.data?.fecha_corte as string | undefined;
  const rows = cutoff ? await supabase.from("valorizaciones_inversiones")
    .select("id, inversion_id, capital, tasa_anual, dias, interes_acumulado, interes_capitalizado, interes_pendiente, total")
    .eq("cliente_id", userId).eq("fecha_corte", cutoff).order("inversion_id") : null;
  const unavailable = Boolean(latest.error || rows?.error);
  if (!unavailable && !rows?.data?.length) return null;
  // Separate query keeps the original closing visible before the optional migration.
  const history = rows?.data?.length ? await supabase.from("valorizaciones_inversiones")
    .select("id, intereses_pagados_al_reinicio, intereses_ganados_historicos")
    .eq("cliente_id", userId).eq("fecha_corte", cutoff!) : null;
  const date = cutoff ? new Intl.DateTimeFormat("es-CL", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${cutoff}T00:00:00Z`)) : null;

  return <section className="bg-surface-muted py-10 sm:py-14" aria-labelledby="closings-title">
    <Container>
      <h2 id="closings-title" className="text-2xl font-medium text-primary">Cierre de inversiones registrado</h2>
      {unavailable ? <p role="status" className="mt-6 text-text-muted">No fue posible consultar sus cierres. Intente nuevamente más tarde.</p> : <>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Corte al <time dateTime={cutoff}>{date}</time>. Importes en pesos chilenos (CLP).
          Cada fila corresponde a una inversión valorizada en esa fecha; no constituye un saldo consolidado de toda su cuenta.
        </p>
        {history?.error && <p role="status" className="mt-5 text-sm text-text-muted">El historial de intereses pagados no está disponible. El cierre del período se muestra a continuación.</p>}
        {rows?.data?.map((row, index) => {
          const historical = history?.data?.find(item => item.id === row.id);
          if (historical?.intereses_pagados_al_reinicio == null || historical.intereses_ganados_historicos == null) return null;
          return <section key={row.id} className="mt-6 border border-border bg-white p-6 sm:p-8" aria-labelledby={`interest-history-${index}`}>
            <h3 id={`interest-history-${index}`} className="text-xl font-medium text-primary">Historial de intereses · Inversión {index + 1}</h3>
            <dl className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total ganados", historical.intereses_ganados_historicos],
                ["Pagados", historical.intereses_pagados_al_reinicio],
                ["Neto", row.interes_pendiente],
                ["Capital más intereses netos", row.total],
              ].map(([label, value]) => <div key={label}>
                <dt className="text-sm text-text-muted">{label}</dt>
                <dd className="mt-3 text-2xl font-medium tabular-nums text-primary">{money(value)}</dd>
              </div>)}
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-text-muted">El total ganado incluye los intereses anteriores pagados al reinicio y los acumulados en el período actual. Los pagos anteriores ya fueron liquidados y no se descuentan nuevamente del capital ni del saldo al corte. El neto corresponde a los intereses del período actual, descontadas sus capitalizaciones registradas; no incorpora impuestos ni cargos que no estén registrados.</p>
          </section>;
        })}
        <div className="mt-6 overflow-x-auto border border-border bg-white p-1" tabIndex={0} role="region" aria-label="Cierre de inversiones: tabla desplazable">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <caption className="sr-only">Inversiones valorizadas al {date}</caption>
            <thead className="bg-surface-muted text-primary"><tr>
              {["Inversión", "Capital", "Tasa anual", "Días", "Intereses acumulados", "Intereses capitalizados", "Neto", "Capital más intereses netos"].map(label =>
                <th key={label} scope="col" className="px-5 py-4 font-medium">{label}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">{rows?.data?.map((row, index) => <tr key={row.id}>
              <th scope="row" className="px-5 py-5 font-medium text-primary">Inversión {index + 1}</th>
              <td className="px-5 py-5 tabular-nums">{money(row.capital)}</td>
              <td className="px-5 py-5 tabular-nums">{new Intl.NumberFormat("es-CL", { style: "percent", maximumFractionDigits: 4 }).format(Number(row.tasa_anual))}</td>
              <td className="px-5 py-5 tabular-nums">{row.dias}</td>
              <td className="px-5 py-5 tabular-nums">{money(row.interes_acumulado)}</td>
              <td className="px-5 py-5 tabular-nums">{money(row.interes_capitalizado)}</td>
              <td className="px-5 py-5 tabular-nums">{money(row.interes_pendiente)}</td>
              <td className="px-5 py-5 font-medium tabular-nums text-primary">{money(row.total)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-text-muted">
          El cierre conserva los cálculos registrados de interés simple ACT/365. No es el saldo de hoy ni acredita disponibilidad de retiro.
          Los intereses acumulados de la tabla corresponden al período actual. El historial anterior, cuando está registrado, se presenta por separado.
        </p>
      </>}
    </Container>
  </section>;
}
