import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// For GitHub Pages, the site is served from /<repo>/, so VITE_BASE must be set
// (e.g. VITE_BASE=/aio/ in the deploy workflow). Locally `/` is used.
const base = process.env.VITE_BASE || "/";

// A unique id per build. Compiled into the bundle as __BUILD_ID__ and also written
// to dist/version.json, so a running (possibly stale, cached) tab can detect that a
// newer version has been deployed and reload itself — see installVersionCheck().
const BUILD_ID = process.env.VITE_BUILD_ID || String(Date.now());

// GitHub Pages has no SPA rewrite, so a clean deep link like /<repo>/x/NSEC/t04
// would 404 on a hard load/refresh. Emitting 404.html as a copy of index.html
// makes Pages serve the app for any unmatched path; the client router then
// renders the right route. This is what lets us drop the "#/" hash router.
function spaFallback() {
  let outDir = "dist";
  return {
    name: "spa-404-fallback",
    configResolved(cfg) { outDir = cfg.build.outDir || "dist"; },
    closeBundle() {
      const idx = resolve(outDir, "index.html");
      if (existsSync(idx)) copyFileSync(idx, resolve(outDir, "404.html"));
      // Version marker, fetched no-store at runtime to detect a newer deploy.
      writeFileSync(resolve(outDir, "version.json"), JSON.stringify({ buildId: BUILD_ID }) + "\n");
    },
  };
}

export default defineConfig({
  base,
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  plugins: [react(), spaFallback()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
