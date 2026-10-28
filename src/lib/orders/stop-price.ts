/** Refuse stop-price triggers the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present stopPrice, triggerPrice, or
 * stopPx is refused: placeLimitOrder / placeMarketOrder do not send a stop
 * trigger, so a stop or trigger intent would otherwise be ignored and the
 * order would rest or fill as a plain spot order at price or market. Zero is
 * present and is refused. This is a stop-price floor, not a halt, and does not
 * flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function stopPriceReason(
  stopPrice: unknown,
  triggerPrice?: unknown,
  stopPx?: unknown,
): string | null {
  if (present(stopPrice)) {
    return "Stop price is not supported; the adapter would place a plain spot order";
  }
  if (present(triggerPrice)) {
    return "Trigger price is not supported; the adapter would place a plain spot order";
  }
  if (present(stopPx)) {
    return "Stop px is not supported; the adapter would place a plain spot order";
  }
  return null;
}
