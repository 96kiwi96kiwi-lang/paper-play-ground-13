import { expect, test } from "vitest";
import { duplicateClientOrderIdReason } from "@/lib/orders/client-order-id";

test("missing or blank clientOrderId is allowed", () => {
  const seen = [{ id: "ex-1", clientOrderId: "cid-a" }];
  expect(duplicateClientOrderIdReason(undefined, seen)).toBeNull();
  expect(duplicateClientOrderIdReason("", seen)).toBeNull();
  expect(duplicateClientOrderIdReason("   ", seen)).toBeNull();
});

test("new clientOrderId is allowed", () => {
  const seen = [{ id: "ex-1", clientOrderId: "cid-a" }];
  expect(duplicateClientOrderIdReason("cid-b", seen)).toBeNull();
});

test("reuse of a seen clientOrderId is refused", () => {
  const seen = [{ id: "ex-9", clientOrderId: "cid-a" }];
  const reason = duplicateClientOrderIdReason("cid-a", seen);
  expect(reason).toMatch(/Duplicate clientOrderId/);
  expect(reason).toMatch(/ex-9/);
});

test("orders without a clientOrderId do not block", () => {
  const seen = [{ id: "ex-2" }];
  expect(duplicateClientOrderIdReason("cid-a", seen)).toBeNull();
});
