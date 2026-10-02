/** Refuse a base amount finer than the configured decimal cap. Not a halt. */

/**
 * Decimal places in a positive finite amount. Scientific notation is expanded.
 * Trailing zeros do not count. Returns null when the amount is not usable.
 */
export function amountDecimalPlaces(amount: number): number | null {
  if (!(amount > 0) || !Number.isFinite(amount)) return null;
  const text = amount.toString().toLowerCase();
  if (text.includes("e")) {
    const [mantissa, expRaw] = text.split("e");
    const exp = Number(expRaw);
    if (!Number.isFinite(exp)) return null;
    const frac = (mantissa.split(".")[1] ?? "").replace(/0+$/, "").length;
    return Math.max(0, frac - exp);
  }
  return (text.split(".")[1] ?? "").replace(/0+$/, "").length;
}

/**
 * A size with more than `maxDecimals` places is refused so the adapter never
 * sees a float KuCoin would reject. Whole numbers and sizes on the cap pass.
 */
export function excessAmountDecimalsReason(amount: number, maxDecimals: number): string | null {
  if (!(maxDecimals >= 0) || !Number.isInteger(maxDecimals)) return null;
  const places = amountDecimalPlaces(amount);
  if (places == null || places <= maxDecimals) return null;
  return `Amount precision: more than ${maxDecimals} decimal places`;
}
