import { expect, test } from "vitest";
import { orderStatusReason } from "@/lib/orders/order-status";

test("omitted, null, false, and blank status aliases pass", () => {
  expect(orderStatusReason(undefined)).toBeNull();
  expect(orderStatusReason(null, null, null)).toBeNull();
  expect(orderStatusReason(false, "", "  ")).toBeNull();
});

test("a present status alias is refused and does not halt", () => {
  expect(orderStatusReason("open")).toBe(
    "Status is not supported; the adapter would place a plain spot order",
  );
  expect(orderStatusReason(0)).toBe(
    "Status is not supported; the adapter would place a plain spot order",
  );
  expect(orderStatusReason(undefined, "filled")).toBe(
    "Order status is not supported; the adapter would place a plain spot order",
  );
  expect(orderStatusReason(undefined, undefined, true)).toBe(
    "Client status is not supported; the adapter would place a plain spot order",
  );
});
