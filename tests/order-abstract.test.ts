import { expect, test } from "vitest";
import { orderAbstractReason } from "@/lib/orders/order-abstract";

test("omitted, null, false, and blank abstract aliases pass", () => {
  expect(orderAbstractReason(undefined)).toBeNull();
  expect(orderAbstractReason(null, null, null)).toBeNull();
  expect(orderAbstractReason(false, "", "  ")).toBeNull();
});

test("a present abstract alias is refused and does not halt", () => {
  expect(orderAbstractReason("hedge note")).toBe(
    "Order abstract is not supported; the adapter would place a plain spot order",
  );
  expect(orderAbstractReason(0)).toBe(
    "Order abstract is not supported; the adapter would place a plain spot order",
  );
  expect(orderAbstractReason(undefined, "client memo")).toBe(
    "Order abstract alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAbstractReason(undefined, undefined, true)).toBe(
    "Client abstract alias is not supported; the adapter would place a plain spot order",
  );
});
