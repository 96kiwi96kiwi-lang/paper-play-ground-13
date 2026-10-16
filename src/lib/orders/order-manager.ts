/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 89 (odd): volume-alias floor wired after size-alias.
 * submit calls volumeAliasReason before the adapter.
 * A present vol, volume, or baseVolume is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
