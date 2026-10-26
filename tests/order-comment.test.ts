import { describe, expect, it } from "vitest";
import { orderCommentReason } from "../src/lib/orders/order-comment";

describe("orderCommentReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderCommentReason()).toBeNull();
    expect(orderCommentReason(undefined, undefined, undefined)).toBeNull();
    expect(orderCommentReason(null, null, null)).toBeNull();
    expect(orderCommentReason(false, false, false)).toBeNull();
    expect(orderCommentReason("", "  ", "")).toBeNull();
  });

  it("refuses a present comment", () => {
    expect(orderCommentReason("grid-a")).toMatch(/Order comment is not supported/);
    expect(orderCommentReason(1)).toMatch(/Order comment is not supported/);
    expect(orderCommentReason(true)).toMatch(/Order comment is not supported/);
  });

  it("refuses a present orderComment alias", () => {
    expect(orderCommentReason(undefined, "bot")).toMatch(/Order comment alias is not supported/);
    expect(orderCommentReason(undefined, 0)).toMatch(/Order comment alias is not supported/);
  });

  it("refuses a present clientComment alias", () => {
    expect(orderCommentReason(undefined, undefined, "desk")).toMatch(/Client comment alias is not supported/);
  });
});
