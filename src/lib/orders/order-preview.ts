/** Refuse order-preview fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present preview, orderPreview, or
 * clientPreview is refused: placeLimitOrder / placeMarketOrder do not set an
 * order preview, so a preview intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPreviewReason(
  preview?: unknown,
  orderPreview?: unknown,
  clientPreview?: unknown,
): string | null {
  if (present(preview)) {
    return "Order preview is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPreview)) {
    return "Order preview alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPreview)) {
    return "Client preview alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
