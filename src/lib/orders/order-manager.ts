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
import { orderCommentReason } from "./order-comment";
import { orderAnnotationReason } from "./order-annotation";
import { orderCaptionReason } from "./order-caption";
import { orderDescriptionReason } from "./order-description";
import { orderAudienceReason } from "./order-audience";
import { orderForceReason } from "./order-force";
import { orderCustomReason } from "./order-custom";
import { orderRelatedReason } from "./order-related";
import { orderChainReason } from "./order-chain";
import { orderAccountReason } from "./order-account";
import { orderChannelReason } from "./order-channel";
import { orderGroupReason } from "./order-group";
import { orderUuidReason } from "./order-uuid";
import { orderHashReason } from "./order-hash";
import { orderIdReason } from "./order-id";
import { orderKeyReason } from "./order-key";
import { orderLinkReason } from "./order-link";
import { orderParentReason } from "./order-parent";
import { orderChildReason } from "./order-child";
import { orderSiblingReason } from "./order-sibling";
import { orderExternalReason } from "./order-external";
import { orderSourceReason } from "./order-source";
import { orderSignatureReason } from "./order-signature";
import { orderPriorityReason } from "./order-priority";
import { orderUrgencyReason } from "./order-urgency";
import { orderVisibilityReason } from "./order-visibility";
import { orderPrivacyReason } from "./order-privacy";

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
  request?: unknown;
  orderRequest?: unknown;
  clientRequest?: unknown;
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
  comment?: unknown;
  orderComment?: unknown;
  clientComment?: unknown;
  annotation?: unknown;
  orderAnnotation?: unknown;
  clientAnnotation?: unknown;
  caption?: unknown;
  orderCaption?: unknown;
  clientCaption?: unknown;
  description?: unknown;
  orderDescription?: unknown;
  clientDescription?: unknown;
  audience?: unknown;
  orderAudience?: unknown;
  clientAudience?: unknown;
  force?: unknown;
  orderForce?: unknown;
  clientForce?: unknown;
  custom?: unknown;
  orderCustom?: unknown;
  clientCustom?: unknown;
  related?: unknown;
  orderRelated?: unknown;
  clientRelated?: unknown;
  chain?: unknown;
  orderChain?: unknown;
  clientChain?: unknown;
  account?: unknown;
  orderAccount?: unknown;
  clientAccount?: unknown;
  channel?: unknown;
  orderChannel?: unknown;
  origin?: unknown;
  group?: unknown;
  orderGroup?: unknown;
  clientGroup?: unknown;
  uuid?: unknown;
  orderUuid?: unknown;
  clientUuid?: unknown;
  hash?: unknown;
  orderHash?: unknown;
  clientHash?: unknown;
  id?: unknown;
  orderId?: unknown;
  clientId?: unknown;
  key?: unknown;
  orderKey?: unknown;
  clientKey?: unknown;
  clOrdId?: unknown;
  orderLinkId?: unknown;
  linkId?: unknown;
  parentId?: unknown;
  orderParent?: unknown;
  clientParent?: unknown;
  childId?: unknown;
  orderChild?: unknown;
  clientChild?: unknown;
  siblingId?: unknown;
  orderSibling?: unknown;
  clientSibling?: unknown;
  externalId?: unknown;
  orderExternal?: unknown;
  clientExternal?: unknown;
  source?: unknown;
  orderSource?: unknown;
  src?: unknown;
  signature?: unknown;
  orderSignature?: unknown;
  clientSignature?: unknown;
  priority?: unknown;
  orderPriority?: unknown;
  clientPriority?: unknown;
  urgency?: unknown;
  orderUrgency?: unknown;
  clientUrgency?: unknown;
  visibility?: unknown;
  orderVisibility?: unknown;
  clientVisibility?: unknown;
  privacy?: unknown;
  orderPrivacy?: unknown;
  clientPrivacy?: unknown;
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

  async cancelAll(): Promise<{ canceled: number; failed: number }> {
    // Paper path: no working orders to cancel in this contract
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
    const batch = orderBatchReason(intent.batch, intent.orderBatch, intent.clientBatch);
    if (batch) return { ok: false, reason: batch };
    const span = orderSpanReason(intent.span, intent.orderSpan, intent.clientSpan);
    if (span) return { ok: false, reason: span };
    const trace = orderTraceReason(intent.trace, intent.orderTrace, intent.clientTrace);
    if (trace) return { ok: false, reason: trace };
    const req = orderRequestReason(intent.request, intent.orderRequest, intent.clientRequest);
    if (req) return { ok: false, reason: req };
    const sess = orderSessionReason(intent.session, intent.orderSession, intent.clientSession);
    if (sess) return { ok: false, reason: sess };
    const ctx = orderContextReason(intent.context, intent.orderContext, intent.clientContext);
    if (ctx) return { ok: false, reason: ctx };
    const corr = orderCorrelationReason(intent.correlation, intent.orderCorrelation, intent.clientCorrelation);
    if (corr) return { ok: false, reason: corr };
    const tag = orderTagReason(intent.tag, intent.orderTag, intent.clientTag);
    if (tag) return { ok: false, reason: tag };
    const label = orderLabelReason(intent.label, intent.orderLabel, intent.clientLabel);
    if (label) return { ok: false, reason: label };
    const comment = orderCommentReason(intent.comment, intent.orderComment, intent.clientComment);
    if (comment) return { ok: false, reason: comment };
    const anno = orderAnnotationReason(intent.annotation, intent.orderAnnotation, intent.clientAnnotation);
    if (anno) return { ok: false, reason: anno };
    const cap = orderCaptionReason(intent.caption, intent.orderCaption, intent.clientCaption);
    if (cap) return { ok: false, reason: cap };
    const desc = orderDescriptionReason(intent.description, intent.orderDescription, intent.clientDescription);
    if (desc) return { ok: false, reason: desc };
    const aud = orderAudienceReason(intent.audience, intent.orderAudience, intent.clientAudience);
    if (aud) return { ok: false, reason: aud };
    const force = orderForceReason(intent.force, intent.orderForce, intent.clientForce);
    if (force) return { ok: false, reason: force };
    const custom = orderCustomReason(intent.custom, intent.orderCustom, intent.clientCustom);
    if (custom) return { ok: false, reason: custom };
    const related = orderRelatedReason(intent.related, intent.orderRelated, intent.clientRelated);
    if (related) return { ok: false, reason: related };
    const chain = orderChainReason(intent.chain, intent.orderChain, intent.clientChain);
    if (chain) return { ok: false, reason: chain };
    const acc = orderAccountReason(intent.account, intent.orderAccount, intent.clientAccount);
    if (acc) return { ok: false, reason: acc };
    const chn = orderChannelReason(intent.channel, intent.orderChannel, intent.origin);
    if (chn) return { ok: false, reason: chn };
    const grp = orderGroupReason(intent.group, intent.orderGroup, intent.clientGroup);
    if (grp) return { ok: false, reason: grp };
    const uuid = orderUuidReason(intent.uuid, intent.orderUuid, intent.clientUuid);
    if (uuid) return { ok: false, reason: uuid };
    const hash = orderHashReason(intent.hash, intent.orderHash, intent.clientHash);
    if (hash) return { ok: false, reason: hash };
    const id = orderIdReason(intent.id, intent.orderId, intent.clientId);
    if (id) return { ok: false, reason: id };
    const key = orderKeyReason(intent.key, intent.orderKey, intent.clientKey);
    if (key) return { ok: false, reason: key };
    const link = orderLinkReason(intent.clOrdId, intent.orderLinkId, intent.linkId);
    if (link) return { ok: false, reason: link };
    const parent = orderParentReason(intent.parentId, intent.orderParent, intent.clientParent);
    if (parent) return { ok: false, reason: parent };
    const child = orderChildReason(intent.childId, intent.orderChild, intent.clientChild);
    if (child) return { ok: false, reason: child };
    const sibling = orderSiblingReason(intent.siblingId, intent.orderSibling, intent.clientSibling);
    if (sibling) return { ok: false, reason: sibling };
    const external = orderExternalReason(intent.externalId, intent.orderExternal, intent.clientExternal);
    if (external) return { ok: false, reason: external };
    const source = orderSourceReason(intent.source, intent.orderSource, intent.src);
    if (source) return { ok: false, reason: source };
    const signature = orderSignatureReason(intent.signature, intent.orderSignature, intent.clientSignature);
    if (signature) return { ok: false, reason: signature };
    const priority = orderPriorityReason(intent.priority, intent.orderPriority, intent.clientPriority);
    if (priority) return { ok: false, reason: priority };
    const urgency = orderUrgencyReason(intent.urgency, intent.orderUrgency, intent.clientUrgency);
    if (urgency) return { ok: false, reason: urgency };
    const visibility = orderVisibilityReason(intent.visibility, intent.orderVisibility, intent.clientVisibility);
    if (visibility) return { ok: false, reason: visibility };
    const privacy = orderPrivacyReason(intent.privacy, intent.orderPrivacy, intent.clientPrivacy);
    if (privacy) return { ok: false, reason: privacy };
    // Paper path: record and succeed (no live keys, no adapter call for this contract)
    this.state.seenOrders.push({ ...intent, at: Date.now() });
    this.state.lastSubmitAt = Date.now();
    return { ok: true };
  }
}
