/** Refuse external footer metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present footer, orderFooter, or
 * clientFooter is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a footer or order footer. A footer intent
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

export function orderFooterReason(
  footer: unknown,
  orderFooter?: unknown,
  clientFooter?: unknown,
): string | null {
  if (present(footer)) {
    return "Footer is not supported; the adapter would place a plain spot order";
  }
  if (present(orderFooter)) {
    return "Order footer is not supported; the adapter would place a plain spot order";
  }
  if (present(clientFooter)) {
    return "Client footer is not supported; the adapter would place a plain spot order";
  }
  return null;
}
