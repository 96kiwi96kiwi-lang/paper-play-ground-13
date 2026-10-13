/** Refuse order-memo text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present memo, orderMemo, or
 * clientMemo is refused: placeLimitOrder / placeMarketOrder do not set an
 * order memo or client memo, so a memo intent would be ignored and the
 * order would rest or fill as a plain spot order. Zero is present and is
 * refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderMemoReason(
  memo?: unknown,
  orderMemo?: unknown,
  clientMemo?: unknown,
): string | null {
  if (present(memo)) {
    return "Order memo is not supported; the adapter would place a plain spot order";
  }
  if (present(orderMemo)) {
    return "Order memo alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientMemo)) {
    return "Client memo alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
