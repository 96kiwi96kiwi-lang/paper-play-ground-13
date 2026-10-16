/** Refuse volume aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present vol, volume, or baseVolume
 * is refused: adapters place by amount only. An alias would be
 * ignored and the order would use the canonical amount or fail.
 * Zero is present and is refused. This is a volume floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function volumeAliasReason(
  vol: unknown,
  volume?: unknown,
  baseVolume?: unknown,
): string | null {
  if (present(vol)) {
    return "Vol alias is not supported; the adapter reads amount";
  }
  if (present(volume)) {
    return "Volume alias is not supported; the adapter reads amount";
  }
  if (present(baseVolume)) {
    return "Base volume alias is not supported; the adapter reads amount";
  }
  return null;
}
