// Workflow patterns — Petri-net token animation pro 5 základních vzorů.
// Pick a pattern; click "fire" to advance transitions and watch tokens move
// through places, demonstrating the runtime semantics.
import { useState, useMemo } from "react";

/**
 * Each pattern is a small Petri net:
 *  - places: nodes that can hold tokens (circles)
 *  - transitions: enable when all input places have tokens, then move tokens (rectangles)
 *
 * A "marking" is a map placeId -> count. We simulate firing.
 */

const PATTERNS = {
  sequence: {
    name: "Sekvence",
    desc: "Krok B začne až po dokončení A. Token putuje lineárně.",
    places: [
      { id: "p1", label: "start", x: 50, y: 60 },
      { id: "p2", label: "po A", x: 220, y: 60 },
      { id: "p3", label: "po B", x: 390, y: 60 },
      { id: "p4", label: "konec", x: 510, y: 60 },
    ],
    transitions: [
      { id: "A", label: "A", x: 135, y: 60, in: ["p1"], out: ["p2"] },
      { id: "B", label: "B", x: 305, y: 60, in: ["p2"], out: ["p3"] },
      { id: "C", label: "konec", x: 450, y: 60, in: ["p3"], out: ["p4"] },
    ],
    initial: { p1: 1 },
    target: { p4: 1 },
  },

  andSplit: {
    name: "AND-split + AND-join (paralelní)",
    desc: "AND brána rozdělí token do všech výstupních větví. Join čeká na všechny.",
    places: [
      { id: "p1", label: "start", x: 50, y: 80 },
      { id: "p2", label: "větev B", x: 230, y: 30 },
      { id: "p3", label: "větev C", x: 230, y: 130 },
      { id: "p4", label: "po B", x: 370, y: 30 },
      { id: "p5", label: "po C", x: 370, y: 130 },
      { id: "p6", label: "konec", x: 510, y: 80 },
    ],
    transitions: [
      { id: "split", label: "⊕ split", x: 140, y: 80, in: ["p1"], out: ["p2", "p3"], kind: "and" },
      { id: "B", label: "B", x: 300, y: 30, in: ["p2"], out: ["p4"] },
      { id: "C", label: "C", x: 300, y: 130, in: ["p3"], out: ["p5"] },
      { id: "join", label: "⊕ join", x: 440, y: 80, in: ["p4", "p5"], out: ["p6"], kind: "and" },
    ],
    initial: { p1: 1 },
    target: { p6: 1 },
  },

  xorSplit: {
    name: "XOR-split + XOR-merge (volba)",
    desc: "XOR vstupuje do PRÁVĚ JEDNÉ větve podle podmínky. Merge propustí jakýkoli příchozí token.",
    places: [
      { id: "p1", label: "start", x: 50, y: 80 },
      { id: "p2", label: "větev B", x: 230, y: 30 },
      { id: "p3", label: "větev C", x: 230, y: 130 },
      { id: "p4", label: "po větvi", x: 380, y: 80 },
      { id: "p5", label: "konec", x: 510, y: 80 },
    ],
    transitions: [
      { id: "B", label: "B (volba 1)", x: 140, y: 30, in: ["p1"], out: ["p2"], kind: "xor" },
      { id: "C", label: "C (volba 2)", x: 140, y: 130, in: ["p1"], out: ["p3"], kind: "xor" },
      { id: "mB", label: "→", x: 310, y: 30, in: ["p2"], out: ["p4"] },
      { id: "mC", label: "→", x: 310, y: 130, in: ["p3"], out: ["p4"] },
      { id: "end", label: "konec", x: 450, y: 80, in: ["p4"], out: ["p5"] },
    ],
    initial: { p1: 1 },
    target: { p5: 1 },
  },

  orSplit: {
    name: "OR-split + OR-join (inkluzivně)",
    desc: "OR-split může aktivovat jednu i obě větve. OR-join čeká na všechny, které byly aktivovány — to je v implementaci náročnější.",
    places: [
      { id: "p1", label: "start", x: 50, y: 80 },
      { id: "p2", label: "větev B", x: 230, y: 30 },
      { id: "p3", label: "větev C", x: 230, y: 130 },
      { id: "p4", label: "po B", x: 370, y: 30 },
      { id: "p5", label: "po C", x: 370, y: 130 },
      { id: "p6", label: "konec", x: 510, y: 80 },
    ],
    transitions: [
      { id: "splitB", label: "○ B?", x: 140, y: 30, in: ["p1"], out: ["p2"], kind: "or" },
      { id: "splitC", label: "○ C?", x: 140, y: 130, in: ["p1"], out: ["p3"], kind: "or" },
      { id: "B", label: "B", x: 300, y: 30, in: ["p2"], out: ["p4"] },
      { id: "C", label: "C", x: 300, y: 130, in: ["p3"], out: ["p5"] },
      { id: "join", label: "○ join", x: 440, y: 80, in: ["p4", "p5"], out: ["p6"], kind: "or" },
    ],
    initial: { p1: 1 },
    target: { p6: 1 },
    note: "U OR-split předpokládáme, že obě podmínky platí (aktivují se obě větve).",
  },

  loop: {
    name: "Cyklus (loop)",
    desc: "Aktivita opakovaná, dokud není splněna podmínka. XOR brána se rozhodne mezi „pokračovat\" a „ukončit\".",
    places: [
      { id: "p1", label: "start", x: 50, y: 80 },
      { id: "p2", label: "před A", x: 200, y: 80 },
      { id: "p3", label: "po A", x: 350, y: 80 },
      { id: "p4", label: "konec", x: 510, y: 80 },
    ],
    transitions: [
      { id: "begin", label: "→", x: 120, y: 80, in: ["p1"], out: ["p2"] },
      { id: "A", label: "A", x: 270, y: 80, in: ["p2"], out: ["p3"] },
      { id: "again", label: "znovu", x: 270, y: 150, in: ["p3"], out: ["p2"], kind: "xor" },
      { id: "exit", label: "ukončit", x: 430, y: 80, in: ["p3"], out: ["p4"], kind: "xor" },
    ],
    initial: { p1: 1 },
    target: { p4: 1 },
    note: "Klikni „znovu\" pro další iteraci, „ukončit\" pro výstup.",
  },
};

