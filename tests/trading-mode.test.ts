import { beforeEach, expect, test, vi } from "vitest";
vi.mock("@/lib/exchange/kucoin", () => ({ hasCredentials: vi.fn(() => true) }));
vi.mock("@/lib/exchange/kucoin-permissions", () => ({
  inspectKucoinKeyPermissions: vi.fn(async () => ({ ok: true, trade: true, withdraw: false })),
}));
vi.mock("@/lib/server/persist", () => ({ saveBotState: vi.fn() }));
import { getRuntimeMode, setRuntimeMode, assertLiveAllowed } from "@/lib/server/trading-mode";
import { inspectKucoinKeyPermissions } from "@/lib/exchange/kucoin-permissions";
import { saveBotState } from "@/lib/server/persist";
beforeEach(async () => {
  await setRuntimeMode("paper", { confirmed: false });
  vi.clearAllMocks();
});
test("client confirmation and available keys cannot enable live mode", async () => {
  await expect(setRuntimeMode("live", { confirmed: true })).rejects.toThrow("OPERATOR_AUTH");
  expect(getRuntimeMode()).toBe("paper");
  expect(inspectKucoinKeyPermissions).not.toHaveBeenCalled();
  expect(saveBotState).not.toHaveBeenCalled();
});
test("an unconfirmed live request stays paper", async () => {
  await expect(setRuntimeMode("live", { confirmed: false })).rejects.toThrow();
  expect(getRuntimeMode()).toBe("paper");
});
test("live order guard remains closed", () => {
  expect(() => assertLiveAllowed()).toThrow("OPERATOR_AUTH");
});
test("paper remains available without confirmation", async () => {
  await expect(setRuntimeMode("paper", { confirmed: false })).resolves.toMatchObject({ mode: "paper" });
});
