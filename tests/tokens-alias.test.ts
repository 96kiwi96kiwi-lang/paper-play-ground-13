import { expect, test } from "vitest";
import { tokensAliasReason } from "@/lib/orders/tokens-alias";

test("omitted, null, and blank tokens aliases pass", () => {
  expect(tokensAliasReason(undefined)).toBeNull();
  expect(tokensAliasReason(null, null, null)).toBeNull();
  expect(tokensAliasReason("", "  ", "")).toBeNull();
});

test("present tokens aliases are refused and do not halt", () => {
  expect(tokensAliasReason(1.5)).toBe(
    "Tokens alias is not supported; the adapter reads amount",
  );
  expect(tokensAliasReason(undefined, "0.1")).toBe(
    "Order tokens alias is not supported; the adapter reads amount",
  );
  expect(tokensAliasReason(undefined, undefined, 100)).toBe(
    "Base tokens alias is not supported; the adapter reads amount",
  );
  expect(tokensAliasReason(0)).toBe(
    "Tokens alias is not supported; the adapter reads amount",
  );
});
