import { expect, test } from "vitest";
import { navAliasReason } from "@/lib/orders/nav-alias";

test("omitted, null, and blank nav aliases pass", () => {
  expect(navAliasReason(undefined)).toBeNull();
  expect(navAliasReason(null, null, null)).toBeNull();
  expect(navAliasReason("", "  ", "")).toBeNull();
});

test("present nav aliases are refused and do not halt", () => {
  expect(navAliasReason(1.5)).toBe(
    "Nav alias is not supported; the adapter reads amount",
  );
  expect(navAliasReason(undefined, "0.1")).toBe(
    "Order nav alias is not supported; the adapter reads amount",
  );
  expect(navAliasReason(undefined, undefined, 100)).toBe(
    "Base nav alias is not supported; the adapter reads amount",
  );
  expect(navAliasReason(0)).toBe(
    "Nav alias is not supported; the adapter reads amount",
  );
});
