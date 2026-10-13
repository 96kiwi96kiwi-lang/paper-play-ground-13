/** Refuse a close-position flag the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present closePosition, closeOnTrigger,
 * or closeOrder is refused: placeLimitOrder / placeMarketOrder do not send a
 * close flag, so the base amount would still trade as a normal spot order.
 * True and zero are present and are refused. This is a close floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function closePositionReason(
  closePosition: unknown,
  closeOnTrigger?: unknown,
  closeOrder?: unknown,
): string | null {
  if (present(closePosition)) {
    return "Close position is not supported; the adapter would place a normal spot order";
  }
  if (present(closeOnTrigger)) {
    return "Close on trigger is not supported; the adapter would place a normal spot order";
  }
  if (present(closeOrder)) {
    return "Close order is not supported; the adapter would place a normal spot order";
  }
  return null;
}
