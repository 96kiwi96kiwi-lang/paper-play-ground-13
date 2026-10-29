import { expect, test } from "vitest";
import { orderKindReason } from "@/lib/orders/order-kind";

test("omitted, null, false, and blank kind aliases pass", () => {
  expect(orderKindReason(undefined)).toBeNull();
  expect(orderKindReason(null, null, null)).toBeNull();
  expect(orderKindReason(false, "", "  ")).toBeNull();
});

test("a present kind alias is refused and does not halt", () => {
  expect(orderKindReason("spot")).toBe(
    "Kind is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(0)).toBe(
    "Kind is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, "margin")).toBe(
    "Order kind is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, undefined, true)).toBe(
    "Client kind is not supported; the adapter would place a plain spot order",
  );
});
