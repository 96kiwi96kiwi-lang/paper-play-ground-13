import { expect, test } from "vitest";
import { sumAliasReason } from "@/lib/orders/sum-alias";

test("omitted, null, and blank sum aliases pass", () => {
  expect(sumAliasReason(undefined)).toBeNull();
  expect(sumAliasReason(null, null, null)).toBeNull();
  expect(sumAliasReason("", "  ", "\t")).toBeNull();
});

test("present sum aliases are refused and do not halt", () => {
  expect(sumAliasReason(1.5)).toBe(
    "Sum alias is not supported; the adapter reads amount",
  );
  expect(sumAliasReason(undefined, 2)).toBe(
    "Order sum alias is not supported; the adapter reads amount",
  );
  expect(sumAliasReason(undefined, undefined, "0.5")).toBe(
    "Base sum alias is not supported; the adapter reads amount",
  );
  expect(sumAliasReason(0)).toBe(
    "Sum alias is not supported; the adapter reads amount",
  );
});
