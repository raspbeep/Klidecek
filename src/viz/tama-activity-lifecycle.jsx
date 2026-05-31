// tama-activity-lifecycle — životní cyklus Android Activity jako stavový automat.
// Vyvolávej události (uživatel odejde, vrátí se, otočí displej) a sleduj, jakou
// posloupností callbacků aplikace projde. Rotace = onDestroy → onCreate (znovuvytvoření).
import { useState } from "react";

// Stavy odpovídají Lifecycle.State; přechody nesou sekvenci callbacků.
const STATES = ["created", "started", "resumed", "stopped", "destroyed"];

const POS = {
  created: { x: 70, y: 150 },
  started: { x: 200, y: 150 },
  resumed: { x: 340, y: 150 },
  stopped: { x: 200, y: 50 },
  destroyed: { x: 430, y: 50 },
};

const LABEL = {
  created: "Created",
  started: "Started",
  resumed: "Resumed",
  stopped: "Stopped",
  destroyed: "Destroyed",
};

// dostupné akce podle aktuálního stavu → [callbacky], cílový stav
function actions(state) {
  switch (state) {
    case "resumed":
      return [
        { id: "leave", label: "uživatel odejde (částečně)", cbs: ["onPause"], to: "started" },
        { id: "hide", label: "obrazovku zakryje jiná aktivita", cbs: ["onPause", "onStop"], to: "stopped" },
        { id: "rotate", label: "otočení displeje", cbs: ["onPause", "onStop", "onDestroy", "onCreate", "onStart", "onResume"], to: "resumed", recreate: true },
      ];
    case "started":
      return [
        { id: "fg", label: "získá focus → popředí", cbs: ["onResume"], to: "resumed" },
        { id: "bg", label: "už není vidět", cbs: ["onStop"], to: "stopped" },
      ];
    case "stopped":
      return [
        { id: "back", label: "uživatel se vrátí", cbs: ["onRestart", "onStart", "onResume"], to: "resumed" },
        { id: "kill", label: "OS uvolní paměť / finish()", cbs: ["onDestroy"], to: "destroyed" },
      ];
    case "created":
      return [{ id: "vis", label: "aktivita je viditelná", cbs: ["onStart"], to: "started" }];
    case "destroyed":
      return [{ id: "new", label: "spustit znovu", cbs: ["onCreate"], to: "created" }];
    default:
      return [];
  }
}

export default function TamaActivityLifecycle() {
  const [state, setState] = useState("created");
  const [log, setLog] = useState(["onCreate  (vytvoření instance, načtení stavu)"]);
  const [lastCbs, setLastCbs] = useState(["onCreate"]);

  function fire(a) {
    setState(a.to);
    setLastCbs(a.cbs);
    const entry = a.recreate
      ? `↻ rotace: ${a.cbs.join(" → ")}  (stav zachová ViewModel / rememberSaveable)`
      : a.cbs.join(" → ");
    setLog((l) => [...l.slice(-4), entry]);
  }
  function reset() {
    setState("created");
    setLog(["onCreate  (vytvoření instance, načtení stavu)"]);
    setLastCbs(["onCreate"]);
  }

  const r = 30;
  const acts = actions(state);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>akce:</span>
        {acts.map((a) => (
          <button key={a.id} onClick={() => fire(a)} style={btn}>{a.label}</button>
        ))}
        <button onClick={reset} style={{ ...btn, color: "var(--text-muted)" }}>reset</button>
      </div>

      <svg viewBox="0 0 500 200" style={{ width: "100%", maxWidth: 520, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* schematické hrany cyklu */}
        {[["created", "started"], ["started", "resumed"], ["started", "stopped"], ["stopped", "destroyed"]].map(([f, t], i) => {
          const A = POS[f], B = POS[t];
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />;
        })}

        {STATES.map((s) => {
          const p = POS[s];
          const cur = s === state;
          return (
            <g key={s}>
              <circle cx={p.x} cy={p.y} r={r} fill={cur ? "var(--accent)" : "var(--bg-card)"} stroke="var(--line-strong)" strokeWidth="1.5" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={cur ? "white" : "var(--text)"}>{LABEL[s]}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>volané callbacky</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text)", lineHeight: 1.6 }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: i === log.length - 1 ? "var(--accent)" : "var(--text-muted)" }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const btn = {
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  padding: "4px 10px",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "ui-monospace, monospace",
  cursor: "pointer",
};
