/** Refuse external kind metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present kind, orderKind, or
 * clientKind is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a kind or order type tag. A kind intent
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

export function orderKindReason(
  kind: unknown,
  orderKind?: unknown,
  clientKind?: unknown,
): string | null {
  if (present(kind)) {
    return "Kind is not supported; the adapter would place a plain spot order";
  }
  if (present(orderKind)) {
    return "Order kind is not supported; the adapter would place a plain spot order";
  }
  if (present(clientKind)) {
    return "Client kind is not supported; the adapter would place a plain spot order";
  }
  return null;
}
