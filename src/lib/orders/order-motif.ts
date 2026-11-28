/** Refuse order-motif flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present motif, orderMotif, or
 * clientMotif is refused: placeLimitOrder / placeMarketOrder do not set an
 * order motif, so a motif intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderMotifReason(
  motif?: unknown,
  orderMotif?: unknown,
  clientMotif?: unknown,
): string | null {
  if (present(motif)) {
    return "Order motif is not supported; the adapter would place a plain spot order";
  }
  if (present(orderMotif)) {
    return "Order motif alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientMotif)) {
    return "Client motif alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
