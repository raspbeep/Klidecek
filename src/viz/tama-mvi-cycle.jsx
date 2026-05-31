// tama-mvi-cycle — jednosměrný tok dat (UDF) ve vzoru MVI.
// Klikni na uživatelskou akci (Intent); ta projde reducerem do nového stavu (State)
// a UI se přerenderuje jako čistá funkce UI = f(State). Tok jde jen jedním směrem.
import { useState } from "react";

// počítadlo — modelový stav. Intenty: increment, decrement, reset.
const INTENTS = {
  increment: { label: "+1", apply: (s) => ({ count: s.count + 1 }), note: "Intent(Increment)" },
  decrement: { label: "−1", apply: (s) => ({ count: Math.max(0, s.count - 1) }), note: "Intent(Decrement)" },
  reset: { label: "reset", apply: () => ({ count: 0 }), note: "Intent(Reset)" },
};

// uzly cyklu rozmístěné po obvodu
const NODES = {
  view: { x: 90, y: 40, label: "View", sub: "UI = f(State)" },
  intent: { x: 410, y: 40, label: "Intent", sub: "uživatelská akce" },
  reducer: { x: 410, y: 150, label: "Reducer", sub: "čistá funkce" },
  state: { x: 90, y: 150, label: "State", sub: "jediný zdroj pravdy" },
};

const FLOW = ["view", "intent", "reducer", "state"]; // směr cyklu

export default function TamaMviCycle() {
  const [state, setState] = useState({ count: 0 });
  const [active, setActive] = useState(null); // index hrany, která právě „svítí"
  const [lastIntent, setLastIntent] = useState(null);

  function dispatch(key) {
    const intent = INTENTS[key];
    setLastIntent(intent.note);
    setActive(1); // View → Intent
    // postupné rozsvícení hran cyklu
    let i = 1;
    const tick = () => {
      i += 1;
      if (i <= 3) {
        setActive(i);
        setTimeout(tick, 260);
      } else {
        setState((s) => intent.apply(s));
        setActive(0); // State → View (rerender)
        setTimeout(() => setActive(null), 320);
      }
    };
    setTimeout(tick, 260);
  }

  const edgeOn = (idx) => active === idx;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>vyšli Intent:</span>
        {Object.entries(INTENTS).map(([k, v]) => (
          <button key={k} onClick={() => dispatch(k)} style={btn}>{v.label}</button>
        ))}
      </div>

      <svg viewBox="0 0 500 200" style={{ width: "100%", maxWidth: 520, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* hrany cyklu (po směru hodinových ručiček) */}
        {FLOW.map((from, idx) => {
          const to = NODES[FLOW[(idx + 1) % FLOW.length]];
          const a = NODES[from];
          const on = edgeOn((idx + 1) % FLOW.length);
          const col = on ? "var(--accent)" : "var(--line-strong)";
          return (
            <line key={from} x1={a.x} y1={a.y} x2={to.x} y2={to.y}
              stroke={col} strokeWidth={on ? 2.4 : 1.4} markerEnd="url(#mviArr)"
              style={{ transition: "stroke 0.15s" }} />
          );
        })}

        {/* uzly */}
        {Object.entries(NODES).map(([k, n]) => {
          const isState = k === "state";
          return (
            <g key={k}>
              <rect x={n.x - 64} y={n.y - 22} width={128} height={44} rx={8}
                fill={isState ? "var(--accent)" : "var(--bg-card)"} stroke="var(--line-strong)" strokeWidth="1.4" />
              <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize="12.5" fontWeight="700"
                fill={isState ? "white" : "var(--text)"}>{n.label}</text>
              <text x={n.x} y={n.y + 13} textAnchor="middle" fontSize="9"
                fill={isState ? "white" : "var(--text-muted)"} fontFamily="ui-monospace, monospace">{n.sub}</text>
            </g>
          );
        })}

        {/* aktuální stav vyrenderovaný „obrazovkou" uvnitř View */}
        <text x={158} y={92} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="ui-monospace, monospace">render ↓</text>
        <rect x={56} y={90} width={68} height={26} rx={5} fill="var(--bg-card)" stroke="var(--accent-line)" strokeWidth="1.2" />
        <text x={90} y={108} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--accent)" fontFamily="ui-monospace, monospace">{state.count}</text>

        <defs>
          <marker id="mviArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5, color: "var(--text-muted)", fontFamily: "ui-monospace, monospace" }}>
        {lastIntent
          ? `${lastIntent} → reducer(state, intent) → nový State → UI = f(State)`
          : "Tok dat jde jen jedním směrem: View → Intent → Reducer → State → View. Stav nelze měnit zpětně z UI."}
      </div>
    </div>
  );
}

const btn = {
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  padding: "4px 12px",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "ui-monospace, monospace",
  cursor: "pointer",
};
