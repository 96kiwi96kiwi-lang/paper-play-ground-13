import { expect, test } from "vitest";
import { notionalAliasReason } from "@/lib/orders/notional-alias";

test("omitted, null, and blank notional aliases pass", () => {
  expect(notionalAliasReason(undefined)).toBeNull();
  expect(notionalAliasReason(null, null, null)).toBeNull();
  expect(notionalAliasReason("", "  ", "\t")).toBeNull();
});

test("present notional aliases are refused and do not halt", () => {
  expect(notionalAliasReason(1.5)).toBe(
    "Notional alias is not supported; the adapter reads amount",
  );
  expect(notionalAliasReason(undefined, 2)).toBe(
    "Order notional alias is not supported; the adapter reads amount",
  );
  expect(notionalAliasReason(undefined, undefined, "0.5")).toBe(
    "Base notional alias is not supported; the adapter reads amount",
  );
  expect(notionalAliasReason(0)).toBe(
    "Notional alias is not supported; the adapter reads amount",
  );
});
