import { useState } from "react";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_TEXT = "ATTACKATDAWN";

function shift(ch, k) {
  const i = ALPHA.indexOf(ch.toUpperCase());
  if (i < 0) return ch;
  return ALPHA[(i + k + 26) % 26];
}

export default function CaesarShift() {
  const [k, setK] = useState(3);
  const [text, setText] = useState(DEFAULT_TEXT);

  const cipher = text.split("").map((c) => shift(c, k)).join("");

  const W = 540, H = 220;
  const cx = 130, cy = 110, r1 = 80, r2 = 58;

  return (
    <div style={{ width: "100%", maxWidth: 580 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* Caesar wheel — outer ring (plaintext) */}
        {ALPHA.split("").map((ch, i) => {
          const ang = (i / 26) * 2 * Math.PI - Math.PI / 2;
          const x = cx + r1 * Math.cos(ang);
          const y = cy + r1 * Math.sin(ang);
          return (
            <text key={"o" + i} x={x} y={y + 4} textAnchor="middle"
              fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              {ch}
            </text>
          );
        })}

        {/* Caesar wheel — inner ring (ciphertext, rotated by k) */}
        {ALPHA.split("").map((ch, i) => {
          const ang = ((i - k) / 26) * 2 * Math.PI - Math.PI / 2;
          const x = cx + r2 * Math.cos(ang);
          const y = cy + r2 * Math.sin(ang);
          return (
            <text key={"i" + i} x={x} y={y + 4} textAnchor="middle"
              fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">
              {ch}
            </text>
          );
        })}

        <circle cx={cx} cy={cy} r={r1 + 12} fill="none" stroke="var(--line)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={(r1 + r2) / 2 + 4} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx={cx} cy={cy} r={r2 - 12} fill="none" stroke="var(--line)" strokeWidth="1" />

        {/* current letter indicator at top */}
        <path d={`M${cx},${cy - r1 - 18} L${cx - 6},${cy - r1 - 30} L${cx + 6},${cy - r1 - 30} Z`}
          fill="var(--accent)" />

        {/* Mapping table */}
        <text x={260} y={28} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          plaintext  →  ciphertext (shift = {k})
        </text>
        {text.slice(0, 18).split("").map((ch, i) => (
          <g key={"map" + i} transform={`translate(${260 + (i % 9) * 30}, ${50 + Math.floor(i / 9) * 36})`}>
            <text x={0} y={0} fontSize="14" fontFamily="var(--font-mono)" fill="var(--text-muted)" textAnchor="middle">
              {ch}
            </text>
            <path d="M0,6 L0,16" stroke="var(--text-muted)" strokeWidth="1" markerEnd="url(#aCaesArrow)" />
            <text x={0} y={28} fontSize="14" fontFamily="var(--font-mono)" fill="var(--accent)" textAnchor="middle">
              {shift(ch, k)}
            </text>
          </g>
        ))}
        <defs>
          <marker id="aCaesArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        <text x={260} y={H - 32} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          C = {cipher.slice(0, 24)}
        </text>
      </svg>

      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          shift k = {k}
        </label>
        <input type="range" min={0} max={25} value={k} onChange={(e) => setK(+e.target.value)}
          style={{ flex: 1, minWidth: 140 }} />
        <input type="text" value={text} maxLength={24}
          onChange={(e) => setText(e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase())}
          style={{ ...inputStyle, width: 160 }} placeholder="PLAINTEXT" />
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "4px 8px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  border: "1px solid var(--line-strong)",
  background: "var(--bg-card)",
  color: "var(--text)",
  borderRadius: 4,
};
