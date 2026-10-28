/** Refuse a client custom field the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present custom, customField, or
 * clientCustom is refused: adapters place one plain spot order and do not
 * forward client metadata, so the custom intent would be dropped and the
 * order would still rest or fill. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderCustomReason(
  custom?: unknown,
  customField?: unknown,
  clientCustom?: unknown,
): string | null {
  if (present(custom)) {
    return "Custom is not supported; the adapter would drop the client metadata";
  }
  if (present(customField)) {
    return "Custom field is not supported; the adapter would drop the client metadata";
  }
  if (present(clientCustom)) {
    return "Client custom is not supported; the adapter would drop the client metadata";
  }
  return null;
}
