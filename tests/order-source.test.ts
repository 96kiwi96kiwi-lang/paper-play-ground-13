import { describe, expect, it } from "vitest";
import { orderSourceReason } from "../src/lib/orders/order-source";

describe("orderSourceReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderSourceReason()).toBeNull();
    expect(orderSourceReason(undefined, undefined, undefined)).toBeNull();
    expect(orderSourceReason(null, null, null)).toBeNull();
    expect(orderSourceReason(false, false, false)).toBeNull();
    expect(orderSourceReason("", "  ", "")).toBeNull();
  });

  it("refuses a present source", () => {
    expect(orderSourceReason("web")).toMatch(/Order source is not supported/);
    expect(orderSourceReason(1)).toMatch(/Order source is not supported/);
    expect(orderSourceReason(true)).toMatch(/Order source is not supported/);
  });

  it("refuses a present orderSource alias", () => {
    expect(orderSourceReason(undefined, "api")).toMatch(/Order source alias is not supported/);
    expect(orderSourceReason(undefined, 0)).toMatch(/Order source alias is not supported/);
  });

  it("refuses a present src alias", () => {
    expect(orderSourceReason(undefined, undefined, "mobile")).toMatch(/Source alias is not supported/);
  });
});
