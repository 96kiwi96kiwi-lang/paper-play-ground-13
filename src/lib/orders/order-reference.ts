/** Refuse order-reference text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present reference, orderReference, or
 * clientReference is refused: placeLimitOrder / placeMarketOrder do not set an
 * order reference or client reference, so a reference intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderReferenceReason(
  reference?: unknown,
  orderReference?: unknown,
  clientReference?: unknown,
): string | null {
  if (present(reference)) {
    return "Order reference is not supported; the adapter would place a plain spot order";
  }
  if (present(orderReference)) {
    return "Order reference alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientReference)) {
    return "Client reference alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
