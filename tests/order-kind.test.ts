import { expect, test } from "vitest";
import { orderKindReason } from "@/lib/orders/order-kind";

test("omitted, blank, and false pass", () => {
  expect(orderKindReason(undefined)).toBeNull();
  expect(orderKindReason(null, null, null)).toBeNull();
  expect(orderKindReason("", "  ", false)).toBeNull();
  expect(orderKindReason(false, false, false)).toBeNull();
});

test("a present kind is refused and does not halt", () => {
  expect(orderKindReason("grid-kind")).toBe(
    "Order kind is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(0)).toBe(
    "Order kind is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, "bybit-kind")).toBe(
    "Order kind alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, undefined, "client-kind")).toBe(
    "Client kind alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, undefined, true)).toBe(
    "Client kind alias is not supported; the adapter would place a plain spot order",
  );
});
