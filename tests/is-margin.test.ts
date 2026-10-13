import { describe, expect, it } from "vitest";
import { isMarginReason } from "../src/lib/orders/is-margin";

describe("isMarginReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(isMarginReason()).toBeNull();
    expect(isMarginReason(undefined, undefined, undefined)).toBeNull();
    expect(isMarginReason(null, null, null)).toBeNull();
    expect(isMarginReason(false, false, false)).toBeNull();
    expect(isMarginReason("", "  ", "")).toBeNull();
  });

  it("refuses a present isMargin", () => {
    expect(isMarginReason(true)).toMatch(/Is-margin is not supported/);
    expect(isMarginReason(1)).toMatch(/Is-margin is not supported/);
    expect(isMarginReason("true")).toMatch(/Is-margin is not supported/);
  });

  it("refuses a present margin flag", () => {
    expect(isMarginReason(undefined, true)).toMatch(/Margin flag is not supported/);
    expect(isMarginReason(undefined, 0)).toMatch(/Margin flag is not supported/);
  });

  it("refuses a present is_margin alias", () => {
    expect(isMarginReason(undefined, undefined, true)).toMatch(/Is-margin alias is not supported/);
  });
});
