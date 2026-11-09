/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import { applyHardStops, evaluateRisk, type RiskState } from "@/lib/risk";
import { excessAmountDecimalsReason } from "./amount-precision";
import { excessPriceDecimalsReason } from "./price-precision";
import { averageDownReason } from "./average-down";
import { cashReserveBuyReason, workingBuyReservedUsd } from "./cash-reserve";
import { crossMarkReason } from "./cross-mark";
import { chaseUpReason, lastAcceptedBuyFill } from "./chase-up";
import { duplicateClientOrderIdReason, invalidClientOrderIdReason } from "./client-order-id";
import { consecutiveBuysReason, trailingAcceptedBuys } from "./consecutive-buys";
import {
  acceptedBuyNotionalOnUtcDay,
  acceptedBuyNotionalOnUtcDayForSymbol,
  dailyBuyNotionalPerSymbolReason,
  dailyBuyNotionalReason,
} from "./daily-buy-notional";
import {
  acceptedTradeCountOnUtcDayForSymbol,
  dailyTradeCapPerSymbolReason,
} from "./daily-trade-cap";
import {
  acceptedBuyNotionalInWindow,
  acceptedBuyNotionalInWindowForSymbol,
  hourlyBuyNotionalPerSymbolReason,
  hourlyBuyNotionalReason,
} from "./hourly-buy-notional";
import {
  acceptedSellNotionalOnUtcDay,
  acceptedSellNotionalOnUtcDayForSymbol,
  dailySellNotionalPerSymbolReason,
  dailySellNotionalReason,
} from "./daily-sell-notional";
import {
  acceptedSellNotionalInWindow,
  acceptedSellNotionalInWindowForSymbol,
  hourlySellNotionalPerSymbolReason,
  hourlySellNotionalReason,
} from "./hourly-sell-notional";
import { inventoryReserveSellReason, workingSellReservedAmount } from "./inventory-reserve";
import { limitPriceBandReason } from "./limit-price-band";
import { lastLosingSellAt, lossReentryReason } from "./loss-reentry";
import { openSlotReason, openSlotSymbols } from "./open-slots";
import {
  rejectBurstPerSymbolReason,
  rejectBurstReason,
  rejectedCountInWindow,
  rejectedCountInWindowForSymbol,
} from "./reject-burst";
import { sameSideCooldownReason } from "./same-side-cooldown";
import { samePriceWorkingReason } from "./same-price";
import { rungSpacingReason } from "./rung-spacing";
import { selfCrossReason } from "./self-cross";
import { sellDustRemainderReason } from "./sell-dust";
import { selectStaleOpenOrders, selectWorkingOrders } from "./stale-open";
import { staleMarketQuoteReason } from "./stale-quote";
import { marketReferencePrice, unpricedMarketReason } from "./unpriced-market";
import { normalizeOrderType } from "./order-type";
import { orderTypeAliasReason } from "./order-type-alias";
import { validateOnlyReason } from "./validate-only";
import { requestWindowReason } from "./request-window";
import { slippageReason } from "./slippage";
import { priceProtectReason } from "./price-protect";
import { priceMatchReason } from "./price-match";
import { categoryReason } from "./category";
import { strategyIdReason } from "./strategy-id";
import { gridIdReason } from "./grid-id";
import { attachAlgoReason } from "./attach-algo";
import { leverageModeReason } from "./leverage-mode";
import { crossMarginReason } from "./cross-margin";
import { isLeverageReason } from "./is-leverage";
import { isMarginReason } from "./is-margin";
import { marginAssetReason } from "./margin-asset";
import { quickMarginReason } from "./quick-margin";
import { triggerDirectionReason } from "./trigger-direction";
import { responseTypeReason } from "./response-type";
import { tpslOrderTypeReason } from "./tpsl-order-type";
import { tpslOrderPriceReason } from "./tpsl-order-price";
import { tpslTriggerPriceReason } from "./tpsl-trigger-price";
import { tpslTriggerByReason } from "./tpsl-trigger-by";
import { targetCurrencyReason } from "./target-currency";
import { orderRemarkReason } from "./order-remark";
import { orderSourceReason } from "./order-source";
import { orderChannelReason } from "./order-channel";
import { orderLabelReason } from "./order-label";
import { orderCommentReason } from "./order-comment";
import { orderHashReason } from "./order-hash";
import { orderMemoReason } from "./order-memo";
import { orderThemeReason } from "./order-theme";
import { orderMessageReason } from "./order-message";
import { orderChainReason } from "./order-chain";
import { orderGroupReason } from "./order-group";
import { orderNoteReason } from "./order-note";
import { orderPriorityReason } from "./order-priority";
import { subAccountReason } from "./sub-account";
import { workingTypeReason } from "./working-type";
import { normalizeTimeInForce } from "./time-in-force";
import { tifAliasReason } from "./tif-alias";
import { orderForceReason } from "./order-force";
import { icebergReason } from "./iceberg";
import { quoteQtyReason } from "./quote-qty";
import { fundsReason } from "./funds";
import { postOnlyReason } from "./post-only";
import { postOnlyAliasReason } from "./post-only-alias";
import { reduceOnlyReason } from "./reduce-only";
import { closePositionReason } from "./close-position";
import { stopPriceReason } from "./stop-price";
import { autoBorrowReason } from "./auto-borrow";
import { borrowSizeReason } from "./borrow-size";
import { repaySizeReason } from "./repay-size";
import { settleCurrencyReason } from "./settle-currency";
import { trailingReason } from "./trailing";
import { orderExpiryReason } from "./order-expiry";
import { goodTillTimeReason } from "./good-till-time";
import { selfTradeReason } from "./self-trade";
import { stpModeReason } from "./stp-mode";
import { execInstReason } from "./exec-inst";
import { mmpReason } from "./mmp";
import { bboReason } from "./bbo";
import { cancelOnDisconnectReason } from "./cancel-on-disconnect";
import { positionSideReason } from "./position-side";
import { positionIndexReason } from "./position-index";
import { openOffsetReason } from "./open-offset";
import { tradeSideReason } from "./trade-side";
import { isolatedReason } from "./isolated";
import { baseSizeReason } from "./base-size";
import { amountAliasReason } from "./amount-alias";
import { sizeAliasReason } from "./size-alias";
import { contractsAliasReason } from "./contracts-alias";
import { piecesAliasReason } from "./pieces-alias";
import { szAliasReason } from "./sz-alias";
import { valueAliasReason } from "./value-alias";
import { costAliasReason } from "./cost-alias";
import { notionalAliasReason } from "./notional-alias";
import { totalAliasReason } from "./total-alias";
import { sumAliasReason } from "./sum-alias";
import { volumeAliasReason } from "./volume-alias";
import { baseQtyAliasReason } from "./base-qty-alias";
import { unitsAliasReason } from "./units-alias";
import { countAliasReason } from "./count-alias";
import { quantityAliasReason } from "./quantity-alias";
import { sharesAliasReason } from "./shares-alias";
import { lotsAliasReason } from "./lots-alias";
import { priceAliasReason } from "./price-alias";
import { clientIdAliasReason } from "./client-id-alias";
import { cancelReplaceReason } from "./cancel-replace";
import { sideAliasReason } from "./side-alias";
import { orderListReason } from "./order-list";
import { positionIdxReason } from "./position-idx";
import { orderTagReason } from "./order-tag";
import { symbolAliasReason } from "./symbol-alias";
import { accountRouteReason } from "./account-route";
import { credentialBodyReason } from "./credential-body";
import { spotOnlyReason } from "./spot-only";
import { sideEffectReason } from "./side-effect";
import { feeCurrencyReason } from "./fee-currency";
import { brokerAttributionReason } from "./broker-attribution";
import { orderLinkReason } from "./order-link";
import { orderRelatedReason } from "./order-related";
import { normalizeOrderSide } from "./side-form";
import { normalizePairSymbol } from "./symbol-form";
import { symbolFlipCooldownReason } from "./symbol-flip";
import {
  workingNotionalPerSymbolReason,
  workingNotionalReason,
  workingNotionalUsd,
  workingNotionalUsdForSymbol,
} from "./working-notional";

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
import { orderTextReason } from "./order-text";
import { orderTitleReason } from "./order-title";
import { orderHeaderReason } from "./order-header";
import { orderFooterReason } from "./order-footer";
import { orderCaptionReason } from "./order-caption";
import { orderDescriptionReason } from "./order-description";
import { orderSummaryReason } from "./order-summary";
import { orderAbstractReason } from "./order-abstract";
import { orderSynopsisReason } from "./order-synopsis";
import { orderOutlineReason } from "./order-outline";
import { orderPreviewReason } from "./order-preview";
import { orderOverviewReason } from "./order-overview";
import { orderReviewReason } from "./order-review";
import { orderDigestReason } from "./order-digest";
import { orderFingerprintReason } from "./order-fingerprint";
import { orderSignatureReason } from "./order-signature";
import { orderOriginReason } from "./order-origin";
import { orderProvenanceReason } from "./order-provenance";
import { orderReferenceReason } from "./order-reference";
import { orderAnnotationReason } from "./order-annotation";
import { orderAttributionReason } from "./order-attribution";
import { orderBodyReason } from "./order-body";
import { orderMetadataReason } from "./order-metadata";
import { orderPayloadReason } from "./order-payload";
import { orderUrgencyReason } from "./order-urgency";
import { orderVisibilityReason } from "./order-visibility";
import { orderAudienceReason } from "./order-audience";
import { orderScopeReason } from "./order-scope";
import { orderCustomReason } from "./order-custom";
import { orderAlgoReason } from "./order-algo";
import { orderStrategyReason } from "./order-strategy";
import { orderTacticReason } from "./order-tactic";
import { orderTemplateReason } from "./order-template";
import { orderKindReason } from "./order-kind";
import { orderLegReason } from "./order-leg";
import { orderSubjectReason } from "./order-subject";
import { orderUuidReason } from "./order-uuid";
import { orderVersionReason } from "./order-version";
import { orderWeightReason } from "./order-weight";
import { orderWindowReason } from "./order-window";
import { orderZoneReason } from "./order-zone";
import { orderLocaleReason } from "./order-locale";
import { orderRegionReason } from "./order-region";
import { orderTimezoneReason } from "./order-timezone";
import { orderCurrencyReason } from "./order-currency";
import { orderDeviceReason } from "./order-device";
import { orderPlatformReason } from "./order-platform";
import { orderSiblingReason } from "./order-sibling";
import { orderParentReason } from "./order-parent";
import { orderChildReason } from "./order-child";
import { orderRootReason } from "./order-root";

