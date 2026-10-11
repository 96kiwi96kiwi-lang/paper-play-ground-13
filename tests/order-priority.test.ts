import { describe, expect, it } from "vitest";
import { orderPriorityReason } from "../src/lib/orders/order-priority";

describe("orderPriorityReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderPriorityReason()).toBeNull();
    expect(orderPriorityReason(undefined, undefined, undefined)).toBeNull();
    expect(orderPriorityReason(null, null, null)).toBeNull();
    expect(orderPriorityReason(false, false, false)).toBeNull();
    expect(orderPriorityReason("", "  ", "")).toBeNull();
  });

  it("refuses a present priority", () => {
    expect(orderPriorityReason("high")).toMatch(/Order priority is not supported/);
    expect(orderPriorityReason(1)).toMatch(/Order priority is not supported/);
    expect(orderPriorityReason(true)).toMatch(/Order priority is not supported/);
  });

  it("refuses a present orderPriority alias", () => {
    expect(orderPriorityReason(undefined, "low")).toMatch(/Order priority alias is not supported/);
    expect(orderPriorityReason(undefined, 0)).toMatch(/Order priority alias is not supported/);
  });

  it("refuses a present timePriority alias", () => {
    expect(orderPriorityReason(undefined, undefined, "normal")).toMatch(/Time priority alias is not supported/);
  });
});
