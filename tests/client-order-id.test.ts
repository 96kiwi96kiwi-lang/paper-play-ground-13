import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { duplicateClientOrderIdReason, invalidClientOrderIdReason } from "@/lib/orders/client-order-id";

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

const maxLen = TRADING_CONFIG.orders.maxClientOrderIdLength;

test("a KuCoin-shaped clientOrderId still passes", () => {
  expect(invalidClientOrderIdReason("grid-btc-1", maxLen)).toBeNull();
  expect(invalidClientOrderIdReason(undefined, maxLen)).toBeNull();
  expect(invalidClientOrderIdReason("  ", maxLen)).toBeNull();
});

test("an overlong or punctuated clientOrderId is refused", () => {
  expect(invalidClientOrderIdReason("a".repeat(maxLen + 1), maxLen)).toMatch(/Bad clientOrderId/);
  expect(invalidClientOrderIdReason("cid with space", maxLen)).toMatch(/letters, digits, or hyphens/);
  expect(invalidClientOrderIdReason("cid_under", maxLen)).toMatch(/Bad clientOrderId/);
  expect(invalidClientOrderIdReason("ok-id", 0)).toBeNull();
});
