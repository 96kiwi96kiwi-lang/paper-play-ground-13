import { describe, expect, it } from "vitest";
import { orderChannelReason } from "../src/lib/orders/order-channel";

describe("orderChannelReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderChannelReason()).toBeNull();
    expect(orderChannelReason(undefined, undefined, undefined)).toBeNull();
    expect(orderChannelReason(null, null, null)).toBeNull();
    expect(orderChannelReason(false, false, false)).toBeNull();
    expect(orderChannelReason("", "  ", "")).toBeNull();
  });

  it("refuses a present channel", () => {
    expect(orderChannelReason("web")).toMatch(/Order channel is not supported/);
    expect(orderChannelReason(1)).toMatch(/Order channel is not supported/);
    expect(orderChannelReason(true)).toMatch(/Order channel is not supported/);
  });

  it("refuses a present orderChannel alias", () => {
    expect(orderChannelReason(undefined, "api")).toMatch(/Order channel alias is not supported/);
    expect(orderChannelReason(undefined, 0)).toMatch(/Order channel alias is not supported/);
  });

  it("refuses a present origin alias", () => {
    expect(orderChannelReason(undefined, undefined, "mobile")).toMatch(/Origin alias is not supported/);
  });
});
