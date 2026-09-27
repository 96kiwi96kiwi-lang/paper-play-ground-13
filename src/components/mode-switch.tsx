/**
 * Safe Paper / Live mode switch.
 * Live requires explicit confirmation + server-side credentials.
 * API keys are never requested or rendered on the client.
 */

import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  fetchExchangeHealth,
  fetchModeStatus,
  requestClearHalt,
  requestSetMode,
} from "@/lib/server/mode-fns";
import type { ModeStatus } from "@/lib/server/trading-mode";

type ClientAlert = {
  at: number;
  reason: string;
  code?: string;
  mode?: string;
};

type ClientGridBook = {
  symbol: string;
  mid: number;
  spacingPct: number;
  lastSide?: "buy" | "sell";
  lastLevel?: number;
  lastFillPrice?: number;
  lastFillAgeMs: number | null;
  stackedBuys: number;
  reserved: boolean;
};

type ClientPaperBook = {
  cash: number;
  used: number;
  total: number;
  positionCount: number;
};

type ClientDailyCap = {
  used: number;
  max: number;
  remaining: number;
  dayKey: string;
  exhausted: boolean;
};

function formatFillAge(ageMs: number | null): string {
  if (ageMs == null) return "no fill";
  const sec = Math.round(ageMs / 1000);
  if (sec < 90) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 90) return `${min}m ago`;
  return `${Math.round(min / 60)}h ago`;
}

export function LiveModeBanner({ mode }: { mode: "paper" | "live" }) {
  if (mode !== "live") return null;
  return (
    <div className="w-full bg-red-600 text-white text-center text-xs font-bold tracking-widest py-1.5 uppercase">
      LIVE MODE — real capital at risk — KuCoin spot orders enabled
    </div>
  );
}

