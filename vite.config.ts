// Lovable preset + explicit Nitro node-server for Railway.
// Do NOT re-add React/TanStack/Tailwind plugins — the preset already includes them.
import { defineConfig as defineViteConfig } from "vite";
import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineViteConfig(async (env) => {
  const config = await defineLovableConfig({
    cloudflare: false,
    tanstackStart: {
      server: { entry: "server" },
    },
    // Disable preset-bundled nitro (defaults toward cloudflare); we attach node-server below.
    // @ts-expect-error — option used at runtime by the preset
    nitro: false,
  })(env);

  if (env.command === "build") {
    config.plugins = [...(config.plugins ?? []), nitro({ preset: "node-server" })];
  }

  return config;
});
