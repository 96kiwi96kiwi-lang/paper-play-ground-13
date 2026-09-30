/** Refuse a submit that reuses a clientOrderId already on the local book. Not a halt. */

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
