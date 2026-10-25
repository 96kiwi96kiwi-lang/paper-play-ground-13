/** Refuse trace fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present trace, orderTrace,
 * or clientTrace is refused: adapters place one plain spot order and do
 * not attach a trace id, so a trace-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderTraceReason(
  trace: unknown,
  orderTrace?: unknown,
  clientTrace?: unknown,
): string | null {
  if (present(trace)) {
    return "Trace is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTrace)) {
    return "Order trace is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTrace)) {
    return "Client trace is not supported; the adapter would place a plain spot order";
  }
  return null;
}