export type OrderIntent = {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  /** Mark used to band limits and to size a market that has no price. */
  markPrice?: number;
  quotedAt?: number;
  clientOrderId?: string;
  reason?: string;
  /** Resting policy. Omitted means GTC. IOC/FOK are refused before the adapter. */
  timeInForce?: string;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  tif?: string;
  /** Time-in-force alias used by some exchange APIs. */
  orderTif?: unknown;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  time_in_force?: string;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  timeInForceAlias?: string;
  /** Bitget order force. Adapters read timeInForce only, so a present value is refused. */
  force?: string | number | boolean;
  /** Order-force alias. Adapters read timeInForce only, so a present value is refused. */
  forceType?: string | number | boolean;
  /** Order-force alias. Adapters read timeInForce only, so a present value is refused. */
  orderForce?: string | number | boolean;
  /** Immediate-or-cancel flag. Adapters do not forward it, so a present value is refused. */
  immediateOrCancel?: boolean | string | number;
  /** Fill-or-kill flag. Adapters do not forward it, so a present value is refused. */
  fillOrKill?: boolean | string | number;
  /** Maker-only flag. Adapters do not forward it, so true is refused. */
  postOnly?: boolean;
  /** Maker-only alias. Adapters do not forward it, so a present value is refused. */
  postOnlyFlag?: boolean | string | number;
  /** Maker-only alias. Adapters read postOnly only, so a present value is refused. */
  post_only?: boolean | string | number;
  /** Maker-only alias. Adapters do not forward it, so a present value is refused. */
  makerOnly?: boolean | string | number;
  /** Maker-only alias. Adapters do not forward it, so a present value is refused. */
  timeInForcePostOnly?: boolean | string | number;
  /** Close-only flag. Adapters do not forward it, so true is refused. */
  reduceOnly?: boolean;
  /** Trigger price. Adapters do not forward it, so a present value is refused. */
  stopPrice?: number;
  /** Display-size flag. Adapters do not forward it, so true is refused. */
  iceberg?: boolean;
  /** Hide-size flag. Adapters do not forward it, so true is refused. */
  hidden?: boolean;
  /** Shown slice. Adapters do not forward it, so a present value is refused. */
  visibleSize?: number;
  /** Display-size alias. Adapters do not forward it, so a present value is refused. */
  icebergQty?: number | string;
  /** Display-size alias. Adapters do not forward it, so a present value is refused. */
  displayQty?: number | string;
  /** Hidden-size alias. Adapters do not forward it, so a present value is refused. */
  hiddenSize?: number | string;
  /** Display-size alias. Adapters do not forward it, so a present value is refused. */
  displaySize?: number | string;
  /** Shown-slice alias. Adapters do not forward it, so a present value is refused. */
  visibleQty?: number | string;
  /** Iceberg-size alias. Adapters do not forward it, so a present value is refused. */
  icebergSize?: number | string;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  funds?: number;
  /** Quote-spend alias. Adapters size by base amount, so a present value is refused. */
  quoteFunds?: unknown;
  /** Quote-spend alias. Adapters size by base amount, so a present value is refused. */
  fundsAmount?: unknown;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  quoteOrderQty?: number;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  quoteQty?: number;
  /** Quote-notional alias. Adapters size by base amount, so a present value is refused. */
  notional?: unknown;
  /** Margin auto-borrow. Spot adapters do not forward it, so true is refused. */
  autoBorrow?: boolean;
  /** Margin auto-repay. Spot adapters do not forward it, so true is refused. */
  autoRepay?: boolean;
  /** Margin borrow size. Adapters size by base amount and do not borrow, so a present value is refused. */
  borrowAmount?: number | string | boolean;
  /** Margin borrow-size alias. Adapters do not borrow, so a present value is refused. */
  borrowSize?: number | string | boolean;
  /** Loan amount. Adapters do not borrow, so a present value is refused. */
  loanAmount?: number | string | boolean;
  /** Margin repay size. Adapters size by base amount and do not repay, so a present value is refused. */
  repayAmount?: number | string | boolean;
  /** Margin repay-size alias. Adapters do not repay, so a present value is refused. */
  repaySize?: number | string | boolean;
  /** Debt amount. Adapters do not repay, so a present value is refused. */
  debtAmount?: number | string | boolean;
  /** Settlement currency. Adapters do not set it, so a present value is refused. */
  settleCcy?: string | number | boolean;
  /** Settlement coin alias. Adapters do not set it, so a present value is refused. */
  settleCoin?: string | number | boolean;
  /** Quote cPLACEHOLDER_TRUNCATED_BECAUSE_TOO_LARGE_IN_THIS_CALL_PLEASE_USE_LOCAL_OR_RETRY_WITH_FULL
