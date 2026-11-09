/** Refuse theme fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present theme, orderTheme,
 * or clientTheme is refused: adapters place one plain spot order and do
 * not attach a theme, so a theme intent would otherwise be dropped and
 * the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderThemeReason(
  theme: unknown,
  orderTheme?: unknown,
  clientTheme?: unknown,
): string | null {
  if (present(theme)) {
    return "Theme is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTheme)) {
    return "Order theme is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTheme)) {
    return "Client theme is not supported; the adapter would place a plain spot order";
  }
  return null;
}
