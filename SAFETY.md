# Safety checklist

## Always

- [ ] Default mode is `paper`.
- [ ] No API keys are committed or sent to the browser.
- [ ] Operator token is required for enable-live and clear-halt.
- [ ] Hard-stop reasons are persisted and survive restarts.
- [ ] OrderManager refuses unsupported metadata (including order-comment, order-context, order-description, order-digest, order-expiry, order-hash, order-memo, order-message, order-metadata, order-name, order-priority, order-tag, order-label, order-source, order-span, order-trace, order-group, order-reference, order-remark, order-signature, order-subject, order-title, order-uuid, order-version, order-visibility, order-weight, order-window, order-zone, order-algo, order-strategy, order-tactic, order-template, order-text, order-kind, order-leg, order-locale, order-region, order-timezone, order-currency, order-device, order-platform, and order-channel, and order-session, and order-sibling, and order-parent, and order-payload, and order-child, and order-root, and order-chain, and order-group, and order-link, and order-list, and order-related, and order-reference, and order-source, and order-origin) before any adapter call.

## Before any live enablement

- [ ] KuCoin API key created with **Trade only** (Withdraw disabled).
- [ ] Keys set only in the server environment.
- [ ] `KUCOIN_ALLOW_UNVERIFIED_KEY` left unset unless you have manually verified the key page.
- [ ] Paper book and risk state reviewed.
- [ ] Operator token generated locally and kept secret.

## Hard-stops (automatic)

- Daily loss limit
- Max drawdown
- Losing streak
- Price gap
- Network error streak

Clearing a halt requires the operator token and explicit confirmation. It does not enable live mode.
