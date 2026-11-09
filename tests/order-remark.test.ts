import { describe, expect, it } from "vitest";
import { orderRemarkReason } from "../src/lib/orders/order-remark";

describe("orderRemarkReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderRemarkReason()).toBeNull();
    expect(orderRemarkReason(undefined, undefined, undefined)).toBeNull();
    expect(orderRemarkReason(null, null, null)).toBeNull();
    expect(orderRemarkReason(false, false, false)).toBeNull();
    expect(orderRemarkReason("", "  ", "")).toBeNull();
  });

  it("refuses a present remark", () => {
    expect(orderRemarkReason("grid-a")).toMatch(/Order remark is not supported/);
    expect(orderRemarkReason(1)).toMatch(/Order remark is not supported/);
    expect(orderRemarkReason(true)).toMatch(/Order remark is not supported/);
  });

  it("refuses a present orderRemark alias", () => {
    expect(orderRemarkReason(undefined, "bot")).toMatch(/Order remark alias is not supported/);
    expect(orderRemarkReason(undefined, 0)).toMatch(/Order remark alias is not supported/);
  });

  it("refuses a present clientRemark alias", () => {
    expect(orderRemarkReason(undefined, undefined, "desk")).toMatch(
      /Client remark alias is not supported/,
    );
  });
});
