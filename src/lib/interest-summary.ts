type Amount = number | string | null;

// Subtract only the named deductions, using decimal integers rather than
// floating-point arithmetic. Unknown inputs remain unknown.
export function netOfTaxAndCapitalization(total: Amount, tax: Amount, capitalized: Amount): string | null {
  const parts = [total, tax, capitalized].map(value => {
    if (value === null) return null;
    const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(value));
    if (!match) return null;
    const fraction = match[2] ?? "";
    const scale = fraction.length - Number(match[3] ?? 0);
    if (Math.abs(scale) > 1000) return null;
    const units = BigInt(match[1] + fraction);
    return { units: scale < 0 ? units * BigInt(10) ** BigInt(-scale) : units, scale: Math.max(scale, 0) };
  });
  if (parts.some(part => part === null)) return null;
  const decimals = parts.filter(part => part !== null);
  const scale = Math.max(...decimals.map(part => part.scale));
  const values = decimals.map(part => part.units * BigInt(10) ** BigInt(scale - part.scale));
  const net = values[0] - values[1] - values[2];
  const sign = net < BigInt(0) ? "-" : "";
  const digits = (net < BigInt(0) ? -net : net).toString().padStart(scale + 1, "0");
  return sign + (scale ? `${digits.slice(0, -scale)}.${digits.slice(-scale)}` : digits);
}

export function hasInterestPayments(paid: Amount): boolean {
  return paid !== null && Number.isFinite(Number(paid)) && Number(paid) > 0;
}
