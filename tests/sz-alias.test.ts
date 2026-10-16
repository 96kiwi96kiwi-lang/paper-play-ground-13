import { expect, test } from "vitest";
import { szAliasReason } from "@/lib/orders/sz-alias";

test("omitted, null, and blank sz aliases pass", () => {
  expect(szAliasReason(undefined)).toBeNull();
  expect(szAliasReason(null, null, null)).toBeNull();
  expect(szAliasReason("", "  ", "\t")).toBeNull();
});

test("present sz aliases are refused and do not halt", () => {
  expect(szAliasReason("0.01")).toBe(
    "Sz alias is not supported; the adapter reads amount",
  );
  expect(szAliasReason(undefined, "0.02")).toBe(
    "Order sz alias is not supported; the adapter reads amount",
  );
  expect(szAliasReason(undefined, undefined, "0.03")).toBe(
    "Sz value alias is not supported; the adapter reads amount",
  );
  expect(szAliasReason(0)).toBe(
    "Sz alias is not supported; the adapter reads amount",
  );
});
