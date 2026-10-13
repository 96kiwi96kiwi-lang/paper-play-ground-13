/** Refuse a post-only flag the adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present postOnly, postOnlyFlag,
 * or makerOnly is refused: adapters place one plain limit or market order
 * and do not set post-only, so a maker-only intent would rest or fill as a
 * taker. This is a matching floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function postOnlyReason(
  postOnly: unknown,
  postOnlyFlag?: unknown,
  makerOnly?: unknown,
): string | null {
  if (present(postOnly)) {
    return "Post only is not supported; the adapter would place a plain order";
  }
  if (present(postOnlyFlag)) {
    return "Post-only flag is not supported; the adapter would place a plain order";
  }
  if (present(makerOnly)) {
    return "Maker only is not supported; the adapter would place a plain order";
  }
  return null;
}
