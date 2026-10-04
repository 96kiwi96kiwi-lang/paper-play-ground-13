import { expect, test } from "vitest";
import { selfTradeReason } from "@/lib/orders/self-trade";

test("omitted, null, and blank STP fields pass", () => {
  expect(selfTradeReason(undefined)).toBeNull();
  expect(selfTradeReason(null, null, null)).toBeNull();
  expect(selfTradeReason("", "  ", "")).toBeNull();
});

test("present STP fields are refused and do not halt", () => {
  expect(selfTradeReason("DC")).toBe(
    "STP is not supported; the adapter would place without self-trade prevention",
  );
  expect(selfTradeReason(undefined, "CO")).toBe(
    "Self-trade prevention is not supported; the adapter would place without it",
  );
  expect(selfTradeReason(undefined, undefined, "CB")).toBe(
    "Self-trade prevention mode is not supported; the adapter would place without it",
  );
  expect(selfTradeReason("CN")).toBe(
    "STP is not supported; the adapter would place without self-trade prevention",
  );
});
