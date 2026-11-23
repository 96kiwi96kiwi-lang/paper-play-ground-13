/** Refuse external judgment metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present judgment, judgmentId, or
 * orderJudgment is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a judgment or narrative tag. A judgment
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

export function orderJudgmentReason(
  judgment: unknown,
  judgmentId?: unknown,
  orderJudgment?: unknown,
): string | null {
  if (present(judgment)) {
    return "Judgment is not supported; the adapter would place a plain spot order";
  }
  if (present(judgmentId)) {
    return "Judgment id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderJudgment)) {
    return "Order-judgment alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
