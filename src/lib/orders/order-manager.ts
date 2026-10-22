/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 *
 * Current alias floors (non-exhaustive; see history): tokens, risk, exposure,
 * notional, quantity, holdings, value, assets, nav, equity, portfolio,
 * positions, crypto, currency, asset, quote, pair, price, product, side, size, order-type, client-id, tif, stop-price, iceberg, post-only, price-protect, price-match, bbo, grid, reduce-only, and close-position.
 * submit calls closePositionReason after the reduce-only floor and before the adapter.
 */

import { assetAliasReason } from "./asset-alias";
import { bboReason } from "./bbo";
import { clientIdAliasReason } from "./client-id-alias";
import { closePositionReason } from "./close-position";
import { currencyAliasReason } from "./currency-alias";
import { gridReason } from "./grid";
import { icebergReason } from "./iceberg";
import { orderTypeAliasReason } from "./order-type-alias";
import { pairAliasReason } from "./pair-alias";
import { postOnlyReason } from "./post-only";
import { priceAliasReason } from "./price-alias";
import { priceMatchReason } from "./price-match";
import { priceProtectReason } from "./price-protect";
import { productAliasReason } from "./product-alias";
import { quoteAliasReason } from "./quote-alias";
import { reduceOnlyReason } from "./reduce-only";
import { sideAliasReason } from "./side-alias";
import { sizeAliasReason } from "./size-alias";
import { stopPriceAliasReason } from "./stop-price-alias";
import { tifAliasReason } from "./tif-alias";

export type OrderIntent = {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  type?: "market" | "limit";
  price?: number;
  // Alias fields that must not be present
  currency?: unknown;
  orderCurrency?: unknown;
  baseCurrency?: unknown;
  asset?: unknown;
  orderAsset?: unknown;
  baseAsset?: unknown;
  quote?: unknown;
  orderQuote?: unknown;
  baseQuote?: unknown;
  pair?: unknown;
  market?: unknown;
  instrument?: unknown;
  px?: unknown;
  limitPx?: unknown;
  orderPrice?: unknown;
  limitPrice?: unknown;
  product?: unknown;
  instId?: unknown;
  ticker?: unknown;
  orderSide?: unknown;
  direction?: unknown;
  action?: unknown;
  qty?: unknown;
  size?: unknown;
  quantity?: unknown;
  ordType?: unknown;
  orderType?: unknown;
  order_type?: unknown;
  clientOid?: unknown;
  newClientOrderId?: unknown;
  origClientOrderId?: unknown;
  tif?: unknown;
  orderTif?: unknown;
  timeInForceAlias?: unknown;
  immediateOrCancel?: unknown;
  fillOrKill?: unknown;
  stopPrice?: unknown;
  triggerPrice?: unknown;
  stopPx?: unknown;
  iceberg?: unknown;
  visibleSize?: unknown;
  icebergQty?: unknown;
  displayQty?: unknown;
  hiddenSize?: unknown;
  displaySize?: unknown;
  visibleQty?: unknown;
  icebergSize?: unknown;
  postOnly?: unknown;
  postOnlyFlag?: unknown;
  makerOnly?: unknown;
  priceProtect?: unknown;
  priceProtection?: unknown;
  percentPrice?: unknown;
  priceMatch?: unknown;
  pegPriceType?: unknown;
  pegOffsetValue?: unknown;
  bbo?: unknown;
  bestBidOffer?: unknown;
  bookPrice?: unknown;
  grid?: unknown;
  gridId?: unknown;
  algoId?: unknown;
  reduceOnly?: unknown;
  closePosition?: unknown;
  closeOnTrigger?: unknown;
  closeOrder?: unknown;
};

