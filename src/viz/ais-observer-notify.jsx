// Observer — vztah 1:N. Připoj/odpoj odběratele (attach/detach), změň stav
// subjektu a stiskni notify(): subjekt rozešle update() všem připojeným
// pozorovatelům naráz, kteří se aktualizují na novou hodnotu.
import { useState, useEffect, useRef } from "react";

const POOL = ["Alice", "Bob", "Cara", "Dan", "Eve"];
const MSGS = ["Nové video", "Live stream", "Komentář", "Premiéra"];

export default function AisObserverNotify() {
  const [attached, setAttached] = useState([0, 1]); // indices into POOL
  const [obsState, setObsState] = useState({}); // poolIndex -> last received msg
  const [msgIdx, setMsgIdx] = useState(0);
  const [pulse, setPulse] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = (i) => {
    setAttached((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)
    );
  };

  const notify = () => {
    clearTimeout(timer.current);
    setPulse(true);
    // every attached observer receives update(msg)
    const msg = MSGS[msgIdx];
    setObsState((prev) => {
      const next = { ...prev };
      attached.forEach((i) => (next[i] = msg));
      return next;
    });
    timer.current = setTimeout(() => setPulse(false), 650);
  };

  const W = 460, H = 200;
  const subX = 80, subY = 100;
  // observers laid out on the right in a column
  const obsX = 330;
  const slots = POOL.map((_, i) => 28 + i * 35);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>zpráva:</span>
        <select value={msgIdx} onChange={(e) => setMsgIdx(+e.target.value)} style={sel}>
          {MSGS.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <button className="btn ghost" style={{ ...btn, borderColor: "oklch(0.62 0.16 22)", color: "oklch(0.5 0.16 22)" }}
          disabled={attached.length === 0} onClick={notify}>
          notify() →
        </button>
        <span style={{ color: "var(--text-faint)" }}>připojeno: {attached.length}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* edges + travelling pulses */}
        {POOL.map((_, i) => {
          if (!attached.includes(i)) return null;
          const y = slots[i];
          return (
            <g key={`e${i}`}>
              <line x1={subX + 56} y1={subY} x2={obsX} y2={y} stroke="var(--line-strong)" strokeWidth="1" />
              {pulse && (
                <circle r="5" fill="oklch(0.62 0.16 22)">
                  <animate attributeName="cx" from={subX + 56} to={obsX} dur="0.5s" fill="freeze" />
                  <animate attributeName="cy" from={subY} to={y} dur="0.5s" fill="freeze" />
                </circle>
              )}
            </g>
          );
        })}

        {/* subject */}
        <rect x={subX - 56} y={subY - 28} width="112" height="56" rx="6"
          fill="oklch(0.62 0.16 22 / 0.14)" stroke="oklch(0.62 0.16 22)"
          strokeWidth={pulse ? 2.2 : 1.3} />
        <text x={subX} y={subY - 8} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Channel</text>
        <text x={subX} y={subY + 6} textAnchor="middle" fontSize="9" fill="var(--text-muted)">(Subject)</text>
        <text x={subX} y={subY + 19} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.5 0.16 22)">notify()</text>

        {/* observers */}
        {POOL.map((name, i) => {
          const on = attached.includes(i);
          const y = slots[i];
          const got = obsState[i];
          return (
            <g key={i} style={{ cursor: "pointer" }} onClick={() => toggle(i)}>
              <rect x={obsX} y={y - 14} width="116" height="28" rx="5"
                fill={on ? "oklch(0.62 0.14 264 / 0.14)" : "var(--bg-card)"}
                stroke={on ? "oklch(0.62 0.14 264)" : "var(--line)"}
                strokeWidth="1.1" strokeDasharray={on ? "none" : "3 3"} />
              <text x={obsX + 8} y={y + 4} fontSize="10.5"
                fill={on ? "var(--text)" : "var(--text-faint)"}>{name}</text>
              <text x={obsX + 108} y={y + 4} textAnchor="end" fontSize="8.5"
                fontFamily="var(--font-mono)"
                fill={got && on ? "oklch(0.5 0.14 264)" : "var(--text-faint)"}>
                {on ? (got ? `"${got}"` : "—") : "detached"}
              </text>
            </g>
          );
        })}
        <text x={obsX + 58} y={14} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
          Observer (klikni = attach/detach)
        </text>
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Subjekt drží seznam pozorovatelů. <strong>notify()</strong> projde seznam a zavolá
        <code> update(msg)</code> na <strong>každém</strong> připojeném — to je vztah <strong>1:N</strong>.
        Odpojený (<em>detached</em>) pozorovatel žádnou notifikaci nedostane; subjekt o jeho konkrétním typu nic neví.
      </div>
    </div>
  );
}

const btn = {
  padding: "4px 12px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--text)",
};
const sel = {
  padding: "3px 6px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
};
