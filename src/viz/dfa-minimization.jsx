// DFA minimalizace — postupné zjemňování ekvivalence ≡^k.
// Preset z přednášky: 6 stavů A..F, koncové {A,F}, ≡ stabilizuje po 2. iteraci na {A,F},{B,E},{C,D}.
// Klikni krok: ukáže se aktuální rozklad jako barvy stavů a tabulka "kam vede přechod do které třídy".
import { useState, useMemo } from "react";

const PRESET = {
  states: ["A", "B", "C", "D", "E", "F"],
  start: "A",
  final: ["A", "F"],
  alphabet: ["a", "b"],
  delta: {
    A: { a: "F", b: "B" },
    B: { a: "E", b: "D" },
    C: { a: "C", b: "F" },
    D: { a: "D", b: "A" },
    E: { a: "B", b: "C" },
    F: { a: "A", b: "E" },
  },
};

function refine(grammar) {
  const { states, final, alphabet, delta } = grammar;
  const finalSet = new Set(final);
  // Initial partition: F vs Q\F
  let classes = []; // array of arrays
  const nonF = states.filter((s) => !finalSet.has(s));
  const F = states.filter((s) => finalSet.has(s));
  if (F.length) classes.push([...F]);
  if (nonF.length) classes.push([...nonF]);

  const history = [{ classes: classes.map((c) => [...c]), label: "≡⁰: rozdělit podle F vs Q∖F" }];
  let iter = 0;
  while (true) {
    iter++;
    const classOf = new Map();
    classes.forEach((c, idx) => c.forEach((s) => classOf.set(s, idx)));
    const newClasses = [];
    for (const cls of classes) {
      // Group states in cls by their signature: tuple of class indices for each symbol
      const buckets = new Map();
      for (const s of cls) {
        const sig = alphabet.map((a) => classOf.get(delta[s][a])).join("|");
        if (!buckets.has(sig)) buckets.set(sig, []);
        buckets.get(sig).push(s);
      }
      for (const group of buckets.values()) newClasses.push(group);
    }
    history.push({ classes: newClasses.map((c) => [...c]), label: `≡^${iter}: zjemnit podle přechodů` });
    // check stable
    if (
      newClasses.length === classes.length &&
      newClasses.every((c, i) => c.length === classes[i].length && c.every((s, k) => s === classes[i][k]))
    ) {
      history[history.length - 1].stable = true;
      break;
    }
    classes = newClasses;
    if (iter > 10) break;
  }
  return history;
}

const COLORS = ["#e07a5f", "#81b29a", "#f2cc8f", "#3d5a80", "#bc6c25", "#606c38"];

export default function DfaMinimization() {
  const history = useMemo(() => refine(PRESET), []);
  const [step, setStep] = useState(0);
  const cur = history[step];

  const classOf = new Map();
  cur.classes.forEach((c, idx) => c.forEach((s) => classOf.set(s, idx)));

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Iterativní zjemnění ekvivalence ≡: každá iterace rozdělí třídu, pokud její stavy
        vedou (přes různé symboly) do *různých* tříd. Stabilita = výsledek.
      </div>

      <svg viewBox="0 0 540 220" style={{ width: "100%", maxWidth: 620, alignSelf: "center" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="12">
        {/* state circles */}
        {PRESET.states.map((s, i) => {
          const cx = 60 + (i % 3) * 80;
          const cy = 50 + Math.floor(i / 3) * 80;
          const cls = classOf.get(s);
          const color = COLORS[cls % COLORS.length];
          const isFinal = PRESET.final.includes(s);
          return (
            <g key={s}>
              <circle cx={cx} cy={cy} r={22} fill={color} fillOpacity="0.25" stroke={color} strokeWidth={isFinal ? 2 : 1.4} />
              {isFinal && <circle cx={cx} cy={cy} r={17} fill="none" stroke={color} strokeWidth={1} />}
              <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--text)" fontSize="14">{s}</text>
            </g>
          );
        })}
        {/* transition table preview */}
        <text x={300} y={30} fill="var(--text-muted)" fontSize="11">δ:</text>
        {PRESET.states.map((s, i) => (
          <text key={"d" + s} x={300} y={50 + i * 22} fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono, ui-monospace)">
            {s}: a→<tspan fill={COLORS[classOf.get(PRESET.delta[s].a) % COLORS.length]}>{PRESET.delta[s].a}</tspan>, b→<tspan fill={COLORS[classOf.get(PRESET.delta[s].b) % COLORS.length]}>{PRESET.delta[s].b}</tspan>
          </text>
        ))}
        <text x={20} y={200} fill="var(--text-muted)" fontSize="11">{cur.label}</text>
      </svg>

      {/* classes display */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {cur.classes.map((cls, i) => (
          <div key={i} style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: COLORS[i % COLORS.length] + "33",
            border: `1px solid ${COLORS[i % COLORS.length]}`,
            color: "var(--text)",
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 12,
          }}>
            {"{" + cls.join(",") + "}"}
          </div>
        ))}
      </div>

      {cur.stable && (
        <div style={{ fontSize: 13, textAlign: "center", color: "var(--accent)" }}>
          ✓ Stabilita: minimální DKA má {cur.classes.length} stavy
        </div>
      )}

      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>◀</button>
        <span className="viz-readout">iter {step}/{history.length - 1}</span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(history.length - 1, step + 1))} disabled={step === history.length - 1}>▶</button>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: 16,
  borderRadius: 12,
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
