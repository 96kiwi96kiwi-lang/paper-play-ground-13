import { expect, test } from "vitest";
import { riskAliasReason } from "@/lib/orders/risk-alias";

test("omitted, null, and blank risk aliases pass", () => {
  expect(riskAliasReason(undefined)).toBeNull();
  expect(riskAliasReason(null, null, null)).toBeNull();
  expect(riskAliasReason("", "  ", "\t")).toBeNull();
});

test("present risk aliases are refused and do not halt", () => {
  expect(riskAliasReason(1.5)).toBe(
    "Risk alias is not supported; the adapter reads amount",
  );
  expect(riskAliasReason(undefined, 2)).toBe(
    "Order risk alias is not supported; the adapter reads amount",
  );
  expect(riskAliasReason(undefined, undefined, "0.5")).toBe(
    "Base risk alias is not supported; the adapter reads amount",
  );
  expect(riskAliasReason(0)).toBe(
    "Risk alias is not supported; the adapter reads amount",
  );
});
