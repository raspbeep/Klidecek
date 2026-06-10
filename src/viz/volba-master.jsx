// Chang-Roberts leader election na kruhu.
// Klikni na uzel pro zahájení volby. Sleduj zprávy putující v kruhu.
// Vyzkoušej worst-case (iniciátor těsně za maximem) vs best-case.
import { useState, useMemo } from "react";

// Default UIDs — worst case if we start election from node 0 (lowest UID just after highest)
const PRESETS = {
  "best (start od max)": [5, 1, 2, 3, 4],
  "worst (start za max)": [4, 5, 1, 2, 3],
  "rozmanité": [3, 5, 7, 1, 6, 2, 8, 4],
};

// Simulate Chang-Roberts step-by-step.
// Returns list of states, each: { messages: [{from, to, uid, kind}], participants, log, msgCount, winner }
function simulate(uids, initiator) {
  const n = uids.length;
  const states = [];
  // initial
  states.push({
    participants: new Set([initiator]),
    messages: [], // currently in-flight (visualised)
    log: [`uzel ${initiator} zahajuje volbu, posílá UID=${uids[initiator]} → uzel ${(initiator + 1) % n}`],
    msgCount: 1,
    winner: null,
    pending: [{ to: (initiator + 1) % n, uid: uids[initiator] }],
  });

  let participants = new Set([initiator]);
  let pending = [{ to: (initiator + 1) % n, uid: uids[initiator] }];
  let msgCount = 1;
  let winner = null;
  let allLogs = states[0].log.slice();
  let safety = 0;

  while (pending.length > 0 && !winner && safety++ < n * 5) {
    const next = [];
    const currentMsgs = pending.map((p) => ({ from: (p.to - 1 + n) % n, to: p.to, uid: p.uid }));
    pending.forEach((m) => {
      const myUID = uids[m.to];
      if (m.uid > myUID) {
        // Forward (mark as participant)
        participants.add(m.to);
        next.push({ to: (m.to + 1) % n, uid: m.uid });
        msgCount++;
        allLogs.push(`uzel ${m.to} (UID=${myUID}): příchozí ${m.uid} > já → přepošle (značka participant)`);
      } else if (m.uid < myUID) {
        if (participants.has(m.to)) {
          // Already participant: drop (won't replace own active message)
          allLogs.push(`uzel ${m.to} (UID=${myUID}): příchozí ${m.uid} < já, ale už jsem participant → zahodí`);
        } else {
          // Replace with own UID and forward
          participants.add(m.to);
          next.push({ to: (m.to + 1) % n, uid: myUID });
          msgCount++;
          allLogs.push(`uzel ${m.to} (UID=${myUID}): příchozí ${m.uid} < já, ještě nejsem participant → nahradí svým UID a přepošle`);
        }
      } else {
        // m.uid === myUID — winner!
        winner = m.to;
        allLogs.push(`✓ uzel ${m.to}: přišlo mé vlastní UID ${myUID} → VYHRÁVÁM volbu`);
      }
    });
    states.push({
      participants: new Set(participants),
      messages: currentMsgs,
      log: allLogs.slice(),
      msgCount,
      winner,
      pending: next,
    });
    pending = next;
    if (winner !== null) break;
  }

  // Announce phase (winner broadcasts)
  if (winner !== null) {
    const announceN = n;
    msgCount += announceN;
    allLogs.push(`uzel ${winner} posílá ELECTED(${uids[winner]}) v kruhu (${announceN} zpráv pro oznámení)`);
    states.push({
      participants: new Set(participants),
      messages: [{ from: winner, to: (winner + 1) % n, uid: uids[winner], kind: "elected" }],
      log: allLogs.slice(),
      msgCount,
      winner,
      pending: [],
    });
  }
  return states;
}

