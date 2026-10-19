import { assetsAliasReason } from "@/lib/orders/assets-alias";
import { equityAliasReason } from "@/lib/orders/equity-alias";
import { holdingsAliasReason } from "@/lib/orders/holdings-alias";
import { navAliasReason } from "@/lib/orders/nav-alias";
import { portfolioAliasReason } from "@/lib/orders/portfolio-alias";
import { positionsAliasReason } from "@/lib/orders/positions-alias";
import { valueAliasReason } from "@/lib/orders/value-alias";

export interface OrderRequest {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  type: "market" | "limit";
  price?: number;
  quotedAt?: number;
  reason?: string;
  // Alias fields that floors refuse when present
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
  value?: unknown;
  orderValue?: unknown;
  baseValue?: unknown;
  holdings?: unknown;
  orderHoldings?: unknown;
  baseHoldings?: unknown;
}

export interface SubmitResult {
  ok: boolean;
  reason?: string;
  order?: {
    id: string;
    symbol: string;
    side: string;
    amount: number;
    status: "filled" | "rejected" | "open";
    filled?: number;
    remaining?: number;
  };
}

export interface OrderManager {
  submit(req: OrderRequest, riskState: unknown): Promise<SubmitResult>;
}

/**
 * Paper-first OrderManager.
 * Checks alias floors in sequence (recent chain ending with holdings) before any adapter.
 * Alias refusals do not burn maxRejectsInWindow and do not flatten.
 * Default mode is paper. No secrets, no live keys.
 */
export class PaperOrderManager implements OrderManager {
  async submit(req: OrderRequest, _riskState: unknown): Promise<SubmitResult> {
    // Floors in the order established by prior hours
    const floors = [
      positionsAliasReason(req.positions, req.orderPositions, req.basePositions),
      portfolioAliasReason(req.portfolio, req.orderPortfolio, req.basePortfolio),
      equityAliasReason(req.equity, req.orderEquity, req.baseEquity),
      navAliasReason(req.nav, req.orderNav, req.baseNav),
      assetsAliasReason(req.assets, req.orderAssets, req.baseAssets),
      valueAliasReason(req.value, req.orderValue, req.baseValue),
      holdingsAliasReason(req.holdings, req.orderHoldings, req.baseHoldings),
    ];

    for (const reason of floors) {
      if (reason) {
        return { ok: false, reason };
      }
    }

    // Paper path: accept and mark filled (no exchange, no secrets)
    return {
      ok: true,
      order: {
        id: `paper-${Date.now()}`,
        symbol: req.symbol,
        side: req.side,
        amount: req.amount,
        status: "filled",
        filled: req.amount,
        remaining: 0,
      },
    };
  }
}

export function createOrderManager(): OrderManager {
  return new PaperOrderManager();
}
