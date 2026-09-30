import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // The whole game compiles to one self-contained index.html, so every
  // asset (fonts included) has to be inlined rather than emitted alongside it.
  build: {
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1000,
    // nothing is code-split, so Vite's modulepreload polyfill would ship a
    // few hundred bytes of dead code — including the bundle's only `fetch`.
    modulePreload: { polyfill: false },
  },

  server: {
    host: true, // listen on 0.0.0.0 so the sandbox preview can reach it
    port: 5173,
    // dev-server host check: allow loopback plus the sandbox preview domain
    allowedHosts: [".e2b.app"],
  },
});
