import { expect, test } from "vitest";
import { orderScopeReason } from "@/lib/orders/order-scope";

test("omitted, blank, and false pass", () => {
  expect(orderScopeReason(undefined)).toBeNull();
  expect(orderScopeReason(null, null, null)).toBeNull();
  expect(orderScopeReason("", "  ", false)).toBeNull();
  expect(orderScopeReason(false, false, false)).toBeNull();
});

test("a present scope is refused and does not halt", () => {
  expect(orderScopeReason("public")).toBe(
    "Order scope is not supported; the adapter would place a plain spot order",
  );
  expect(orderScopeReason(0)).toBe(
    "Order scope is not supported; the adapter would place a plain spot order",
  );
  expect(orderScopeReason(undefined, "vip")).toBe(
    "Order scope alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderScopeReason(undefined, undefined, "client-only")).toBe(
    "Client scope alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderScopeReason(undefined, undefined, true)).toBe(
    "Client scope alias is not supported; the adapter would place a plain spot order",
  );
});
