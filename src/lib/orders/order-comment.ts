/** Refuse order-comment text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present comment, orderComment, or
 * clientComment is refused: placeLimitOrder / placeMarketOrder do not set an
 * order comment or client comment, so a comment intent would be ignored and the
 * order would rest or fill as a plain spot order. Zero is present and is
 * refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderCommentReason(
  comment?: unknown,
  orderComment?: unknown,
  clientComment?: unknown,
): string | null {
  if (present(comment)) {
    return "Order comment is not supported; the adapter would place a plain spot order";
  }
  if (present(orderComment)) {
    return "Order comment alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientComment)) {
    return "Client comment alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
