import { defineConfig } from "nitro/config";

export default defineConfig({
  plugins: ["./src/lib/server/nitro-startup.ts"],
});
