import { describe, expect, it } from "vitest";
import { orderDescriptionReason } from "../src/lib/orders/order-description";
import { submit } from "../src/lib/orders/order-manager";

describe("orderDescriptionReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderDescriptionReason()).toBeNull();
    expect(orderDescriptionReason(undefined, undefined, undefined)).toBeNull();
    expect(orderDescriptionReason(null, null, null)).toBeNull();
    expect(orderDescriptionReason(false, false, false)).toBeNull();
    expect(orderDescriptionReason("", "  ", "")).toBeNull();
  });

  it("refuses a present description", () => {
    expect(orderDescriptionReason("grid-a")).toMatch(/Order description is not supported/);
    expect(orderDescriptionReason(1)).toMatch(/Order description is not supported/);
    expect(orderDescriptionReason(true)).toMatch(/Order description is not supported/);
  });

  it("refuses a present orderDescription alias", () => {
    expect(orderDescriptionReason(undefined, "bot")).toMatch(/Order description alias is not supported/);
    expect(orderDescriptionReason(undefined, 0)).toMatch(/Order description alias is not supported/);
  });

  it("refuses a present clientDescription alias", () => {
    expect(orderDescriptionReason(undefined, undefined, "desk")).toMatch(/Client description alias is not supported/);
  });

  it("is wired into submit before the adapter", () => {
    const result = submit({
      symbol: "BTC/USDT",
      side: "buy",
      amount: 0.001,
      type: "market",
      description: "grid-a",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/Order description is not supported/);
    }
  });
});
