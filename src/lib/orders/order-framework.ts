/** Refuse order-framework flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present framework, orderFramework, or
 * clientFramework is refused: placeLimitOrder / placeMarketOrder do not set an
 * order framework, so a framework intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderFrameworkReason(
  framework?: unknown,
  orderFramework?: unknown,
  clientFramework?: unknown,
): string | null {
  if (present(framework)) {
    return "Order framework is not supported; the adapter would place a plain spot order";
  }
  if (present(orderFramework)) {
    return "Order framework alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientFramework)) {
    return "Client framework alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
