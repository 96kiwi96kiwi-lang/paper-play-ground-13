/**
 * Standalone paper trading worker — no Vite / TanStack build.
 * Runs on Railway (or any Node host) 24/7.
 *
 * Default: PAPER only. Virtual $10_000 USDT. Prices from CoinGecko.
 * Env:
 *   PORT              — HTTP health port (Railway sets this)
 *   WORKER_STRATEGY   — momentum | mean_reversion (default momentum)
 *   WORKER_SYMBOLS    — comma list, default BTC,ETH,SOL,BNB (CoinGecko ids)
 *   WORKER_TICK_MS    — tick interval ms (default 45000)
 *   WORKER_STARTING_BALANCE — default 10000
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, "data", "worker-state.json");

const PORT = Number(process.env.PORT) || 3000;
const TICK_MS = Number(process.env.WORKER_TICK_MS) || 45_000;
const STARTING = Number(process.env.WORKER_STARTING_BALANCE) || 10_000;
const STRATEGY = (process.env.WORKER_STRATEGY || "momentum").toLowerCase();
const COIN_IDS = (process.env.WORKER_SYMBOLS || "bitcoin,ethereum,solana,binancecoin")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const COIN_TO_SYMBOL = {
  bitcoin: "BTC/USDT",
  ethereum: "ETH/USDT",
  solana: "SOL/USDT",
  binancecoin: "BNB/USDT",
};

const RISK = {
  tradeSizePct: 0.15,
  maxPositionPct: 0.2,
  stopLossPct: -4,
  takeProfitPct: 6,
  dailyLossLimitPct: -10,
  maxDrawdownPct: -18,
  maxOpenPositions: 3,
};

/** @type {{ cash: number, positions: Record<string, { amount: number, avgEntry: number }>, history: Record<string, number[]>, peak: number, dayKey: string, dayStartEquity: number, haltReason: string | null, trades: number, lastTickAt: number | null, lastAction: string | null }} */
let state = {
  cash: STARTING,
  positions: {},
  history: {},
  peak: STARTING,
  dayKey: utcDay(),
  dayStartEquity: STARTING,
  haltReason: null,
  trades: 0,
  lastTickAt: null,
  lastAction: null,
};

function utcDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function equity(prices) {
  let total = state.cash;
  for (const [sym, pos] of Object.entries(state.positions)) {
    const px = prices[sym] ?? pos.avgEntry;
    total += pos.amount * px;
  }
  return total;
}

