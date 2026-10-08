/** Submit gate for order-force aliases. Not a halt. */

import { orderForceReason } from "./order-force";

export function orderForceGate(intent: {
  force?: unknown;
  forceType?: unknown;
  orderForce?: unknown;
}): string | null {
  return orderForceReason(intent.force, intent.forceType, intent.orderForce);
}
