// ais-state-machine — stavový diagram turniketu.
// Stavy + přechody vyvolané událostmi. Klikni na událost a sleduj přechod;
// neplatná událost v daném stavu se ignoruje (jako v reálném FSM).
import { useState } from "react";

// stavy: locked, unlocked. Počáteční pseudo-stav → locked.
const TRANS = {
  locked: { coin: { to: "unlocked", note: "vhozena mince → odemknout" }, push: { to: "locked", note: "zatlačení při zamčeném — nic se nestane" } },
  unlocked: { push: { to: "locked", note: "průchod → zamknout za sebou" }, coin: { to: "unlocked", note: "další mince — ignorováno" } },
};

const POS = {
  locked: { x: 120, y: 92 },
  unlocked: { x: 360, y: 92 },
};

export default function AisStateMachine() {
  const [state, setState] = useState("locked");
  const [log, setLog] = useState([{ t: "init → locked (počáteční pseudo-stav ●)" }]);
  const [lastEvt, setLastEvt] = useState(null);

  function fire(evt) {
    const t = TRANS[state][evt];
    setLastEvt(t.to !== state ? evt : null);
    setState(t.to);
    setLog((l) => [...l.slice(-3), { t: `${state} --${evt}--> ${t.to}  (${t.note})` }]);
  }
  function reset() { setState("locked"); setLastEvt(null); setLog([{ t: "init → locked (počáteční pseudo-stav ●)" }]); }

  const r = 36;
  const Lp = POS.locked, Up = POS.unlocked;

  return (
    <div style={{ width: "100%" }}>
      <div className="viz-controls" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>událost:</span>
        <button className="viz-btn" onClick={() => fire("coin")}>coin (mince)</button>
        <button className="viz-btn" onClick={() => fire("push")}>push (zatlačit)</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <svg viewBox="0 0 500 200" style={{ width: "100%", maxWidth: 540, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* počáteční pseudo-stav */}
        <circle cx={36} cy={92} r={7} fill="var(--text)" />
        <line x1={43} y1={92} x2={Lp.x - r} y2={92} stroke="var(--text)" strokeWidth="1.4" markerEnd="url(#smArr)" />

        {/* stav locked */}
        <circle cx={Lp.x} cy={Lp.y} r={r} fill={state === "locked" ? "var(--accent)" : "var(--bg-card)"} stroke="var(--line-strong)" strokeWidth="1.6" />
        <text x={Lp.x} y={Lp.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={state === "locked" ? "white" : "var(--text)"}>Locked</text>

        {/* stav unlocked */}
        <circle cx={Up.x} cy={Up.y} r={r} fill={state === "unlocked" ? "var(--accent)" : "var(--bg-card)"} stroke="var(--line-strong)" strokeWidth="1.6" />
        <text x={Up.x} y={Up.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={state === "unlocked" ? "white" : "var(--text)"}>Unlocked</text>

        {/* přechod locked --coin--> unlocked (horní oblouk) */}
        <path d={`M ${Lp.x + r * 0.7} ${Lp.y - r * 0.7} Q 240 30 ${Up.x - r * 0.7} ${Up.y - r * 0.7}`}
          fill="none" stroke={lastEvt === "coin" ? "var(--accent)" : "var(--text-muted)"} strokeWidth="1.5" markerEnd="url(#smArr2)" />
        <text x={240} y={36} textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={lastEvt === "coin" ? "var(--accent)" : "var(--text-muted)"}>coin</text>

        {/* přechod unlocked --push--> locked (dolní oblouk) */}
        <path d={`M ${Up.x - r * 0.7} ${Up.y + r * 0.7} Q 240 154 ${Lp.x + r * 0.7} ${Lp.y + r * 0.7}`}
          fill="none" stroke={lastEvt === "push" ? "var(--accent)" : "var(--text-muted)"} strokeWidth="1.5" markerEnd="url(#smArr2)" />
        <text x={240} y={162} textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={lastEvt === "push" ? "var(--accent)" : "var(--text-muted)"}>push</text>

        <defs>
          <marker id="smArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text)" />
          </marker>
          <marker id="smArr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{ marginTop: 6, padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text)", lineHeight: 1.6 }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: i === log.length - 1 ? "var(--accent)" : "var(--text-muted)" }}>{l.t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
