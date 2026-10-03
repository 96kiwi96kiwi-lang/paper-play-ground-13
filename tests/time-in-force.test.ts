import { expect, test } from "vitest";
import { normalizeTimeInForce } from "@/lib/orders/time-in-force";

test("omitted, blank, and mixed case map to GTC", () => {
  expect(normalizeTimeInForce(undefined)).toEqual({ timeInForce: "GTC" });
  expect(normalizeTimeInForce("   ")).toEqual({ timeInForce: "GTC" });
  expect(normalizeTimeInForce("gtc")).toEqual({ timeInForce: "GTC" });
  expect(normalizeTimeInForce("  Gtc  ")).toEqual({ timeInForce: "GTC" });
});

test("IOC and FOK are refused and do not halt", () => {
  expect(normalizeTimeInForce("IOC")).toEqual({ reason: "Unsupported time in force: IOC" });
  expect(normalizeTimeInForce("fok")).toEqual({ reason: "Unsupported time in force: FOK" });
  const reason = normalizeTimeInForce("GTT");
  expect("reason" in reason && reason.reason).toMatch(/Unsupported time in force/);
});

test("a non-string time in force is refused", () => {
  expect(normalizeTimeInForce(1)).toEqual({ reason: "Unsupported time in force: 1" });
});
