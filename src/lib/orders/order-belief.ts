/** Refuse external belief metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present belief, beliefId, or
 * orderBelief is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a belief or narrative tag. A belief
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

export function orderBeliefReason(
  belief: unknown,
  beliefId?: unknown,
  orderBelief?: unknown,
): string | null {
  if (present(belief)) {
    return "Belief is not supported; the adapter would place a plain spot order";
  }
  if (present(beliefId)) {
    return "Belief id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderBelief)) {
    return "Order-belief alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
