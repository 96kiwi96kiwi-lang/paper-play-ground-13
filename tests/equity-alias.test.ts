import { expect, test } from "vitest";
import { equityAliasReason } from "@/lib/orders/equity-alias";

test("omitted, null, and blank equity aliases pass", () => {
  expect(equityAliasReason(undefined)).toBeNull();
  expect(equityAliasReason(null, null, null)).toBeNull();
  expect(equityAliasReason("", "  ", "")).toBeNull();
});

test("present equity aliases are refused and do not halt", () => {
  expect(equityAliasReason(1.5)).toBe(
    "Equity alias is not supported; the adapter reads amount",
  );
  expect(equityAliasReason(undefined, "0.1")).toBe(
    "Order equity alias is not supported; the adapter reads amount",
  );
  expect(equityAliasReason(undefined, undefined, 100)).toBe(
    "Base equity alias is not supported; the adapter reads amount",
  );
  expect(equityAliasReason(0)).toBe(
    "Equity alias is not supported; the adapter reads amount",
  );
});
