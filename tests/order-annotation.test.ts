import { expect, test } from "vitest";
import { orderAnnotationReason } from "@/lib/orders/order-annotation";

test("omitted, blank, and false pass", () => {
  expect(orderAnnotationReason(undefined)).toBeNull();
  expect(orderAnnotationReason(null, null, null)).toBeNull();
  expect(orderAnnotationReason("", "  ", false)).toBeNull();
  expect(orderAnnotationReason(false, false, false)).toBeNull();
});

test("a present annotation is refused and does not halt", () => {
  expect(orderAnnotationReason("grid-ann")).toBe(
    "Order annotation is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(0)).toBe(
    "Order annotation is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(undefined, "bybit-ann")).toBe(
    "Order annotation alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(undefined, undefined, "client-ann")).toBe(
    "Client annotation alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(undefined, undefined, true)).toBe(
    "Client annotation alias is not supported; the adapter would place a plain spot order",
  );
});
