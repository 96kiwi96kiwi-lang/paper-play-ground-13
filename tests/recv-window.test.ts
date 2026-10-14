import { expect, test } from "vitest";
import { recvWindowReason } from "@/lib/orders/recv-window";

test("omitted, blank, and false pass", () => {
  expect(recvWindowReason(undefined)).toBeNull();
  expect(recvWindowReason(null)).toBeNull();
  expect(recvWindowReason("")).toBeNull();
  expect(recvWindowReason("  ")).toBeNull();
  expect(recvWindowReason(false)).toBeNull();
});

test("a present recvWindow is refused and does not halt", () => {
  expect(recvWindowReason(true)).toBe(
    "Recv window is not supported; the adapter would place without a client deadline",
  );
  expect(recvWindowReason(0)).toBe(
    "Recv window is not supported; the adapter would place without a client deadline",
  );
  expect(recvWindowReason("0")).toBe(
    "Recv window is not supported; the adapter would place without a client deadline",
  );
  expect(recvWindowReason(5000)).toBe(
    "Recv window is not supported; the adapter would place without a client deadline",
  );
});
