import { expect, test } from "vitest";
import { postOnlyAliasReason } from "@/lib/orders/post-only-alias";

test("omitted, null, blank, and false post-only aliases pass", () => {
  expect(postOnlyAliasReason(undefined)).toBeNull();
  expect(postOnlyAliasReason(null, null, null)).toBeNull();
  expect(postOnlyAliasReason("", "  ", false)).toBeNull();
});

test("present post-only aliases are refused and do not halt", () => {
  expect(postOnlyAliasReason(true)).toBe(
    "Post only alias is not supported; the adapter reads postOnly",
  );
  expect(postOnlyAliasReason(undefined, "maker")).toBe(
    "Maker only is not supported; the adapter reads postOnly",
  );
  expect(postOnlyAliasReason(undefined, undefined, 1)).toBe(
    "Time in force post only is not supported; the adapter reads postOnly",
  );
});
