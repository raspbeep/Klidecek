// tier.js — content "tier" classification: which material is core exam knowledge
// vs. supplementary (worked examples, real-world usage, beyond-syllabus extras).
//
// A tier can be attached to a WHOLE subtopic (frontmatter `tier:`) or to a
// heading-delimited SECTION inside a subtopic (a `{…}` attribute on the heading,
// see md-parser.js). Non-core content gets a badge and is collapsible; by default
// it starts collapsed (an `open` flag forces it expanded — "based on necessity").
//
//   ---                         ### V praxi: řízení DC motoru {tier=practice}
//   tier: example               ### Worked example {.example open}
//   ---
//
// Recognised non-core kinds (the value/label/hue drives the badge):
export const TIER_META = {
  example:  { label: "Příklad",  hue: 150, desc: "Ilustrativní příklad — doplněk, ne jádro k okruhu." },
  practice: { label: "V praxi",  hue: 35,  desc: "Reálné použití / aplikace mimo zkouškové jádro." },
  extra:    { label: "Navíc",    hue: 285, desc: "Rozšiřující obsah nad rámec okruhů." },
};
// Fallback for an explicitly-tiered-but-unknown kind (e.g. `{.foo}`).
export const DEFAULT_TIER = { label: "Doplněk", hue: 220, desc: "Doplňkový obsah mimo jádro." };

// Parse a tier spec string into a normalised descriptor, or null if `raw` is not
// a tier spec. Accepts: a bare kind (`example`), the `core` sentinel, a dotted
// form (`.practice`), a `tier=` form (`tier=practice`), each optionally followed
// by flags — currently only `open` (start expanded instead of collapsed).
//   parseTier("example")        → { core:false, kind:"example", defaultOpen:false, label, hue, desc }
//   parseTier("practice open")  → { …, defaultOpen:true }
//   parseTier("core")           → { core:true }
//   parseTier("randomword")     → null   (a bare unknown word is NOT a tier)
//   parseTier(".randomword")    → { core:false, kind:"randomword", …DEFAULT_TIER }
export function parseTier(raw) {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;
  const dotted = s.startsWith(".");
  const eq = /^tier\s*=/i.test(s);
  s = s.replace(/^\./, "").replace(/^tier\s*=\s*/i, "").trim();
  const tokens = s.split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const kind = tokens[0].toLowerCase();
  const flags = tokens.slice(1).map((t) => t.toLowerCase());
  if (kind === "core") return { core: true };
  const known = Object.prototype.hasOwnProperty.call(TIER_META, kind);
  // A bare unknown word (no `.`/`tier=` marker) is ordinary text, not a tier —
  // so a heading that merely ends in `{something}` isn't hijacked.
  if (!known && !dotted && !eq) return null;
  const meta = TIER_META[kind] || DEFAULT_TIER;
  return {
    core: false,
    kind,
    defaultOpen: flags.includes("open"),
    label: meta.label,
    hue: meta.hue,
    desc: meta.desc,
  };
}
