import { expect, test } from "vitest";
import { normalizeOrderSide } from "@/lib/orders/side-form";

test("mixed case and surrounding space map to buy or sell", () => {
  expect(normalizeOrderSide("BUY")).toEqual({ side: "buy" });
  expect(normalizeOrderSide("  Sell  ")).toEqual({ side: "sell" });
  expect(normalizeOrderSide("buy")).toEqual({ side: "buy" });
});

test("an unknown side is refused and does not halt", () => {
  const reason = normalizeOrderSide("long");
  expect(reason).toEqual({ reason: "Unsupported side: long" });
  expect("reason" in reason && reason.reason).toMatch(/Unsupported side/);
});

test("blank and non-string input is refused", () => {
  const blank = normalizeOrderSide("   ");
  expect("reason" in blank).toBe(true);
  if ("reason" in blank) expect(blank.reason).toMatch(/^Unsupported side:/);
  const missing = normalizeOrderSide(undefined);
  expect(missing).toEqual({ reason: "Unsupported side: (blank)" });
});
