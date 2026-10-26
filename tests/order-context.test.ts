import { expect, test } from "vitest";
import { orderContextReason } from "@/lib/orders/order-context";

test("omitted, null, false, and blank context aliases pass", () => {
  expect(orderContextReason(undefined)).toBeNull();
  expect(orderContextReason(null, null, null)).toBeNull();
  expect(orderContextReason(false, "", "  ")).toBeNull();
});

test("a present context alias is refused and does not halt", () => {
  expect(orderContextReason("hedge note")).toBe(
    "Context is not supported; the adapter would place a plain spot order",
  );
  expect(orderContextReason(0)).toBe(
    "Context is not supported; the adapter would place a plain spot order",
  );
  expect(orderContextReason(undefined, "client memo")).toBe(
    "Order context is not supported; the adapter would place a plain spot order",
  );
  expect(orderContextReason(undefined, undefined, true)).toBe(
    "Client context is not supported; the adapter would place a plain spot order",
  );
});
