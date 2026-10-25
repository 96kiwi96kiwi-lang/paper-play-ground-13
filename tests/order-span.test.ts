import { expect, test } from "vitest";
import { orderSpanReason } from "@/lib/orders/order-span";

test("omitted, null, false, and blank span aliases pass", () => {
  expect(orderSpanReason(undefined)).toBeNull();
  expect(orderSpanReason(null, null, null)).toBeNull();
  expect(orderSpanReason(false, "", "  ")).toBeNull();
});

test("a present span alias is refused and does not halt", () => {
  expect(orderSpanReason("span-abc123")).toBe(
    "Span is not supported; the adapter would place a plain spot order",
  );
  expect(orderSpanReason(0)).toBe(
    "Span is not supported; the adapter would place a plain spot order",
  );
  expect(orderSpanReason(undefined, "ord-span")).toBe(
    "Order span is not supported; the adapter would place a plain spot order",
  );
  expect(orderSpanReason(undefined, undefined, true)).toBe(
    "Client span is not supported; the adapter would place a plain spot order",
  );
});
