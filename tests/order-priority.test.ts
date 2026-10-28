import { expect, test } from "vitest";
import { orderPriorityReason } from "@/lib/orders/order-priority";

test("omitted, blank, and false pass", () => {
  expect(orderPriorityReason(undefined)).toBeNull();
  expect(orderPriorityReason(null, null, null)).toBeNull();
  expect(orderPriorityReason("", "  ", false)).toBeNull();
  expect(orderPriorityReason(false, false, false)).toBeNull();
});

test("a present priority is refused and does not halt", () => {
  expect(orderPriorityReason("high")).toBe(
    "Order priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(0)).toBe(
    "Order priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(undefined, "urgent")).toBe(
    "Order priority alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(undefined, undefined, "client-high")).toBe(
    "Client priority alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(undefined, undefined, true)).toBe(
    "Client priority alias is not supported; the adapter would place a plain spot order",
  );
});
