/** Refuse order-brief fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present brief, orderBrief, or
 * clientBrief is refused: placeLimitOrder / placeMarketOrder do not set an
 * order brief, so a brief intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderBriefReason(
  brief?: unknown,
  orderBrief?: unknown,
  clientBrief?: unknown,
): string | null {
  if (present(brief)) {
    return "Order brief is not supported; the adapter would place a plain spot order";
  }
  if (present(orderBrief)) {
    return "Order brief alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientBrief)) {
    return "Client brief alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
