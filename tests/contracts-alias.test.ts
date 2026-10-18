import { expect, test } from "vitest";
import { contractsAliasReason } from "@/lib/orders/contracts-alias";

test("omitted, null, and blank contracts aliases pass", () => {
  expect(contractsAliasReason(undefined)).toBeNull();
  expect(contractsAliasReason(null, null, null)).toBeNull();
  expect(contractsAliasReason("", "  ", "")).toBeNull();
});

test("present contracts aliases are refused and do not halt", () => {
  expect(contractsAliasReason(1.5)).toBe(
    "Contracts alias is not supported; the adapter reads amount",
  );
  expect(contractsAliasReason(undefined, "0.1")).toBe(
    "Order contracts alias is not supported; the adapter reads amount",
  );
  expect(contractsAliasReason(undefined, undefined, 100)).toBe(
    "Base contracts alias is not supported; the adapter reads amount",
  );
  expect(contractsAliasReason(0)).toBe(
    "Contracts alias is not supported; the adapter reads amount",
  );
});
