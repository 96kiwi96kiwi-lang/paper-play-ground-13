import { expect, test } from "vitest";
import { stpModeReason } from "@/lib/orders/stp-mode";

test("omitted, blank, and false pass", () => {
  expect(stpModeReason(undefined)).toBeNull();
  expect(stpModeReason(null, null, null)).toBeNull();
  expect(stpModeReason("", "  ", false)).toBeNull();
  expect(stpModeReason(false, false, false)).toBeNull();
});

test("a present STP mode, SMP type, or prevent-self-trade flag is refused and does not halt", () => {
  expect(stpModeReason("cancel_maker")).toBe(
    "STP mode is not supported; the adapter would place without self-trade prevention",
  );
  expect(stpModeReason("cancel_taker")).toBe(
    "STP mode is not supported; the adapter would place without self-trade prevention",
  );
  expect(stpModeReason(undefined, "EXPIRE_TAKER")).toBe(
    "SMP type is not supported; the adapter would place without self-trade prevention",
  );
  expect(stpModeReason(undefined, undefined, true)).toBe(
    "Prevent self trade is not supported; the adapter would place without self-trade prevention",
  );
  expect(stpModeReason(undefined, undefined, 0)).toBe(
    "Prevent self trade is not supported; the adapter would place without self-trade prevention",
  );
});
