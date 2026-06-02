// viz-registry.js — registry for interactive viz components.
//
// `src/viz/index.js` registers every viz by id with a *dynamic-import loader*
// (`() => import("./foo.jsx")`) rather than an eagerly-imported component, so
// Vite code-splits each viz into its own chunk. `register()` wraps the loader in
// `React.lazy`, so the chunk is only fetched when that viz is actually rendered
// (which, combined with the in-view gating in content-blocks.jsx, means a page
// loads only the viz a reader can currently see). MD files reference a viz by id
// via `::: viz <id>`.

import { lazy } from "react";

const registry = new Map();

export function register(id, loader) {
  if (!id || typeof id !== "string") {
    throw new Error(`viz: register() requires a string id (got ${typeof id})`);
  }
  if (typeof loader !== "function") {
    throw new Error(`viz: register("${id}", loader) requires a () => import(...) loader`);
  }
  if (registry.has(id)) {
    console.warn(`viz: overwriting existing registration for "${id}"`);
  }
  registry.set(id, lazy(loader));
}

export function get(id) {
  return registry.get(id);
}

export function list() {
  return Array.from(registry.keys());
}
