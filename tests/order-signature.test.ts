import { describe, expect, it } from "vitest";
import { orderSignatureReason } from "../src/lib/orders/order-signature";

describe("orderSignatureReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderSignatureReason()).toBeNull();
    expect(orderSignatureReason(undefined, undefined, undefined)).toBeNull();
    expect(orderSignatureReason(null, null, null)).toBeNull();
    expect(orderSignatureReason(false, false, false)).toBeNull();
    expect(orderSignatureReason("", "  ", "")).toBeNull();
  });

  it("refuses a present signature", () => {
    expect(orderSignatureReason("grid-a")).toMatch(/Order signature is not supported/);
    expect(orderSignatureReason(1)).toMatch(/Order signature is not supported/);
    expect(orderSignatureReason(true)).toMatch(/Order signature is not supported/);
  });

  it("refuses a present orderSignature alias", () => {
    expect(orderSignatureReason(undefined, "bot")).toMatch(/Order signature alias is not supported/);
    expect(orderSignatureReason(undefined, 0)).toMatch(/Order signature alias is not supported/);
  });

  it("refuses a present clientSignature alias", () => {
    expect(orderSignatureReason(undefined, undefined, "desk")).toMatch(/Client signature alias is not supported/);
  });
});
