// error-boundary.jsx — keep a failed chunk / render error from white-screening the page.
//
// Two failure modes this guards against:
//  1. Stale deploy: after a redeploy the browser may hold a cached index.html (or a
//     cached parent chunk) that references an OLD hashed child chunk that no longer
//     exists on the server. The `import()` for that chunk then resolves to the SPA
//     404 fallback (`text/html`) and the module fails to load — classically a blank
//     white page. Recovery: reload ONCE to fetch a fresh, self-consistent index.html.
//  2. A genuine runtime error inside a component. Recovery: show a small inline notice
//     instead of tearing down the whole React tree.
import { Component } from "react";

const CHUNK_RE =
  /dynamically imported module|loading chunk|importing a module script|disallowed mime|failed to fetch dynamically|error loading|module script failed/i;

export function isChunkLoadError(err) {
  const msg = String((err && (err.message || err.toString())) || err || "");
  return CHUNK_RE.test(msg);
}

// Reload once to recover a stale deploy; the sessionStorage stamp prevents a reload
// loop if the chunk is genuinely gone even after a fresh index.html.
export function recoverFromStaleChunk() {
  try {
    const k = "okruhy.chunkReloadAt";
    const last = Number(sessionStorage.getItem(k) || 0);
    if (Date.now() - last < 10000) return false; // already tried in the last 10 s
    sessionStorage.setItem(k, String(Date.now()));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

// Install global handlers so a stale chunk recovers even when it fails outside React's
// render (e.g. a modulepreload link, or an unhandled import() rejection). Idempotent.
let installed = false;
export function installChunkErrorRecovery() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  // Vite fires this when a build-time code-split chunk fails to (pre)load.
  window.addEventListener("vite:preloadError", (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    recoverFromStaleChunk();
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (isChunkLoadError(e && e.reason)) recoverFromStaleChunk();
  });
}

// Proactively detect that a newer build has been deployed and reload before the user
// hits a now-deleted chunk. Fetches version.json (no-store) shortly after load and
// whenever the tab is refocused; if its buildId differs from the running build, the
// guarded reload pulls a fresh (no-cache) index.html with the current asset hashes.
export function installVersionCheck(currentBuildId) {
  if (typeof window === "undefined" || !currentBuildId || currentBuildId === "dev") return;
  const base = (import.meta.env && import.meta.env.BASE_URL) || "/";
  const url = base + "version.json";
  let busy = false;
  const check = async () => {
    if (busy || document.visibilityState === "hidden") return;
    busy = true;
    try {
      const r = await fetch(url + "?t=" + Date.now(), { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        if (data && data.buildId && data.buildId !== currentBuildId) recoverFromStaleChunk();
      }
    } catch {
      /* offline or version.json absent (e.g. local dev) — ignore */
    } finally {
      busy = false;
    }
  };
  setTimeout(check, 4000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    // A chunk error that surfaced through render: try the same one-shot reload.
    if (isChunkLoadError(error)) recoverFromStaleChunk();
  }
  reset = () => this.setState({ error: null });
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const stale = isChunkLoadError(error);
    if (this.props.fallback) return this.props.fallback({ error, stale, reset: this.reset });
    return (
      <div role="alert" style={{ padding: 16, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
        {stale
          ? "Stránka se nenačetla správně (zřejmě po aktualizaci). "
          : "Něco se pokazilo při vykreslování. "}
        <button
          onClick={() => window.location.reload()}
          style={{ font: "inherit", color: "var(--accent)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer", padding: 0 }}
        >
          obnovit stránku
        </button>
      </div>
    );
  }
}
