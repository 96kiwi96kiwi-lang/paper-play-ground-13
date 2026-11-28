/** Refuse external faith metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present faith, faithId, or
 * orderFaith is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a faith or narrative tag. A faith
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

export function orderFaithReason(
  faith: unknown,
  faithId?: unknown,
  orderFaith?: unknown,
): string | null {
  if (present(faith)) {
    return "Faith is not supported; the adapter would place a plain spot order";
  }
  if (present(faithId)) {
    return "Faith id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderFaith)) {
    return "Order-faith alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
