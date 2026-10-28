import { expect, test } from "vitest";
import { valueAliasReason } from "@/lib/orders/value-alias";

test("omitted, null, and blank value aliases pass", () => {
  expect(valueAliasReason(undefined)).toBeNull();
  expect(valueAliasReason(null, null, null)).toBeNull();
  expect(valueAliasReason("", "  ", "\t")).toBeNull();
});

test("present value aliases are refused and do not halt", () => {
  expect(valueAliasReason(1.5)).toBe(
    "Value alias is not supported; the adapter reads amount",
  );
  expect(valueAliasReason(undefined, 2)).toBe(
    "Order value alias is not supported; the adapter reads amount",
  );
  expect(valueAliasReason(undefined, undefined, "0.5")).toBe(
    "Base value alias is not supported; the adapter reads amount",
  );
  expect(valueAliasReason(0)).toBe(
    "Value alias is not supported; the adapter reads amount",
  );
});
