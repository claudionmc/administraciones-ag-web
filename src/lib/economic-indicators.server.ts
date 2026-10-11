import "server-only";
import { get } from "node:https";
import { unstable_cache } from "next/cache";
import { INDICATORS, chileToday, parseBrent, parseBde, selectObservation, type Indicator, type Observation } from "./economic-indicators";

export const INDICATORS_REVALIDATE = 3600;

async function request(url: URL): Promise<unknown> {
  // Avoid Next's patched fetch: its cache-error logs and tracing can contain URLs.
  // Native HTTPS errors are consumed here and never serialized or logged.
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: unknown) => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } };
    const timer = setTimeout(() => { finish(null); req.destroy(); }, 6000);
    const req = get(url, (response) => {
      if (response.statusCode !== 200) { response.resume(); finish(null); return; }
      const chunks: Buffer[] = [];
      let bytes = 0;
      response.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > 2_000_000) { finish(null); response.destroy(); req.destroy(); }
        else chunks.push(chunk);
      });
      response.on("error", () => finish(null));
      response.on("end", () => {
        try { finish(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
        catch { finish(null); }
      });
    });
    req.on("error", () => finish(null));
  });
}

async function bde(series: string, today: string, exact: boolean): Promise<Observation | null> {
  const token = process.env.BCCH_API_TOKEN;
  if (!token) return null;
  const start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 365);
  const url = new URL("https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx");
  url.search = new URLSearchParams({ token, function: "GetSeries", timeseries: series, firstdate: exact ? today : start.toISOString().slice(0, 10), lastdate: today }).toString();
  return selectObservation(parseBde(await request(url), series), today, exact);
}

async function brent(today: string): Promise<Observation | null> {
  const key = process.env.EIA_API_KEY;
  if (!key) return null;
  const url = new URL("https://api.eia.gov/v2/petroleum/pri/spt/data/");
  url.search = new URLSearchParams({ api_key: key, frequency: "daily", "data[0]": "value", "facets[series][]": "RBRTE", "sort[0][column]": "period", "sort[0][direction]": "desc", offset: "0", length: "30", end: today }).toString();
  const payload = await request(url);
  // One bounded retry handles transient EIA connection failures.
  return selectObservation(parseBrent(payload ?? await request(url)), today);
}

// Cache only public arguments and parsed observations, never authenticated URLs.
const cachedBde = unstable_cache(bde, ["economic-bde-v2"], { revalidate: INDICATORS_REVALIDATE });
const cachedBrent = unstable_cache(brent, ["economic-brent-v4"], { revalidate: INDICATORS_REVALIDATE });

export async function getEconomicIndicators(): Promise<Indicator[]> {
  const today = chileToday();
  return Promise.all(INDICATORS.map(async (indicator) => ({
    ...indicator,
    pending: indicator.id === "ipsa" || (indicator.id === "brent" && !process.env.EIA_API_KEY),
    observation: indicator.series ? await cachedBde(indicator.series, today, indicator.id === "uf") : indicator.id === "brent" ? await cachedBrent(today) : null,
    // IPSA stays unavailable until a documented closing-price API and public display rights are verified.
  })));
}
