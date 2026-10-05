import { expect, test } from "vitest";
import { orderTypeAliasReason } from "@/lib/orders/order-type-alias";

test("omitted, null, and blank order-type aliases pass", () => {
  expect(orderTypeAliasReason(undefined)).toBeNull();
  expect(orderTypeAliasReason(null, null, null)).toBeNull();
  expect(orderTypeAliasReason("", "  ", "\t")).toBeNull();
});

test("present order-type aliases are refused and do not halt", () => {
  expect(orderTypeAliasReason("limit")).toBe(
    "Ord type is not supported; the adapter reads type",
  );
  expect(orderTypeAliasReason(undefined, "market")).toBe(
    "Order type alias is not supported; the adapter reads type",
  );
  expect(orderTypeAliasReason(undefined, undefined, "limit")).toBe(
    "Order type snake alias is not supported; the adapter reads type",
  );
  expect(orderTypeAliasReason(0)).toBe(
    "Ord type is not supported; the adapter reads type",
  );
});
