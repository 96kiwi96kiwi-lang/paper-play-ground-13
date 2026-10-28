/** Refuse nav aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present nav, orderNav, or baseNav
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a nav floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function navAliasReason(
  nav: unknown,
  orderNav?: unknown,
  baseNav?: unknown,
): string | null {
  if (present(nav)) {
    return "Nav alias is not supported; the adapter reads amount";
  }
  if (present(orderNav)) {
    return "Order nav alias is not supported; the adapter reads amount";
  }
  if (present(baseNav)) {
    return "Base nav alias is not supported; the adapter reads amount";
  }
  return null;
}
