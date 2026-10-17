import { expect, test } from "vitest";
import { countAliasReason } from "@/lib/orders/count-alias";

test("omitted, null, and blank count aliases pass", () => {
  expect(countAliasReason(undefined)).toBeNull();
  expect(countAliasReason(null, null, null)).toBeNull();
  expect(countAliasReason("", "  ", "\t")).toBeNull();
});

test("present count aliases are refused and do not halt", () => {
  expect(countAliasReason(1.5)).toBe(
    "Count alias is not supported; the adapter reads amount",
  );
  expect(countAliasReason(undefined, 2)).toBe(
    "Order count alias is not supported; the adapter reads amount",
  );
  expect(countAliasReason(undefined, undefined, "0.5")).toBe(
    "Base count alias is not supported; the adapter reads amount",
  );
  expect(countAliasReason(0)).toBe(
    "Count alias is not supported; the adapter reads amount",
  );
});
