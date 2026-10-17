import { expect, test } from "vitest";
import { baseQtyAliasReason } from "@/lib/orders/base-qty-alias";

test("omitted, null, and blank base-qty aliases pass", () => {
  expect(baseQtyAliasReason(undefined)).toBeNull();
  expect(baseQtyAliasReason(null, null, null)).toBeNull();
  expect(baseQtyAliasReason("", "  ", "\t")).toBeNull();
});

test("present base-qty aliases are refused and do not halt", () => {
  expect(baseQtyAliasReason(1.5)).toBe(
    "Base qty alias is not supported; the adapter reads amount",
  );
  expect(baseQtyAliasReason(undefined, 2)).toBe(
    "Order base qty alias is not supported; the adapter reads amount",
  );
  expect(baseQtyAliasReason(undefined, undefined, "0.5")).toBe(
    "Base base qty alias is not supported; the adapter reads amount",
  );
  expect(baseQtyAliasReason(0)).toBe(
    "Base qty alias is not supported; the adapter reads amount",
  );
});
