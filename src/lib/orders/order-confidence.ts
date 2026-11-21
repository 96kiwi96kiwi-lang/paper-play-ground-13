/** Refuse external confidence metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present confidence, confidenceId, or
 * orderConfidence is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a confidence or narrative tag. A confidence
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

export function orderConfidenceReason(
  confidence: unknown,
  confidenceId?: unknown,
  orderConfidence?: unknown,
): string | null {
  if (present(confidence)) {
    return "Confidence is not supported; the adapter would place a plain spot order";
  }
  if (present(confidenceId)) {
    return "Confidence id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderConfidence)) {
    return "Order-confidence alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
