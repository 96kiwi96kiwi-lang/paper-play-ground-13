/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 *
 * Current alias floors (non-exhaustive; see history): tokens, risk, exposure,
 * notional, quantity, holdings, value, assets, nav, equity, portfolio,
 * positions, and crypto. submit calls cryptoAliasReason after the tokens-alias
 * floor and before the adapter.
 */

import { cryptoAliasReason } from "./crypto-alias";

export type OrderIntent = {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  type?: "market" | "limit";
  price?: number;
  // Alias fields that must not be present
  crypto?: unknown;
  orderCrypto?: unknown;
  baseCrypto?: unknown;
};

export function submit(intent: OrderIntent): { ok: true } | { ok: false; reason: string } {
  const cryptoReason = cryptoAliasReason(intent.crypto, intent.orderCrypto, intent.baseCrypto);
  if (cryptoReason) {
    return { ok: false, reason: cryptoReason };
  }
  // Additional floors would be called here in the full implementation.
  // Adapters read amount only.
  return { ok: true };
}
