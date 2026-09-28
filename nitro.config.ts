import { defineConfig } from "nitro";

// Railway runs a long-lived Node process — not Cloudflare Workers.
export default defineConfig({
  preset: "node-server",
});
