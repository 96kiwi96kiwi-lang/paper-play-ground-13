import { expect, test } from "vitest";
import { orderRootReason } from "@/lib/orders/order-root";

test("omitted, null, false, and blank root aliases pass", () => {
  expect(orderRootReason(undefined)).toBeNull();
  expect(orderRootReason(null, null, null)).toBeNull();
  expect(orderRootReason(false, "", "  ")).toBeNull();
});

test("a present root alias is refused and does not halt", () => {
  expect(orderRootReason("root-1")).toBe(
    "Root id is not supported; the adapter would place a plain spot order",
  );
  expect(orderRootReason(0)).toBe(
    "Root id is not supported; the adapter would place a plain spot order",
  );
  expect(orderRootReason(undefined, "ord-root")).toBe(
    "Order root is not supported; the adapter would place a plain spot order",
  );
  expect(orderRootReason(undefined, undefined, true)).toBe(
    "Client root is not supported; the adapter would place a plain spot order",
  );
});
