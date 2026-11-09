/**
 * OrderManager – single gate for paper and live submits.
 * Applies hard-stops, notional/reserve/trade-cap floors, and metadata floors
 * (child/root/sibling/parent/payload/chain/group/link/list/related/reference/source/origin/grid/algo/strategy/tactic/template/text/position-index
 * and amount aliases) before any adapter call.
 * Seen orders are persisted UnifiedOrder records. Cancel of stale or working orders
 * goes through the adapter and does not flatten positions.
 * Default path is paper. No secrets. No live without server-side keys.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { orderChildReason } from "./order-child";
import { orderRootReason } from "./order-root";
import { orderSiblingReason } from "./order-sibling";
import { orderParentReason } from "./order-parent";
import { orderPayloadReason } from "./order-payload";
import { orderChainReason } from "./order-chain";
import { orderGroupReason } from "./order-group";
import { orderLinkReason } from "./order-link";
import { orderListReason } from "./order-list";
import { orderRelatedReason } from "./order-related";
import { orderReferenceReason } from "./order-reference";
import { orderSourceReason } from "./order-source";
import { orderOriginReason } from "./order-origin";
import { gridIdReason } from "./grid-id";
import { orderAlgoReason } from "./order-algo";
import { orderStrategyReason } from "./order-strategy";
import { orderTacticReason } from "./order-tactic";
import { orderTemplateReason } from "./order-template";
import { orderTextReason } from "./order-text";
import { positionIdxReason } from "./position-idx";
import { positionsAliasReason } from "./positions-alias";
import { portfolioAliasReason } from "./portfolio-alias";
import { equityAliasReason } from "./equity-alias";
import { navAliasReason } from "./nav-alias";
import { assetsAliasReason } from "./assets-alias";
import { holdingsAliasReason } from "./holdings-alias";
import { selectStaleOpenOrders, selectWorkingOrders } from "./stale-open";

export interface OrderIntent {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  quotedAt?: number;
  reason?: string;
  clientOrderId?: string;
  // metadata floors (present values are refused)
  childId?: unknown;
  orderChild?: unknown;
  clientChild?: unknown;
  rootId?: unknown;
  orderRoot?: unknown;
  clientRoot?: unknown;
  siblingId?: unknown;
  orderSibling?: unknown;
  clientSibling?: unknown;
  parentId?: unknown;
  orderParent?: unknown;
  clientParent?: unknown;
  payload?: unknown;
  orderPayload?: unknown;
  clientPayload?: unknown;
  chainId?: unknown;
  orderChain?: unknown;
  clientChain?: unknown;
  group?: unknown;
  orderGroup?: unknown;
  clientGroup?: unknown;
  linkId?: unknown;
  orderLink?: unknown;
  clientLink?: unknown;
  oco?: unknown;
  orderListId?: unknown;
  listClientOrderId?: unknown;
  aboveType?: unknown;
  belowType?: unknown;
  stopLimitPrice?: unknown;
  relatedId?: unknown;
  orderRelated?: unknown;
  clientRelated?: unknown;
  reference?: unknown;
  orderReference?: unknown;
  clientReference?: unknown;
  source?: unknown;
  orderSource?: unknown;
  clientSource?: unknown;
  origin?: unknown;
  orderOrigin?: unknown;
  clientOrigin?: unknown;
  grid?: unknown;
  gridId?: unknown;
  algoId?: unknown;
  algo?: unknown;
  algoType?: unknown;
  clientAlgo?: unknown;
  strategy?: unknown;
  strategyId?: unknown;
  clientStrategy?: unknown;
  tactic?: unknown;
  tacticId?: unknown;
  clientTactic?: unknown;
  template?: unknown;
  templateId?: unknown;
  clientTemplate?: unknown;
  text?: unknown;
  orderText?: unknown;
  clientText?: unknown;
  positionIdx?: unknown;
  posIdx?: unknown;
  hedgeIdx?: unknown;
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
}

export interface SubmitResult {
  ok: boolean;
  reason?: string;
  order?: UnifiedOrder;
}

export interface PortfolioSnapshot {
  cash: number;
  positions: Record<string, { amount: number; avgEntry: number }>;
}

export interface CancelOrdersResult {
  canceled: number;
  failed: number;
}

export interface OrderManagerOptions {
  startingCash?: number;
  startingPositions?: Record<string, { amount: number; avgEntry: number }>;
  seenOrders?: UnifiedOrder[];
  lastSubmitAt?: number;
  onPortfolioChange?: (portfolio: PortfolioSnapshot) => void;
  onSeenOrdersChange?: (seen: UnifiedOrder[]) => void;
  onLastSubmitAtChange?: (ts: number) => void;
}

export class OrderManager {
  private cash: number;
  private positions: Record<string, { amount: number; avgEntry: number }>;
  private orders: UnifiedOrder[] = [];
  private lastSubmitAt = 0;
  private readonly options: OrderManagerOptions;

  constructor(
    private adapter: ExchangeAdapter,
    opts: OrderManagerOptions = {},
  ) {
    this.options = opts;
    this.cash = opts.startingCash ?? TRADING_CONFIG.paperStartingBalance;
    this.positions = { ...(opts.startingPositions ?? {}) };
    this.orders = (opts.seenOrders ?? []).map((order) => ({ ...order }));
    this.lastSubmitAt = opts.lastSubmitAt ?? 0;
  }

  positionAmount(symbol: string): number {
    return this.positions[symbol]?.amount ?? 0;
  }

  snapshot(): PortfolioSnapshot {
    return { cash: this.cash, positions: { ...this.positions } };
  }

  seenOrders(): UnifiedOrder[] {
    return this.orders.map((order) => ({ ...order }));
  }

  async cancelStaleOpenOrders(now = Date.now()): Promise<CancelOrdersResult> {
    const stale = selectStaleOpenOrders(
      this.orders,
      now,
      TRADING_CONFIG.orders.staleOpenOrderMs,
    );
    return this.cancelSelected(stale);
  }

  async cancelAllWorkingOrders(): Promise<CancelOrdersResult> {
    return this.cancelSelected(selectWorkingOrders(this.orders));
  }

  private async cancelSelected(selected: UnifiedOrder[]): Promise<CancelOrdersResult> {
    let canceled = 0;
    let failed = 0;
    const canceledIds = new Set<string>();
    for (const order of selected) {
      try {
        await this.adapter.cancelOrder(order.id, order.symbol);
        canceled += 1;
        canceledIds.add(order.id);
      } catch {
        failed += 1;
      }
    }
    if (canceledIds.size > 0) {
      this.orders = this.orders.map((order) => {
        if (!canceledIds.has(order.id)) return order;
        const filled = order.filled ?? 0;
        return {
          ...order,
          status: "canceled",
          remaining: order.remaining ?? Math.max(0, order.amount - filled),
        };
      });
      this.options.onSeenOrdersChange?.(this.seenOrders());
    }
    return { canceled, failed };
  }

  private refuse(reason: string): SubmitResult {
    return { ok: false, reason };
  }

  private remember(order: UnifiedOrder): void {
    const next = { ...order };
    const index = this.orders.findIndex((existing) => existing.id === next.id);
    if (index >= 0) this.orders[index] = next;
    else this.orders.push(next);
    this.options.onSeenOrdersChange?.(this.seenOrders());
  }

  private publishPortfolio(): void {
    this.options.onPortfolioChange?.(this.snapshot());
  }

  async submit(intent: OrderIntent, riskState: RiskState): Promise<SubmitResult> {
    if (riskState.haltReason) {
      return this.refuse(`Hard-stop active: ${riskState.haltReason}`);
    }

    // Metadata floors – refuse unsupported parent/child/root/sibling/payload/chain/group/link/list/related/reference/source/origin/grid/algo/strategy/tactic/template/text intent
    const child = orderChildReason(intent.childId, intent.orderChild, intent.clientChild);
    if (child) return this.refuse(child);
    const root = orderRootReason(intent.rootId, intent.orderRoot, intent.clientRoot);
    if (root) return this.refuse(root);
    const sibling = orderSiblingReason(intent.siblingId, intent.orderSibling, intent.clientSibling);
    if (sibling) return this.refuse(sibling);
    const parent = orderParentReason(intent.parentId, intent.orderParent, intent.clientParent);
    if (parent) return this.refuse(parent);
    const payload = orderPayloadReason(intent.payload, intent.orderPayload, intent.clientPayload);
    if (payload) return this.refuse(payload);
    const chain = orderChainReason(intent.chainId, intent.orderChain, intent.clientChain);
    if (chain) return this.refuse(chain);
    const group = orderGroupReason(intent.group, intent.orderGroup, intent.clientGroup);
    if (group) return this.refuse(group);
    const link = orderLinkReason(intent.linkId, intent.orderLink, intent.clientLink);
    if (link) return this.refuse(link);
    const list = orderListReason(
      intent.oco,
      intent.orderListId,
      intent.listClientOrderId,
      intent.aboveType,
      intent.belowType,
      intent.stopLimitPrice,
    );
    if (list) return this.refuse(list);
    const related = orderRelatedReason(intent.relatedId, intent.orderRelated, intent.clientRelated);
    if (related) return this.refuse(related);
    const reference = orderReferenceReason(intent.reference, intent.orderReference, intent.clientReference);
    if (reference) return this.refuse(reference);
    const source = orderSourceReason(intent.source, intent.orderSource, intent.clientSource);
    if (source) return this.refuse(source);
    const origin = orderOriginReason(intent.origin, intent.orderOrigin, intent.clientOrigin);
    if (origin) return this.refuse(origin);
    const grid = gridIdReason(intent.grid, intent.gridId, intent.algoId);
    if (grid) return this.refuse(grid);
    const algo = orderAlgoReason(intent.algo, intent.algoType, intent.clientAlgo);
    if (algo) return this.refuse(algo);
    const strategy = orderStrategyReason(intent.strategy, intent.strategyId, intent.clientStrategy);
    if (strategy) return this.refuse(strategy);
    const tactic = orderTacticReason(intent.tactic, intent.tacticId, intent.clientTactic);
    if (tactic) return this.refuse(tactic);
    const template = orderTemplateReason(intent.template, intent.templateId, intent.clientTemplate);
    if (template) return this.refuse(template);
    const text = orderTextReason(intent.text, intent.orderText, intent.clientText);
    if (text) return this.refuse(text);
    const positionIndex = positionIdxReason(intent.positionIdx, intent.posIdx, intent.hedgeIdx);
    if (positionIndex) return this.refuse(positionIndex);
    const positionsAlias = positionsAliasReason(
      intent.positions,
      intent.orderPositions,
      intent.basePositions,
    );
    if (positionsAlias) return this.refuse(positionsAlias);
    const portfolioAlias = portfolioAliasReason(
      intent.portfolio,
      intent.orderPortfolio,
      intent.basePortfolio,
    );
    if (portfolioAlias) return this.refuse(portfolioAlias);
    const equityAlias = equityAliasReason(intent.equity, intent.orderEquity, intent.baseEquity);
    if (equityAlias) return this.refuse(equityAlias);
    const navAlias = navAliasReason(intent.nav, intent.orderNav, intent.baseNav);
    if (navAlias) return this.refuse(navAlias);
    const assetsAlias = assetsAliasReason(intent.assets, intent.orderAssets, intent.baseAssets);
    if (assetsAlias) return this.refuse(assetsAlias);
    const holdingsAlias = holdingsAliasReason(
      intent.holdings,
      intent.orderHoldings,
      intent.baseHoldings,
    );
    if (holdingsAlias) return this.refuse(holdingsAlias);

    if (!TRADING_CONFIG.pairs.includes(intent.symbol as never)) {
      return this.refuse(`Unsupported symbol ${intent.symbol}`);
    }
    if (!(intent.amount > 0)) {
      return this.refuse("Amount must be positive");
    }

    const price = intent.price ?? 0;
    const notional = intent.amount * (price > 0 ? price : 1);
    const orders = TRADING_CONFIG.orders;
    if (notional > orders.maxOrderNotionalUsd) {
      return this.refuse(`Notional ${notional.toFixed(2)} exceeds maxOrderNotionalUsd`);
    }
    if (price > 0 && notional < orders.minOrderNotionalUsd) {
      return this.refuse(`Notional ${notional.toFixed(2)} below minOrderNotionalUsd`);
    }

    if (intent.side === "buy") {
      const reserve = TRADING_CONFIG.risk.minCashReserveUsd;
      if (this.cash - notional < reserve) {
        return this.refuse("Buy would breach minCashReserveUsd");
      }
    } else {
      const held = this.positionAmount(intent.symbol);
      if (intent.amount > held + 1e-8) {
        return this.refuse(`Sell exceeds inventory (${held})`);
      }
    }

    // Daily trade cap (refuse, not halt)
    const dayKey = new Date().toISOString().slice(0, 10);
    if (riskState.tradesDayKey === dayKey && (riskState.tradesToday ?? 0) >= TRADING_CONFIG.risk.maxDailyTrades) {
      return this.refuse("Daily trade cap reached");
    }

    try {
      const type = intent.type ?? "market";
      let order: UnifiedOrder;
      if (type === "limit" && intent.price) {
        order = await this.adapter.placeLimitOrder(
          intent.symbol,
          intent.side,
          intent.amount,
          intent.price,
          intent.clientOrderId,
        );
      } else {
        order = await this.adapter.placeMarketOrder(
          intent.symbol,
          intent.side,
          intent.amount,
          intent.clientOrderId,
        );
      }

      if (order.status === "rejected" || order.rejectReason) {
        return { ok: false, reason: order.rejectReason ?? "Adapter rejected", order };
      }

      // Update internal paper book (live still tracks a shadow book for positionAmount)
      if (intent.side === "buy") {
        this.cash -= notional;
        const existing = this.positions[intent.symbol];
        if (existing) {
          const totalAmt = existing.amount + intent.amount;
          const totalCost = existing.amount * existing.avgEntry + notional;
          this.positions[intent.symbol] = { amount: totalAmt, avgEntry: totalCost / totalAmt };
        } else {
          this.positions[intent.symbol] = { amount: intent.amount, avgEntry: price || notional / intent.amount };
        }
      } else {
        this.cash += notional;
        const existing = this.positions[intent.symbol];
        if (existing) {
          const left = existing.amount - intent.amount;
          if (left <= 1e-8) delete this.positions[intent.symbol];
          else this.positions[intent.symbol] = { amount: left, avgEntry: existing.avgEntry };
        }
      }

      this.remember(order);
      this.lastSubmitAt = Date.now();
      this.options.onLastSubmitAtChange?.(this.lastSubmitAt);
      this.publishPortfolio();
      return { ok: true, order };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.refuse(`Adapter error: ${msg}`);
    }
  }
}
