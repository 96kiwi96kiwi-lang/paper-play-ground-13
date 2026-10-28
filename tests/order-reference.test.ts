import { expect, test } from "vitest";
import { orderReferenceReason } from "@/lib/orders/order-reference";

test("omitted, blank, and false pass", () => {
  expect(orderReferenceReason(undefined)).toBeNull();
  expect(orderReferenceReason(null, null, null)).toBeNull();
  expect(orderReferenceReason("", "  ", false)).toBeNull();
  expect(orderReferenceReason(false, false, false)).toBeNull();
});

test("a present reference is refused and does not halt", () => {
  expect(orderReferenceReason("grid-ref")).toBe(
    "Order reference is not supported; the adapter would place a plain spot order",
  );
  expect(orderReferenceReason(0)).toBe(
    "Order reference is not supported; the adapter would place a plain spot order",
  );
  expect(orderReferenceReason(undefined, "bybit-ref")).toBe(
    "Order reference alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderReferenceReason(undefined, undefined, "client-ref")).toBe(
    "Client reference alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderReferenceReason(undefined, undefined, true)).toBe(
    "Client reference alias is not supported; the adapter would place a plain spot order",
  );
});
