import { expect, test } from "vitest";
import { positionIdxReason } from "@/lib/orders/position-idx";

test("omitted, null, false, and blank position-idx fields pass", () => {
  expect(positionIdxReason(undefined)).toBeNull();
  expect(positionIdxReason(null, null, null)).toBeNull();
  expect(positionIdxReason(false, "", "  ")).toBeNull();
});

test("a present position index field is refused and does not halt", () => {
  expect(positionIdxReason(true)).toBe(
    "Position index is not supported; the adapter places one spot order",
  );
  expect(positionIdxReason(0)).toBe(
    "Position index is not supported; the adapter places one spot order",
  );
  expect(positionIdxReason(undefined, 1)).toBe(
    "Pos index is not supported; the adapter places one spot order",
  );
  expect(positionIdxReason(undefined, undefined, "hedge")).toBe(
    "Hedge index is not supported; the adapter places one spot order",
  );
});
