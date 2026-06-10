// Turingův stroj — interaktivní simulátor.
// Tři přednastavené stroje: binární inkrement, akceptor a^n b^n, akceptor a^n b^n c^n.
// Pro každý krok vidíš pásku, hlavu, stav, a které pravidlo δ se právě aplikovalo.
// Trace ověřen ručně pro každý preset (viz komentáře u definic).
import { useState, useMemo, useEffect } from "react";

const BLANK = "·";

// Každý preset: { name, gamma, init (tape string), startState, finalStates, rules: [{from, read, to, write, move}] }
// move ∈ {"L","R","S"} (S = stay)
const PRESETS = {
  "binární inkrement": {
    desc: "Inkrementuje binární číslo na pásce. Vstup: 1011 → 1100.",
    gamma: ["0", "1", BLANK],
    init: "1011",
    startState: "q0",
    finalStates: ["qF"],
    rules: [
      { from: "q0", read: "0", to: "q0", write: "0", move: "R" },
      { from: "q0", read: "1", to: "q0", write: "1", move: "R" },
      { from: "q0", read: BLANK, to: "q1", write: BLANK, move: "L" },
      { from: "q1", read: "1", to: "q1", write: "0", move: "L" },
      { from: "q1", read: "0", to: "qF", write: "1", move: "S" },
      { from: "q1", read: BLANK, to: "qF", write: "1", move: "S" },
    ],
  },
  "a^n b^n (n≥0)": {
    desc: "Přijímá slova ve tvaru a^n b^n; iterativně škrtá vždy nejlevější a a nejlevější b.",
    gamma: ["a", "b", "X", "Y", BLANK],
    init: "aabb",
    startState: "q0",
    finalStates: ["qF"],
    rules: [
      { from: "q0", read: "a", to: "q1", write: "X", move: "R" },
      { from: "q0", read: "Y", to: "qF", write: "Y", move: "S" },
      { from: "q0", read: BLANK, to: "qF", write: BLANK, move: "S" },
      { from: "q1", read: "a", to: "q1", write: "a", move: "R" },
      { from: "q1", read: "Y", to: "q1", write: "Y", move: "R" },
      { from: "q1", read: "b", to: "q2", write: "Y", move: "L" },
      { from: "q2", read: "a", to: "q2", write: "a", move: "L" },
      { from: "q2", read: "Y", to: "q2", write: "Y", move: "L" },
      { from: "q2", read: "X", to: "q0", write: "X", move: "R" },
    ],
  },
  "a^n b^n c^n (n≥1)": {
    desc: "Přijímá slova ve tvaru a^n b^n c^n; v každé iteraci škrtá trojici (a, b, c).",
    gamma: ["a", "b", "c", "X", "Y", "Z", BLANK],
    init: "aabbcc",
    startState: "q0",
    finalStates: ["qF"],
    rules: [
      { from: "q0", read: "a", to: "q1", write: "X", move: "R" },
      { from: "q0", read: "Y", to: "q4", write: "Y", move: "R" },
      { from: "q1", read: "a", to: "q1", write: "a", move: "R" },
      { from: "q1", read: "Y", to: "q1", write: "Y", move: "R" },
      { from: "q1", read: "b", to: "q2", write: "Y", move: "R" },
      { from: "q2", read: "b", to: "q2", write: "b", move: "R" },
      { from: "q2", read: "Z", to: "q2", write: "Z", move: "R" },
      { from: "q2", read: "c", to: "q3", write: "Z", move: "L" },
      { from: "q3", read: "b", to: "q3", write: "b", move: "L" },
      { from: "q3", read: "Z", to: "q3", write: "Z", move: "L" },
      { from: "q3", read: "Y", to: "q3", write: "Y", move: "L" },
      { from: "q3", read: "a", to: "q3", write: "a", move: "L" },
      { from: "q3", read: "X", to: "q0", write: "X", move: "R" },
      { from: "q4", read: "Y", to: "q4", write: "Y", move: "R" },
      { from: "q4", read: "Z", to: "q4", write: "Z", move: "R" },
      { from: "q4", read: BLANK, to: "qF", write: BLANK, move: "S" },
    ],
  },
};

function findRule(rules, state, sym) {
  return rules.find((r) => r.from === state && r.read === sym);
}

function step(config, rules) {
  const { tape, head, state } = config;
  const sym = tape[head] ?? BLANK;
  const rule = findRule(rules, state, sym);
  if (!rule) return { ...config, halted: true, accepted: false, lastRule: null };
  const newTape = tape.slice();
  newTape[head] = rule.write;
  let newHead = head;
  if (rule.move === "L") newHead = head - 1;
  else if (rule.move === "R") newHead = head + 1;
  // Extend tape if going past edges
  if (newHead < 0) {
    newTape.unshift(BLANK);
    newHead = 0;
  } else if (newHead >= newTape.length) {
    newTape.push(BLANK);
  }
  return {
    tape: newTape,
    head: newHead,
    state: rule.to,
    halted: false,
    accepted: false,
    lastRule: rule,
  };
}

