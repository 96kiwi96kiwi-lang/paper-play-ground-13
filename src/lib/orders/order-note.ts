/** Refuse order-note flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present note, orderNote, or
 * clientNote is refused: placeLimitOrder / placeMarketOrder do not forward a
 * note, so a note intent would be ignored and the order would rest or fill as
 * a plain spot order. Zero is present and is refused. This is a metadata floor,
 * not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderNoteReason(
  note?: unknown,
  orderNote?: unknown,
  clientNote?: unknown,
): string | null {
  if (present(note)) {
    return "Order note is not supported; the adapter would place a plain spot order";
  }
  if (present(orderNote)) {
    return "Order note alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientNote)) {
    return "Client note alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
