/** Reason string when a market intent has no quote time or the quote is too old. */
export function staleMarketQuoteReason(
  type: string | undefined,
  quotedAt: number | undefined,
  now: number,
  maxAgeMs: number,
): string | null {
  if ((type ?? "market") !== "market") return null;
  if (quotedAt == null || !Number.isFinite(quotedAt)) {
    return "Stale price: market submit requires quotedAt";
  }
  const age = now - quotedAt;
  if (age > maxAgeMs) {
    return `Stale price: quote age ${age}ms exceeds max ${maxAgeMs}ms`;
  }
  return null;
}
