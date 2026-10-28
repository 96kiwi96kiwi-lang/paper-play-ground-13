/** Refuse order-remark text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present remark, orderRemark, or
 * clientRemark is refused: placeLimitOrder / placeMarketOrder do not set an
 * order remark or client remark, so a remark intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderRemarkReason(
  remark?: unknown,
  orderRemark?: unknown,
  clientRemark?: unknown,
): string | null {
  if (present(remark)) {
    return "Order remark is not supported; the adapter would place a plain spot order";
  }
  if (present(orderRemark)) {
    return "Order remark alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientRemark)) {
    return "Client remark alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
