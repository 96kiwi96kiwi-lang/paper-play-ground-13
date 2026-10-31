import { expect, test } from "vitest";
import { orderLegReason } from "@/lib/orders/order-leg";

test("omitted, null, false, and blank leg aliases pass", () => {
  expect(orderLegReason(undefined)).toBeNull();
  expect(orderLegReason(null, null, null)).toBeNull();
  expect(orderLegReason(false, "", "  ")).toBeNull();
});

test("a present leg alias is refused and does not halt", () => {
  expect(orderLegReason("leg-1")).toBe(
    "Leg id is not supported; the adapter would place a plain spot order",
  );
  expect(orderLegReason(0)).toBe(
    "Leg id is not supported; the adapter would place a plain spot order",
  );
  expect(orderLegReason(undefined, "ord-leg")).toBe(
    "Order leg is not supported; the adapter would place a plain spot order",
  );
  expect(orderLegReason(undefined, undefined, true)).toBe(
    "Client leg is not supported; the adapter would place a plain spot order",
  );
});
