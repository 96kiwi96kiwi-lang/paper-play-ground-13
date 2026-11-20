/** Refuse external intent metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present intent, intentId, or
 * orderIntent is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an intent or narrative tag. An intent
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

export function orderIntentReason(
  intent: unknown,
  intentId?: unknown,
  orderIntent?: unknown,
): string | null {
  if (present(intent)) {
    return "Intent is not supported; the adapter would place a plain spot order";
  }
  if (present(intentId)) {
    return "Intent id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderIntent)) {
    return "Order-intent alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
