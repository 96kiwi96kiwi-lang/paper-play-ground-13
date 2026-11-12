/** Refuse order-summary fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present summary, orderSummary, or
 * clientSummary is refused: placeLimitOrder / placeMarketOrder do not set an
 * order summary, so a summary intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSummaryReason(
  summary?: unknown,
  orderSummary?: unknown,
  clientSummary?: unknown,
): string | null {
  if (present(summary)) {
    return "Order summary is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSummary)) {
    return "Order summary alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSummary)) {
    return "Client summary alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
