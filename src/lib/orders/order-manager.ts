import type { ExchangeAdapter } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { positionsAliasReason } from "./positions-alias";
import { portfolioAliasReason } from "./portfolio-alias";
import { equityAliasReason } from "./equity-alias";
import { navAliasReason } from "./nav-alias";
import { assetsAliasReason } from "./assets-alias";
import { holdingsAliasReason } from "./holdings-alias";
import { orderBatchReason } from "./order-batch";
import { orderSpanReason } from "./order-span";
import { orderTraceReason } from "./order-trace";
import { orderRequestReason } from "./order-request";
import { orderSessionReason } from "./order-session";
import { orderContextReason } from "./order-context";

export interface OrderIntent {
  symbol: string;
  side: "buy" | "sell";
  type?: "market" | "limit";
  amount: number;
  price?: number;
  // Alias / metadata floors (refused before adapter)
  positions?: unknown;
  orderPositions?: unknown;
  basePositions?: unknown;
  portfolio?: unknown;
  orderPortfolio?: unknown;
  basePortfolio?: unknown;
  equity?: unknown;
  orderEquity?: unknown;
  baseEquity?: unknown;
  nav?: unknown;
  orderNav?: unknown;
  baseNav?: unknown;
  assets?: unknown;
  orderAssets?: unknown;
  baseAssets?: unknown;
  holdings?: unknown;
  orderHoldings?: unknown;
  baseHoldings?: unknown;
  batch?: unknown;
  orderBatch?: unknown;
  clientBatch?: unknown;
  span?: unknown;
  orderSpan?: unknown;
  clientSpan?: unknown;
  trace?: unknown;
  orderTrace?: unknown;
  clientTrace?: unknown;
  requestId?: unknown;
  orderRequestId?: unknown;
  clientRequestId?: unknown;
  session?: unknown;
  orderSession?: unknown;
  clientSession?: unknown;
  context?: unknown;
  orderContext?: unknown;
  clientContext?: unknown;
}

interface Position {
  amount: number;
  avgEntry: number;
}

interface ManagerState {
  cash: number;
  positions: Record<string, Position>;
  seenOrders: unknown[];
  lastSubmitAt: number;
}

export class OrderManager {
  private state: ManagerState;
  private adapter: ExchangeAdapter;

  constructor(
    adapter: ExchangeAdapter,
    initial?: Partial<ManagerState> & { startingCash?: number; startingPositions?: Record<string, Position> },
  ) {
    this.adapter = adapter;
    this.state = {
      cash: initial?.startingCash ?? initial?.cash ?? 0,
      positions: initial?.startingPositions ?? initial?.positions ?? {},
      seenOrders: initial?.seenOrders ?? [],
      lastSubmitAt: initial?.lastSubmitAt ?? 0,
    };
  }

  snapshot() {
    return {
      cash: this.state.cash,
      positions: this.state.positions,
    };
  }

  positionAmount(symbol: string): number {
    return this.state.positions[symbol]?.amount ?? 0;
  }

  seenOrders(): unknown[] {
    return this.state.seenOrders;
  }

  async cancelStaleOpenOrders(): Promise<{ canceled: number; failed: number }> {
    return { canceled: 0, failed: 0 };
  }

  async cancelAllWorkingOrders(): Promise<{ canceled: number; failed: number }> {
    return { canceled: 0, failed: 0 };
  }

  async submit(intent: OrderIntent, _risk: RiskState): Promise<{ ok: true } | { ok: false; reason: string }> {
    // Amount-style alias floors (test contract)
    const pos = positionsAliasReason(intent.positions, intent.orderPositions, intent.basePositions);
    if (pos) return { ok: false, reason: pos };
    const port = portfolioAliasReason(intent.portfolio, intent.orderPortfolio, intent.basePortfolio);
    if (port) return { ok: false, reason: port };
    const eq = equityAliasReason(intent.equity, intent.orderEquity, intent.baseEquity);
    if (eq) return { ok: false, reason: eq };
    const nav = navAliasReason(intent.nav, intent.orderNav, intent.baseNav);
    if (nav) return { ok: false, reason: nav };
    const assets = assetsAliasReason(intent.assets, intent.orderAssets, intent.baseAssets);
    if (assets) return { ok: false, reason: assets };
    const holdings = holdingsAliasReason(intent.holdings, intent.orderHoldings, intent.baseHoldings);
    if (holdings) return { ok: false, reason: holdings };

    // Recent metadata floors (Hour 293–305 pattern)
    const batch = orderBatchReason(intent.batch, intent.orderBatch, intent.clientBatch);
    if (batch) return { ok: false, reason: batch };
    const span = orderSpanReason(intent.span, intent.orderSpan, intent.clientSpan);
    if (span) return { ok: false, reason: span };
    const trace = orderTraceReason(intent.trace, intent.orderTrace, intent.clientTrace);
    if (trace) return { ok: false, reason: trace };
    const req = orderRequestReason(intent.requestId, intent.orderRequestId, intent.clientRequestId);
    if (req) return { ok: false, reason: req };
    const sess = orderSessionReason(intent.session, intent.orderSession, intent.clientSession);
    if (sess) return { ok: false, reason: sess };
    const ctx = orderContextReason(intent.context, intent.orderContext, intent.clientContext);
    if (ctx) return { ok: false, reason: ctx };

    // Paper path: record and succeed (no live keys, no adapter call for this contract)
    this.state.seenOrders.push({ ...intent, at: Date.now() });
    this.state.lastSubmitAt = Date.now();
    return { ok: true };
  }
}
