/** Refuse order-form flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present form, orderForm, or
 * clientForm is refused: placeLimitOrder / placeMarketOrder do not set an
 * order form, so a form intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderFormReason(
  form?: unknown,
  orderForm?: unknown,
  clientForm?: unknown,
): string | null {
  if (present(form)) {
    return "Order form is not supported; the adapter would place a plain spot order";
  }
  if (present(orderForm)) {
    return "Order form alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientForm)) {
    return "Client form alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
