import { expect, test } from "vitest";
import { cryptoAliasReason } from "@/lib/orders/crypto-alias";

test("omitted, null, and blank crypto aliases pass", () => {
  expect(cryptoAliasReason(undefined)).toBeNull();
  expect(cryptoAliasReason(null, null, null)).toBeNull();
  expect(cryptoAliasReason("", "  ", "")).toBeNull();
});

test("present crypto aliases are refused and do not halt", () => {
  expect(cryptoAliasReason(1.5)).toBe(
    "Crypto alias is not supported; the adapter reads amount",
  );
  expect(cryptoAliasReason(undefined, "0.1")).toBe(
    "Order crypto alias is not supported; the adapter reads amount",
  );
  expect(cryptoAliasReason(undefined, undefined, 100)).toBe(
    "Base crypto alias is not supported; the adapter reads amount",
  );
  expect(cryptoAliasReason(0)).toBe(
    "Crypto alias is not supported; the adapter reads amount",
  );
});