export function submit(intent: OrderIntent): { ok: true } | { ok: false; reason: string } {
  const currencyReason = currencyAliasReason(intent.currency, intent.orderCurrency, intent.baseCurrency);
  if (currencyReason) {
    return { ok: false, reason: currencyReason };
  }
  const assetReason = assetAliasReason(intent.asset, intent.orderAsset, intent.baseAsset);
  if (assetReason) {
    return { ok: false, reason: assetReason };
  }
  const quoteReason = quoteAliasReason(intent.quote, intent.orderQuote, intent.baseQuote);
  if (quoteReason) {
    return { ok: false, reason: quoteReason };
  }
  const pairReason = pairAliasReason(intent.pair, intent.market, intent.instrument);
  if (pairReason) {
    return { ok: false, reason: pairReason };
  }
  const priceReason = priceAliasReason(intent.px, intent.limitPx, intent.orderPrice, intent.limitPrice);
  if (priceReason) {
    return { ok: false, reason: priceReason };
  }
  const productReason = productAliasReason(intent.product, intent.instId, intent.ticker);
  if (productReason) {
    return { ok: false, reason: productReason };
  }
  const sideReason = sideAliasReason(intent.orderSide, intent.direction, intent.action);
  if (sideReason) {
    return { ok: false, reason: sideReason };
  }
  const sizeReason = sizeAliasReason(intent.qty, intent.size, intent.quantity);
  if (sizeReason) {
    return { ok: false, reason: sizeReason };
  }
  const orderTypeReason = orderTypeAliasReason(intent.ordType, intent.orderType, intent.order_type);
  if (orderTypeReason) {
    return { ok: false, reason: orderTypeReason };
  }
  const clientIdReason = clientIdAliasReason(intent.clientOid, intent.newClientOrderId, intent.origClientOrderId);
  if (clientIdReason) {
    return { ok: false, reason: clientIdReason };
  }
  const tifReason = tifAliasReason(
    intent.tif,
    intent.orderTif,
    intent.timeInForceAlias,
    intent.immediateOrCancel,
    intent.fillOrKill,
  );
  if (tifReason) {
    return { ok: false, reason: tifReason };
  }
  const stopPriceReason = stopPriceAliasReason(intent.stopPrice, intent.triggerPrice, intent.stopPx);
  if (stopPriceReason) {
    return { ok: false, reason: stopPriceReason };
  }
  const iceberg = icebergReason(
    intent.iceberg,
    intent.visibleSize,
    intent.icebergQty,
    intent.displayQty,
    intent.hiddenSize,
    intent.displaySize,
    intent.visibleQty,
    intent.icebergSize,
  );
  if (iceberg) {
    return { ok: false, reason: iceberg };
  }
  const postOnly = postOnlyReason(intent.postOnly, intent.postOnlyFlag, intent.makerOnly);
  if (postOnly) {
    return { ok: false, reason: postOnly };
  }
  const priceProtect = priceProtectReason(intent.priceProtect, intent.priceProtection, intent.percentPrice);
  if (priceProtect) {
    return { ok: false, reason: priceProtect };
  }
  const priceMatch = priceMatchReason(intent.priceMatch, intent.pegPriceType, intent.pegOffsetValue);
  if (priceMatch) {
    return { ok: false, reason: priceMatch };
  }
  const bbo = bboReason(intent.bbo, intent.bestBidOffer, intent.bookPrice);
  if (bbo) {
    return { ok: false, reason: bbo };
  }
  const grid = gridReason(intent.grid, intent.gridId, intent.algoId);
  if (grid) {
    return { ok: false, reason: grid };
  }
  const reduceOnly = reduceOnlyReason(intent.reduceOnly);
  if (reduceOnly) {
    return { ok: false, reason: reduceOnly };
  }
  const closePosition = closePositionReason(intent.closePosition, intent.closeOnTrigger, intent.closeOrder);
  if (closePosition) {
    return { ok: false, reason: closePosition };
  }
  // Additional floors would be called here in the full implementation.
  // Adapters read amount / symbol / price / side / type / clientOrderId / timeInForce only.
  return { ok: true };
}
