import { describe, expect, it } from "vitest";
import { orderGroupReason } from "../src/lib/orders/order-group";
import { submit } from "../src/lib/orders/order-manager";

describe("orderGroupReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderGroupReason()).toBeNull();
    expect(orderGroupReason(undefined, undefined, undefined)).toBeNull();
    expect(orderGroupReason(null, null, null)).toBeNull();
    expect(orderGroupReason(false, false, false)).toBeNull();
    expect(orderGroupReason("", "  ", "")).toBeNull();
  });

  it("refuses a present group", () => {
    expect(orderGroupReason("grid-a")).toMatch(/Order group is not supported/);
    expect(orderGroupReason(1)).toMatch(/Order group is not supported/);
    expect(orderGroupReason(true)).toMatch(/Order group is not supported/);
  });

  it("refuses a present orderGroup alias", () => {
    expect(orderGroupReason(undefined, "bot")).toMatch(/Order group alias is not supported/);
    expect(orderGroupReason(undefined, 0)).toMatch(/Order group alias is not supported/);
  });

  it("refuses a present clientGroup alias", () => {
    expect(orderGroupReason(undefined, undefined, "desk")).toMatch(/Client group alias is not supported/);
  });

  it("is wired into submit before the adapter", () => {
    const result = submit({
      symbol: "BTC/USDT",
      side: "buy",
      amount: 0.001,
      type: "market",
      group: "grid-a",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/Order group is not supported/);
    }
  });
});
