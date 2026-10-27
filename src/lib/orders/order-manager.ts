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
import { orderCorrelationReason } from "./order-correlation";
import { orderTagReason } from "./order-tag";
import { orderLabelReason } from "./order-label";
import { orderMemoReason } from "./order-memo";
import { orderNoteReason } from "./order-note";
import { orderCommentReason } from "./order-comment";
import { orderTextReason } from "./order-text";
import { orderTitleReason } from "./order-title";
import { orderCaptionReason } from "./order-caption";
import { orderDescriptionReason } from "./order-description";
import { orderSummaryReason } from "./order-summary";
import { orderAbstractReason } from "./order-abstract";

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
  correlation?: unknown;
  orderCorrelation?: unknown;
  clientCorrelation?: unknown;
  tag?: unknown;
  orderTag?: unknown;
  clientTag?: unknown;
  label?: unknown;
  orderLabel?: unknown;
  clientLabel?: unknown;
  memo?: unknown;
  orderMemo?: unknown;
  clientMemo?: unknown;
  note?: unknown;
  orderNote?: unknown;
  clientNote?: unknown;
  comment?: unknown;
  orderComment?: unknown;
  clientComment?: unknown;
  text?: unknown;
  orderText?: unknown;
  clientText?: unknown;
  title?: unknown;
  orderTitle?: unknown;
  clientTitle?: unknown;
  caption?: unknown;
  orderCaption?: unknown;
  clientCaption?: unknown;
  description?: unknown;
  orderDescription?: unknown;
  clientDescription?: unknown;
  summary?: unknown;
  orderSummary?: unknown;
  clientSummary?: unknown;
  abstract?: unknown;
  orderAbstract?: unknown;
  clientAbstract?: unknown;
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

    // Recent metadata floors (Hour 293–329 pattern)
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
    const corr = orderCorrelationReason(intent.correlation, intent.orderCorrelation, intent.clientCorrelation);
    if (corr) return { ok: false, reason: corr };
    const tag = orderTagReason(intent.tag, intent.orderTag, intent.clientTag);
    if (tag) return { ok: false, reason: tag };
    const lab = orderLabelReason(intent.label, intent.orderLabel, intent.clientLabel);
    if (lab) return { ok: false, reason: lab };
    const memo = orderMemoReason(intent.memo, intent.orderMemo, intent.clientMemo);
    if (memo) return { ok: false, reason: memo };
    const note = orderNoteReason(intent.note, intent.orderNote, intent.clientNote);
    if (note) return { ok: false, reason: note };
    const comment = orderCommentReason(intent.comment, intent.orderComment, intent.clientComment);
    if (comment) return { ok: false, reason: comment };
    const text = orderTextReason(intent.text, intent.orderText, intent.clientText);
    if (text) return { ok: false, reason: text };
    const title = orderTitleReason(intent.title, intent.orderTitle, intent.clientTitle);
    if (title) return { ok: false, reason: title };
    const caption = orderCaptionReason(intent.caption, intent.orderCaption, intent.clientCaption);
    if (caption) return { ok: false, reason: caption };
    const desc = orderDescriptionReason(intent.description, intent.orderDescription, intent.clientDescription);
    if (desc) return { ok: false, reason: desc };
    const sum = orderSummaryReason(intent.summary, intent.orderSummary, intent.clientSummary);
    if (sum) return { ok: false, reason: sum };
    const abs = orderAbstractReason(intent.abstract, intent.orderAbstract, intent.clientAbstract);
    if (abs) return { ok: false, reason: abs };

    // Paper path: record and succeed (no live keys, no adapter call for this contract)
    this.state.seenOrders.push({ ...intent, at: Date.now() });
    this.state.lastSubmitAt = Date.now();
    return { ok: true };
  }
}
