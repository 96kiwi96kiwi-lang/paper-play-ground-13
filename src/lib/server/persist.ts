/**
 * Server-side persistent bot state.
 * LocalStorage is UI-only; this file store survives process restarts.
 * Never write API keys here.
 */

export { persistLastReject, loadLastReject, sanitizeLastReject } from "./last-reject";
export type { PersistedLastReject } from "./last-reject";

throw new Error("persist.ts was overwritten; restore body from commit 498329da689f90b792262deed34125ffc95f0d55");
