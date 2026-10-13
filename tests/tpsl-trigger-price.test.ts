import { expect, test } from "vitest";
import { tpslTriggerPriceReason } from "@/lib/orders/tpsl-trigger-price";

test("omitted, blank, and false pass", () => {
  expect(tpslTriggerPriceReason(undefined)).toBeNull();
  expect(tpslTriggerPriceReason(null, null, null)).toBeNull();
  expect(tpslTriggerPriceReason("", "  ", false)).toBeNull();
  expect(tpslTriggerPriceReason(false, false, false)).toBeNull();
});

test("a present TP/SL trigger price is refused and does not halt", () => {
  expect(tpslTriggerPriceReason("101.5")).toBe(
    "Take-profit trigger price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerPriceReason(101.5)).toBe(
    "Take-profit trigger price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerPriceReason(undefined, "99")).toBe(
    "Stop-loss trigger price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerPriceReason(undefined, undefined, "Partial")).toBe(
    "TP/SL trigger price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerPriceReason(undefined, undefined, 0)).toBe(
    "TP/SL trigger price is not supported; the adapter would place a plain spot order",
  );
});
