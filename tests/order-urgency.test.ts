import { expect, test } from "vitest";
import { orderUrgencyReason } from "@/lib/orders/order-urgency";

test("omitted, blank, and false pass", () => {
  expect(orderUrgencyReason(undefined)).toBeNull();
  expect(orderUrgencyReason(null, null, null)).toBeNull();
  expect(orderUrgencyReason("", "  ", false)).toBeNull();
  expect(orderUrgencyReason(false, false, false)).toBeNull();
});

test("a present urgency is refused and does not halt", () => {
  expect(orderUrgencyReason("high")).toBe(
    "Order urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(0)).toBe(
    "Order urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(undefined, "urgent")).toBe(
    "Order urgency alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(undefined, undefined, "client-high")).toBe(
    "Client urgency alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(undefined, undefined, true)).toBe(
    "Client urgency alias is not supported; the adapter would place a plain spot order",
  );
});
