import { expect, test } from "vitest";
import { portfolioAliasReason } from "@/lib/orders/portfolio-alias";

test("omitted, null, and blank portfolio aliases pass", () => {
  expect(portfolioAliasReason(undefined)).toBeNull();
  expect(portfolioAliasReason(null, null, null)).toBeNull();
  expect(portfolioAliasReason("", "  ", "")).toBeNull();
});

test("present portfolio aliases are refused and do not halt", () => {
  expect(portfolioAliasReason(1.5)).toBe(
    "Portfolio alias is not supported; the adapter reads amount",
  );
  expect(portfolioAliasReason(undefined, "0.1")).toBe(
    "Order portfolio alias is not supported; the adapter reads amount",
  );
  expect(portfolioAliasReason(undefined, undefined, 100)).toBe(
    "Base portfolio alias is not supported; the adapter reads amount",
  );
  expect(portfolioAliasReason(0)).toBe(
    "Portfolio alias is not supported; the adapter reads amount",
  );
});
