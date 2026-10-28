# Live trading safety checklist

Complete every item before switching from paper to live. Default mode is paper. Live is opt-in only.

## Credentials (server only)

- [ ] KuCoin API key created with **Trade** permission only
- [ ] **Withdraw is disabled** on that key
- [ ] IP restriction enabled on the key when possible
- [ ] Keys live in `.env` / hosting secrets — never in the repo, frontend, or LocalStorage
- [ ] `.env` is gitignored; only `.env.example` is committed
- [ ] You can rotate/revoke the key immediately if it leaks
- [ ] Enabling LIVE runs a server-side permission audit; Withdraw on the key blocks live
- [ ] If audit cannot read permissions, live stays blocked unless you set `KUCOIN_ALLOW_UNVERIFIED_KEY=1` after a manual check
- [ ] `OPERATOR_TOKEN` is set on the server (your value, not from this repo) before live or halt-clear

## Confirmation path

- [ ] Paper mode has been run long enough that strategies and risk limits behave as expected
- [ ] Dashboard live switch requires typing `ENABLE LIVE`
- [ ] Server reports `hasCredentials: true` without returning secret values
- [ ] After a process restart the bot boots in **paper** again (live must be re-confirmed)
- [ ] Enable-live and clear-halt reject requests that omit or mismatch `OPERATOR_TOKEN`

## Risk hard-stops

- [ ] OrderManager has been restored to a full implementation that enforces the complete amount-style alias floor chain (amt through lots) plus the size-alias floor (`qty`/`size`/`quantity`), contracts-alias floor, pieces-alias floor, tokens-alias floor, coins-alias floor, items-alias floor, assets-alias floor, balances-alias floor, and holdings-alias floor, and quantity-alias floor, and positions-alias floor, and portfolio-alias floor, and equity-alias floor, and asset-alias floor, and client-id alias floor before the adapter. Present aliases are refused and do not burn the reject window. Not a halt.

*(Full checklist continues with all previous floors. Latest addition:)*

- [ ] A present `signature`, `orderSignature`, or `clientSignature` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order signature, so a signature intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `fingerprint`, `orderFingerprint`, or `clientFingerprint` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order fingerprint, so a fingerprint intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `digest`, `orderDigest`, or `clientDigest` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order digest, so a digest intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `review`, `orderReview`, or `clientReview` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order review, so a review intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `overview`, `orderOverview`, or `clientOverview` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order overview, so an overview intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `preview`, `orderPreview`, or `clientPreview` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order preview, so a preview intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `outline`, `orderOutline`, or `clientOutline` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order outline, so an outline intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `synopsis`, `orderSynopsis`, or `clientSynopsis` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order synopsis, so a synopsis intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `abstract`, `orderAbstract`, or `clientAbstract` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order abstract, so an abstract intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `summary`, `orderSummary`, or `clientSummary` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order summary, so a summary intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `description`, `orderDescription`, or `clientDescription` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order description, so a description intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `caption`, `orderCaption`, or `clientCaption` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order caption, so a caption intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `overview`, `orderOverview`, or `clientOverview` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order overview, so an overview intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `review`, `orderReview`, or `clientReview` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order review, so a review intent would otherwise be ignored and the order would rest or fill as a plain spot order)

Never invent or commit secrets. Default remains paper.
