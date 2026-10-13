/** Refuse cross-margin aliases the spot adapters do not apply. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present mgnMode, tradeMode, or
 * isCross is refused: adapters place one plain spot order and do not open a
 * cross margin account, so a cross or isolated intent in those aliases would
 * be ignored and the base size would trade on the spot book. Zero is present
 * and is refused. leverage, marginMode, and tdMode remain the leverage-mode
 * floor. This is a margin floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function crossMarginReason(
  mgnMode?: unknown,
  tradeMode?: unknown,
  isCross?: unknown,
): string | null {
  if (present(mgnMode)) {
    return "Margin-mode alias is not supported; the adapter would place a plain spot order";
  }
  if (present(tradeMode)) {
    return "Trade-mode alias is not supported; the adapter would place a plain spot order";
  }
  if (present(isCross)) {
    return "Cross margin is not supported; the adapter would place a plain spot order";
  }
  return null;
}
