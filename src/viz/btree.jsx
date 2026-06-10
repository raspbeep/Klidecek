// B+ tree insertion (simplified visual).
import { useState, useRef } from "react";

export default function BTree() {
  const ORDER = 3;
  const [keys, setKeys] = useState([10, 20, 5, 30, 15, 25]);
  const next = useRef(40);

  const sorted = [...keys].sort((a, b) => a - b);
  const leaves = [];
  for (let i = 0; i < sorted.length; i += ORDER) leaves.push(sorted.slice(i, i + ORDER));
  if (leaves.length === 0) leaves.push([]);
  const routing = leaves.slice(1).map((l) => l[0]);

  const W = 280;
  const H = 160;
  const leafW = Math.min(70, (W - 16) / leaves.length);
  const leafGap = (W - leafW * leaves.length) / (leaves.length + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 400 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {routing.length > 0 && (
          <g>
            <rect x={W/2 - (routing.length*22+12)/2} y={14} width={routing.length*22+12} height={26}
              fill="var(--bg-card)" stroke="var(--line-strong)" rx="4"/>
            {routing.map((k, i) => (
              <text key={i} x={W/2 - (routing.length*22+12)/2 + 6 + i*22 + 11} y={31}
                textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">{k}</text>
            ))}
          </g>
        )}
        {leaves.map((leaf, li) => {
          const x = leafGap + li * (leafW + leafGap);
          const y = 80;
          return (
            <g key={li}>
              <line x1={W/2} y1={42} x2={x + leafW/2} y2={y} stroke="var(--line-strong)" strokeWidth="0.5"/>
              <rect x={x} y={y} width={leafW} height={26} fill="var(--bg-card)" stroke="var(--accent-line)" rx="4"/>
              {leaf.map((k, i) => (
                <text key={i} x={x + (i+0.5)*(leafW/Math.max(1,leaf.length))} y={y+17}
                  textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">{k}</text>
              ))}
              {li < leaves.length - 1 && (
                <line x1={x + leafW} y1={y+13} x2={x + leafW + leafGap} y2={y+13}
                  stroke="var(--accent-line)" strokeWidth="1" strokeDasharray="2 2"/>
              )}
            </g>
          );
        })}
        <text x={8} y={H-8} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          fanout {ORDER}, {leaves.length} leaves
        </text>
      </svg>
      <div className="viz-controls">
        <button className="viz-btn primary" onClick={() => {
          const k = next.current;
          next.current += 5 + Math.floor(Math.random() * 12);
          setKeys((prev) => [...prev, k]);
        }}>+ insert key</button>
        <button className="viz-btn" onClick={() => setKeys((prev) => prev.slice(0, -1))}>undo</button>
        <button className="viz-btn" onClick={() => { setKeys([10, 20, 5, 30, 15, 25]); next.current = 40; }}>reset</button>
      </div>
    </div>
  );
}
