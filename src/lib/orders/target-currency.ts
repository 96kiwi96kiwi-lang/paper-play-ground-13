/** Refuse a size unit the spot adapters do not apply. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tgtCcy, targetCurrency, or
 * szCcy is refused: adapters size by base amount and do not read a quote-or-base
 * unit, so a quote-currency size would be ignored and the base amount would
 * trade. Zero is present and is refused. This is a size-unit floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function targetCurrencyReason(
  tgtCcy?: unknown,
  targetCurrency?: unknown,
  szCcy?: unknown,
): string | null {
  if (present(tgtCcy)) {
    return "Target currency is not supported; the adapter would size by base amount";
  }
  if (present(targetCurrency)) {
    return "Size currency is not supported; the adapter would size by base amount";
  }
  if (present(szCcy)) {
    return "Size unit is not supported; the adapter would size by base amount";
  }
  return null;
}