export function ModeSwitch() {
  const [status, setStatus] = useState<ModeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const [clearTyped, setClearTyped] = useState("");
  const [stale, setStale] = useState(false);
  const [ageSec, setAgeSec] = useState<number | null>(null);
  const [haltReason, setHaltReason] = useState<string | null>(null);
  const [clearedAt, setClearedAt] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [gridBooks, setGridBooks] = useState<ClientGridBook[]>([]);
  const [paperBook, setPaperBook] = useState<ClientPaperBook | null>(null);
  const [dailyCap, setDailyCap] = useState<ClientDailyCap | null>(null);

  const refresh = async () => {
    try {
      const next = await fetchModeStatus();
      setStatus(next);
      const health = await fetchExchangeHealth();
      setStale(Boolean(health.heartbeatStale));
      setAgeSec(
        health.heartbeatAgeMs != null ? Math.round(health.heartbeatAgeMs / 1000) : null,
      );
      // Use haltReason from health only. lastHardStop.reason survives a clear
      // for history and must not keep the cluster in Halt after operator ack.
      setHaltReason(health.haltReason ?? null);
      setClearedAt(health.lastHardStop?.clearedAt ?? null);
      setAlerts(Array.isArray(health.recentAlerts) ? health.recentAlerts.slice(-5) : []);
      setGridBooks(Array.isArray(health.gridBooks) ? health.gridBooks.slice(0, 4) : []);
      setPaperBook(health.paperBook ?? null);
      setDailyCap(health.dailyCap ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mode");
    }
  };

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 45_000);
    return () => clearInterval(id);
  }, []);

  const mode = status?.mode ?? "paper";

  const enableLive = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await requestSetMode({ data: { mode: "live", confirmed: true } });
      setStatus(next);
      setConfirmOpen(false);
      setTyped("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable live");
    } finally {
      setBusy(false);
    }
  };

  const backToPaper = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await requestSetMode({ data: { mode: "paper", confirmed: false } });
      setStatus(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch to paper");
    } finally {
      setBusy(false);
    }
  };

  const confirmClearHalt = async () => {
    setBusy(true);
    setError(null);
    try {
      await requestClearHalt({ data: { confirmed: true, note: "dashboard CLEAR HALT" } });
      setClearOpen(false);
      setClearTyped("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear halt");
    } finally {
      setBusy(false);
    }
  };

  const liveReady = Boolean(status?.hasCredentials);

  return (
    <>
      <LiveModeBanner mode={mode} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy || mode === "paper"}
          onClick={() => void backToPaper()}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium border ${
            mode === "paper"
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="size-3" />
          PAPER
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (mode === "live") return;
            setConfirmOpen(true);
          }}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium border ${
            mode === "live"
              ? "border-red-500 bg-red-600 text-white"
              : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
          }`}
          title={liveReady ? "Enable live trading (confirmation required)" : "Server API keys required"}
        >
          <AlertTriangle className="size-3" />
          LIVE
        </button>
      </div>
      {stale && (
        <span className="text-[10px] text-amber-400 max-w-[18rem]">
          Watchdog: no tick for {ageSec ?? "?"}s
        </span>
      )}
      {haltReason && (
        <span className="text-[10px] text-red-400 max-w-[18rem] truncate" title={haltReason}>
          Halt: {haltReason}
        </span>
      )}
      {haltReason && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setClearOpen(true)}
          className="text-[10px] px-2 py-1 rounded-md border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-40"
        >
          Clear halt
        </button>
      )}
      {!haltReason && clearedAt != null && (
        <span className="text-[10px] text-muted-foreground max-w-[18rem] truncate">
          Halt cleared
        </span>
      )}
      {paperBook && (
        <span
          className="text-[10px] text-muted-foreground max-w-[18rem] truncate"
          title={`Paper cash=${paperBook.cash.toFixed(2)} used=${paperBook.used.toFixed(2)} equity=${paperBook.total.toFixed(2)} positions=${paperBook.positionCount}`}
        >
          Paper ${paperBook.total.toFixed(0)} cash={paperBook.cash.toFixed(0)} pos={paperBook.positionCount}
        </span>
      )}
      {dailyCap && (
        <span
          className={`text-[10px] max-w-[18rem] truncate ${dailyCap.exhausted ? "text-amber-400" : "text-muted-foreground"}`}
          title={`UTC ${dailyCap.dayKey} accepted submits ${dailyCap.used}/${dailyCap.max} remaining=${dailyCap.remaining}. Cap is not a hard-stop.`}
        >
          Cap {dailyCap.used}/{dailyCap.max}
          {dailyCap.exhausted ? " exhausted" : ` left=${dailyCap.remaining}`}
        </span>
      )}
      {gridBooks.length > 0 && (
        <ol className="text-[10px] text-muted-foreground max-w-[18rem] space-y-0.5">
          {gridBooks.map((g) => (
            <li
              key={g.symbol}
              className="truncate"
              title={`${g.symbol} mid=${g.mid} space=${g.spacingPct}% stack=${g.stackedBuys} fill=${g.lastFillPrice ?? "-"} ${formatFillAge(g.lastFillAgeMs)}`}
            >
              Grid {g.symbol.split("/")[0]} mid={g.mid.toFixed(2)} stack={g.stackedBuys}
              {g.lastSide ? ` last=${g.lastSide}` : ""}
              {g.lastLevel != null ? ` L${g.lastLevel}` : ""}
              {` ${formatFillAge(g.lastFillAgeMs)}`}
              {g.reserved ? " (reserved)" : ""}
            </li>
          ))}
        </ol>
      )}
      {alerts.length > 0 && (
        <ol className="text-[10px] text-muted-foreground max-w-[18rem] space-y-0.5">
          {alerts.slice().reverse().map((a) => (
            <li key={`${a.at}-${a.code ?? a.reason}`} className="truncate" title={a.reason}>
              {a.code ? `${a.code}: ` : ""}
              {a.reason}
            </li>
          ))}
        </ol>
      )}
      {error && <span className="text-[10px] text-red-400 max-w-[18rem] truncate">{error}</span>}
      {status?.keyAuditMessage && mode === "paper" && (
        <span className="text-[10px] text-muted-foreground max-w-[18rem] truncate" title={status.keyAuditMessage}>
          {status.keyAuditMessage}
        </span>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-lg border border-red-500/40 bg-card p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="size-5" />
              <h2 className="text-sm font-semibold">Enable LIVE trading?</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Live mode sends real spot orders to KuCoin. Default remains paper. Keys stay on the
              server and are never sent to this page. The server will refuse LIVE if the key has
              Withdraw permission or Trade is missing.
            </p>
            {!liveReady && (
              <p className="text-xs text-amber-400">
                Server is missing KUCOIN_API_KEY / SECRET / PASSWORD. Live cannot be enabled until
                those env vars are set by the operator.
              </p>
            )}
            <label className="block text-[11px] text-muted-foreground">
              Type <span className="font-mono text-foreground">ENABLE LIVE</span> to confirm
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-input px-2 py-1.5 text-xs"
                autoComplete="off"
              />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setConfirmOpen(false);
                  setTyped("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || typed.trim().toUpperCase() !== "ENABLE LIVE" || !liveReady}
                onClick={() => void enableLive()}
                className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white disabled:opacity-40"
              >
                {busy ? "Switching…" : "Confirm LIVE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {clearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-lg border border-amber-500/40 bg-card p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="size-5" />
              <h2 className="text-sm font-semibold">Clear persisted halt?</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This stamps <span className="font-mono">clearedAt</span> so a restart will not restore
              the halt. It does not enable live trading and does not reset daily PnL or drawdown —
              those still halt if still breached.
            </p>
            {haltReason && (
              <p className="text-xs text-red-300 truncate" title={haltReason}>
                Current: {haltReason}
              </p>
            )}
            <label className="block text-[11px] text-muted-foreground">
              Type <span className="font-mono text-foreground">CLEAR HALT</span> to confirm
              <input
                value={clearTyped}
                onChange={(e) => setClearTyped(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-input px-2 py-1.5 text-xs"
                autoComplete="off"
              />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setClearOpen(false);
                  setClearTyped("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || clearTyped.trim().toUpperCase() !== "CLEAR HALT"}
                onClick={() => void confirmClearHalt()}
                className="text-xs px-3 py-1.5 rounded-md bg-amber-600 text-black disabled:opacity-40"
              >
                {busy ? "Clearing…" : "Confirm clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
