import { expect, test } from "vitest";
import { holdingsAliasReason } from "@/lib/orders/holdings-alias";

test("omitted, null, and blank holdings aliases pass", () => {
  expect(holdingsAliasReason(undefined)).toBeNull();
  expect(holdingsAliasReason(null, null, null)).toBeNull();
  expect(holdingsAliasReason("", "  ", "")).toBeNull();
});

test("present holdings aliases are refused and do not halt", () => {
  expect(holdingsAliasReason(1.5)).toBe(
    "Holdings alias is not supported; the adapter reads amount",
  );
  expect(holdingsAliasReason(undefined, "0.1")).toBe(
    "Order holdings alias is not supported; the adapter reads amount",
  );
  expect(holdingsAliasReason(undefined, undefined, 100)).toBe(
    "Base holdings alias is not supported; the adapter reads amount",
  );
  expect(holdingsAliasReason(0)).toBe(
    "Holdings alias is not supported; the adapter reads amount",
  );
});
