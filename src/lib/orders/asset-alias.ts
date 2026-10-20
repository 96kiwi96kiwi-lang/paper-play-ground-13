/** Refuse asset aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present asset, orderAsset, or baseAsset
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is an asset floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function assetAliasReason(
  asset: unknown,
  orderAsset?: unknown,
  baseAsset?: unknown,
): string | null {
  if (present(asset)) {
    return "Asset alias is not supported; the adapter reads amount";
  }
  if (present(orderAsset)) {
    return "Order asset alias is not supported; the adapter reads amount";
  }
  if (present(baseAsset)) {
    return "Base asset alias is not supported; the adapter reads amount";
  }
  return null;
}
