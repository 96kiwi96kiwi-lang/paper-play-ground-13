/** Refuse order-theme flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present theme, orderTheme, or
 * clientTheme is refused: placeLimitOrder / placeMarketOrder do not set an
 * order theme, so a theme intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderThemeReason(
  theme?: unknown,
  orderTheme?: unknown,
  clientTheme?: unknown,
): string | null {
  if (present(theme)) {
    return "Order theme is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTheme)) {
    return "Order theme alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTheme)) {
    return "Client theme alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
