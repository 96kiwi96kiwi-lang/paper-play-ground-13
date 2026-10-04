import { definePlugin } from "nitro";
import { registerHardStopMonitoring } from "./register-monitoring";
import { stopPaperServerLoop } from "./paper-loop";

// Nitro loads the SSR entry lazily. A runtime plugin must arm the worker before
// the first HTTP request, including when this service has no public domain.
export default definePlugin((app) => {
  registerHardStopMonitoring();
  app.hooks.hook("close", () => { stopPaperServerLoop("server shutdown"); });
});
