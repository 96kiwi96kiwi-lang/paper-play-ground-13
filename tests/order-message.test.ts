import { expect, test } from "vitest";
import { orderMessageReason } from "@/lib/orders/order-message";

test("omitted, blank, and false pass", () => {
  expect(orderMessageReason(undefined)).toBeNull();
  expect(orderMessageReason(null, null, null)).toBeNull();
  expect(orderMessageReason("", "  ", false)).toBeNull();
  expect(orderMessageReason(false, false, false)).toBeNull();
});

test("a present message is refused and does not halt", () => {
  expect(orderMessageReason("grid-msg")).toBe(
    "Order message is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(0)).toBe(
    "Order message is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(undefined, "bybit-msg")).toBe(
    "Order message alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(undefined, undefined, "client-msg")).toBe(
    "Client message alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(undefined, undefined, true)).toBe(
    "Client message alias is not supported; the adapter would place a plain spot order",
  );
});
