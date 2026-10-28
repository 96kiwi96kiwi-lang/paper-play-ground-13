/** Refuse volume aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present volume, orderVolume, or baseVolume is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a volume floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function volumeAliasReason(
  volume: unknown,
  orderVolume?: unknown,
  baseVolume?: unknown,
): string | null {
  if (present(volume)) {
    return "Volume alias is not supported; the adapter reads amount";
  }
  if (present(orderVolume)) {
    return "Order volume alias is not supported; the adapter reads amount";
  }
  if (present(baseVolume)) {
    return "Base volume alias is not supported; the adapter reads amount";
  }
  return null;
}
