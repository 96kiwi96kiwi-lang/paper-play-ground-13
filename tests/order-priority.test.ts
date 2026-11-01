import { expect, test } from "vitest";
import { orderPriorityReason } from "@/lib/orders/order-priority";

test("omitted, null, false, and blank priority aliases pass", () => {
  expect(orderPriorityReason(undefined)).toBeNull();
  expect(orderPriorityReason(null, null, null)).toBeNull();
  expect(orderPriorityReason(false, "", "  ")).toBeNull();
});

test("a present priority alias is refused and does not halt", () => {
  expect(orderPriorityReason("high")).toBe(
    "Priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(0)).toBe(
    "Priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(undefined, "urgent")).toBe(
    "Order priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(undefined, undefined, true)).toBe(
    "Client priority is not supported; the adapter would place a plain spot order",
  );
});
