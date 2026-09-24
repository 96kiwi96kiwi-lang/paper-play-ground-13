/**
 * Safe Paper / Live mode switch.
 * Live requires explicit confirmation + server-side credentials.
 * API keys are never requested or rendered on the client.
 */

import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  fetchModeStatus,
  requestSetMode,
} from "@/lib/server/mode-fns";
import type { ModeStatus } from "@/lib/server/trading-mode";

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

  const refresh = async () => {
    try {
      const next = await fetchModeStatus();
      setStatus(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mode");
    }
  };

  useEffect(() => {
    void refresh();
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
    </>
  );
}
