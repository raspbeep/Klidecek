import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.jsx";
import { ErrorBoundary, installChunkErrorRecovery, installVersionCheck } from "./framework/error-boundary.jsx";
import "./styles.css";

// Resilience against redeploys: recover if a code-split chunk 404s (stale cached
// index.html → deleted child chunk), and proactively reload when a newer build is
// detected. __BUILD_ID__ is replaced at build time (see vite.config.js).
const BUILD_ID = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "dev";
installChunkErrorRecovery();
installVersionCheck(BUILD_ID);

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

requestAnimationFrame(() => {
  document.body.classList.remove("booting");
  document.body.classList.add("booted");
});
