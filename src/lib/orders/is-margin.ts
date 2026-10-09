/** Refuse is-margin flags the spot adapters do not apply. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present isMargin, margin, or
 * is_margin is refused: adapters place one plain spot order and do not open
 * a margin account, so a margin intent would be ignored and the base size
 * would trade on cash. Zero is present and is refused. This is a margin
 * floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function isMarginReason(
  isMargin?: unknown,
  margin?: unknown,
  is_margin?: unknown,
): string | null {
  if (present(isMargin)) {
    return "Is-margin is not supported; the adapter would place a plain spot order";
  }
  if (present(margin)) {
    return "Margin flag is not supported; the adapter would place a plain spot order";
  }
  if (present(is_margin)) {
    return "Is-margin alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
