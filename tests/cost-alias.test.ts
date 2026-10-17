import { expect, test } from "vitest";
import { costAliasReason } from "@/lib/orders/cost-alias";

test("omitted, null, and blank cost aliases pass", () => {
  expect(costAliasReason(undefined)).toBeNull();
  expect(costAliasReason(null, null, null)).toBeNull();
  expect(costAliasReason("", "  ", "\t")).toBeNull();
});

test("present cost aliases are refused and do not halt", () => {
  expect(costAliasReason(1.5)).toBe(
    "Cost alias is not supported; the adapter reads amount",
  );
  expect(costAliasReason(undefined, 2)).toBe(
    "Order cost alias is not supported; the adapter reads amount",
  );
  expect(costAliasReason(undefined, undefined, "0.5")).toBe(
    "Base cost alias is not supported; the adapter reads amount",
  );
  expect(costAliasReason(0)).toBe(
    "Cost alias is not supported; the adapter reads amount",
  );
});
