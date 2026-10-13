import { expect, test } from "vitest";
import { goodTillTimeReason } from "@/lib/orders/good-till-time";

test("omitted, blank, and false pass", () => {
  expect(goodTillTimeReason(undefined)).toBeNull();
  expect(goodTillTimeReason(null, null, null)).toBeNull();
  expect(goodTillTimeReason("", "  ", false)).toBeNull();
  expect(goodTillTimeReason(false, false, false)).toBeNull();
});

test("a present good-till time is refused and does not halt", () => {
  expect(goodTillTimeReason(1_700_000_000_000)).toBe(
    "Good till time is not supported; the adapter would rest the order",
  );
  expect(goodTillTimeReason("2026-10-09T12:00:00Z")).toBe(
    "Good till time is not supported; the adapter would rest the order",
  );
  expect(goodTillTimeReason(undefined, "gtd")).toBe(
    "GTD is not supported; the adapter would rest the order",
  );
  expect(goodTillTimeReason(undefined, undefined, 0)).toBe(
    "Expire-at is not supported; the adapter would rest the order",
  );
});
