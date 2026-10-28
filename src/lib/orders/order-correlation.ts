/** Refuse correlation fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present correlation, orderCorrelation,
 * or clientCorrelation is refused: adapters place one plain spot order and do
 * not attach a correlation, so a correlation-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderCorrelationReason(
  correlation: unknown,
  orderCorrelation?: unknown,
  clientCorrelation?: unknown,
): string | null {
  if (present(correlation)) {
    return "Correlation is not supported; the adapter would place a plain spot order";
  }
  if (present(orderCorrelation)) {
    return "Order correlation is not supported; the adapter would place a plain spot order";
  }
  if (present(clientCorrelation)) {
    return "Client correlation is not supported; the adapter would place a plain spot order";
  }
  return null;
}
