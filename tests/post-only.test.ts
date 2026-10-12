import { expect, test } from "vitest";
import { postOnlyReason } from "@/lib/orders/post-only";

test("omitted, null, false, and blank post-only fields pass", () => {
  expect(postOnlyReason(undefined)).toBeNull();
  expect(postOnlyReason(null, null, null)).toBeNull();
  expect(postOnlyReason(false, "", "  ")).toBeNull();
});

test("present post-only fields are refused and do not halt", () => {
  expect(postOnlyReason(true)).toBe(
    "Post only is not supported; the adapter would place a plain order",
  );
  expect(postOnlyReason(undefined, true)).toBe(
    "Post-only flag is not supported; the adapter would place a plain order",
  );
  expect(postOnlyReason(undefined, undefined, "YES")).toBe(
    "Maker only is not supported; the adapter would place a plain order",
  );
  expect(postOnlyReason(1)).toBe(
    "Post only is not supported; the adapter would place a plain order",
  );
});
