/** Refuse external result metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present result, resultId, or
 * orderResult is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a result or narrative tag. A result
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

export function orderResultReason(
  result: unknown,
  resultId?: unknown,
  orderResult?: unknown,
): string | null {
  if (present(result)) {
    return "Result is not supported; the adapter would place a plain spot order";
  }
  if (present(resultId)) {
    return "Result id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderResult)) {
    return "Order-result alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
