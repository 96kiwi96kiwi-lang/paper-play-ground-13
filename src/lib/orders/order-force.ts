/** Refuse order-force aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present force, forceType, or
 * orderForce is refused: placeLimitOrder / placeMarketOrder read timeInForce
 * only, so IOC, FOK, or post-only packed in force would be ignored and the
 * order would rest as GTC. Zero is present and is refused. timeInForce, tif,
 * and postOnly remain their own floors. This is a force floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderForceReason(
  force: unknown,
  forceType?: unknown,
  orderForce?: unknown,
): string | null {
  if (present(force)) {
    return "Order force is not supported; the adapter would rest the order as GTC";
  }
  if (present(forceType)) {
    return "Force type is not supported; the adapter would rest the order as GTC";
  }
  if (present(orderForce)) {
    return "Order-force alias is not supported; the adapter would rest the order as GTC";
  }
  return null;
}
