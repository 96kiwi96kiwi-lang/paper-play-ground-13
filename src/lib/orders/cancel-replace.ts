/** Refuse cancel-replace fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present cancel-replace flag or
 * resting id is refused: adapters place one new spot order and do not cancel
 * the named order, so a replace would leave both resting. This is a replace
 * floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function cancelReplaceReason(
  cancelReplace: unknown,
  cancelOrderId?: unknown,
  orderIdToCancel?: unknown,
): string | null {
  if (present(cancelReplace)) {
    return "Cancel-replace is not supported; the adapter would place a new order and leave the old one resting";
  }
  if (present(cancelOrderId)) {
    return "Cancel order id is not supported; the adapter would place a new order and leave the old one resting";
  }
  if (present(orderIdToCancel)) {
    return "Order id to cancel is not supported; the adapter would place a new order and leave the old one resting";
  }
  return null;
}
