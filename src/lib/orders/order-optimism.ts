/** Refuse external optimism metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present optimism, optimismId, or
 * orderOptimism is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an optimism or narrative tag. An optimism
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

export function orderOptimismReason(
  optimism: unknown,
  optimismId?: unknown,
  orderOptimism?: unknown,
): string | null {
  if (present(optimism)) {
    return "Optimism is not supported; the adapter would place a plain spot order";
  }
  if (present(optimismId)) {
    return "Optimism id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderOptimism)) {
    return "Order-optimism alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