function isEnabled(transition, marking) {
  return transition.in.every((p) => (marking[p] || 0) > 0);
}

function fireTransition(transition, marking) {
  const next = { ...marking };
  for (const p of transition.in) next[p] = (next[p] || 0) - 1;
  for (const p of transition.out) next[p] = (next[p] || 0) + 1;
  return next;
}

export default function WorkflowPatterns() {
  const [patternId, setPatternId] = useState("sequence");
  const pattern = PATTERNS[patternId];
  const [marking, setMarking] = useState(pattern.initial);

  // Re-init marking when switching pattern
  const switchPattern = (id) => {
    setPatternId(id);
    setMarking(PATTERNS[id].initial);
  };

  const reset = () => setMarking(pattern.initial);

  const enabledTransitions = useMemo(
    () => pattern.transitions.filter((t) => isEnabled(t, marking)),
    [marking, pattern]
  );

  const fire = (t) => setMarking(fireTransition(t, marking));

  const completed = Object.entries(pattern.target).every(([p, n]) => (marking[p] || 0) >= n);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Pattern picker */}
      <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--bg-inset)", borderRadius: 8, flexWrap: "wrap" }}>
        {Object.entries(PATTERNS).map(([id, p]) => (
          <button key={id} onClick={() => switchPattern(id)}
            className="btn ghost"
            style={{
              background: patternId === id ? "var(--bg-card)" : "transparent",
              boxShadow: patternId === id ? "var(--shadow-sm)" : "none",
              padding: "5px 10px",
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
            }}>
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
        {pattern.desc}
      </div>

      {/* Petri net diagram */}
      <svg viewBox="0 0 560 220" style={{ width: "100%", maxWidth: 560 }}>
        <rect width="560" height="220" fill="var(--bg-inset)" />

        {/* Arcs */}
        {pattern.transitions.flatMap((t) =>
          [...t.in.map((p) => ({ from: pattern.places.find((pl) => pl.id === p), to: t, kind: "in" })),
           ...t.out.map((p) => ({ from: t, to: pattern.places.find((pl) => pl.id === p), kind: "out" }))]
        ).map((arc, i) => (
          <line key={i} x1={arc.from.x} y1={arc.from.y} x2={arc.to.x} y2={arc.to.y}
            stroke="var(--text-muted)" strokeWidth="1" markerEnd="url(#wpA)" opacity="0.5" />
        ))}

        {/* Places */}
        {pattern.places.map((p) => {
          const count = marking[p.id] || 0;
          return (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={18}
                fill="var(--bg-card)"
                stroke={count > 0 ? "oklch(0.55 0.18 142)" : "var(--line-strong)"}
                strokeWidth={count > 0 ? "1.8" : "1"} />
              {/* Tokens (up to 3 visible, then number) */}
              {count > 0 && count <= 3 && Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * 2 * Math.PI;
                const dx = count === 1 ? 0 : Math.cos(angle) * 7;
                const dy = count === 1 ? 0 : Math.sin(angle) * 7;
                return <circle key={i} cx={p.x + dx} cy={p.y + dy} r="5" fill="oklch(0.45 0.20 142)" />;
              })}
              {count > 3 && (
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="oklch(0.40 0.20 142)">{count}</text>
              )}
              <text x={p.x} y={p.y + 33} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">
                {p.label}
              </text>
            </g>
          );
        })}

        {/* Transitions */}
        {pattern.transitions.map((t) => {
          const enabled = isEnabled(t, marking);
          const color = t.kind === "and" ? 264 : t.kind === "xor" ? 22 : t.kind === "or" ? 80 : 142;
          return (
            <g key={t.id}
              onClick={() => enabled && fire(t)}
              style={{ cursor: enabled ? "pointer" : "not-allowed" }}>
              <rect x={t.x - 30} y={t.y - 13} width="60" height="26" rx="3"
                fill={enabled ? `oklch(0.62 0.14 ${color} / 0.35)` : "var(--bg-card)"}
                stroke={enabled ? `oklch(0.55 0.18 ${color})` : "var(--line-strong)"}
                strokeWidth={enabled ? "2" : "1"} />
              <text x={t.x} y={t.y + 4} textAnchor="middle" fontSize="11" fontWeight="600"
                fill={enabled ? "var(--text)" : "var(--text-faint)"} style={{ pointerEvents: "none" }}>
                {t.label}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="wpA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      {/* Controls */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
          enabled transitions:
        </span>
        {enabledTransitions.length === 0 ? (
          <span style={{ fontSize: 11.5, color: "var(--text-faint)", fontStyle: "italic" }}>
            {completed ? "✓ workflow dokončen" : "(žádný)"}
          </span>
        ) : (
          enabledTransitions.map((t) => (
            <button key={t.id} onClick={() => fire(t)} style={fireBtn}>
              ▶ {t.label}
            </button>
          ))
        )}
        <button onClick={reset} style={{ ...fireBtn, marginLeft: "auto", background: "oklch(0.55 0.18 22 / 0.10)" }}>↺ reset</button>
      </div>

      {pattern.note && (
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
          {pattern.note}
        </div>
      )}

      {completed && (
        <div style={{
          padding: 8, borderRadius: 6,
          background: "oklch(0.62 0.14 142 / 0.10)",
          border: "1px solid oklch(0.55 0.14 142)",
          fontSize: 12, color: "oklch(0.30 0.14 142)",
        }}>
          ✓ Workflow dosáhl cílového stavu. Klikni „reset" pro restart.
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
        <strong>Pravidla Petri sítí:</strong> kroužek = <em>place</em>, obdélník = <em>transition</em>.
        Transition se aktivuje, když všechny vstupní places mají token. Po vykonání spotřebuje vstupní tokeny a vyrobí výstupní.
        Klikni na zvýrazněný obdélník nebo tlačítko „▶".
      </div>
    </div>
  );
}

const fireBtn = {
  padding: "4px 10px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--text)",
};
