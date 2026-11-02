/** Refuse external header metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present header, orderHeader, or
 * clientHeader is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a header or order header. A header intent
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

export function orderHeaderReason(
  header: unknown,
  orderHeader?: unknown,
  clientHeader?: unknown,
): string | null {
  if (present(header)) {
    return "Header is not supported; the adapter would place a plain spot order";
  }
  if (present(orderHeader)) {
    return "Order header is not supported; the adapter would place a plain spot order";
  }
  if (present(clientHeader)) {
    return "Client header is not supported; the adapter would place a plain spot order";
  }
  return null;
}
