import { expect, test } from "vitest";
import { orderSiblingReason } from "@/lib/orders/order-sibling";

test("omitted, null, false, and blank sibling aliases pass", () => {
  expect(orderSiblingReason(undefined)).toBeNull();
  expect(orderSiblingReason(null, null, null)).toBeNull();
  expect(orderSiblingReason(false, "", "  ")).toBeNull();
});

test("a present sibling alias is refused and does not halt", () => {
  expect(orderSiblingReason("sib-1")).toBe(
    "Sibling id is not supported; the adapter would place a plain spot order",
  );
  expect(orderSiblingReason(0)).toBe(
    "Sibling id is not supported; the adapter would place a plain spot order",
  );
  expect(orderSiblingReason(undefined, "ord-sib")).toBe(
    "Order sibling is not supported; the adapter would place a plain spot order",
  );
  expect(orderSiblingReason(undefined, undefined, true)).toBe(
    "Client sibling is not supported; the adapter would place a plain spot order",
  );
});
