import { expect, test } from "vitest";
import { unitsAliasReason } from "@/lib/orders/units-alias";

test("omitted, null, and blank units aliases pass", () => {
  expect(unitsAliasReason(undefined)).toBeNull();
  expect(unitsAliasReason(null, null, null)).toBeNull();
  expect(unitsAliasReason("", "  ", "\t")).toBeNull();
});

test("present units aliases are refused and do not halt", () => {
  expect(unitsAliasReason(1.5)).toBe(
    "Units alias is not supported; the adapter reads amount",
  );
  expect(unitsAliasReason(undefined, 2)).toBe(
    "Order units alias is not supported; the adapter reads amount",
  );
  expect(unitsAliasReason(undefined, undefined, "0.5")).toBe(
    "Base units alias is not supported; the adapter reads amount",
  );
  expect(unitsAliasReason(0)).toBe(
    "Units alias is not supported; the adapter reads amount",
  );
});
