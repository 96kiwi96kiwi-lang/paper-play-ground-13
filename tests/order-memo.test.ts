import { expect, test } from "vitest";
import { orderMemoReason } from "@/lib/orders/order-memo";

test("omitted, blank, and false pass", () => {
  expect(orderMemoReason(undefined)).toBeNull();
  expect(orderMemoReason(null, null, null)).toBeNull();
  expect(orderMemoReason("", "  ", false)).toBeNull();
  expect(orderMemoReason(false, false, false)).toBeNull();
});

test("a present memo is refused and does not halt", () => {
  expect(orderMemoReason("grid-memo")).toBe(
    "Order memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(0)).toBe(
    "Order memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(undefined, "bybit-memo")).toBe(
    "Order memo alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(undefined, undefined, "client-memo")).toBe(
    "Client memo alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(undefined, undefined, true)).toBe(
    "Client memo alias is not supported; the adapter would place a plain spot order",
  );
});
