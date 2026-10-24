import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { signOut } from "@/app/acceso-clientes/actions";
import { hasInterestPayments, netOfTaxAndCapitalization } from "@/lib/interest-summary";

type Amount = number | string | null;
export type Opening = {
  id: string;
  fecha_corte: string;
  capital_vigente: Amount;
  intereses_pendientes: Amount;
  intereses_ganados_totales: Amount;
  saldo_neto_apertura: Amount;
};
export type OpeningLot = {
  id: string;
  orden_fifo: number;
  fecha_inicio_original: string;
  capital_vigente: Amount;
  tasa_anual: number | string;
};
export type InterestBreakdown = {
  intereses_capitalizados: Amount;
  intereses_pagados: Amount;
  impuestos: Amount;
  cargos: Amount;
  intereses_netos: Amount;
};
type Profile = { nombres: string | null; apellidos: string | null; rut: string | null };
const money = (value: Amount) => value === null ? "Información pendiente" :
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 2 }).format(Number(value));
const date = (value: string) => new Intl.DateTimeFormat("es-CL", {
  day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
}).format(new Date(`${value}T00:00:00Z`));

function Metric({ label, value, description }: { label: string; value: Amount; description: string }) {
  return <div className="min-w-0 border border-border bg-white p-6 sm:p-8">
    <dt className="text-sm text-text-muted">{label}</dt>
    <dd className={`mt-4 break-words font-medium tabular-nums text-primary ${value === null ? "text-lg" : "text-2xl sm:text-3xl"}`}>{money(value)}</dd>
    <p className="mt-3 text-sm leading-relaxed text-text-muted">{description}</p>
  </div>;
}