export default function VolbaMaster() {
  const [presetKey, setPresetKey] = useState("worst (start za max)");
  const [initiator, setInitiator] = useState(0);
  const [step, setStep] = useState(0);

  const uids = PRESETS[presetKey];
  const n = uids.length;
  const states = useMemo(() => simulate(uids, initiator), [uids, initiator]);
  const cur = states[Math.min(step, states.length - 1)];

  useMemo(() => { setStep(0); }, [presetKey, initiator]);

  const W = 540, H = 340;
  const cx = W / 2, cy = H / 2 + 10, r = 110;

  const nodePos = (i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div className="viz-controls" style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>scénář:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} className="viz-btn" data-active={presetKey === k} onClick={() => setPresetKey(k)}>{k}</button>
        ))}
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>iniciátor:</span>
        <select className="viz-select" value={initiator} onChange={(e) => setInitiator(parseInt(e.target.value, 10))}>
          {uids.map((u, i) => <option key={i} value={i}>uzel {i} (UID={u})</option>)}
        </select>
      </div>

      {/* Step nav */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {states.length} &nbsp;·&nbsp; zpráv: <b style={{ color: "var(--text)" }}>{cur.msgCount}</b>
          {cur.winner !== null && <span style={{ color: "oklch(0.55 0.18 142)", marginLeft: 8 }}>vítěz: uzel {cur.winner}</span>}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(states.length - 1, step + 1))} disabled={step >= states.length - 1}>další →</button>
        <button className="viz-btn" onClick={() => setStep(0)}>↻</button>
      </div>

      {/* Ring SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Ring edges */}
        {Array.from({ length: n }, (_, i) => {
          const a = nodePos(i);
          const b = nodePos((i + 1) % n);
          return <line key={`re-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line-strong)" strokeWidth="1" opacity="0.4" />;
        })}

        {/* In-flight messages */}
        {cur.messages.map((m, k) => {
          const a = nodePos(m.from);
          const b = nodePos(m.to);
          // midpoint just inside the line
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const color = m.kind === "elected" ? "oklch(0.55 0.18 142)" : "var(--accent)";
          return (
            <g key={`m-${k}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth="2.2" markerEnd="url(#cr-arr)" opacity="0.95" />
              <rect x={mx - 22} y={my - 10} width="44" height="20" rx="3" fill="var(--bg-card)" stroke={color} strokeWidth="1" />
              <text x={mx} y={my + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600" fill={color}>
                {m.kind === "elected" ? `E:${m.uid}` : m.uid}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {uids.map((uid, i) => {
          const p = nodePos(i);
          const isInitiator = i === initiator;
          const isParticipant = cur.participants.has(i);
          const isWinner = cur.winner === i;
          return (
            <g key={`n-${i}`}>
              <circle cx={p.x} cy={p.y} r="22"
                      fill={isWinner ? "oklch(0.62 0.14 142 / 0.4)" : isParticipant ? "oklch(0.62 0.14 252 / 0.3)" : "var(--bg-card)"}
                      stroke={isWinner ? "oklch(0.55 0.18 142)" : isParticipant ? "var(--accent)" : "var(--line-strong)"} strokeWidth={isInitiator ? 2.4 : 1.4} />
              <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">
                {i}
              </text>
              <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                UID={uid}
              </text>
              {isInitiator && (
                <text x={p.x} y={p.y - 32} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">★ start</text>
              )}
              {isWinner && (
                <text x={p.x} y={p.y - 32} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 142)" fontWeight="700">✓ leader</text>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="cr-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
          Chang-Roberts election na kruhu n = {n}
        </text>
      </svg>

      {/* Log */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          Event log
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", maxHeight: 140, overflowY: "auto", lineHeight: 1.5 }}>
          {cur.log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        best-case (start od maxima): <b style={{ color: "var(--text)" }}>2n zpráv</b> · worst-case (max těsně před iniciátorem): <b style={{ color: "var(--accent)" }}>O(n²) zpráv</b> · Hirschberg-Sinclair má vždy <b style={{ color: "var(--text)" }}>O(n log n)</b>
      </div>
    </div>
  );
}

