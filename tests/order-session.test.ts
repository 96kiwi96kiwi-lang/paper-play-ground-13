import { describe, expect, it } from "vitest";
import { orderSessionReason } from "../src/lib/orders/order-session";

describe("orderSessionReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderSessionReason()).toBeNull();
    expect(orderSessionReason(undefined, undefined, undefined)).toBeNull();
    expect(orderSessionReason(null, null, null)).toBeNull();
    expect(orderSessionReason(false, false, false)).toBeNull();
    expect(orderSessionReason("", "  ", "")).toBeNull();
  });

  it("refuses a present session", () => {
    expect(orderSessionReason("abc123")).toMatch(/Order session is not supported/);
    expect(orderSessionReason(1)).toMatch(/Order session is not supported/);
    expect(orderSessionReason(true)).toMatch(/Order session is not supported/);
  });

  it("refuses a present orderSession alias", () => {
    expect(orderSessionReason(undefined, "xyz")).toMatch(/Order session alias is not supported/);
    expect(orderSessionReason(undefined, 0)).toMatch(/Order session alias is not supported/);
  });

  it("refuses a present clientSession alias", () => {
    expect(orderSessionReason(undefined, undefined, "sess-1")).toMatch(/Client session alias is not supported/);
  });
});
