import { describe, expect, it } from "vitest";
import { orderAttributionReason } from "../src/lib/orders/order-attribution";

describe("orderAttributionReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderAttributionReason()).toBeNull();
    expect(orderAttributionReason(undefined, undefined, undefined)).toBeNull();
    expect(orderAttributionReason(null, null, null)).toBeNull();
    expect(orderAttributionReason(false, false, false)).toBeNull();
    expect(orderAttributionReason("", "  ", "")).toBeNull();
  });

  it("refuses a present attribution", () => {
    expect(orderAttributionReason("web")).toMatch(/Order attribution is not supported/);
    expect(orderAttributionReason(1)).toMatch(/Order attribution is not supported/);
    expect(orderAttributionReason(true)).toMatch(/Order attribution is not supported/);
  });

  it("refuses a present orderAttribution alias", () => {
    expect(orderAttributionReason(undefined, "api")).toMatch(/Order attribution alias is not supported/);
    expect(orderAttributionReason(undefined, 0)).toMatch(/Order attribution alias is not supported/);
  });

  it("refuses a present clientAttribution alias", () => {
    expect(orderAttributionReason(undefined, undefined, "mobile")).toMatch(/Client attribution alias is not supported/);
  });
});
