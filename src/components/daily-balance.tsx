import { Container } from "@/components/ui/container";
import { DailyRefresh } from "@/components/daily-refresh";

export type DailyBalanceData = {
  fecha: string;
  capital: string;
  intereses_nuevos: string;
  intereses_totales: string;
  saldo_estimado: string;
  desde_apertura: boolean;
  lotes: {
    id: string; origen: string; fecha_origen: string; fecha_inicio: string;
    capital: string; tasa_anual: string; dias: number; interes: string;
  }[];
};

const money = (value: string) => new Intl.NumberFormat("es-CL", {
  style: "currency", currency: "CLP", maximumFractionDigits: 2,
}).format(Number(value));
const date = (value: string) => new Intl.DateTimeFormat("es-CL", {
  timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric",
}).format(new Date(`${value}T00:00:00Z`));

export function DailyBalance({ balance }: { balance: DailyBalanceData | null }) {
  return <section className="bg-surface-muted py-10 sm:py-14" aria-labelledby="daily-title">
    <Container>
      <h2 id="daily-title" className="text-2xl font-medium text-primary">Resumen diario</h2>
      {!balance ? <p role="status" className="mt-6 border border-border bg-white p-6 text-text-muted">
        El resumen diario no está disponible. Sus registros históricos se conservan. Intente nuevamente más tarde.
      </p> : <>
        <DailyRefresh date={balance.fecha} />
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Cálculo al <time dateTime={balance.fecha}>{date(balance.fecha)}</time>, según la fecha de Chile. Importes en CLP.
        </p>
        {!balance.lotes.length ? <p role="status" className="mt-6 border border-border bg-white p-6 text-text-muted">
          Aún no hay capital con fecha de inicio igual o anterior a hoy.
        </p> : <>
          <dl className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Capital registrado", balance.capital],
              ["Intereses ganados acumulados", balance.intereses_totales],
              ["Saldo estimado al día", balance.saldo_estimado],
            ].map(([label, value]) => <div key={label} className="min-w-0 border border-border bg-white p-6 sm:p-8">
              <dt className="text-sm text-text-muted">{label}</dt>
              <dd className="mt-4 break-words text-2xl font-medium tabular-nums text-primary">{money(value)}</dd>
            </div>)}
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-text-muted">
            Interés simple ACT/365, sin capitalización automática. Se cuentan los días completos transcurridos desde el inicio de intereses hasta la fecha indicada; en la fecha de inicio corresponden cero días. Se redondea al peso por aporte sobre el acumulado, sin sumar redondeos diarios.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {balance.desde_apertura
              ? `El cálculo conserva el saldo histórico confirmado y añade los aportes posteriores y sus intereses. Intereses nuevos desde la apertura: ${money(balance.intereses_nuevos)}.`
              : "El cálculo utiliza los aportes registrados y sus tasas anuales."}
            {" "}El saldo estimado no acredita un monto disponible para retiro. No incorpora pagos, retiros, impuestos, cargos ni cambios de tasa posteriores que no estén registrados y conciliados.
          </p>
          <div className="mt-8 overflow-x-auto border border-border bg-white p-1" tabIndex={0} role="region" aria-label="Aportes e intereses: tabla desplazable">
            <table className="w-full min-w-[700px] text-left text-sm">
              <caption className="p-5 text-left font-medium text-primary">Detalle del cálculo diario</caption>
              <thead className="bg-surface-muted text-primary"><tr>
                {["Origen", "Inicio de intereses", "Tasa anual", "Capital", "Días", "Intereses nuevos"].map(label => <th key={label} scope="col" className="px-5 py-4 font-medium">{label}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">{balance.lotes.map(lot => <tr key={`${lot.origen}-${lot.id}`}>
                <th scope="row" className="px-5 py-4 font-medium">{lot.origen === "apertura" ? "Lote histórico" : "Aporte"}</th>
                <td className="px-5 py-4"><time dateTime={lot.fecha_inicio}>{date(lot.fecha_inicio)}</time></td>
                <td className="px-5 py-4 tabular-nums">{new Intl.NumberFormat("es-CL", { style: "percent", maximumFractionDigits: 4 }).format(Number(lot.tasa_anual))}</td>
                <td className="px-5 py-4 tabular-nums">{money(lot.capital)}</td>
                <td className="px-5 py-4 tabular-nums">{lot.dias}</td>
                <td className="px-5 py-4 tabular-nums">{money(lot.interes)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </>}
      </>}
    </Container>
  </section>;
}
