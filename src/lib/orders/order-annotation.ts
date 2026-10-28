/** Refuse order-annotation text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present annotation, orderAnnotation, or
 * clientAnnotation is refused: placeLimitOrder / placeMarketOrder do not set an
 * order annotation or client annotation, so an annotation intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderAnnotationReason(
  annotation?: unknown,
  orderAnnotation?: unknown,
  clientAnnotation?: unknown,
): string | null {
  if (present(annotation)) {
    return "Order annotation is not supported; the adapter would place a plain spot order";
  }
  if (present(orderAnnotation)) {
    return "Order annotation alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientAnnotation)) {
    return "Client annotation alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
