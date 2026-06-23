import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  Play,
  Square,
  TrendingUp,
  TrendingDown,
  Wallet,
  Bot,
  ShieldCheck,
  AlertTriangle,
  Timer,
  Flame,
  Info,
  Lock,
  LockOpen,
} from "lucide-react";
import {
  COINS,
  type CoinId,
  type EquityPoint,
  type Position,
  type PricePoint,
  type Strategy,
  type Trade,
  avgSince,
  fmtDuration,
  fmtPct,
  fmtUSD,
  pctChangeSince,
  rsi,
  sharpe,
} from "@/lib/trading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Algo Paper Trader — Virtual Crypto Simulator" },
      {
        name: "description",
        content:
          "Paper trade BTC, ETH, SOL, BNB with auto-reinvest, stop-loss, take-profit and drawdown protection. Virtual $10,000 USDT.",
      },
      { property: "og:title", content: "Algo Paper Trader" },
      {
        property: "og:description",
        content: "Automated crypto paper trading with risk management, cooldowns and compound growth tracking.",
      },
    ],
  }),
  component: App,
});

const STARTING_BALANCE = 10_000;
const PRICE_REFRESH_MS = 30_000;
const BOT_TICK_MS = 60_000;
const MAX_HISTORY = 200;
const MAX_EQUITY = 500;

// Risk management constants
const TRADE_SIZE_PCT = 0.20;       // 20% of portfolio per trade
const MAX_POSITION_PCT = 0.25;     // never more than 25% of portfolio in one trade
const STOP_LOSS_PCT = -5;          // auto-sell at -5%
const TAKE_PROFIT_PCT = 8;         // auto-sell at +8%
const DAILY_LOSS_LIMIT_PCT = -15;  // halt for the rest of the day
const MAX_DRAWDOWN_PCT = -25;      // pause 24h
const DRAWDOWN_PAUSE_MS = 24 * 60 * 60 * 1000;

// Losing streak cooldowns
const COOLDOWN_2_MS = 15 * 60 * 1000;
const COOLDOWN_3_MS = 60 * 60 * 1000;
const STREAK_HARD_STOP = 5;

type HaltReason = null | "manual_streak" | "daily_loss" | "drawdown" | "cooldown";

const STORAGE_KEY = "algo-paper-trader:v1";
const SAVE_INTERVAL_MS = 30_000;

type Persisted = {
  cash: number;
  positions: Record<CoinId, Position | null>;
  trades: Trade[];
  strategy: Strategy;
  botRunning: boolean;
  equity: EquityPoint[];
  peak: number;
  dayAnchor: { key: string; value: number };
  losingStreak: number;
  cooldownUntil: number | null;
  haltReason: HaltReason;
  savedAt: number;
};

function loadPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function App() {
  // One-shot load from localStorage so initial state restores prior session
  const persistedRef = useRef<Persisted | null>(null);
  if (persistedRef.current === null && typeof window !== "undefined") {
    persistedRef.current = loadPersisted();
  }
  const persisted = persistedRef.current;

  const [prices, setPrices] = useState<Record<CoinId, number>>({
    bitcoin: 0, ethereum: 0, solana: 0, binancecoin: 0,
  });
  const [history, setHistory] = useState<Record<CoinId, PricePoint[]>>({
    bitcoin: [], ethereum: [], solana: [], binancecoin: [],
  });
  const [cash, setCash] = useState(persisted?.cash ?? STARTING_BALANCE);
  const [positions, setPositions] = useState<Record<CoinId, Position | null>>(
    persisted?.positions ?? { bitcoin: null, ethereum: null, solana: null, binancecoin: null },
  );
  const [trades, setTrades] = useState<Trade[]>(persisted?.trades ?? []);
  const [strategy, setStrategy] = useState<Strategy>(persisted?.strategy ?? "momentum");
  const [botRunning, setBotRunning] = useState(persisted?.botRunning ?? false);
  const [selectedCoin, setSelectedCoin] = useState<CoinId>("bitcoin");
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Risk / equity state
  const [equity, setEquity] = useState<EquityPoint[]>(persisted?.equity ?? []);
  const [peak, setPeak] = useState(persisted?.peak ?? STARTING_BALANCE);
  const [dayAnchor, setDayAnchor] = useState<{ key: string; value: number }>(
    persisted?.dayAnchor ?? { key: dayKey(Date.now()), value: STARTING_BALANCE },
  );
  const [losingStreak, setLosingStreak] = useState(persisted?.losingStreak ?? 0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(persisted?.cooldownUntil ?? null);
  const [haltReason, setHaltReason] = useState<HaltReason>(persisted?.haltReason ?? null);
  const [now, setNow] = useState(Date.now());

  // Session-restore + resume notifications
  const [sessionRestored, setSessionRestored] = useState<number | null>(
    persisted ? persisted.savedAt : null,
  );
  const [resumeNotice, setResumeNotice] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Tick every second for countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Keep latest state in refs
  const stateRef = useRef({
    prices, history, cash, positions, strategy,
    peak, dayAnchor, losingStreak, cooldownUntil, haltReason,
    trades, equity, botRunning,
  });
  useEffect(() => {
    stateRef.current = {
      prices, history, cash, positions, strategy,
      peak, dayAnchor, losingStreak, cooldownUntil, haltReason,
      trades, equity, botRunning,
    };
  });

  // --- localStorage persistence (every 30s + on tab hide)
  const saveSnapshot = useCallback(() => {
    if (typeof window === "undefined") return;
    const s = stateRef.current;
    const snap: Persisted = {
      cash: s.cash,
      positions: s.positions,
      trades: s.trades,
      strategy: s.strategy,
      botRunning: s.botRunning,
      equity: s.equity,
      peak: s.peak,
      dayAnchor: s.dayAnchor,
      losingStreak: s.losingStreak,
      cooldownUntil: s.cooldownUntil,
      haltReason: s.haltReason,
      savedAt: Date.now(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch {
      /* quota / private mode — ignore */
    }
  }, []);

  useEffect(() => {
    const id = setInterval(saveSnapshot, SAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [saveSnapshot]);

  // --- Visibility: save on hide, resume on return
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        saveSnapshot();
      } else if (document.visibilityState === "visible") {
        // If bot was supposed to be running, surface a "resumed" notice
        if (stateRef.current.botRunning) {
          setResumeNotice(true);
          window.setTimeout(() => setResumeNotice(false), 4000);
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [saveSnapshot]);

  // --- Wake Lock: keep screen awake while bot runs
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> } }) : null;
    if (!nav?.wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      if (!botRunning) return;
      try {
        const sentinel = await nav.wakeLock!.request("screen");
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        wakeLockRef.current = sentinel;
        setWakeLockActive(true);
        sentinel.addEventListener("release", () => {
          if (wakeLockRef.current === sentinel) {
            wakeLockRef.current = null;
            setWakeLockActive(false);
          }
        });
      } catch {
        setWakeLockActive(false);
      }
    };

    const release = async () => {
      const s = wakeLockRef.current;
      wakeLockRef.current = null;
      setWakeLockActive(false);
      if (s) {
        try { await s.release(); } catch { /* noop */ }
      }
    };

    const onVis = () => {
      if (document.visibilityState === "visible" && botRunning && !wakeLockRef.current) {
        acquire();
      }
    };

    if (botRunning) acquire();
    else release();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      release();
    };
  }, [botRunning]);


  // Fetch prices
  const fetchPrices = useCallback(async () => {
    try {
      const ids = COINS.map((c) => c.id).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      );
      const data = (await res.json()) as Record<CoinId, { usd: number }>;
      const t = Date.now();
      const newPrices: Record<CoinId, number> = { ...stateRef.current.prices };
      const newHist = { ...stateRef.current.history };
      for (const c of COINS) {
        const p = data[c.id]?.usd;
        if (typeof p === "number") {
          newPrices[c.id] = p;
          const h = [...(newHist[c.id] ?? []), { t, price: p }];
          newHist[c.id] = h.slice(-MAX_HISTORY);
        }
      }
      setPrices(newPrices);
      setHistory(newHist);
      setLastUpdate(t);
      setLoading(false);
    } catch (e) {
      console.error("price fetch failed", e);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, PRICE_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchPrices]);

  // --- Trade execution
  const executeTrade = useCallback(
    (coin: CoinId, action: "BUY" | "SELL", price: number, reason: string) => {
      const s = stateRef.current;
      if (action === "BUY") {
        if (s.positions[coin]) return;
        // Position sizing on portfolio value, capped by MAX_POSITION_PCT and cash
        let posValue = 0;
        for (const c of COINS) {
          const p = s.positions[c.id];
          if (p) posValue += p.amount * (s.prices[c.id] || 0);
        }
        const portfolio = s.cash + posValue;
        const target = portfolio * TRADE_SIZE_PCT;
        const cap = portfolio * MAX_POSITION_PCT;
        const spend = Math.min(target, cap, s.cash);
        if (spend < 10) return;
        const amount = spend / price;
        const trade: Trade = {
          id: crypto.randomUUID(),
          ts: Date.now(),
          coin, action, price, amount, usd: spend, reason,
        };
        setCash((c) => c - spend);
        setPositions((p) => ({ ...p, [coin]: { coin, amount, avgEntry: price } }));
        setTrades((t) => [trade, ...t]);
      } else {
        const pos = s.positions[coin];
        if (!pos) return;
        const proceeds = pos.amount * price;
        const cost = pos.amount * pos.avgEntry;
        const realizedPnl = proceeds - cost;
        const realizedPct = (realizedPnl / cost) * 100;
        const trade: Trade = {
          id: crypto.randomUUID(),
          ts: Date.now(),
          coin, action, price,
          amount: pos.amount, usd: proceeds, reason,
          realizedPnl, realizedPct,
        };
        setCash((c) => c + proceeds);
        setPositions((p) => ({ ...p, [coin]: null }));
        setTrades((t) => [trade, ...t]);

        // Losing streak + cooldown logic
        if (realizedPnl < 0) {
          setLosingStreak((prev) => {
            const next = prev + 1;
            if (next >= STREAK_HARD_STOP) {
              setBotRunning(false);
              setHaltReason("manual_streak");
              setCooldownUntil(null);
            } else if (next === 3) {
              setCooldownUntil(Date.now() + COOLDOWN_3_MS);
              setHaltReason("cooldown");
            } else if (next === 2) {
              setCooldownUntil(Date.now() + COOLDOWN_2_MS);
              setHaltReason("cooldown");
            }
            return next;
          });
        } else {
          setLosingStreak(0);
        }
      }
    },
    [],
  );

  // --- Portfolio value + equity tracking on each price update
  const positionsValue = useMemo(() => {
    let v = 0;
    for (const c of COINS) {
      const p = positions[c.id];
      if (p) v += p.amount * (prices[c.id] || 0);
    }
    return v;
  }, [positions, prices]);

  const portfolioValue = cash + positionsValue;
  const pnl = portfolioValue - STARTING_BALANCE;
  const totalReturnPct = (pnl / STARTING_BALANCE) * 100;

  useEffect(() => {
    if (!lastUpdate) return;
    setEquity((eq) => {
      const next = [...eq, { t: lastUpdate, value: portfolioValue }];
      return next.slice(-MAX_EQUITY);
    });
    setPeak((pk) => (portfolioValue > pk ? portfolioValue : pk));

    // Day rollover
    const key = dayKey(lastUpdate);
    if (key !== stateRef.current.dayAnchor.key) {
      setDayAnchor({ key, value: portfolioValue });
      // New day resets daily-loss halt
      if (stateRef.current.haltReason === "daily_loss") {
        setHaltReason(null);
      }
    }
  }, [lastUpdate, portfolioValue]);

  // Clear cooldown when expired
  useEffect(() => {
    if (cooldownUntil && now >= cooldownUntil) {
      setCooldownUntil(null);
      if (haltReason === "cooldown" || haltReason === "drawdown") setHaltReason(null);
    }
  }, [now, cooldownUntil, haltReason]);

  // Drawdown & daily-loss monitoring
  useEffect(() => {
    const ddPct = peak > 0 ? ((portfolioValue - peak) / peak) * 100 : 0;
    const dayPct = dayAnchor.value > 0
      ? ((portfolioValue - dayAnchor.value) / dayAnchor.value) * 100
      : 0;

    if (ddPct <= MAX_DRAWDOWN_PCT && haltReason !== "drawdown" && haltReason !== "manual_streak") {
      setHaltReason("drawdown");
      setCooldownUntil(Date.now() + DRAWDOWN_PAUSE_MS);
    } else if (dayPct <= DAILY_LOSS_LIMIT_PCT && !haltReason) {
      setHaltReason("daily_loss");
    }
  }, [portfolioValue, peak, dayAnchor, haltReason]);

  // --- Risk gate: should the bot trade right now?
  const tradingAllowed = useCallback(() => {
    if (haltReason === "manual_streak") return false;
    if (haltReason === "daily_loss") return false;
    if (cooldownUntil && Date.now() < cooldownUntil) return false;
    return true;
  }, [haltReason, cooldownUntil]);

  // --- Stop-loss / take-profit check (runs on every price update)
  useEffect(() => {
    for (const c of COINS) {
      const pos = positions[c.id];
      const px = prices[c.id];
      if (!pos || !px) continue;
      const pct = ((px - pos.avgEntry) / pos.avgEntry) * 100;
      if (pct <= STOP_LOSS_PCT) {
        executeTrade(c.id, "SELL", px, `Stop-loss ${pct.toFixed(2)}%`);
      } else if (pct >= TAKE_PROFIT_PCT) {
        executeTrade(c.id, "SELL", px, `Take-profit +${pct.toFixed(2)}%`);
      }
    }
  }, [prices, positions, executeTrade]);

  // --- Bot tick
  const botTick = useCallback(() => {
    if (!tradingAllowed()) return;
    const { history: h, positions: pos, strategy: strat } = stateRef.current;
    for (const c of COINS) {
      const hist = h[c.id];
      if (!hist || hist.length < 2) continue;
      const last = hist[hist.length - 1].price;
      const hasPos = !!pos[c.id];

      if (strat === "momentum") {
        const ch = pctChangeSince(hist, 5 * 60 * 1000);
        if (ch == null) continue;
        if (!hasPos && ch > 2) executeTrade(c.id, "BUY", last, `Momentum +${ch.toFixed(2)}% / 5m`);
        else if (hasPos && ch < -1.5) executeTrade(c.id, "SELL", last, `Momentum ${ch.toFixed(2)}% / 5m`);
      } else if (strat === "mean_reversion") {
        const avg = avgSince(hist, 60 * 60 * 1000);
        if (avg == null) continue;
        const dev = ((last - avg) / avg) * 100;
        if (!hasPos && dev < -3) executeTrade(c.id, "BUY", last, `MR ${dev.toFixed(2)}% vs 1h avg`);
        else if (hasPos && dev >= 0) executeTrade(c.id, "SELL", last, `MR reverted to avg`);
      } else if (strat === "rsi") {
        const ps = hist.map((p) => p.price);
        const r = rsi(ps, 14);
        if (r == null) continue;
        if (!hasPos && r < 30) executeTrade(c.id, "BUY", last, `RSI ${r.toFixed(1)} oversold`);
        else if (hasPos && r > 70) executeTrade(c.id, "SELL", last, `RSI ${r.toFixed(1)} overbought`);
      }
    }
  }, [executeTrade, tradingAllowed]);

  useEffect(() => {
    if (!botRunning) return;
    const id = setInterval(botTick, BOT_TICK_MS);
    return () => clearInterval(id);
  }, [botRunning, botTick]);

  // --- Derived stats
  const sellTrades = useMemo(() => trades.filter((t) => t.action === "SELL"), [trades]);
  const wins = sellTrades.filter((t) => (t.realizedPnl ?? 0) > 0).length;
  const winRate = sellTrades.length ? (wins / sellTrades.length) * 100 : null;
  const sharpeRatio = useMemo(() => sharpe(equity), [equity]);

  const drawdownPct = peak > 0 ? ((portfolioValue - peak) / peak) * 100 : 0;
  const maxDrawdownPct = useMemo(() => {
    let pk = STARTING_BALANCE, mdd = 0;
    for (const p of equity) {
      if (p.value > pk) pk = p.value;
      const dd = ((p.value - pk) / pk) * 100;
      if (dd < mdd) mdd = dd;
    }
    return mdd;
  }, [equity]);

  const dayPct = dayAnchor.value > 0
    ? ((portfolioValue - dayAnchor.value) / dayAnchor.value) * 100
    : 0;

  const riskLevel: "green" | "yellow" | "red" =
    haltReason ? "red"
    : (losingStreak >= 1 || drawdownPct <= -10 || dayPct <= -7 || (cooldownUntil && now < cooldownUntil))
      ? "yellow"
      : "green";

  const cooldownLeft = cooldownUntil ? Math.max(0, cooldownUntil - now) : 0;

  const chartData = useMemo(
    () =>
      (history[selectedCoin] ?? []).slice(-30).map((p) => ({
        time: new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        price: p.price,
      })),
    [history, selectedCoin],
  );

  const equityChart = useMemo(
    () => equity.map((p) => ({
      time: new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: p.value,
    })),
    [equity],
  );

  const resetSim = () => {
    setBotRunning(false);
    setCash(STARTING_BALANCE);
    setPositions({ bitcoin: null, ethereum: null, solana: null, binancecoin: null });
    setTrades([]);
    setEquity([]);
    setPeak(STARTING_BALANCE);
    setDayAnchor({ key: dayKey(Date.now()), value: STARTING_BALANCE });
    setLosingStreak(0);
    setCooldownUntil(null);
    setHaltReason(null);
    setSessionRestored(null);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  };

  const dismissRestored = () => setSessionRestored(null);


  const startBot = () => {
    // Manual start clears non-permanent halts; resets streak only on hard-stop restart
    if (haltReason === "manual_streak") {
      setLosingStreak(0);
    }
    setHaltReason(null);
    setCooldownUntil(null);
    setBotRunning(true);
  };

  const coinMeta = (id: CoinId) => COINS.find((c) => c.id === id)!;

  const haltLabel =
    haltReason === "manual_streak" ? `Hard-stopped after ${STREAK_HARD_STOP} losing trades`
    : haltReason === "daily_loss"  ? `Daily loss limit hit (${dayPct.toFixed(2)}%)`
    : haltReason === "drawdown"    ? `Drawdown ${drawdownPct.toFixed(2)}% — 24h pause`
    : haltReason === "cooldown"    ? `Losing-streak cooldown active`
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary/15 flex items-center justify-center">
              <Activity className="size-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Algo Paper Trader</h1>
              <p className="text-[11px] text-muted-foreground">Virtual money · risk-managed · CoinGecko live data</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`size-2 rounded-full ${lastUpdate ? "bg-bull animate-pulse" : "bg-muted-foreground"}`} />
              {lastUpdate ? `Live · ${new Date(lastUpdate).toLocaleTimeString()}` : "Connecting…"}
            </div>
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] rounded-md px-2 py-1 border ${
                wakeLockActive
                  ? "border-bull/40 bg-bull/10 text-bull"
                  : "border-border bg-muted/30 text-muted-foreground"
              }`}
              title="Wake Lock keeps the screen awake while the bot runs"
            >
              {wakeLockActive ? <Lock className="size-3" /> : <LockOpen className="size-3" />}
              Screen lock: {wakeLockActive ? "Active" : "Inactive"}
            </div>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as Strategy)}
              className="bg-input border border-border rounded-md px-2 py-1.5 text-xs tabular"
            >

              <option value="momentum">Momentum</option>
              <option value="mean_reversion">Mean Reversion</option>
              <option value="rsi">RSI</option>
            </select>
            <button
              onClick={() => botRunning ? setBotRunning(false) : startBot()}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                botRunning
                  ? "bg-bear/15 text-bear hover:bg-bear/25"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {botRunning ? <><Square className="size-3.5" /> Stop Bot</> : <><Play className="size-3.5" /> Start Bot</>}
            </button>
            <button
              onClick={resetSim}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Persistence info banner */}
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 flex items-start gap-3">
          <Info className="size-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-foreground/80">
            <span className="font-medium text-amber-400">⚠️ Bot only runs while this tab is open in browser.</span>{" "}
            For 24/7 trading, a server is needed. State auto-saves every 30s and restores on return.
          </div>
        </div>

        {/* Session restored */}
        {sessionRestored && (
          <div className="rounded-lg border border-bull/40 bg-bull/10 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-bull" />
              <span className="text-bull font-medium">Session restored</span>
              <span className="text-muted-foreground text-xs">
                from {new Date(sessionRestored).toLocaleString()}
              </span>
            </div>
            <button
              onClick={dismissRestored}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Resumed-on-return toast */}
        {resumeNotice && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 flex items-center gap-2 text-sm">
            <Bot className="size-4 text-primary" />
            <span className="text-primary font-medium">Bot resumed automatically</span>
            <span className="text-muted-foreground text-xs">— welcome back</span>
          </div>
        )}


        {/* Halt banner */}
        {haltLabel && (
          <div className="rounded-lg border border-bear/40 bg-bear/10 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="size-4 text-bear shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-bear">Bot paused.</span>{" "}
              <span className="text-foreground/80">{haltLabel}</span>
              {cooldownLeft > 0 && (
                <span className="ml-2 text-muted-foreground">· resumes in <span className="tabular text-foreground">{fmtDuration(cooldownLeft)}</span></span>
              )}
              {haltReason === "manual_streak" && (
                <span className="ml-2 text-muted-foreground">Press <span className="text-foreground">Start Bot</span> to resume.</span>
              )}
            </div>
          </div>
        )}

        {/* Top metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Portfolio Value"
            value={fmtUSD(portfolioValue)}
            icon={<Wallet className="size-4" />}
            sub={`Peak ${fmtUSD(peak)}`}
          />
          <MetricCard
            label="Total Return"
            value={fmtPct(totalReturnPct)}
            sub={fmtUSD(pnl)}
            tone={totalReturnPct >= 0 ? "bull" : "bear"}
            icon={totalReturnPct >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            big
          />
          <MetricCard label="Cash (USDT)" value={fmtUSD(cash)} sub={`Invested ${fmtUSD(positionsValue)}`} />
          <MetricCard
            label="Bot Status"
            value={botRunning && !haltReason ? "Running" : haltReason ? "Paused" : "Stopped"}
            tone={botRunning && !haltReason ? "bull" : haltReason ? "bear" : undefined}
            icon={<Bot className="size-4" />}
            sub={`Tick every ${BOT_TICK_MS / 1000}s`}
          />
        </section>

        {/* Risk strip */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <RiskCard level={riskLevel} haltReason={haltReason} />
          <MetricCard
            label="Losing Streak"
            value={`${losingStreak}`}
            tone={losingStreak >= 2 ? "bear" : undefined}
            icon={<Flame className="size-4" />}
            sub={
              losingStreak >= STREAK_HARD_STOP ? "Hard stop"
              : losingStreak === 3 ? "1h cooldown"
              : losingStreak === 2 ? "15m cooldown"
              : "—"
            }
          />
          <MetricCard
            label="Cooldown"
            value={cooldownLeft > 0 ? fmtDuration(cooldownLeft) : "—"}
            tone={cooldownLeft > 0 ? "bear" : undefined}
            icon={<Timer className="size-4" />}
            sub={cooldownLeft > 0 ? "Bot paused" : "Clear"}
          />
          <MetricCard
            label="Max Drawdown"
            value={fmtPct(maxDrawdownPct)}
            sub={`Current ${fmtPct(drawdownPct)}`}
            tone={maxDrawdownPct <= -10 ? "bear" : undefined}
          />
          <MetricCard
            label="Win Rate"
            value={winRate == null ? "—" : `${winRate.toFixed(1)}%`}
            sub={`${wins}/${sellTrades.length} · Sharpe ${sharpeRatio == null ? "—" : sharpeRatio.toFixed(2)}`}
            tone={winRate != null && winRate >= 50 ? "bull" : undefined}
          />
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold">{coinMeta(selectedCoin).name} · Live</h2>
                <p className="text-xs text-muted-foreground">Last 30 ticks (30s interval)</p>
              </div>
              <div className="text-right">
                <div className="tabular text-lg">{prices[selectedCoin] ? fmtUSD(prices[selectedCoin]) : "—"}</div>
                <ChangeBadge value={pctChangeSince(history[selectedCoin] ?? [], 5 * 60 * 1000)} suffix="5m" />
              </div>
            </div>
            <div className="h-[280px] p-2">
              {loading || chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Loading market data…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-grid)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      tickFormatter={(v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "var(--color-muted-foreground)" }}
                      formatter={(v: number) => [fmtUSD(v), "Price"]}
                    />
                    <Line type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Markets</h2>
              <p className="text-xs text-muted-foreground">Tap to select chart</p>
            </div>
            <ul>
              {COINS.map((c) => {
                const p = prices[c.id];
                const ch = pctChangeSince(history[c.id] ?? [], 5 * 60 * 1000);
                const active = selectedCoin === c.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedCoin(c.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition border-b border-border last:border-0 ${
                        active ? "bg-accent/40" : "hover:bg-accent/20"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{c.symbol}</div>
                        <div className="text-[11px] text-muted-foreground">{c.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="tabular text-sm">{p ? fmtUSD(p) : "—"}</div>
                        <ChangeBadge value={ch} compact />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Equity / compound growth chart */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">Portfolio Growth (Compounded)</h2>
              <p className="text-xs text-muted-foreground">All profits auto-reinvested · position sized off live equity</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              Start <span className="text-foreground tabular">{fmtUSD(STARTING_BALANCE)}</span>
            </div>
          </div>
          <div className="h-[220px] p-2">
            {equityChart.length < 2 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Tracking portfolio… need a few price ticks.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityChart} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-grid)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={40} />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--color-muted-foreground)" }}
                    formatter={(v: number) => [fmtUSD(v), "Equity"]}
                  />
                  <ReferenceLine y={STARTING_BALANCE} stroke="var(--color-muted-foreground)" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={portfolioValue >= STARTING_BALANCE ? "var(--color-bull)" : "var(--color-bear)"}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Positions */}
        <section className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Active Positions</h2>
            <span className="text-[11px] text-muted-foreground">
              SL {STOP_LOSS_PCT}% · TP +{TAKE_PROFIT_PCT}% · Max size {MAX_POSITION_PCT * 100}%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <Th>Asset</Th>
                  <Th right>Amount</Th>
                  <Th right>Avg Entry</Th>
                  <Th right>Mark</Th>
                  <Th right>Value</Th>
                  <Th right>Unrealized P&L</Th>
                </tr>
              </thead>
              <tbody>
                {COINS.filter((c) => positions[c.id]).map((c) => {
                  const pos = positions[c.id]!;
                  const mark = prices[c.id] || 0;
                  const value = pos.amount * mark;
                  const cost = pos.amount * pos.avgEntry;
                  const upl = value - cost;
                  const uplPct = (upl / cost) * 100;
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <Td><span className="font-medium">{c.symbol}</span></Td>
                      <Td right mono>{pos.amount.toFixed(6)}</Td>
                      <Td right mono>{fmtUSD(pos.avgEntry)}</Td>
                      <Td right mono>{fmtUSD(mark)}</Td>
                      <Td right mono>{fmtUSD(value)}</Td>
                      <Td right>
                        <span className={`tabular ${upl >= 0 ? "text-bull" : "text-bear"}`}>
                          {fmtUSD(upl)} ({fmtPct(uplPct)})
                        </span>
                      </Td>
                    </tr>
                  );
                })}
                {COINS.every((c) => !positions[c.id]) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No open positions. {botRunning && !haltReason ? "Bot is scanning the market…" : "Start the bot to begin trading."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trade log */}
        <section className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Trade Log</h2>
            <span className="text-xs text-muted-foreground">{trades.length} trades</span>
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <Th>Time</Th>
                  <Th>Action</Th>
                  <Th>Asset</Th>
                  <Th right>Price</Th>
                  <Th right>Amount</Th>
                  <Th right>USD</Th>
                  <Th right>Realized</Th>
                  <Th>Signal</Th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <Td mono className="text-muted-foreground">
                      {new Date(t.ts).toLocaleTimeString()}
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                          t.action === "BUY" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
                        }`}
                      >
                        {t.action}
                      </span>
                    </Td>
                    <Td>{coinMeta(t.coin).symbol}</Td>
                    <Td right mono>{fmtUSD(t.price)}</Td>
                    <Td right mono>{t.amount.toFixed(6)}</Td>
                    <Td right mono>{fmtUSD(t.usd)}</Td>
                    <Td right>
                      {t.realizedPnl != null ? (
                        <span className={`tabular ${t.realizedPnl >= 0 ? "text-bull" : "text-bear"}`}>
                          {fmtUSD(t.realizedPnl)} ({fmtPct(t.realizedPct ?? 0)})
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Td>
                    <Td className="text-xs text-muted-foreground">{t.reason}</Td>
                  </tr>
                ))}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No trades yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-[11px] text-muted-foreground pt-2 pb-6">
          Paper trading simulator · Virtual money only · No real funds involved · Prices via CoinGecko
        </footer>
      </main>
    </div>
  );
}

