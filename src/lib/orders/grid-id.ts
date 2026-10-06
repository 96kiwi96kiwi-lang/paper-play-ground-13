/** Refuse grid ids the spot adapters do not attach. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A true grid flag, or a present
 * gridId or algoId, is refused: adapters place one plain spot order and do
 * not attach a grid, so a grid intent would be ignored and the base size
 * would trade. Zero is present and is refused. This is a grid floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function gridIdReason(
  grid: unknown,
  gridId?: unknown,
  algoId?: unknown,
): string | null {
  if (present(grid)) {
    return "Grid is not supported; the adapter would place a plain spot order";
  }
  if (present(gridId)) {
    return "Grid id is not supported; the adapter would place a plain spot order";
  }
  if (present(algoId)) {
    return "Algo id is not supported; the adapter would place a plain spot order";
  }
  return null;
}
