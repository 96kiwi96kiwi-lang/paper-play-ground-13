/** Refuse a bad or reused clientOrderId before the adapter. Not a halt. */

/** KuCoin clientOid: letters, digits, hyphens. Blank still passes. */
const CLIENT_ORDER_ID_RE = /^[A-Za-z0-9-]+$/;

/**
 * A non-blank id is refused when it is longer than `maxLength` or outside
 * [A-Za-z0-9-]. KuCoin rejects those before they rest, which would burn the
 * reject-burst window. Blank and omitted ids still pass (the exchange assigns one).
 */
export function invalidClientOrderIdReason(
  clientOrderId: string | undefined,
  maxLength: number,
): string | null {
  if (typeof clientOrderId !== "string") return null;
  const id = clientOrderId.trim();
  if (!id) return null;
  if (!(maxLength > 0)) return null;
  if (id.length > maxLength || !CLIENT_ORDER_ID_RE.test(id)) {
    return `Bad clientOrderId: must be 1-${maxLength} chars of letters, digits, or hyphens`;
  }
  return null;
}

export function duplicateClientOrderIdReason(
  clientOrderId: string | undefined,
  seen: Array<{ id: string; clientOrderId?: string }>,
): string | null {
  const id = typeof clientOrderId === "string" ? clientOrderId.trim() : "";
  if (!id) return null;
  const hit = seen.find((o) => o.clientOrderId === id);
  if (!hit) return null;
  return `Duplicate clientOrderId: ${id} already used by ${hit.id}`;
}
