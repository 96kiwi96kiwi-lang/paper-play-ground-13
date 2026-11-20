/** Refuse external plot metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present plot, plotId, or
 * clientPlot is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a plot or playbook tag. A plot intent
 * would otherwise be dropped and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPlotReason(
  plot: unknown,
  plotId?: unknown,
  clientPlot?: unknown,
): string | null {
  if (present(plot)) {
    return "Plot is not supported; the adapter would place a plain spot order";
  }
  if (present(plotId)) {
    return "Plot id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPlot)) {
    return "Client plot is not supported; the adapter would place a plain spot order";
  }
  return null;
}
