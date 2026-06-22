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
} from "recharts";
import { Activity, Play, Square, TrendingUp, TrendingDown, Wallet, Bot } from "lucide-react";
import {
  COINS,
  type CoinId,
  type Position,
  type PricePoint,
  type Strategy,
  type Trade,
  avgSince,
  fmtPct,
  fmtUSD,
  pctChangeSince,
  rsi,
} from "@/lib/trading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Algo Paper Trader — Virtual Crypto Simulator" },
      {
        name: "description",
        content:
          "Paper trade BTC, ETH, SOL, and BNB with automated strategies. Virtual $10,000 USDT, no real money.",
      },
      { property: "og:title", content: "Algo Paper Trader" },
      {
        property: "og:description",
        content: "Automated crypto paper trading simulator with momentum, mean reversion, and RSI strategies.",
      },
    ],
  }),
  component: App,
});

const STARTING_BALANCE = 10_000;
const PRICE_REFRESH_MS = 30_000;
const BOT_TICK_MS = 60_000;
const MAX_HISTORY = 200;
const TRADE_SIZE_PCT = 0.2; // 20% of cash per buy

function App() {
  const [prices, setPrices] = useState<Record<CoinId, number>>({
    bitcoin: 0,
    ethereum: 0,
    solana: 0,
    binancecoin: 0,
  });
  const [history, setHistory] = useState<Record<CoinId, PricePoint[]>>({
    bitcoin: [],
    ethereum: [],
    solana: [],
    binancecoin: [],
  });
  const [cash, setCash] = useState(STARTING_BALANCE);
  const [positions, setPositions] = useState<Record<CoinId, Position | null>>({
    bitcoin: null,
    ethereum: null,
    solana: null,
    binancecoin: null,
  });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategy, setStrategy] = useState<Strategy>("momentum");
  const [botRunning, setBotRunning] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinId>("bitcoin");
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep latest state in refs for the bot tick
  const stateRef = useRef({ prices, history, cash, positions, strategy });
  useEffect(() => {
    stateRef.current = { prices, history, cash, positions, strategy };
  }, [prices, history, cash, positions, strategy]);

  // Fetch prices
  const fetchPrices = useCallback(async () => {
    try {
      const ids = COINS.map((c) => c.id).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      );
      const data = (await res.json()) as Record<CoinId, { usd: number }>;
      const now = Date.now();
      const newPrices: Record<CoinId, number> = { ...stateRef.current.prices };
      const newHist = { ...stateRef.current.history };
      for (const c of COINS) {
        const p = data[c.id]?.usd;
        if (typeof p === "number") {
          newPrices[c.id] = p;
          const h = [...(newHist[c.id] ?? []), { t: now, price: p }];
          newHist[c.id] = h.slice(-MAX_HISTORY);
        }
      }
      setPrices(newPrices);
      setHistory(newHist);
      setLastUpdate(now);
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

  // Trading logic
  const executeTrade = useCallback(
    (coin: CoinId, action: "BUY" | "SELL", price: number, reason: string) => {
      const s = stateRef.current;
      if (action === "BUY") {
        if (s.positions[coin]) return; // one position per coin at a time
        const spend = Math.min(s.cash, s.cash * TRADE_SIZE_PCT);
        if (spend < 10) return;
        const amount = spend / price;
        const trade: Trade = {
          id: crypto.randomUUID(),
          ts: Date.now(),
          coin,
          action,
          price,
          amount,
          usd: spend,
          reason,
        };
        setCash((c) => c - spend);
        setPositions((p) => ({ ...p, [coin]: { coin, amount, avgEntry: price } }));
        setTrades((t) => [trade, ...t]);
      } else {
        const pos = s.positions[coin];
        if (!pos) return;
        const proceeds = pos.amount * price;
        const trade: Trade = {
          id: crypto.randomUUID(),
          ts: Date.now(),
          coin,
          action,
          price,
          amount: pos.amount,
          usd: proceeds,
          reason,
        };
        setCash((c) => c + proceeds);
        setPositions((p) => ({ ...p, [coin]: null }));
        setTrades((t) => [trade, ...t]);
      }
    },
    [],
  );

  const botTick = useCallback(() => {
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
        const prices = hist.map((p) => p.price);
        const r = rsi(prices, 14);
        if (r == null) continue;
        if (!hasPos && r < 30) executeTrade(c.id, "BUY", last, `RSI ${r.toFixed(1)} oversold`);
        else if (hasPos && r > 70) executeTrade(c.id, "SELL", last, `RSI ${r.toFixed(1)} overbought`);
      }
    }
  }, [executeTrade]);

  useEffect(() => {
    if (!botRunning) return;
    const id = setInterval(botTick, BOT_TICK_MS);
    return () => clearInterval(id);
  }, [botRunning, botTick]);

  // Derived metrics
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

  const chartData = useMemo(
    () =>
      (history[selectedCoin] ?? []).slice(-30).map((p) => ({
        time: new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        price: p.price,
      })),
    [history, selectedCoin],
  );

  const resetSim = () => {
    setBotRunning(false);
    setCash(STARTING_BALANCE);
    setPositions({ bitcoin: null, ethereum: null, solana: null, binancecoin: null });
    setTrades([]);
  };

  const coinMeta = (id: CoinId) => COINS.find((c) => c.id === id)!;

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
              <p className="text-[11px] text-muted-foreground">Virtual money · CoinGecko live data</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`size-2 rounded-full ${lastUpdate ? "bg-bull animate-pulse" : "bg-muted-foreground"}`} />
              {lastUpdate ? `Live · ${new Date(lastUpdate).toLocaleTimeString()}` : "Connecting…"}
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
              onClick={() => setBotRunning((r) => !r)}
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
        {/* Top metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Portfolio Value"
            value={fmtUSD(portfolioValue)}
            icon={<Wallet className="size-4" />}
          />
          <MetricCard
            label="Total Return"
            value={fmtPct(totalReturnPct)}
            sub={fmtUSD(pnl)}
            tone={totalReturnPct >= 0 ? "bull" : "bear"}
            icon={totalReturnPct >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            big
          />
          <MetricCard label="Cash (USDT)" value={fmtUSD(cash)} />
          <MetricCard
            label="Bot Status"
            value={botRunning ? "Running" : "Stopped"}
            tone={botRunning ? "bull" : undefined}
            icon={<Bot className="size-4" />}
            sub={`Tick every ${BOT_TICK_MS / 1000}s`}
          />
        </section>

        {/* Prices + Chart */}
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

        {/* Positions */}
        <section className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Active Positions</h2>
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
                      No open positions. {botRunning ? "Bot is scanning the market…" : "Start the bot to begin trading."}
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
                    <Td className="text-xs text-muted-foreground">{t.reason}</Td>
                  </tr>
                ))}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
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
  label,
  value,
  sub,
  tone,
  icon,
  big,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "bull" | "bear";
  icon?: React.ReactNode;
  big?: boolean;
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
  children,
  right,
  mono,
  className = "",
}: {
  children: React.ReactNode;
  right?: boolean;
  mono?: boolean;
  className?: string;
}) {
  return (
    <td className={`px-4 py-2 ${right ? "text-right" : ""} ${mono ? "tabular" : ""} ${className}`}>
      {children}
    </td>
  );
}
