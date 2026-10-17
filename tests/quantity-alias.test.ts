import { expect, test } from "vitest";
import { quantityAliasReason } from "@/lib/orders/quantity-alias";

test("omitted, null, and blank quantity aliases pass", () => {
  expect(quantityAliasReason(undefined)).toBeNull();
  expect(quantityAliasReason(null, null, null)).toBeNull();
  expect(quantityAliasReason("", "  ", "\t")).toBeNull();
});

test("present quantity aliases are refused and do not halt", () => {
  expect(quantityAliasReason(1.5)).toBe(
    "Quantity alias is not supported; the adapter reads amount",
  );
  expect(quantityAliasReason(undefined, 2)).toBe(
    "Order quantity alias is not supported; the adapter reads amount",
  );
  expect(quantityAliasReason(undefined, undefined, "0.5")).toBe(
    "Base quantity alias is not supported; the adapter reads amount",
  );
  expect(quantityAliasReason(0)).toBe(
    "Quantity alias is not supported; the adapter reads amount",
  );
});
