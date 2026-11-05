import { describe, expect, it } from "vitest";
import { orderReferenceReason } from "../src/lib/orders/order-reference";

describe("orderReferenceReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderReferenceReason()).toBeNull();
    expect(orderReferenceReason(undefined, undefined, undefined)).toBeNull();
    expect(orderReferenceReason(null, null, null)).toBeNull();
    expect(orderReferenceReason(false, false, false)).toBeNull();
    expect(orderReferenceReason("", "  ", "")).toBeNull();
  });

  it("refuses a present reference", () => {
    expect(orderReferenceReason("grid-a")).toMatch(/Order reference is not supported/);
    expect(orderReferenceReason(1)).toMatch(/Order reference is not supported/);
    expect(orderReferenceReason(true)).toMatch(/Order reference is not supported/);
  });

  it("refuses a present orderReference alias", () => {
    expect(orderReferenceReason(undefined, "bot")).toMatch(/Order reference alias is not supported/);
    expect(orderReferenceReason(undefined, 0)).toMatch(/Order reference alias is not supported/);
  });

  it("refuses a present clientReference alias", () => {
    expect(orderReferenceReason(undefined, undefined, "desk")).toMatch(/Client reference alias is not supported/);
  });
});
