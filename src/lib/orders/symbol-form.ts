/** Normalize a pair to BASE/QUOTE before the allowlist check. Not a halt. */

/**
 * Trim, uppercase, and turn KuCoin `BASE-QUOTE` into `BASE/QUOTE`.
 * Internal spaces are dropped. A pair still outside `allowed` is refused
 * so the adapter never sees an unknown symbol (which would burn the
 * reject-burst window). This is a shape floor, not a halt.
 */
export function normalizePairSymbol(
  raw: string,
  allowed: ReadonlySet<string>,
): { symbol: string } | { reason: string } {
  const shaped = typeof raw === "string" ? raw.trim().toUpperCase().replace(/\s+/g, "").replace(/-/g, "/") : "";
  if (!shaped || !allowed.has(shaped)) {
    return { reason: `Unsupported pair: ${shaped || raw}` };
  }
  return { symbol: shaped };
}
