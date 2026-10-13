import { expect, test } from "vitest";
import { triggerDirectionReason } from "@/lib/orders/trigger-direction";

test("omitted, blank, and false pass", () => {
  expect(triggerDirectionReason(undefined)).toBeNull();
  expect(triggerDirectionReason(null, null, null)).toBeNull();
  expect(triggerDirectionReason("", "  ", false)).toBeNull();
  expect(triggerDirectionReason(false, false, false)).toBeNull();
});

test("a present trigger direction is refused and does not halt", () => {
  expect(triggerDirectionReason("up")).toBe(
    "Trigger direction is not supported; the adapter would place a plain spot order",
  );
  expect(triggerDirectionReason(1)).toBe(
    "Trigger direction is not supported; the adapter would place a plain spot order",
  );
  expect(triggerDirectionReason(undefined, "down")).toBe(
    "Stop direction is not supported; the adapter would place a plain spot order",
  );
  expect(triggerDirectionReason(undefined, undefined, 0)).toBe(
    "Trigger dir is not supported; the adapter would place a plain spot order",
  );
});
