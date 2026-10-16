import { expect, test } from "vitest";
import { sideAliasReason } from "@/lib/orders/side-alias";

test("omitted, null, and blank side aliases pass", () => {
  expect(sideAliasReason(undefined)).toBeNull();
  expect(sideAliasReason(null, null, null)).toBeNull();
  expect(sideAliasReason("", "  ", "")).toBeNull();
});

test("present side aliases are refused and do not halt", () => {
  expect(sideAliasReason("BUY")).toBe(
    "Order side alias is not supported; the adapter reads side",
  );
  expect(sideAliasReason(undefined, "long")).toBe(
    "Direction is not supported; the adapter reads side",
  );
  expect(sideAliasReason(undefined, undefined, "open")).toBe(
    "Action is not supported; the adapter reads side",
  );
  expect(sideAliasReason(0)).toBe(
    "Order side alias is not supported; the adapter reads side",
  );
});
