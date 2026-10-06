/** Refuse leverage and margin mode the spot adapters do not apply. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present leverage, marginMode, or
 * tdMode is refused: adapters place one plain spot order and do not set
 * leverage or a margin account, so a cross or isolated intent would be ignored
 * and the base size would trade on the spot book. Zero is present and is
 * refused. This is a leverage floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function leverageModeReason(
  leverage?: unknown,
  marginMode?: unknown,
  tdMode?: unknown,
): string | null {
  if (present(leverage)) {
    return "Leverage is not supported; the adapter would place a plain spot order";
  }
  if (present(marginMode)) {
    return "Margin mode is not supported; the adapter would place a plain spot order";
  }
  if (present(tdMode)) {
    return "Trade mode is not supported; the adapter would place a plain spot order";
  }
  return null;
}
