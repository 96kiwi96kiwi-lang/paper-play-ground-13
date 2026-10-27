import { expect, test } from "vitest";
import { orderSummaryReason } from "@/lib/orders/order-summary";

test("omitted, null, false, and blank summary aliases pass", () => {
  expect(orderSummaryReason(undefined)).toBeNull();
  expect(orderSummaryReason(null, null, null)).toBeNull();
  expect(orderSummaryReason(false, "", "  ")).toBeNull();
});

test("a present summary alias is refused and does not halt", () => {
  expect(orderSummaryReason("hedge note")).toBe(
    "Order summary is not supported; the adapter would place a plain spot order",
  );
  expect(orderSummaryReason(0)).toBe(
    "Order summary is not supported; the adapter would place a plain spot order",
  );
  expect(orderSummaryReason(undefined, "client memo")).toBe(
    "Order summary alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSummaryReason(undefined, undefined, true)).toBe(
    "Client summary alias is not supported; the adapter would place a plain spot order",
  );
});
