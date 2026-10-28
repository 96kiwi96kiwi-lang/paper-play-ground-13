import { describe, expect, it } from "vitest";
import { orderOriginReason } from "../src/lib/orders/order-origin";

describe("orderOriginReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderOriginReason()).toBeNull();
    expect(orderOriginReason(undefined, undefined, undefined)).toBeNull();
    expect(orderOriginReason(null, null, null)).toBeNull();
    expect(orderOriginReason(false, false, false)).toBeNull();
    expect(orderOriginReason("", "  ", "")).toBeNull();
  });

  it("refuses a present origin", () => {
    expect(orderOriginReason("web")).toMatch(/Order origin is not supported/);
    expect(orderOriginReason(1)).toMatch(/Order origin is not supported/);
    expect(orderOriginReason(true)).toMatch(/Order origin is not supported/);
  });

  it("refuses a present orderOrigin alias", () => {
    expect(orderOriginReason(undefined, "api")).toMatch(/Order origin alias is not supported/);
    expect(orderOriginReason(undefined, 0)).toMatch(/Order origin alias is not supported/);
  });

  it("refuses a present clientOrigin alias", () => {
    expect(orderOriginReason(undefined, undefined, "mobile")).toMatch(/Client origin alias is not supported/);
  });
});
