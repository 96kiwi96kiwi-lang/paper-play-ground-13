import { describe, expect, it } from "vitest";
import { orderLinkReason } from "../src/lib/orders/order-link";

describe("orderLinkReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderLinkReason()).toBeNull();
    expect(orderLinkReason(undefined, undefined, undefined)).toBeNull();
    expect(orderLinkReason(null, null, null)).toBeNull();
    expect(orderLinkReason(false, false, false)).toBeNull();
    expect(orderLinkReason("", "  ", "")).toBeNull();
  });

  it("refuses a present linkId", () => {
    expect(orderLinkReason("link-a")).toMatch(/Link id is not supported/);
    expect(orderLinkReason(1)).toMatch(/Link id is not supported/);
    expect(orderLinkReason(true)).toMatch(/Link id is not supported/);
  });

  it("refuses a present orderLink alias", () => {
    expect(orderLinkReason(undefined, "bot")).toMatch(/Order link is not supported/);
    expect(orderLinkReason(undefined, 0)).toMatch(/Order link is not supported/);
  });

  it("refuses a present clientLink alias", () => {
    expect(orderLinkReason(undefined, undefined, "desk")).toMatch(/Client link alias is not supported/);
  });
});
