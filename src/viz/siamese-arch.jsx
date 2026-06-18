// Siamese network schematic: two inputs -> the SAME shared-weight encoder ->
// two embeddings -> distance -> contrastive loss.
// Toggle whether the pair is the same identity or different, and watch the
// embedding distance + contrastive loss change.
import { useState } from "react";

export default function SiameseArch() {
  const [same, setSame] = useState(true); // same identity (y=1) vs different (y=0)
  const m = 2.0; // margin

  // toy embeddings: same pair -> close; different pair -> far.
  const e1 = [0.8, 0.6];
  const e2 = same ? [0.95, 0.55] : [-0.7, -0.4];
  const d = Math.hypot(e1[0] - e2[0], e1[1] - e2[1]);
  // contrastive loss, convention y=1 same: L = y*d^2 + (1-y)*max(0,m-d)^2
  const y = same ? 1 : 0;
  const loss = y * d * d + (1 - y) * Math.max(0, m - d) ** 2;

  const W = 340, H = 200;
  const fmt = (v) => `[${v[0].toFixed(2)}, ${v[1].toFixed(2)}]`;

  // tower drawing helper
  const Tower = ({ cx }) => (
    <g>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={cx - 22} y={70 + i * 16} width={44} height={11}
          rx={2} fill="var(--bg-card)" stroke="var(--accent-line)" strokeWidth="1" />
      ))}
    </g>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* shared-weights bracket linking the two towers */}
        <line x1={75} y1={58} x2={195} y2={58} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
        <text x={135} y={52} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">sdílené váhy</text>

        {/* input 1 */}
        <rect x={53} y={26} width={44} height={22} rx={3} fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x={75} y={41} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">x₁</text>
        <line x1={75} y1={48} x2={75} y2={68} stroke="var(--line-strong)" strokeWidth="1" />
        <Tower cx={75} />
        <text x={75} y={132} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">f(x₁)</text>

        {/* input 2 */}
        <rect x={173} y={26} width={44} height={22} rx={3} fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x={195} y={41} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">x₂</text>
        <line x1={195} y1={48} x2={195} y2={68} stroke="var(--line-strong)" strokeWidth="1" />
        <Tower cx={195} />
        <text x={195} y={132} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">f(x₂)</text>

        {/* embeddings -> distance node */}
        <line x1={75} y1={136} x2={135} y2={160} stroke="var(--line-strong)" strokeWidth="1" />
        <line x1={195} y1={136} x2={135} y2={160} stroke="var(--line-strong)" strokeWidth="1" />
        <circle cx={135} cy={168} r={13} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x={135} y={171} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)">d</text>

        {/* distance -> loss */}
        <line x1={148} y1={168} x2={245} y2={168} stroke="var(--accent)" strokeWidth="1.2" />
        <polygon points="245,168 238,164 238,172" fill="var(--accent)" />
        <rect x={248} y={154} width={84} height={28} rx={4} fill="var(--bg-card)"
          stroke="var(--accent)" strokeWidth="1.5" />
        <text x={290} y={166} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">contrastive</text>
        <text x={290} y={177} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600"
          fill="var(--accent)">L = {loss.toFixed(2)}</text>

        {/* embedding mini-space top-right: show the two points */}
        <rect x={250} y={26} width={82} height={70} rx={3} fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.8" />
        <text x={291} y={37} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">embedding prostor</text>
        {(() => {
          const ox = 291, oy = 66, s = 13; // origin + scale
          const p1 = [ox + e1[0] * s, oy - e1[1] * s];
          const p2 = [ox + e2[0] * s, oy - e2[1] * s];
          return (
            <g>
              <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
                stroke={same ? "var(--accent)" : "var(--text-muted)"} strokeWidth="1" strokeDasharray="2 2" />
              <circle cx={p1[0]} cy={p1[1]} r="3.5" fill="var(--accent)" />
              <circle cx={p2[0]} cy={p2[1]} r="3.5" fill={same ? "var(--accent)" : "var(--text-muted)"} />
            </g>
          );
        })()}
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>pár:</span>
        <button className="viz-btn" data-active={same} onClick={() => setSame(true)}>stejná identita (y=1)</button>
        <button className="viz-btn" data-active={!same} onClick={() => setSame(false)}>různá identita (y=0)</button>
      </div>

      <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>f(x₁) = {fmt(e1)} · f(x₂) = {fmt(e2)}</div>
        <div>vzdálenost d = <b style={{ color: "var(--accent)" }}>{d.toFixed(2)}</b> · margin m = {m.toFixed(1)}</div>
        <div>{same
          ? <>stejný pár → L = d² = <b style={{ color: "var(--text)" }}>{loss.toFixed(2)}</b> (táhne k sobě)</>
          : <>různý pár → L = max(0, m−d)² = <b style={{ color: "var(--text)" }}>{loss.toFixed(2)}</b> {d >= m ? "(už za marginem → 0)" : "(odpuzuje)"}</>}</div>
      </div>
    </div>
  );
}
