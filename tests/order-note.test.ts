import { describe, expect, it } from "vitest";
import { orderNoteReason } from "../src/lib/orders/order-note";

describe("orderNoteReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderNoteReason()).toBeNull();
    expect(orderNoteReason(undefined, undefined, undefined)).toBeNull();
    expect(orderNoteReason(null, null, null)).toBeNull();
    expect(orderNoteReason(false, false, false)).toBeNull();
    expect(orderNoteReason("", "  ", "")).toBeNull();
  });

  it("refuses a present note", () => {
    expect(orderNoteReason("grid-a")).toMatch(/Order note is not supported/);
    expect(orderNoteReason(1)).toMatch(/Order note is not supported/);
    expect(orderNoteReason(true)).toMatch(/Order note is not supported/);
  });

  it("refuses a present orderNote alias", () => {
    expect(orderNoteReason(undefined, "bot")).toMatch(/Order note alias is not supported/);
    expect(orderNoteReason(undefined, 0)).toMatch(/Order note alias is not supported/);
  });

  it("refuses a present clientNote alias", () => {
    expect(orderNoteReason(undefined, undefined, "desk")).toMatch(/Client note alias is not supported/);
  });
});
