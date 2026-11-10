/** Refuse style fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present style, orderStyle,
 * or clientStyle is refused: adapters place one plain spot order and do
 * not attach a style, so a style intent would otherwise be dropped and
 * the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderStyleReason(
  style: unknown,
  orderStyle?: unknown,
  clientStyle?: unknown,
): string | null {
  if (present(style)) {
    return "Style is not supported; the adapter would place a plain spot order";
  }
  if (present(orderStyle)) {
    return "Order style is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStyle)) {
    return "Client style is not supported; the adapter would place a plain spot order";
  }
  return null;
}
