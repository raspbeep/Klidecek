// TCP three-way handshake stepper.
import { useState } from "react";

export default function Handshake() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "(idle)",       arrows: [] },
    { label: "1. SYN →",     arrows: [{ from: "c", to: "s", text: "SYN, seq=x" }] },
    { label: "2. ← SYN/ACK", arrows: [{ from: "s", to: "c", text: "SYN+ACK, seq=y, ack=x+1" }] },
    { label: "3. ACK →",     arrows: [{ from: "c", to: "s", text: "ACK, ack=y+1" }] },
    { label: "ESTABLISHED",  arrows: [] },
  ];
  const W = 280, H = 180;
  const cx = 50, sx = W - 50;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 400 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={cx} y={22} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">client</text>
        <text x={sx} y={22} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">server</text>
        <line x1={cx} y1={30} x2={cx} y2={H-30} stroke="var(--line-strong)" strokeWidth="0.5" />
        <line x1={sx} y1={30} x2={sx} y2={H-30} stroke="var(--line-strong)" strokeWidth="0.5" />
        {steps.slice(1, step + 1).map((s, i) => {
          if (!s.arrows.length) return null;
          const a = s.arrows[0];
          const y = 50 + i * 30;
          const x1 = a.from === "c" ? cx + 8 : sx - 8;
          const x2 = a.from === "c" ? sx - 8 : cx + 8;
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#arrhead)" />
              <text x={(x1 + x2) / 2} y={y - 5} textAnchor="middle"
                fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--accent)">{a.text}</text>
            </g>
          );
        })}
        {step === steps.length - 1 && (
          <text x={W/2} y={H-12} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="oklch(0.62 0.15 145)">
            ✓ connection established
          </text>
        )}
        <defs>
          <marker id="arrhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--accent)" />
          </marker>
        </defs>
      </svg>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
          {step === steps.length - 1 ? "done" : "next step →"}
        </button>
        <button className="btn ghost" onClick={() => setStep(0)}>reset</button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>{steps[step].label}</span>
      </div>
    </div>
  );
}
