import { expect, test } from "vitest";
import { orderParentReason } from "@/lib/orders/order-parent";

test("omitted, null, false, and blank parent aliases pass", () => {
  expect(orderParentReason(undefined)).toBeNull();
  expect(orderParentReason(null, null, null)).toBeNull();
  expect(orderParentReason(false, "", "  ")).toBeNull();
});

test("a present parent alias is refused and does not halt", () => {
  expect(orderParentReason("parent-1")).toBe(
    "Parent id is not supported; the adapter would place a plain spot order",
  );
  expect(orderParentReason(0)).toBe(
    "Parent id is not supported; the adapter would place a plain spot order",
  );
  expect(orderParentReason(undefined, "ord-parent")).toBe(
    "Order parent is not supported; the adapter would place a plain spot order",
  );
  expect(orderParentReason(undefined, undefined, true)).toBe(
    "Client parent is not supported; the adapter would place a plain spot order",
  );
});
