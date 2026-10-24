import { test } from "node:test";
import assert from "node:assert/strict";
import { hasInterestPayments, netOfTaxAndCapitalization } from "../src/lib/interest-summary.ts";

test("net excludes tax and capitalization, without deducting payments or charges", () => {
  assert.equal(netOfTaxAndCapitalization("1000.30", "20.10", "100.05"), "880.15");
  assert.equal(netOfTaxAndCapitalization("0.3", "0.1", "0.2"), "0.0");
  assert.equal(netOfTaxAndCapitalization(1000, 0, 0), "1000");
  assert.equal(netOfTaxAndCapitalization("9007199254740993.01", "0.01", 1), "9007199254740992.00");
  assert.equal(netOfTaxAndCapitalization(1e-7, 0, 0), "0.0000001");
});

test("missing data never implies zero or a reconciled net", () => {
  assert.equal(netOfTaxAndCapitalization(1000, null, 0), null);
  assert.equal(netOfTaxAndCapitalization(null, 0, 0), null);
  assert.equal(netOfTaxAndCapitalization(1000, 0, null), null);
});

test("payment rows appear only for strictly positive recorded interest payments", () => {
  for (const value of [null, 0, "0", "0.00", -1, "NaN", Infinity]) assert.equal(hasInterestPayments(value), false);
  for (const value of [1, "0.01", 100]) assert.equal(hasInterestPayments(value), true);
});
