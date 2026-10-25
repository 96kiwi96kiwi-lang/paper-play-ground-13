/** Refuse span fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present span, orderSpan,
 * or clientSpan is refused: adapters place one plain spot order and do
 * not attach a span id, so a span-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSpanReason(
  span: unknown,
  orderSpan?: unknown,
  clientSpan?: unknown,
): string | null {
  if (present(span)) {
    return "Span is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSpan)) {
    return "Order span is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSpan)) {
    return "Client span is not supported; the adapter would place a plain spot order";
  }
  return null;
}