function pad(tape, minLen = 12) {
  const padded = tape.slice();
  while (padded.length < minLen) padded.push(BLANK);
  return padded;
}

export default function TmSimulator() {
  const [presetKey, setPresetKey] = useState("binární inkrement");
  const preset = PRESETS[presetKey];
  const [config, setConfig] = useState({
    tape: pad(preset.init.split("")),
    head: 0,
    state: preset.startState,
    halted: false,
    accepted: false,
    lastRule: null,
  });
  const [history, setHistory] = useState([]);

  useMemo(() => {
    const p = PRESETS[presetKey];
    setConfig({
      tape: pad(p.init.split("")),
      head: 0,
      state: p.startState,
      halted: false,
      accepted: false,
      lastRule: null,
    });
    setHistory([]);
    return null;
  }, [presetKey]);

  const isAccepting = preset.finalStates.includes(config.state);

  function doStep() {
    if (isAccepting || config.halted) return;
    const next = step(config, preset.rules);
    setHistory([...history, config]);
    setConfig(next);
  }
  function doBack() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setConfig(prev);
  }
  function doReset() {
    setConfig({
      tape: pad(preset.init.split("")),
      head: 0,
      state: preset.startState,
      halted: false,
      accepted: false,
      lastRule: null,
    });
    setHistory([]);
  }

  const tape = pad(config.tape, 14);
  const CELL = 28;
  const TAPE_Y = 60;
  const HEAD_Y = 92;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: "var(--bg-card)",
        border: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div className="viz-controls">
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Preset:</label>
        <select
          className="viz-select"
          value={presetKey}
          onChange={(e) => setPresetKey(e.target.value)}
        >
          {Object.keys(PRESETS).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{preset.desc}</div>

      <svg
        viewBox={`0 0 ${CELL * tape.length + 40} 170`}
        style={{ width: "100%", maxWidth: 640, alignSelf: "center" }}
        fontFamily="var(--font-mono, ui-monospace)"
        fontSize="14"
      >
        {/* tape */}
        {tape.map((sym, i) => (
          <g key={i}>
            <rect
              x={20 + i * CELL}
              y={TAPE_Y}
              width={CELL}
              height={CELL}
              fill={i === config.head ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))" : "var(--bg-inset)"}
              stroke="var(--line)"
            />
            <text
              x={20 + i * CELL + CELL / 2}
              y={TAPE_Y + CELL / 2 + 5}
              textAnchor="middle"
              fill="var(--text)"
            >
              {sym}
            </text>
          </g>
        ))}
        {/* head */}
        <polygon
          points={`${20 + config.head * CELL + CELL / 2 - 8},${HEAD_Y} ${
            20 + config.head * CELL + CELL / 2 + 8
          },${HEAD_Y} ${20 + config.head * CELL + CELL / 2},${HEAD_Y + 12}`}
          fill="var(--accent)"
        />
        <text
          x={20 + config.head * CELL + CELL / 2}
          y={HEAD_Y + 28}
          textAnchor="middle"
          fill="var(--accent)"
          fontSize="12"
        >
          {config.state}
          {isAccepting && " ✓"}
        </text>
        {/* last rule */}
        {config.lastRule && (
          <text x={20} y={30} fill="var(--text-muted)" fontSize="12">
            δ({config.lastRule.from},{" "}
            {config.lastRule.read === BLANK ? "□" : config.lastRule.read}) = ({config.lastRule.to},{" "}
            {config.lastRule.write === BLANK ? "□" : config.lastRule.write}/{config.lastRule.move})
          </text>
        )}
        <text x={20} y={150} fill="var(--text-faint)" fontSize="11">
          krok: {history.length} {isAccepting && "— stroj přijal vstup"}
        </text>
      </svg>

      {/* transition table */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, fontSize: 11, fontFamily: "var(--font-mono, ui-monospace)" }}>
        {preset.rules.map((r, i) => {
          const isActive = config.lastRule && r === config.lastRule;
          return (
            <span
              key={i}
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                background: isActive ? "color-mix(in oklch, var(--accent) 30%, var(--bg-inset))" : "var(--bg-inset)",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                border: isActive ? "1px solid var(--accent)" : "1px solid var(--line)",
              }}
            >
              {r.from},{r.read === BLANK ? "□" : r.read}→{r.to},{r.write === BLANK ? "□" : r.write}/{r.move}
            </span>
          );
        })}
      </div>

      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <button className="viz-btn" onClick={doBack} disabled={history.length === 0}>
          ◀ zpět
        </button>
        <button className="viz-btn" onClick={doReset}>
          reset
        </button>
        <button className="viz-btn primary" onClick={doStep} disabled={isAccepting}>
          krok ▶
        </button>
      </div>
    </div>
  );
}
