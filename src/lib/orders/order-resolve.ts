/** Refuse external resolve metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present resolve, resolveId, or
 * orderResolve is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a resolve or narrative tag. A resolve
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

export function orderResolveReason(
  resolve: unknown,
  resolveId?: unknown,
  orderResolve?: unknown,
): string | null {
  if (present(resolve)) {
    return "Resolve is not supported; the adapter would place a plain spot order";
  }
  if (present(resolveId)) {
    return "Resolve id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderResolve)) {
    return "Order-resolve alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
