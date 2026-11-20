/** Refuse external will metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present will, willId, or
 * orderWill is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a will or narrative tag. A will
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

export function orderWillReason(
  will: unknown,
  willId?: unknown,
  orderWill?: unknown,
): string | null {
  if (present(will)) {
    return "Will is not supported; the adapter would place a plain spot order";
  }
  if (present(willId)) {
    return "Will id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderWill)) {
    return "Order-will alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
