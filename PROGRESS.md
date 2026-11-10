# Development progress

## Datum a čas

2026-11-10 01:21 CET (odd hour). Order-style metadata floor added and documented.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Added `orderStyleReason` and wired it (intended) into the persistent OrderManager so a present `style`, `orderStyle`, or `clientStyle` is refused before any adapter call, matching the order-theme / order-memo pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Added `src/lib/orders/order-style.ts`, `tests/order-style.test.ts`, `docs/ORDER_STYLE_FLOOR.md`.
- Updated README current status and SAFETY checklist to include the order-style floor.

(Full historical record follows from prior PROGRESS.md content.)

## Historical record from main (PR #18)

## 2026-11-09 21:58 CET

- **Verified state:** `main` is `2f687bca5ba4324b9c4b890e7e668887a1193bb3` ("Wire order-memo metadata floor into OrderManager", parent `8a41c5abd7bdd4411fa0b07b2d5cff39d69e8e24`). PR #18 branch `cursor/fix-main-check-failures-b084` merged that commit as `6ae3fd0df4b4a2ba411af25a2894ef84d0eed27d` (parents `7e073fdfc949f51bf9392eb99d0e7b637b474483` and `2f687bca5ba4324b9c4b890e7e668887a1193bb3`). The integration commit that was fully checked is `30a8e2e2712102999946fafff753d36b5c0e21c2`. Paper stays the default. No secrets are committed. Live trading stays disabled.
- **Completed change:** The persistent OrderManager remains the submit gate: seen orders are `UnifiedOrder` records, stale and working cancels go through the adapter, and the position-index and amount-alias floors still refuse before any adapter call. `submit` now calls `orderMemoReason` immediately after the order-comment floor, so a present `memo`, `orderMemo`, or `clientMemo` is refused before `placeMarketOrder` or `placeLimitOrder` and does not record a seen order. Main's helper file `tests/order-memo.test.ts` passed (2 tests) and does not call `OrderManager.submit`. This branch adds three submit regressions for those aliases.
- **Verification:** Node v22.23.4 (`.nvmrc` asks for 22.14.0). Install was `npm ci` from `package-lock.json` (524 packages). Commands below were run on this VM.

### Main `2f687bca5ba4324b9c4b890e7e668887a1193bb3`

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | PASS |
| `npm test` | 1 | FAIL — 7 failed, 607 passed (614 tests, 232 files). `tests/order-memo.test.ts` passed (2). `tests/order-comment.test.ts` passed (4). |
| `npm run typecheck` | 2 | FAIL — 3 errors in `src/lib/server/create-order-manager.ts` |
| `npm run lint` | 1 | FAIL — 412 errors, 6 warnings |
| `npm run build` | 0 | PASS |
| `npm run test:smoke` | 0 | PASS — production server renders home with no exchange credentials |
| `npm run test:worker` | 0 | PASS — worker starts, evaluates quotes and persists history without any browser request |

Failing tests:

- `tests/halt-cancel-working.test.ts` — OrderManager cancelAllWorkingOrders leaves positions untouched (`cancelAllWorkingOrders` is not a function)
- `tests/order-manager-runtime-contract.test.ts` — OrderManager exposes the persisted runtime contract (`seenOrders` is not a function)
- `tests/order-manager-runtime-contract.test.ts` — recent unsupported amount aliases fail before adapter invocation (positions alias reaches the adapter: `placeMarketOrder` is not a function)
- `tests/paper-loop.test.ts` — market tick uses a fresh quote, strategy, lease and persisted paper order (seen orders stay empty)
- `tests/paper-loop.test.ts` — market runtime restores paper inventory after a process restart (inventory stays 0)
- `tests/position-idx.test.ts` — position index is wired into OrderManager before the adapter
- `tests/stale-open-orders.test.ts` — OrderManager cancels stale working orders without touching positions (`cancelStaleOpenOrders` result has no `canceled`)

Typecheck:

- `create-order-manager.ts(30,5)` — `UnifiedOrder[]` is not assignable to `string[] | Set<string>`
- `create-order-manager.ts(35,5)` — `(orders: UnifiedOrder[]) => void` is not assignable to `(seen: string[]) => void`
- `create-order-manager.ts(57,9)` — `string | undefined` is not assignable to `string` (`result.reason`)

Lint: 412 `prettier/prettier` errors. The 6 warnings are `react-refresh/only-export-components` in `src/components/ui/{badge,button,form,navigation-menu,sidebar,toggle}.tsx`.

### Integration commit `30a8e2e2712102999946fafff753d36b5c0e21c2`

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | PASS |
| `npm test` | 0 | PASS — 620 passed, 0 failed (232 files). `tests/order-memo.test.ts` passed (5). |
| `npm run typecheck` | 0 | PASS |
| `npm run lint` | 0 | PASS — 0 errors, 6 pre-existing `react-refresh/only-export-components` warnings |
| `npm run build` | 0 | PASS |
| `npm run test:smoke` | 0 | PASS — production server renders home with no exchange credentials |
| `npm run test:worker` | 0 | PASS — worker starts, evaluates quotes and persists history without any browser request |

Not run on either SHA: there is no `format:check` script. `npm run format` rewrites files. `dev`, `build:dev`, `start`, and `preview` are servers, not checks. `npm run build` regenerated `src/routeTree.gen.ts`; that generated diff was discarded and is not in these commits.

- **Open problem:** `main` still fails the persistent OrderManager contract (the 7 tests, 3 type errors, and 412 lint errors above). Those fixes are on PR #18. Live trading is still disabled pending an owner security review.
- **Next priority:** Keep this PR's persistent OrderManager, restart recovery, idempotent submit, duplicate-order protection, safe cancel, and capital/risk fail-closed behavior as the paper-beta path. This status commit adds only this file on top of `30a8e2e2712102999946fafff753d36b5c0e21c2`.

(Remaining historical sections unchanged from prior version.)
