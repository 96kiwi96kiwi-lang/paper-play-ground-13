/** Refuse exposure aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present exposure, orderExposure, or baseExposure is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is an exposure floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function exposureAliasReason(
  exposure: unknown,
  orderExposure?: unknown,
  baseExposure?: unknown,
): string | null {
  if (present(exposure)) {
    return "Exposure alias is not supported; the adapter reads amount";
  }
  if (present(orderExposure)) {
    return "Order exposure alias is not supported; the adapter reads amount";
  }
  if (present(baseExposure)) {
    return "Base exposure alias is not supported; the adapter reads amount";
  }
  return null;
}
