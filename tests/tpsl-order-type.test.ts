import { expect, test } from "vitest";
import { tpslOrderTypeReason } from "@/lib/orders/tpsl-order-type";

test("omitted, blank, and false pass", () => {
  expect(tpslOrderTypeReason(undefined)).toBeNull();
  expect(tpslOrderTypeReason(null, null, null)).toBeNull();
  expect(tpslOrderTypeReason("", "  ", false)).toBeNull();
  expect(tpslOrderTypeReason(false, false, false)).toBeNull();
});

test("a present TP/SL order type is refused and does not halt", () => {
  expect(tpslOrderTypeReason("Limit")).toBe(
    "Take-profit order type is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderTypeReason("Market")).toBe(
    "Take-profit order type is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderTypeReason(undefined, "Market")).toBe(
    "Stop-loss order type is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderTypeReason(undefined, undefined, "Partial")).toBe(
    "TP/SL mode is not supported; the adapter would place a plain spot order",
  );
  expect(tpslOrderTypeReason(undefined, undefined, 0)).toBe(
    "TP/SL mode is not supported; the adapter would place a plain spot order",
  );
});
