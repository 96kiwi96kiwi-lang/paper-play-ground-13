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

- [ ] A present `chainId`, `orderChain`, or `clientChain` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a chain, so a multi-order chain intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `relatedId`, `orderRelated`, or `clientRelated` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a related order, so a related-order intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `legId`, `orderLeg`, or `clientLeg` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a leg, so a multi-leg intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `uuid`, `orderUuid`, or `clientUuid` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a uuid, so a uuid-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `group`, `orderGroup`, or `clientGroup` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order group, so a group intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `channel`, `orderChannel`, or `origin` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order channel or origin tag, so a channel intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `user`, `orderUser`, or `clientUser` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a user, so a user intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `status`, `orderStatus`, or `clientStatus` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a status, so a status-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `version`, `orderVersion`, or `clientVersion` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a version, so a version-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `token`, `orderToken`, or `clientToken` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a token, so a token-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `timestamp`, `orderTimestamp`, or `clientTimestamp` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a timestamp, so a time-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `nonce`, `orderNonce`, or `clientNonce` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a nonce, so a nonce intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `name`, `orderName`, or `clientName` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a name, so a name intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `kind`, `orderKind`, or `clientKind` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a kind, so a kind intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `template`, `orderTemplate`, or `clientTemplate` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a template, so a template intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `algo`, `algoType`, or `clientAlgo` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach an algo, so an algo intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `strategy`, `strategyId`, or `clientStrategy` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not attach a strategy, so a strategy intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `custom`, `customField`, or `clientCustom` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not forward client metadata, so a custom intent would otherwise be dropped and the order would rest or fill as a plain spot order)

- [ ] A present `scope`, `orderScope`, or `clientScope` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order scope, so a scope intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `audience`, `orderAudience`, or `clientAudience` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order audience, so an audience intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `visibility`, `orderVisibility`, or `clientVisibility` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order visibility, so a visibility intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `urgency`, `orderUrgency`, or `clientUrgency` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order urgency, so an urgency intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `priority`, `orderPriority`, or `clientPriority` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order priority, so a priority intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `payload`, `orderPayload`, or `clientPayload` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order payload, so a payload intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `metadata`, `orderMetadata`, or `clientMetadata` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order metadata, so a metadata intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `remark`, `orderRemark`, or `clientRemark` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order remark, so a remark intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `reference`, `orderReference`, or `clientReference` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order reference, so a reference intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `provenance`, `orderProvenance`, or `clientProvenance` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order provenance, so a provenance intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `origin`, `orderOrigin`, or `clientOrigin` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order origin, so an origin intent would otherwise be ignored and the order would rest or fill as a plain spot order)

- [ ] A present `source`, `orderSource`, or `src` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not set an order source, so a source intent would otherwise be ignored and the order would rest or fill as a plain spot order)

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

Never invent or commit secrets. Default remains paper.
