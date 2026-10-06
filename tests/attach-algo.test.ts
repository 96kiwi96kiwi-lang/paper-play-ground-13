import { expect, test } from "vitest";
import { attachAlgoReason } from "@/lib/orders/attach-algo";

test("omitted, null, false, blank, and empty attach lists pass", () => {
  expect(attachAlgoReason(undefined)).toBeNull();
  expect(attachAlgoReason(null, null, null)).toBeNull();
  expect(attachAlgoReason(false, "", "  ")).toBeNull();
  expect(attachAlgoReason([])).toBeNull();
});

test("a present attached bracket is refused and does not halt", () => {
  expect(attachAlgoReason([{ tpTriggerPx: "1" }])).toBe(
    "Attached algo is not supported; the adapter would place a plain spot order",
  );
  expect(attachAlgoReason(0)).toBe(
    "Attached algo is not supported; the adapter would place a plain spot order",
  );
  expect(attachAlgoReason(undefined, "10")).toBe(
    "Take-profit trigger is not supported; the adapter would place a plain spot order",
  );
  expect(attachAlgoReason(undefined, undefined, 0)).toBe(
    "Stop-loss trigger is not supported; the adapter would place a plain spot order",
  );
});
