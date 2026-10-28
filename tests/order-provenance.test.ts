import { describe, expect, it } from "vitest";
import { orderProvenanceReason } from "../src/lib/orders/order-provenance";

describe("orderProvenanceReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderProvenanceReason()).toBeNull();
    expect(orderProvenanceReason(undefined, undefined, undefined)).toBeNull();
    expect(orderProvenanceReason(null, null, null)).toBeNull();
    expect(orderProvenanceReason(false, false, false)).toBeNull();
    expect(orderProvenanceReason("", "  ", "")).toBeNull();
  });

  it("refuses a present provenance", () => {
    expect(orderProvenanceReason("web")).toMatch(/Order provenance is not supported/);
    expect(orderProvenanceReason(1)).toMatch(/Order provenance is not supported/);
    expect(orderProvenanceReason(true)).toMatch(/Order provenance is not supported/);
  });

  it("refuses a present orderProvenance alias", () => {
    expect(orderProvenanceReason(undefined, "api")).toMatch(/Order provenance alias is not supported/);
    expect(orderProvenanceReason(undefined, 0)).toMatch(/Order provenance alias is not supported/);
  });

  it("refuses a present clientProvenance alias", () => {
    expect(orderProvenanceReason(undefined, undefined, "mobile")).toMatch(/Client provenance alias is not supported/);
  });
});
