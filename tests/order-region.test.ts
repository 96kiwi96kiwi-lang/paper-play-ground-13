import { expect, test } from "vitest";
import { orderRegionReason } from "@/lib/orders/order-region";

test("omitted, null, false, and blank region aliases pass", () => {
  expect(orderRegionReason(undefined)).toBeNull();
  expect(orderRegionReason(null, null, null)).toBeNull();
  expect(orderRegionReason(false, "", "  ")).toBeNull();
});

test("a present region alias is refused and does not halt", () => {
  expect(orderRegionReason("us-east")).toBe(
    "Region is not supported; the adapter would place a plain spot order",
  );
  expect(orderRegionReason(0)).toBe(
    "Region is not supported; the adapter would place a plain spot order",
  );
  expect(orderRegionReason(undefined, "ord-region")).toBe(
    "Order region is not supported; the adapter would place a plain spot order",
  );
  expect(orderRegionReason(undefined, undefined, true)).toBe(
    "Client region is not supported; the adapter would place a plain spot order",
  );
});
