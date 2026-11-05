import { describe, expect, it } from "vitest";
import { orderSubjectReason } from "../src/lib/orders/order-subject";

describe("orderSubjectReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderSubjectReason()).toBeNull();
    expect(orderSubjectReason(undefined, undefined, undefined)).toBeNull();
    expect(orderSubjectReason(null, null, null)).toBeNull();
    expect(orderSubjectReason(false, false, false)).toBeNull();
    expect(orderSubjectReason("", "  ", "")).toBeNull();
  });

  it("refuses a present subject", () => {
    expect(orderSubjectReason("grid-a")).toMatch(/Order subject is not supported/);
    expect(orderSubjectReason(1)).toMatch(/Order subject is not supported/);
    expect(orderSubjectReason(true)).toMatch(/Order subject is not supported/);
  });

  it("refuses a present orderSubject alias", () => {
    expect(orderSubjectReason(undefined, "bot")).toMatch(/Order subject alias is not supported/);
    expect(orderSubjectReason(undefined, 0)).toMatch(/Order subject alias is not supported/);
  });

  it("refuses a present clientSubject alias", () => {
    expect(orderSubjectReason(undefined, undefined, "desk")).toMatch(/Client subject alias is not supported/);
  });
});
