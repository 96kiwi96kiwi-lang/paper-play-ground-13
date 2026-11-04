import { expect, test } from "vitest";
import { orderMemoReason } from "@/lib/orders/order-memo";

test("omitted, null, false, and blank memo aliases pass", () => {
  expect(orderMemoReason(undefined)).toBeNull();
  expect(orderMemoReason(null, null, null)).toBeNull();
  expect(orderMemoReason(false, "", "  ")).toBeNull();
});

test("a present memo alias is refused and does not halt", () => {
  expect(orderMemoReason("hedge note")).toBe(
    "Memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(0)).toBe(
    "Memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(undefined, "ord-memo")).toBe(
    "Order memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(undefined, undefined, true)).toBe(
    "Client memo is not supported; the adapter would place a plain spot order",
  );
});