function MetricCard({
  label, value, sub, tone, icon, big,
}: {
  label: string; value: string; sub?: string;
  tone?: "bull" | "bear"; icon?: React.ReactNode; big?: boolean;
}) {
  const toneClass = tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`mt-2 tabular ${big ? "text-3xl" : "text-xl"} font-semibold ${toneClass}`}>
        {value}
      </div>
      {sub && <div className={`mt-0.5 text-xs tabular ${toneClass || "text-muted-foreground"}`}>{sub}</div>}
    </div>
  );
}

function RiskCard({ level, haltReason }: { level: "green" | "yellow" | "red"; haltReason: HaltReason }) {
  const cfg =
    level === "green" ? { label: "GREEN", text: "text-bull", bg: "bg-bull/10", border: "border-bull/40", note: "All systems normal" }
    : level === "yellow" ? { label: "YELLOW", text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/40", note: "Elevated risk — caution" }
    : { label: "RED", text: "text-bear", bg: "bg-bear/10", border: "border-bear/40", note: haltReason ? "Bot halted" : "Critical risk" };

  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Risk Status</span>
        <ShieldCheck className={`size-4 ${cfg.text}`} />
      </div>
      <div className={`mt-2 text-xl font-semibold tabular ${cfg.text}`}>{cfg.label}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{cfg.note}</div>
    </div>
  );
}

function ChangeBadge({ value, suffix, compact }: { value: number | null; suffix?: string; compact?: boolean }) {
  if (value == null) return <span className="text-[11px] text-muted-foreground">—</span>;
  const up = value >= 0;
  return (
    <span className={`tabular text-[11px] ${up ? "text-bull" : "text-bear"} ${compact ? "" : "inline-flex items-center gap-1"}`}>
      {fmtPct(value)} {suffix && !compact ? <span className="text-muted-foreground">/ {suffix}</span> : null}
    </span>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-2 font-medium ${right ? "text-right" : "text-left"}`}>{children}</th>
  );
}

function Td({
  children, right, mono, className = "",
}: {
  children: React.ReactNode; right?: boolean; mono?: boolean; className?: string;
}) {
  return (
    <td className={`px-4 py-2 ${right ? "text-right" : ""} ${mono ? "tabular" : ""} ${className}`}>
      {children}
    </td>
  );
}
