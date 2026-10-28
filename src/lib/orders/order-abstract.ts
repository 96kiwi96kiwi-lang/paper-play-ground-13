/** Refuse order-abstract fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present abstract, orderAbstract, or
 * clientAbstract is refused: placeLimitOrder / placeMarketOrder do not set an
 * order abstract, so an abstract intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderAbstractReason(
  abstract?: unknown,
  orderAbstract?: unknown,
  clientAbstract?: unknown,
): string | null {
  if (present(abstract)) {
    return "Order abstract is not supported; the adapter would place a plain spot order";
  }
  if (present(orderAbstract)) {
    return "Order abstract alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientAbstract)) {
    return "Client abstract alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
