import { connection } from "next/server";
import { Container } from "@/components/ui/container";
import { INDICATORS, formatDate, formatValue, type Indicator } from "@/lib/economic-indicators";
import { getEconomicIndicators } from "@/lib/economic-indicators.server";

function IndicatorStrip({ indicators, loading = false }: { indicators: Indicator[]; loading?: boolean }) {
  return <section aria-labelledby="indicators-title" aria-busy={loading} className="border-b border-border bg-surface-muted py-10 sm:py-12">
    <Container>
      <h2 id="indicators-title" className="text-sm font-medium tracking-widest text-primary">INDICADORES ECONÓMICOS</h2>
      <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-3 xl:grid-cols-5">
        {indicators.filter((indicator) => indicator.id !== "ipsa").map((indicator) => <div key={indicator.id} className="min-w-0 border-t border-border pt-4">
          <dt className="min-h-10 text-sm font-medium text-primary">{indicator.name}</dt>
          <dd className="mt-2">
            <span className={`${indicator.observation ? "text-2xl" : "text-sm leading-6"} block font-medium tabular-nums tracking-tight text-primary`}>{indicator.observation ? formatValue(indicator.observation.value) : loading ? "Consultando…" : indicator.pending ? "Próximamente" : "Dato temporalmente no disponible"}</span>
            <span className="mt-1 block text-xs text-text-muted">{indicator.unit}</span>
            {indicator.observation && <span className="mt-3 block text-xs leading-5 text-text-muted">{indicator.id === "uf" ? "Valor del " : "Último dato: "}<time className="inline-block whitespace-nowrap" dateTime={indicator.observation.date}>{formatDate(indicator.observation.date)}</time></span>}
          </dd>
        </div>)}
      </dl>
      <p className="mt-7 text-xs leading-5 text-text-muted">Fuentes: <a href="https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/documentacion.html" className="underline underline-offset-4">Banco Central de Chile</a> (UF, TPM, dólar y cobre BML). <a href="https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm" className="underline underline-offset-4">U.S. Energy Information Administration</a> (Brent). Cada dato conserva su fecha de referencia.</p>
    </Container>
  </section>;
}

export function EconomicIndicatorsFallback() {
  return <IndicatorStrip indicators={INDICATORS.map((indicator) => ({ ...indicator, observation: null }))} loading />;
}

export async function EconomicIndicators() {
  // Resolve Chile's date on every request, including requests across midnight.
  // Provider responses are cached independently for 60 minutes.
  await connection();
  return <IndicatorStrip indicators={await getEconomicIndicators()} />;
}
