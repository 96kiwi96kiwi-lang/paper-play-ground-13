import { expect, test } from "vitest";
import { requestWindowReason } from "@/lib/orders/request-window";

test("omitted, null, false, and blank request-window fields pass", () => {
  expect(requestWindowReason(undefined)).toBeNull();
  expect(requestWindowReason(null, null, null)).toBeNull();
  expect(requestWindowReason(false, "", "  ")).toBeNull();
});

test("present request-window fields are refused and do not halt", () => {
  expect(requestWindowReason(5000)).toBe(
    "Recv window is not supported; the adapter would place without a client deadline",
  );
  expect(requestWindowReason(undefined, "ACK")).toBe(
    "New order response type is not supported; the adapter would ignore ACK or FULL",
  );
  expect(requestWindowReason(undefined, undefined, 0)).toBe(
    "Response type is not supported; the adapter would ignore ACK or FULL",
  );
});
