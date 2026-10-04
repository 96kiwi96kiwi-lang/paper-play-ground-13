/** Refuse side aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present orderSide, direction, or action
 * is refused: adapters place by side only. An alias would be ignored and
 * the order would buy or sell the canonical side. This is a side floor, not
 * a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function sideAliasReason(
  orderSide: unknown,
  direction?: unknown,
  action?: unknown,
): string | null {
  if (present(orderSide)) {
    return "Order side alias is not supported; the adapter reads side";
  }
  if (present(direction)) {
    return "Direction is not supported; the adapter reads side";
  }
  if (present(action)) {
    return "Action is not supported; the adapter reads side";
  }
  return null;
}
