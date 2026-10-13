/** Refuse cancel-on-disconnect the spot adapters do not arm. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present cancelOnDisconnect, deadman,
 * or cod is refused: placeLimitOrder / placeMarketOrder do not arm a
 * cancel-on-disconnect timer, so a dead-man intent would be ignored and a
 * resting order could stay live after the process drops. Zero is present and
 * is refused. cancelAfter and expireTime remain their own floor. This is a
 * disconnect floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function cancelOnDisconnectReason(
  cancelOnDisconnect: unknown,
  deadman?: unknown,
  cod?: unknown,
): string | null {
  if (present(cancelOnDisconnect)) {
    return "Cancel on disconnect is not supported; the adapter would leave a resting order";
  }
  if (present(deadman)) {
    return "Dead-man switch is not supported; the adapter would leave a resting order";
  }
  if (present(cod)) {
    return "COD flag is not supported; the adapter would leave a resting order";
  }
  return null;
}
