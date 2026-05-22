// viz-registry.js — registry for interactive viz components.
//
// Each viz module exports a default React component plus a `vizId` string.
// `src/viz/index.js` collects all viz modules and calls `register(id, Component)`
// on startup, so MD files can reference visualisations by id via `::: viz <id>`.

const registry = new Map();

export function register(id, Component) {
  if (!id || typeof id !== "string") {
    throw new Error(`viz: register() requires a string id (got ${typeof id})`);
  }
  if (registry.has(id)) {
    console.warn(`viz: overwriting existing registration for "${id}"`);
  }
  registry.set(id, Component);
}

export function get(id) {
  return registry.get(id);
}

export function list() {
  return Array.from(registry.keys());
}
