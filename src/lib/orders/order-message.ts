/** Refuse order-message text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present message, orderMessage, or
 * clientMessage is refused: placeLimitOrder / placeMarketOrder do not set an
 * order message or client message, so a message intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderMessageReason(
  message?: unknown,
  orderMessage?: unknown,
  clientMessage?: unknown,
): string | null {
  if (present(message)) {
    return "Order message is not supported; the adapter would place a plain spot order";
  }
  if (present(orderMessage)) {
    return "Order message alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientMessage)) {
    return "Client message alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
