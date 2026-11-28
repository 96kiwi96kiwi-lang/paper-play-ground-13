/** Refuse external outcome metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present outcome, outcomeId, or
 * orderOutcome is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an outcome or narrative tag. An outcome
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

export function orderOutcomeReason(
  outcome: unknown,
  outcomeId?: unknown,
  orderOutcome?: unknown,
): string | null {
  if (present(outcome)) {
    return "Outcome is not supported; the adapter would place a plain spot order";
  }
  if (present(outcomeId)) {
    return "Outcome id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderOutcome)) {
    return "Order-outcome alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
