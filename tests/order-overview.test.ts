import { expect, test } from "vitest";
import { orderOverviewReason } from "@/lib/orders/order-overview";

test("omitted, null, false, and blank overview aliases pass", () => {
  expect(orderOverviewReason(undefined)).toBeNull();
  expect(orderOverviewReason(null, null, null)).toBeNull();
  expect(orderOverviewReason(false, "", "  ")).toBeNull();
});

test("a present overview alias is refused and does not halt", () => {
  expect(orderOverviewReason("hedge note")).toBe(
    "Order overview is not supported; the adapter would place a plain spot order",
  );
  expect(orderOverviewReason(0)).toBe(
    "Order overview is not supported; the adapter would place a plain spot order",
  );
  expect(orderOverviewReason(undefined, "client memo")).toBe(
    "Order overview alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderOverviewReason(undefined, undefined, true)).toBe(
    "Client overview alias is not supported; the adapter would place a plain spot order",
  );
});
