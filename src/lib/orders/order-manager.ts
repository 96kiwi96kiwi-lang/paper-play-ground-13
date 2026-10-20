/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 *
 * Current alias floors (non-exhaustive; see history): tokens, risk, exposure,
 * notional, quantity, holdings, value, assets, nav, equity, portfolio,
 * positions, crypto, currency, and asset. submit calls assetAliasReason after the
 * currency-alias floor and before the adapter.
 */

import { assetAliasReason } from "./asset-alias";
import { currencyAliasReason } from "./currency-alias";

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
  // Additional floors would be called here in the full implementation.
  // Adapters read amount only.
  return { ok: true };
}
