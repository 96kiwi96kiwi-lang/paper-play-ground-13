import { expect, test } from "vitest";
import { orderWeightReason } from "@/lib/orders/order-weight";

test("omitted, blank, and false pass", () => {
  expect(orderWeightReason(undefined)).toBeNull();
  expect(orderWeightReason(null, null, null)).toBeNull();
  expect(orderWeightReason("", "  ", false)).toBeNull();
  expect(orderWeightReason(false, false, false)).toBeNull();
});

test("a present weight is refused and does not halt", () => {
  expect(orderWeightReason("high")).toBe(
    "Order weight is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(0)).toBe(
    "Order weight is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(undefined, "medium")).toBe(
    "Order weight alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(undefined, undefined, "client-low")).toBe(
    "Client weight alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(undefined, undefined, true)).toBe(
    "Client weight alias is not supported; the adapter would place a plain spot order",
  );
});
