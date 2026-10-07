import { expect, test } from "vitest";
import { sideEffectReason } from "@/lib/orders/side-effect";

test("omitted, blank, and false pass", () => {
  expect(sideEffectReason(undefined)).toBeNull();
  expect(sideEffectReason(null, null, null)).toBeNull();
  expect(sideEffectReason("", "  ", false)).toBeNull();
  expect(sideEffectReason(false, false, false)).toBeNull();
});

test("a present side effect is refused and does not halt", () => {
  expect(sideEffectReason("MARGIN_BUY")).toBe(
    "Side effect type is not supported; the adapter would place a spot order",
  );
  expect(sideEffectReason("NO_SIDE_EFFECT")).toBe(
    "Side effect type is not supported; the adapter would place a spot order",
  );
  expect(sideEffectReason(undefined, "AUTO_REPAY")).toBe(
    "Side effect is not supported; the adapter would place a spot order",
  );
  expect(sideEffectReason(undefined, undefined, 0)).toBe(
    "Margin effect is not supported; the adapter would place a spot order",
  );
  expect(sideEffectReason(undefined, undefined, "AUTO_BORROW_REPAY")).toBe(
    "Margin effect is not supported; the adapter would place a spot order",
  );
});
