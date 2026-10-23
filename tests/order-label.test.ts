import { describe, expect, it } from "vitest";
import { orderLabelReason } from "../src/lib/orders/order-label";
import { submit } from "../src/lib/orders/order-manager";

describe("orderLabelReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderLabelReason()).toBeNull();
    expect(orderLabelReason(undefined, undefined, undefined)).toBeNull();
    expect(orderLabelReason(null, null, null)).toBeNull();
    expect(orderLabelReason(false, false, false)).toBeNull();
    expect(orderLabelReason("", "  ", "")).toBeNull();
  });

  it("refuses a present label", () => {
    expect(orderLabelReason("grid-a")).toMatch(/Order label is not supported/);
    expect(orderLabelReason(1)).toMatch(/Order label is not supported/);
    expect(orderLabelReason(true)).toMatch(/Order label is not supported/);
  });

  it("refuses a present orderLabel alias", () => {
    expect(orderLabelReason(undefined, "bot")).toMatch(/Order label alias is not supported/);
    expect(orderLabelReason(undefined, 0)).toMatch(/Order label alias is not supported/);
  });

  it("refuses a present clientLabel alias", () => {
    expect(orderLabelReason(undefined, undefined, "desk")).toMatch(/Client label alias is not supported/);
  });

  it("is wired into submit before the adapter", () => {
    const result = submit({
      symbol: "BTC/USDT",
      side: "buy",
      amount: 0.001,
      type: "market",
      label: "grid-a",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/Order label is not supported/);
    }
  });
});
