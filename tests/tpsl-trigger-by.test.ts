import { expect, test } from "vitest";
import { tpslTriggerByReason } from "@/lib/orders/tpsl-trigger-by";

test("omitted, blank, and false pass", () => {
  expect(tpslTriggerByReason(undefined)).toBeNull();
  expect(tpslTriggerByReason(null, null, null)).toBeNull();
  expect(tpslTriggerByReason("", "  ", false)).toBeNull();
  expect(tpslTriggerByReason(false, false, false)).toBeNull();
});

test("a present TP/SL trigger source is refused and does not halt", () => {
  expect(tpslTriggerByReason("MarkPrice")).toBe(
    "Take-profit trigger source is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerByReason("LastPrice")).toBe(
    "Take-profit trigger source is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerByReason(undefined, "IndexPrice")).toBe(
    "Stop-loss trigger source is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerByReason(undefined, undefined, "mark")).toBe(
    "Trigger price type is not supported; the adapter would place a plain spot order",
  );
  expect(tpslTriggerByReason(undefined, undefined, 0)).toBe(
    "Trigger price type is not supported; the adapter would place a plain spot order",
  );
});
