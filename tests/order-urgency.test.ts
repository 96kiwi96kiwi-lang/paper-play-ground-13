import { expect, test } from "vitest";
import { orderUrgencyReason } from "@/lib/orders/order-urgency";

test("omitted, null, false, and blank urgency aliases pass", () => {
  expect(orderUrgencyReason(undefined)).toBeNull();
  expect(orderUrgencyReason(null, null, null)).toBeNull();
  expect(orderUrgencyReason(false, "", "  ")).toBeNull();
});

test("a present urgency alias is refused and does not halt", () => {
  expect(orderUrgencyReason("high")).toBe(
    "Urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(0)).toBe(
    "Urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(undefined, "urgent")).toBe(
    "Order urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(undefined, undefined, true)).toBe(
    "Client urgency is not supported; the adapter would place a plain spot order",
  );
});
