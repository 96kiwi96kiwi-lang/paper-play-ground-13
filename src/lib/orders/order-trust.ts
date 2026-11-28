/** Refuse external trust metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present trust, trustId, or
 * orderTrust is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a trust or narrative tag. A trust
 * would otherwise be dropped and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderTrustReason(
  trust: unknown,
  trustId?: unknown,
  orderTrust?: unknown,
): string | null {
  if (present(trust)) {
    return "Trust is not supported; the adapter would place a plain spot order";
  }
  if (present(trustId)) {
    return "Trust id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTrust)) {
    return "Order-trust alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
