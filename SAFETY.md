# Safety checklist

## Always

- [ ] Default mode is `paper`.
- [ ] No API keys are committed or sent to the browser.
- [ ] Operator token is required for enable-live and clear-halt.
- [ ] Hard-stop reasons are persisted and survive restarts.
- [ ] OrderManager refuses unsupported metadata (including order-comment, order-context, order-description, order-digest, order-expiry, order-hash, and order-memo) before any adapter call.

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
