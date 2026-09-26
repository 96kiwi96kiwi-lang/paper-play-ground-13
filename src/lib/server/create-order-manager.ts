/**
 * Server factory for OrderManager.
 * Hydrates paper book, seen clientOrderIds, lastSubmitAt, and risk halt
 * from bot-state.json so a restart cannot burst-submit or trade through a halt.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";
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
    applyPersistedHalt(riskState);
    const result = await submit(intent, riskState);
    persistRiskSnapshot(riskState);
    return result;
  };

  return manager;
}
