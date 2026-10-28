import { expect, test } from "vitest";
import { balancesAliasReason } from "@/lib/orders/balances-alias";

test("omitted, null, and blank balances aliases pass", () => {
  expect(balancesAliasReason(undefined)).toBeNull();
  expect(balancesAliasReason(null, null, null)).toBeNull();
  expect(balancesAliasReason("", "  ", "")).toBeNull();
});

test("present balances aliases are refused and do not halt", () => {
  expect(balancesAliasReason(1.5)).toBe(
    "Balances alias is not supported; the adapter reads amount",
  );
  expect(balancesAliasReason(undefined, "0.1")).toBe(
    "Order balances alias is not supported; the adapter reads amount",
  );
  expect(balancesAliasReason(undefined, undefined, 100)).toBe(
    "Base balances alias is not supported; the adapter reads amount",
  );
  expect(balancesAliasReason(0)).toBe(
    "Balances alias is not supported; the adapter reads amount",
  );
});
