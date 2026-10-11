export type Observation = { date: string; value: number };
export const INDICATORS = [
  { id: "uf", name: "UF", unit: "CLP/UF", series: "F073.UFF.PRE.Z.D" },
  { id: "tpm", name: "TPM", unit: "%", series: "F022.TPM.TIN.D001.NO.Z.D" },
  { id: "dollar", name: "Dólar observado", unit: "CLP/USD", series: "F073.TCO.PRE.Z.D" },
  { id: "ipsa", name: "IPSA", unit: "puntos", series: null },
  { id: "copper", name: "Cobre", unit: "USD/libra", series: "F019.PPB.PRE.100.D" },
  { id: "brent", name: "Petróleo Brent", unit: "USD/barril", series: null },
] as const;
export type Indicator = (typeof INDICATORS)[number] & { observation: Observation | null; pending?: boolean };

export function chileToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function validDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}

export function numeric(value: unknown): number | null {
  if (typeof value !== "number" && (typeof value !== "string" || !/^-?\d+(\.\d+)?$/.test(value))) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function parseBde(payload: unknown, series: string): Observation[] {
  if (!payload || typeof payload !== "object") return [];
  const data = payload as { Codigo?: number; Series?: { seriesId?: string; Obs?: unknown[] } };
  if (data.Codigo !== 0 || data.Series?.seriesId !== series || !Array.isArray(data.Series.Obs)) return [];
  return data.Series.Obs.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { indexDateString?: string; value?: unknown; statusCode?: string };
    const match = typeof row.indexDateString === "string" && row.indexDateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match || row.statusCode !== "OK") return [];
    const date = `${match[3]}-${match[2]}-${match[1]}`;
    const value = numeric(row.value);
    return validDate(date) && value !== null ? [{ date, value }] : [];
  });
}

export function selectObservation(rows: Observation[], today: string, exact = false): Observation | null {
  return rows.filter((row) => validDate(row.date) && Number.isFinite(row.value) && (exact ? row.date === today : row.date <= today)).sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

export function formatValue(value: number): string {
  return new Intl.NumberFormat("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatDate(date: string): string {
  const parts = new Intl.DateTimeFormat("es-CL", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).formatToParts(new Date(`${date}T12:00:00Z`));
  const part = (type: string) => parts.find((item) => item.type === type)?.value.replace(/\.$/, "");
  return `${part("day")} ${part("month")} ${part("year")}`;
}

export function parseBrent(payload: unknown): Observation[] {
  if (!payload || typeof payload !== "object") return [];
  const rows = (payload as { response?: { data?: unknown[] } }).response?.data;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { series?: string; units?: string; period?: string; value?: unknown };
    const value = numeric(row.value);
    return row.series === "RBRTE" && (row.units === "$/BBL" || row.units === "Dollars per Barrel") && typeof row.period === "string" && validDate(row.period) && value !== null ? [{ date: row.period, value }] : [];
  });
}
