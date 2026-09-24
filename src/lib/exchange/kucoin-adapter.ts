/**
 * KuCoin ExchangeAdapter wrapper.
 * Server-side only. Delegates to kucoin.ts primitives so Paper and Live
 * share the same order-management interface.
 */

import * as kucoin from "./kucoin";
import type {
  ExchangeAdapter,
  Side,
  UnifiedBalance,
  UnifiedOrder,
  UnifiedTicker,
} from "./types";
import { getRuntimeMode } from "@/lib/server/trading-mode";

function mapOrder(raw: kucoin.OrderResult, clientOrderId?: string): UnifiedOrder {
  const filled = raw.filled ?? 0;
  const remaining = raw.remaining ?? Math.max(0, raw.amount - filled);
  let status: UnifiedOrder["status"] = raw.status ?? "unknown";
  if (status === "closed" || status === "filled") status = "closed";
  else if (filled > 0 && remaining > 0) status = "partially_filled";
  else if (status === "canceled" || status === "cancelled") status = "canceled";
  else if (status === "rejected" || status === "expired") status = "rejected";

  return {
    id: raw.id,
    clientOrderId,
    symbol: raw.symbol,
    side: raw.side,
    type: raw.type,
    amount: raw.amount,
    price: raw.price,
    status,
    filled,
    remaining,
    cost: raw.cost,
    timestamp: raw.timestamp,
  };
}

function liveBlocked(
  symbol: string,
  side: Side,
  amount: number,
  type: "market" | "limit",
  clientOrderId?: string,
  price?: number,
): UnifiedOrder {
  return {
    id: `blocked-${Date.now()}`,
    clientOrderId,
    symbol,
    side,
    type,
    amount,
    price,
    status: "rejected",
    filled: 0,
    remaining: amount,
    cost: 0,
    timestamp: Date.now(),
    rejectReason: "Live trading is disabled. Current mode is paper.",
  };
}

export class KuCoinExchange implements ExchangeAdapter {
  name = "kucoin" as const;
  private clientOrderIndex = new Map<string, UnifiedOrder>();

  async fetchBalance(): Promise<UnifiedBalance> {
    return kucoin.fetchBalance();
  }

  async fetchTickers(symbols: string[]): Promise<Record<string, UnifiedTicker>> {
    const raw = await kucoin.fetchTickers();
    const result: Record<string, UnifiedTicker> = {};
    for (const s of symbols) {
      if (raw[s]) result[s] = raw[s];
    }
    return result;
  }

  async placeMarketOrder(
    symbol: string,
    side: Side,
    amount: number,
    clientOrderId?: string,
  ): Promise<UnifiedOrder> {
    if (clientOrderId && this.clientOrderIndex.has(clientOrderId)) {
      return this.clientOrderIndex.get(clientOrderId)!;
    }
    if (getRuntimeMode() !== "live") {
      const rejected = liveBlocked(symbol, side, amount, "market", clientOrderId);
      if (clientOrderId) this.clientOrderIndex.set(clientOrderId, rejected);
      return rejected;
    }
    const raw = await kucoin.placeMarketOrder(symbol, side, amount);
    const order = mapOrder(raw, clientOrderId);
    if (clientOrderId) this.clientOrderIndex.set(clientOrderId, order);
    return order;
  }

  async placeLimitOrder(
    symbol: string,
    side: Side,
    amount: number,
    price: number,
    clientOrderId?: string,
  ): Promise<UnifiedOrder> {
    if (clientOrderId && this.clientOrderIndex.has(clientOrderId)) {
      return this.clientOrderIndex.get(clientOrderId)!;
    }
    if (getRuntimeMode() !== "live") {
      const rejected = liveBlocked(symbol, side, amount, "limit", clientOrderId, price);
      if (clientOrderId) this.clientOrderIndex.set(clientOrderId, rejected);
      return rejected;
    }
    const raw = await kucoin.placeLimitOrder(symbol, side, amount, price);
    const order = mapOrder(raw, clientOrderId);
    if (clientOrderId) this.clientOrderIndex.set(clientOrderId, order);
    return order;
  }

  async cancelOrder(orderId: string, symbol: string): Promise<void> {
    await kucoin.cancelOrder(orderId, symbol);
  }

  async fetchOpenOrders(symbol?: string): Promise<UnifiedOrder[]> {
    const raw = await kucoin.fetchOpenOrders(symbol);
    return raw.map((o) =>
      mapOrder(
        {
          id: String(o.id),
          symbol: o.symbol ?? symbol ?? "",
          side: (o.side as Side) ?? "buy",
          type: (o.type as "market" | "limit") ?? "limit",
          amount: Number(o.amount) || 0,
          price: o.price ? Number(o.price) : undefined,
          status: String(o.status ?? "open"),
          filled: Number(o.filled) || 0,
          remaining: Number(o.remaining) || 0,
          cost: Number(o.cost) || 0,
          timestamp: Number(o.timestamp) || Date.now(),
        },
        undefined,
      ),
    );
  }

  async healthCheck() {
    return kucoin.healthCheck();
  }
}
