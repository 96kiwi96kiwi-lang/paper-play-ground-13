/**
 * Server factory for OrderManager.
 * Hydrates paper book, seen clientOrderIds, lastSubmitAt, lastReject, and risk halt
 * from disk so a restart cannot burst-submit or trade through a halt.
 * Standby processes that do not hold the worker lease are refused before the adapter.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";
import { persistLastReject } from "./last-reject";
import {
  applyPersistedHalt,
  loadLastSubmitAt,
  loadPaperPortfolio,
  loadSeenOrders,
  persistLastSubmitAt,
  persistPaperPortfolio,
  persistRiskSnapshot,
  persistSeenOrders,
} from "./persist";
import { assertWorkerMaySubmit } from "./worker-lease";

export function createServerOrderManager(adapter: ExchangeAdapter): OrderManager {
  const paper = adapter.name === "paper" ? loadPaperPortfolio() : null;
  const manager = new OrderManager(adapter, {
    startingCash: paper?.cash ?? TRADING_CONFIG.paperStartingBalance,
    startingPositions: paper?.positions ?? {},
    seenOrders: loadSeenOrders(),
    lastSubmitAt: loadLastSubmitAt(),
    onPortfolioChange: (portfolio) => {
      if (adapter.name === "paper") persistPaperPortfolio(portfolio);
    },
    onSeenOrdersChange: persistSeenOrders,
    onLastSubmitAtChange: persistLastSubmitAt,
  });

  const submit = manager.submit.bind(manager);
  manager.submit = async (intent, riskState: RiskState) => {
    const lease = assertWorkerMaySubmit();
    if (!lease.ok) {
      persistLastReject({
        at: Date.now(),
        reason: lease.reason ?? "Standby worker cannot submit",
        symbol: intent.symbol,
        side: intent.side,
      });
      return { ok: false, reason: lease.reason ?? "Standby worker cannot submit" };
    }
    applyPersistedHalt(riskState);
    const result = await submit(intent, riskState);
    persistRiskSnapshot(riskState);
    if (!result.ok) {
      persistLastReject({
        at: Date.now(),
        reason: result.reason,
        symbol: intent.symbol,
        side: intent.side,
      });
    }
    return result;
  };

  return manager;
}
