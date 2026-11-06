import { expect, test } from "vitest";
import { orderWindowReason } from "@/lib/orders/order-window";

test("omitted, blank, and false pass", () => {
  expect(orderWindowReason(undefined)).toBeNull();
  expect(orderWindowReason(null, null, null)).toBeNull();
  expect(orderWindowReason("", "  ", false)).toBeNull();
  expect(orderWindowReason(false, false, false)).toBeNull();
});

test("a present window is refused and does not halt", () => {
  expect(orderWindowReason("1h")).toBe(
    "Order window is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(0)).toBe(
    "Order window is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(undefined, "session")).toBe(
    "Order window alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(undefined, undefined, "client-window")).toBe(
    "Client window alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(undefined, undefined, true)).toBe(
    "Client window alias is not supported; the adapter would place a plain spot order",
  );
});
