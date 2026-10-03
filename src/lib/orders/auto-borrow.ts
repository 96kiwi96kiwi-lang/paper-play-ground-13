/** Refuse margin borrow flags the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. True autoBorrow or autoRepay is refused:
 * placeLimitOrder / placeMarketOrder do not send those flags, so the order
 * would trade on the spot book without borrowing or repaying margin.
 * A non-boolean flag is refused as a bad shape.
 * This is a margin floor, not a halt, and does not flatten positions.
 */
function refusedFlag(value: unknown, label: string): string | null {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  if (value === false) return null;
  if (value === true) {
    return `${label} is not supported; the adapter would place a spot order`;
  }
  return `${label} must be a boolean`;
}

export function autoBorrowReason(autoBorrow: unknown, autoRepay?: unknown): string | null {
  return refusedFlag(autoBorrow, "Auto-borrow") ?? refusedFlag(autoRepay, "Auto-repay");
}
