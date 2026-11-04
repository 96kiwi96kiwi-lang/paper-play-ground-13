/** Refuse external template metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present template, orderTemplate, or
 * clientTemplate is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a template or order type tag. A template
 * intent would otherwise be dropped and the order would rest or fill as a plain
 * spot order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderTemplateReason(
  template: unknown,
  orderTemplate?: unknown,
  clientTemplate?: unknown,
): string | null {
  if (present(template)) {
    return "Template is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTemplate)) {
    return "Order template is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTemplate)) {
    return "Client template is not supported; the adapter would place a plain spot order";
  }
  return null;
}
