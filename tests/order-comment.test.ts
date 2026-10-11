import { expect, test } from "vitest";
import { orderCommentReason } from "@/lib/orders/order-comment";

test("omitted, blank, and false pass", () => {
  expect(orderCommentReason(undefined)).toBeNull();
  expect(orderCommentReason(null, null, null)).toBeNull();
  expect(orderCommentReason("", "  ", false)).toBeNull();
  expect(orderCommentReason(false, false, false)).toBeNull();
});

test("a present comment is refused and does not halt", () => {
  expect(orderCommentReason("grid-note")).toBe(
    "Order comment is not supported; the adapter would place a plain spot order",
  );
  expect(orderCommentReason(0)).toBe(
    "Order comment is not supported; the adapter would place a plain spot order",
  );
  expect(orderCommentReason(undefined, "bybit-comment")).toBe(
    "Order comment alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderCommentReason(undefined, undefined, "client-memo")).toBe(
    "Client comment alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderCommentReason(undefined, undefined, true)).toBe(
    "Client comment alias is not supported; the adapter would place a plain spot order",
  );
});
