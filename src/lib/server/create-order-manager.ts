/**
 * Server factory for OrderManager.
 * Hydrates paper book, seen clientOrderIds, and lastSubmitAt from bot-state.json
 * so a restart cannot burst-submit inside the cooldown window.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { OrderManager } from "@/lib/orders/order-manager";
import {
  loadLastSubmitAt,
  loadPaperPortfolio,
  loadSeenOrders,
  persistLastSubmitAt,
  persistPaperPortfolio,
  persistSeenOrders,
} from "./persist";

export function createServerOrderManager(adapter: ExchangeAdapter): OrderManager {
  const paper = adapter.name === "paper" ? loadPaperPortfolio() : null;
  return new OrderManager(adapter, {
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
}
