import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Standalone library build for the embeddable widget itself.
 *
 * This is intentionally a SEPARATE config from `vite.config.ts` (which
 * builds the React demo host page). Run it with:
 *
 *   npx vite build --config vite.widget.config.ts
 *
 * Output lands in `public/widget/` so that the demo app's own
 * `npm run build` (via the normal Vite static-asset copy step) ships the
 * real distributable widget files alongside the demo, and the plain HTML
 * `embed-test.html` page can load them with a relative <script type="module">
 * import, exactly like an external website would from a CDN.
 */
export default defineConfig({
  // This build's outDir lives inside the demo app's public/ directory on
  // purpose (see comment above), but we must disable Vite's automatic
  // "copy publicDir into outDir" behavior here, otherwise it would copy
  // public/* (including this very output) into itself.
  publicDir: false,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "public/widget"),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/widget/index.ts"),
      name: "LiveCodePlayground",
      formats: ["es", "umd"],
      fileName: (format) => (format === "es" ? "live-code-playground.es.js" : "live-code-playground.js"),
    },
    rollupOptions: {
      output: {
        exports: "named",
      },
    },
    sourcemap: true,
  },
});
