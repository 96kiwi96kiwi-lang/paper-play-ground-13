import { expect, test } from "vitest";
import { tpslOrderPriceReason } from "@/lib/orders/tpsl-order-price";

test("omitted, blank, and false pass", () => {
  expect(tpslOrderPriceReason(undefined)).toBeNull();
  expect(tpslOrderPriceReason(null, null, null)).toBeNull();
  expect(tpslOrderPriceReason("", "  ", false)).toBeNull();
  expect(tpslOrderPriceReason(false, false, false)).toBeNull();
});

test("a present TP/SL order price is refused and does not halt", () => {
  expect(tpslOrderPriceReason("101.5")).toBe(
    "Take-profit order price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderPriceReason(101.5)).toBe(
    "Take-profit order price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderPriceReason(undefined, "99")).toBe(
    "Stop-loss order price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderPriceReason(undefined, undefined, "Partial")).toBe(
    "TP/SL order price is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderPriceReason(undefined, undefined, 0)).toBe(
    "TP/SL order price is not supported; the adapter would place a plain spot order",
  );
});
