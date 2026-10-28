import { expect, test } from "vitest";
import { amountAliasReason } from "@/lib/orders/amount-alias";

test("omitted, null, and blank amount aliases pass", () => {
  expect(amountAliasReason(undefined)).toBeNull();
  expect(amountAliasReason(null, null, null)).toBeNull();
  expect(amountAliasReason("", "  ", "\t")).toBeNull();
});

test("present amount aliases are refused and do not halt", () => {
  expect(amountAliasReason(1.5)).toBe(
    "Amt alias is not supported; the adapter reads amount",
  );
  expect(amountAliasReason(undefined, 2)).toBe(
    "Order amt alias is not supported; the adapter reads amount",
  );
  expect(amountAliasReason(undefined, undefined, "0.5")).toBe(
    "Base amt alias is not supported; the adapter reads amount",
  );
  expect(amountAliasReason(0)).toBe(
    "Amt alias is not supported; the adapter reads amount",
  );
});
