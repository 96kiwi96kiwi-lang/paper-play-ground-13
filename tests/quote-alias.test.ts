import { expect, test } from "vitest";
import { quoteAliasReason } from "@/lib/orders/quote-alias";

test("omitted, null, and blank quote aliases pass", () => {
  expect(quoteAliasReason(undefined)).toBeNull();
  expect(quoteAliasReason(null, null, null)).toBeNull();
  expect(quoteAliasReason("", "  ", "")).toBeNull();
});

test("present quote aliases are refused and do not halt", () => {
  expect(quoteAliasReason(1.5)).toBe(
    "Quote alias is not supported; the adapter reads amount",
  );
  expect(quoteAliasReason(undefined, "0.1")).toBe(
    "Order quote alias is not supported; the adapter reads amount",
  );
  expect(quoteAliasReason(undefined, undefined, 100)).toBe(
    "Base quote alias is not supported; the adapter reads amount",
  );
  expect(quoteAliasReason(0)).toBe(
    "Quote alias is not supported; the adapter reads amount",
  );
});
