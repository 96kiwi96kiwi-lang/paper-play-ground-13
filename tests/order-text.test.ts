import { expect, test } from "vitest";
import { orderTextReason } from "@/lib/orders/order-text";

test("omitted, blank, and false pass", () => {
  expect(orderTextReason(undefined)).toBeNull();
  expect(orderTextReason(null, null, null)).toBeNull();
  expect(orderTextReason("", "  ", false)).toBeNull();
  expect(orderTextReason(false, false, false)).toBeNull();
});

test("a present text is refused and does not halt", () => {
  expect(orderTextReason("grid-text")).toBe(
    "Order text is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(0)).toBe(
    "Order text is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, "bybit-text")).toBe(
    "Order text alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, undefined, "client-text")).toBe(
    "Client text alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, undefined, true)).toBe(
    "Client text alias is not supported; the adapter would place a plain spot order",
  );
});
