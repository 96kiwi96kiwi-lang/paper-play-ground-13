import { expect, test } from "vitest";
import { orderChildReason } from "@/lib/orders/order-child";

test("omitted, null, false, and blank child aliases pass", () => {
  expect(orderChildReason(undefined)).toBeNull();
  expect(orderChildReason(null, null, null)).toBeNull();
  expect(orderChildReason(false, "", "  ")).toBeNull();
});

test("a present child alias is refused and does not halt", () => {
  expect(orderChildReason("child-1")).toBe(
    "Child id is not supported; the adapter would place a plain spot order",
  );
  expect(orderChildReason(0)).toBe(
    "Child id is not supported; the adapter would place a plain spot order",
  );
  expect(orderChildReason(undefined, "ord-child")).toBe(
    "Order child is not supported; the adapter would place a plain spot order",
  );
  expect(orderChildReason(undefined, undefined, true)).toBe(
    "Client child is not supported; the adapter would place a plain spot order",
  );
});
