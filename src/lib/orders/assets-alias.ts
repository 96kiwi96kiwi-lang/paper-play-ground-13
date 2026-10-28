/** Refuse assets aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present assets, orderAssets, or baseAssets
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is an assets floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function assetsAliasReason(
  assets: unknown,
  orderAssets?: unknown,
  baseAssets?: unknown,
): string | null {
  if (present(assets)) {
    return "Assets alias is not supported; the adapter reads amount";
  }
  if (present(orderAssets)) {
    return "Order assets alias is not supported; the adapter reads amount";
  }
  if (present(baseAssets)) {
    return "Base assets alias is not supported; the adapter reads amount";
  }
  return null;
}