function loadState() {
  try {
    if (!fs.existsSync(STATE_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    state = { ...state, ...raw, positions: raw.positions || {}, history: raw.history || {} };
    console.log("[worker] restored state from", STATE_PATH);
  } catch (e) {
    console.warn("[worker] could not load state:", e.message);
  }
}

function saveState() {
  try {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    const tmp = STATE_PATH + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, STATE_PATH);
  } catch (e) {
    console.warn("[worker] save failed:", e.message);
  }
}

async function fetchPrices() {
  const ids = COIN_IDS.join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = await res.json();
  /** @type {Record<string, number>} */
  const prices = {};
  for (const id of COIN_IDS) {
    const sym = COIN_TO_SYMBOL[id] || `${id.toUpperCase()}/USDT`;
    const px = data[id]?.usd;
    if (typeof px === "number" && px > 0) prices[sym] = px;
  }
  return prices;
}

function pushHistory(sym, px) {
  const h = state.history[sym] || [];
  h.push(px);
  if (h.length > 40) h.shift();
  state.history[sym] = h;
}

function momentumSignal(sym, px) {
  const h = state.history[sym] || [];
  if (h.length < 5) return { action: "hold", reason: "warming up" };
  const prev = h[h.length - 5];
  const chg = ((px - prev) / prev) * 100;
  if (chg >= 1.2) return { action: "buy", reason: `momentum +${chg.toFixed(2)}%` };
  if (chg <= -1.2) return { action: "sell", reason: `momentum ${chg.toFixed(2)}%` };
  return { action: "hold", reason: `flat ${chg.toFixed(2)}%` };
}

function meanRevSignal(sym, px) {
  const h = state.history[sym] || [];
  if (h.length < 10) return { action: "hold", reason: "warming up" };
  const avg = h.reduce((a, b) => a + b, 0) / h.length;
  const chg = ((px - avg) / avg) * 100;
  if (chg <= -2) return { action: "buy", reason: `mean-rev cheap ${chg.toFixed(2)}%` };
  if (chg >= 2) return { action: "sell", reason: `mean-rev rich ${chg.toFixed(2)}%` };
  return { action: "hold", reason: `near mean ${chg.toFixed(2)}%` };
}

function signal(sym, px) {
  return STRATEGY === "mean_reversion" ? meanRevSignal(sym, px) : momentumSignal(sym, px);
}

function applyStops(prices) {
  for (const [sym, pos] of Object.entries(state.positions)) {
    const px = prices[sym];
    if (!px || pos.amount <= 0) continue;
    const pnlPct = ((px - pos.avgEntry) / pos.avgEntry) * 100;
    if (pnlPct <= RISK.stopLossPct || pnlPct >= RISK.takeProfitPct) {
      const proceeds = pos.amount * px;
      state.cash += proceeds;
      delete state.positions[sym];
      state.trades += 1;
      state.lastAction = `close ${sym} @ ${px} (${pnlPct.toFixed(2)}%)`;
      console.log("[worker]", state.lastAction);
    }
  }
}

function checkHardStops(eq) {
  const day = utcDay();
  if (day !== state.dayKey) {
    state.dayKey = day;
    state.dayStartEquity = eq;
  }
  if (eq > state.peak) state.peak = eq;
  const dd = ((eq - state.peak) / state.peak) * 100;
  const dayPnl = ((eq - state.dayStartEquity) / state.dayStartEquity) * 100;
  if (dd <= RISK.maxDrawdownPct) {
    state.haltReason = `max drawdown ${dd.toFixed(2)}%`;
  } else if (dayPnl <= RISK.dailyLossLimitPct) {
    state.haltReason = `daily loss ${dayPnl.toFixed(2)}%`;
  }
}

function tryTrade(sym, px, action, reason) {
  const openCount = Object.keys(state.positions).filter((s) => state.positions[s].amount > 0).length;
  const eq = equity({ [sym]: px, ...Object.fromEntries(Object.entries(state.positions).map(([s, p]) => [s, p.avgEntry])) });

  if (action === "buy") {
    if (state.positions[sym]?.amount > 0) return;
    if (openCount >= RISK.maxOpenPositions) return;
    const sizeUsd = Math.min(state.cash * RISK.tradeSizePct, eq * RISK.maxPositionPct);
    if (sizeUsd < 10 || state.cash < sizeUsd) return;
    const amount = sizeUsd / px;
    state.cash -= sizeUsd;
    state.positions[sym] = { amount, avgEntry: px };
    state.trades += 1;
    state.lastAction = `buy ${sym} ${amount.toFixed(6)} @ ${px} (${reason})`;
    console.log("[worker]", state.lastAction);
  }

  if (action === "sell") {
    const pos = state.positions[sym];
    if (!pos || pos.amount <= 0) return;
    const proceeds = pos.amount * px;
    state.cash += proceeds;
    delete state.positions[sym];
    state.trades += 1;
    state.lastAction = `sell ${sym} @ ${px} (${reason})`;
    console.log("[worker]", state.lastAction);
  }
}

async function tick() {
  try {
    const prices = await fetchPrices();
    for (const [sym, px] of Object.entries(prices)) pushHistory(sym, px);

    applyStops(prices);
    const eq = equity(prices);
    checkHardStops(eq);

    if (state.haltReason) {
      state.lastTickAt = Date.now();
      state.lastAction = `HALT: ${state.haltReason}`;
      saveState();
      console.log("[worker] halted:", state.haltReason);
      return;
    }

    for (const [sym, px] of Object.entries(prices)) {
      const sig = signal(sym, px);
      if (sig.action !== "hold") tryTrade(sym, px, sig.action, sig.reason);
    }

    state.lastTickAt = Date.now();
    saveState();
    console.log(
      `[worker] tick eq=$${equity(prices).toFixed(2)} cash=$${state.cash.toFixed(2)} positions=${Object.keys(state.positions).length}`,
    );
  } catch (e) {
    console.error("[worker] tick error:", e.message);
  }
}

function healthJson() {
  return {
    ok: !state.haltReason,
    mode: "paper",
    strategy: STRATEGY,
    coins: COIN_IDS,
    cash: state.cash,
    positions: state.positions,
    trades: state.trades,
    haltReason: state.haltReason,
    lastTickAt: state.lastTickAt,
    lastAction: state.lastAction,
    tickMs: TICK_MS,
  };
}

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(healthJson(), null, 2));
    return;
  }
  if (req.url === "/clear-halt" && req.method === "POST") {
    state.haltReason = null;
    saveState();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, message: "halt cleared" }));
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

loadState();
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[worker] paper bot listening on :${PORT}`);
  console.log(`[worker] strategy=${STRATEGY} tick=${TICK_MS}ms coins=${COIN_IDS.join(",")}`);
  tick();
  setInterval(tick, TICK_MS);
});
