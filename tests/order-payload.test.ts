import { expect, test } from "vitest";
import { orderPayloadReason } from "@/lib/orders/order-payload";

test("omitted, blank, and false pass", () => {
  expect(orderPayloadReason(undefined)).toBeNull();
  expect(orderPayloadReason(null, null, null)).toBeNull();
  expect(orderPayloadReason("", "  ", false)).toBeNull();
  expect(orderPayloadReason(false, false, false)).toBeNull();
});

test("a present payload is refused and does not halt", () => {
  expect(orderPayloadReason("grid-payload")).toBe(
    "Order payload is not supported; the adapter would place a plain spot order",
  );
  expect(orderPayloadReason(0)).toBe(
    "Order payload is not supported; the adapter would place a plain spot order",
  );
  expect(orderPayloadReason(undefined, "bybit-payload")).toBe(
    "Order payload alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPayloadReason(undefined, undefined, "client-payload")).toBe(
    "Client payload alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPayloadReason(undefined, undefined, true)).toBe(
    "Client payload alias is not supported; the adapter would place a plain spot order",
  );
});