export function ClientDashboard({ profile, opening, lots, breakdown, unavailable, lotsUnavailable, breakdownUnavailable }: {
  profile: Profile | null; opening: Opening | null; lots: OpeningLot[];
  breakdown: InterestBreakdown | null;
  unavailable: boolean; lotsUnavailable: boolean; breakdownUnavailable: boolean;
}) {
  const name = [profile?.nombres, profile?.apellidos].filter(Boolean).join(" ");
  const net = netOfTaxAndCapitalization(opening?.intereses_ganados_totales ?? null,
    breakdown?.impuestos ?? null, breakdown?.intereses_capitalizados ?? null);
  const showPayments = hasInterestPayments(breakdown?.intereses_pagados ?? null);
  const interestRows: [string, Amount][] = [
    ["Capitalizados", breakdown?.intereses_capitalizados ?? null],
    ["Impuestos", breakdown?.impuestos ?? null],
    ["Netos de impuestos y capitalización", net],
    ...(showPayments ? [
      ["Pagados", breakdown?.intereses_pagados ?? null],
      ["Pendientes de pago", opening?.intereses_pendientes ?? null],
    ] as [string, Amount][] : []),
  ];
  return <>
    <section className="bg-primary py-12 text-white sm:py-16" aria-labelledby="dashboard-title">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow text-on-dark">Portal privado · Resumen patrimonial</p>
            <h1 id="dashboard-title" className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">{name || "Su área de clientes"}</h1>
            <p className="mt-4 text-sm text-on-dark">RUT: {profile?.rut || "Información pendiente"}</p>
          </div>
          <form action={signOut}><Button variant="light" type="submit">Cerrar sesión</Button></form>
        </div>
        <div className="mt-8 border-t border-white/20 pt-6 text-sm leading-relaxed text-on-dark">
          {opening ? <>Información histórica confirmada al <time dateTime={opening.fecha_corte}>{date(opening.fecha_corte)}</time>. Importes en pesos chilenos (CLP).</> : "Consulte aquí sus saldos y el detalle de su capital registrado."}
        </div>
      </Container>
    </section>
    <section className="bg-surface-muted py-10 sm:py-14" aria-labelledby="summary-title">
      <Container>
        <h2 id="summary-title" className="text-2xl font-medium text-primary">Resumen de su patrimonio</h2>
        {!opening && <p role="status" className="mt-6 border border-border bg-white p-6 leading-relaxed text-text-muted">
          {unavailable ? "No fue posible consultar sus saldos. Intente nuevamente más tarde." : "Aún no hay un saldo confirmado disponible para su cuenta. Sus cifras se mostrarán una vez finalizada la revisión."}
        </p>}
        <dl className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Capital vigente" value={opening?.capital_vigente ?? null} description="Capital registrado al corte. Puede incluir intereses previamente capitalizados." />
          <Metric label="Intereses ganados acumulados" value={opening?.intereses_ganados_totales ?? null} description="Total histórico de intereses ganados al corte confirmado." />
          <Metric label="Saldo neto al corte" value={opening?.saldo_neto_apertura ?? null} description="Saldo confirmado, incluidos los ajustes históricos conciliados." />
        </dl>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="border border-border bg-white p-6 sm:p-8" aria-labelledby="interest-title">
            <h2 id="interest-title" className="text-xl font-medium text-primary">Desglose de intereses</h2>
            {breakdownUnavailable && <p role="status" className="mt-4 text-sm text-text-muted">No fue posible consultar el desglose. Intente nuevamente más tarde.</p>}
            <dl className="mt-6 divide-y divide-border">
              <div className="flex flex-wrap justify-between gap-3 py-4 text-sm font-medium text-primary">
                <dt>Total Ganados</dt><dd className="tabular-nums">{money(opening?.intereses_ganados_totales ?? null)}</dd>
              </div>
              {interestRows.map(([label, value]) => <div key={label} className="ml-[4ch] flex flex-wrap justify-between gap-3 py-4 text-sm">
                <dt className="text-text-muted">{label}</dt><dd className="font-medium tabular-nums text-primary">{money(value)}</dd>
              </div>)}
            </dl>
          </section>
          <aside className="border border-border bg-white p-6 sm:p-8" aria-labelledby="report-title">
            <p className="eyebrow text-primary-action">Acerca de su reporte</p>
            <h2 id="report-title" className="mt-4 text-xl font-medium text-primary">Una fecha, una visión clara</h2>
            <p className="mt-5 text-sm leading-relaxed text-text-muted">Este resumen corresponde al último corte histórico confirmado disponible. No representa un saldo actualizado a hoy ni incorpora movimientos posteriores al corte.</p>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">Los campos sin antecedentes verificados indican “Información pendiente”. Un importe de cero se muestra únicamente cuando está registrado.</p>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">Los netos de impuestos y capitalización corresponden al total ganado menos ambos conceptos, antes de descontar pagos. Los capitalizados ya forman parte del capital vigente.</p>
          </aside>
        </div>
        <section className="mt-10 border border-border bg-white" aria-labelledby="detail-title">
          <div className="p-6 sm:p-8"><h2 id="detail-title" className="text-xl font-medium text-primary">Detalle del capital al corte</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">Lotes que componen su apertura histórica, ordenados por fecha original. Esa fecha no implica un nuevo cálculo de intereses anteriores al corte.</p>
          </div>
          {lots.length ? <div className="overflow-x-auto p-1" tabIndex={0} role="region" aria-label="Detalle del capital: tabla desplazable">
            <table className="w-full min-w-[580px] text-left text-sm">
              <caption className="sr-only">Capital registrado al {opening && date(opening.fecha_corte)}, en CLP</caption>
              <thead className="bg-surface-muted text-primary"><tr>
                {['Lote', 'Fecha de origen', 'Tasa anual', 'Capital vigente'].map(label => <th key={label} scope="col" className="px-6 py-4 font-medium">{label}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">{lots.map(lot => <tr key={lot.id}>
                <th scope="row" className="px-6 py-5 font-medium text-primary">Lote {lot.orden_fifo}</th>
                <td className="px-6 py-5"><time dateTime={lot.fecha_inicio_original}>{date(lot.fecha_inicio_original)}</time></td>
                <td className="px-6 py-5 tabular-nums">{new Intl.NumberFormat("es-CL", { style: "percent", maximumFractionDigits: 4 }).format(Number(lot.tasa_anual))}</td>
                <td className="px-6 py-5 font-medium tabular-nums text-primary">{money(lot.capital_vigente)}</td>
              </tr>)}</tbody>
            </table>
          </div> : <p role="status" className="px-6 pb-8 text-sm text-text-muted sm:px-8">{lotsUnavailable ? "No fue posible consultar el detalle. Intente nuevamente más tarde." : "El detalle estará disponible cuando exista una apertura confirmada."}</p>}
        </section>
      </Container>
    </section>
  </>;
}
