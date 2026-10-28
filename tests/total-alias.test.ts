import { expect, test } from "vitest";
import { totalAliasReason } from "@/lib/orders/total-alias";

test("omitted, null, and blank total aliases pass", () => {
  expect(totalAliasReason(undefined)).toBeNull();
  expect(totalAliasReason(null, null, null)).toBeNull();
  expect(totalAliasReason("", "  ", "\t")).toBeNull();
});

test("present total aliases are refused and do not halt", () => {
  expect(totalAliasReason(1.5)).toBe(
    "Total alias is not supported; the adapter reads amount",
  );
  expect(totalAliasReason(undefined, 2)).toBe(
    "Order total alias is not supported; the adapter reads amount",
  );
  expect(totalAliasReason(undefined, undefined, "0.5")).toBe(
    "Base total alias is not supported; the adapter reads amount",
  );
  expect(totalAliasReason(0)).toBe(
    "Total alias is not supported; the adapter reads amount",
  );
});
