/**
 * Unified exchange interface
 * Used by both Paper and Live modes so strategies stay mode-agnostic.
 */

export type Side = "buy" | "sell";

export interface UnifiedTicker {
  symbol: string;       // e.g. "BTC/USDT"
  last: number;
  bid: number;
  ask: number;
  timestamp: number;
}

export interface UnifiedBalance {
  free: number;         // available USDT
  used: number;
  total: number;
}

export interface UnifiedOrder {
  id: string;
  symbol: string;
  side: Side;
  type: "market" | "limit";
  amount: number;
  price?: number;
  status: string;
  filled: number;
  cost: number;
  timestamp: number;
}

export interface ExchangeAdapter {
  name: "paper" | "kucoin";
  fetchBalance(): Promise<UnifiedBalance>;
  fetchTickers(symbols: string[]): Promise<Record<string, UnifiedTicker>>;
  placeMarketOrder(symbol: string, side: Side, amount: number): Promise<UnifiedOrder>;
  placeLimitOrder(symbol: string, side: Side, amount: number, price: number): Promise<UnifiedOrder>;
  cancelOrder(orderId: string, symbol: string): Promise<void>;
  fetchOpenOrders(symbol?: string): Promise<UnifiedOrder[]>;
  healthCheck(): Promise<{ ok: boolean; message: string }>;
}
