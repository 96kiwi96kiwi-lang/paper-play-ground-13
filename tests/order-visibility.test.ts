import { expect, test } from "vitest";
import { orderVisibilityReason } from "@/lib/orders/order-visibility";

test("omitted, blank, and false pass", () => {
  expect(orderVisibilityReason(undefined)).toBeNull();
  expect(orderVisibilityReason(null, null, null)).toBeNull();
  expect(orderVisibilityReason("", "  ", false)).toBeNull();
  expect(orderVisibilityReason(false, false, false)).toBeNull();
});

test("a present visibility is refused and does not halt", () => {
  expect(orderVisibilityReason("public")).toBe(
    "Order visibility is not supported; the adapter would place a plain spot order",
  );
  expect(orderVisibilityReason(0)).toBe(
    "Order visibility is not supported; the adapter would place a plain spot order",
  );
  expect(orderVisibilityReason(undefined, "private")).toBe(
    "Order visibility alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderVisibilityReason(undefined, undefined, "client-hidden")).toBe(
    "Client visibility alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderVisibilityReason(undefined, undefined, true)).toBe(
    "Client visibility alias is not supported; the adapter would place a plain spot order",
  );
});
