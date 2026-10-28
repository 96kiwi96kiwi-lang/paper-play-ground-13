import { expect, test } from "vitest";
import { sharesAliasReason } from "@/lib/orders/shares-alias";

test("omitted, null, and blank shares aliases pass", () => {
  expect(sharesAliasReason(undefined)).toBeNull();
  expect(sharesAliasReason(null, null, null)).toBeNull();
  expect(sharesAliasReason("", "  ", "\t")).toBeNull();
});

test("present shares aliases are refused and do not halt", () => {
  expect(sharesAliasReason(1.5)).toBe(
    "Shares alias is not supported; the adapter reads amount",
  );
  expect(sharesAliasReason(undefined, 2)).toBe(
    "Order shares alias is not supported; the adapter reads amount",
  );
  expect(sharesAliasReason(undefined, undefined, "0.5")).toBe(
    "Base shares alias is not supported; the adapter reads amount",
  );
  expect(sharesAliasReason(0)).toBe(
    "Shares alias is not supported; the adapter reads amount",
  );
});
