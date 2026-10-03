import { expect, test } from "vitest";
import { postOnlyReason } from "@/lib/orders/post-only";

test("omitted and false pass", () => {
  expect(postOnlyReason(undefined)).toBeNull();
  expect(postOnlyReason(null)).toBeNull();
  expect(postOnlyReason(false)).toBeNull();
});

test("true is refused and does not halt", () => {
  expect(postOnlyReason(true)).toBe(
    "Post-only is not supported; the adapter would place a normal order",
  );
});

test("a non-boolean post-only flag is refused", () => {
  expect(postOnlyReason("true")).toBe("Post-only must be omitted or false");
  expect(postOnlyReason(1)).toBe("Post-only must be omitted or false");
});
