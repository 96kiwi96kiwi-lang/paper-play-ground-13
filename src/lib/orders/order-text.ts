/** Refuse external text metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present text, orderText, or
 * clientText is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach free-text or order text. A text intent
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

export function orderTextReason(
  text: unknown,
  orderText?: unknown,
  clientText?: unknown,
): string | null {
  if (present(text)) {
    return "Text is not supported; the adapter would place a plain spot order";
  }
  if (present(orderText)) {
    return "Order text is not supported; the adapter would place a plain spot order";
  }
  if (present(clientText)) {
    return "Client text is not supported; the adapter would place a plain spot order";
  }
  return null;
}
