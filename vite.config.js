import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Pages, the site is served from /<repo>/, so VITE_BASE must be set
// (e.g. VITE_BASE=/aio/ in the deploy workflow). Locally `/` is used.
const base = process.env.VITE_BASE || "/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
