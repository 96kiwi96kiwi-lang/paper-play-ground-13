/** Refuse order-metadata text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present metadata, orderMetadata, or
 * clientMetadata is refused: placeLimitOrder / placeMarketOrder do not set an
 * order metadata or client metadata, so a metadata intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderMetadataReason(
  metadata?: unknown,
  orderMetadata?: unknown,
  clientMetadata?: unknown,
): string | null {
  if (present(metadata)) {
    return "Order metadata is not supported; the adapter would place a plain spot order";
  }
  if (present(orderMetadata)) {
    return "Order metadata alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientMetadata)) {
    return "Client metadata alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
