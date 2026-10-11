import { test } from "node:test";
import assert from "node:assert/strict";
import { chileToday, numeric, parseBde, parseBrent, selectObservation, formatDate, formatValue, validDate } from "../src/lib/economic-indicators.ts";

test("Chile's date is independent of the UTC day", () => {
  assert.equal(chileToday(new Date("2026-10-10T01:00:00Z")), "2026-10-09");
  assert.equal(chileToday(new Date("2026-10-10T04:00:00Z")), "2026-10-10");
});
test("compact dates retain the actual observation day", () => {
  assert.equal(formatDate("2026-10-10"), "10 oct 2026");
  assert.equal(formatDate("2026-10-09"), "9 oct 2026");
});
test("Brent accepts only EIA RBRTE spot in dollars per barrel", () => {
  const row = { series: "RBRTE", units: "Dollars per Barrel", period: "2026-10-06", value: "125.44" };
  const payload = { response: { data: [row, { ...row, period: "2026-10-09", value: "." }, { ...row, series: "RWTC" }, { ...row, units: "Cents per Gallon" }, { ...row, period: "2026-02-30" }] } };
  assert.deepEqual(parseBrent(payload), [{ date: "2026-10-06", value: 125.44 }]);
  assert.deepEqual(parseBrent({ response: { data: [{ ...row, units: "$/BBL" }] } }), [{ date: "2026-10-06", value: 125.44 }]);
  assert.deepEqual(selectObservation(parseBrent(payload), "2026-10-10"), { date: "2026-10-06", value: 125.44 });
  assert.deepEqual(parseBrent({ response: { data: null } }), []);
  assert.deepEqual(parseBrent(null), []);
});
test("UF requires today; other series skip weekends and future observations", () => {
  const rows = [{ date: "2026-10-09", value: 1 }, { date: "2026-10-12", value: 2 }];
  assert.equal(selectObservation(rows, "2026-10-10", true), null);
  assert.deepEqual(selectObservation(rows, "2026-10-10"), rows[0]);
});
test("invalid provider values are never treated as quotes", () => {
  for (const value of [null, undefined, "", "NaN", "ND", Infinity, true, "1,200", " "]) assert.equal(numeric(value), null);
  assert.equal(numeric("4.5"), 4.5);
  assert.equal(validDate("2026-02-30"), false);
});
test("BDE validates series, status, numbers and observation dates", () => {
  const payload = { Codigo: 0, Series: { seriesId: "test", Obs: [
    { indexDateString: "09-10-2026", value: "4.5", statusCode: "OK" },
    { indexDateString: "10-10-2026", value: "NaN", statusCode: "ND" },
    { indexDateString: "30-02-2026", value: "1", statusCode: "OK" },
  ] } };
  assert.deepEqual(parseBde(payload, "test"), [{ date: "2026-10-09", value: 4.5 }]);
  assert.deepEqual(parseBde(payload, "different"), []);
  assert.deepEqual(parseBde(null, "test"), []);
  assert.deepEqual(parseBde({ ...payload, Codigo: -1 }, "test"), []);
  assert.equal(formatValue(41000.25), "41.000,25");
});
