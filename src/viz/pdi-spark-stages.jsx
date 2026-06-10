// pdi-spark-stages — Spark DAG: úzké (narrow) vs široké (wide) závislosti.
// Skládej řetězec transformací; každá wide operace (shuffle) přestřihne graf
// a založí novou stage. Narrow operace se slévají (pipeline) do jedné stage.
import { useState } from "react";

// Katalog transformací: narrow se pipelinuje, wide vynucuje shuffle.
const OPS = [
  { id: "textFile", label: "textFile", kind: "source" },
  { id: "map", label: "map", kind: "narrow" },
  { id: "filter", label: "filter", kind: "narrow" },
  { id: "flatMap", label: "flatMap", kind: "narrow" },
  { id: "reduceByKey", label: "reduceByKey", kind: "wide" },
  { id: "groupByKey", label: "groupByKey", kind: "wide" },
  { id: "join", label: "join", kind: "wide" },
];

const DEFAULT = ["textFile", "flatMap", "map", "reduceByKey", "filter"];

const W = 540, H = 200;

export default function PdiSparkStages() {
  const [chain, setChain] = useState(DEFAULT);

  // Rozdělení do stage: nová stage začíná na zdroji a po každé wide operaci.
  const stages = [];
  let cur = [];
  chain.forEach((opId) => {
    const op = OPS.find((o) => o.id === opId);
    if (op.kind === "wide") {
      // wide op uzavírá předchozí stage (shuffle write) a otevírá novou (shuffle read)
      if (cur.length) stages.push(cur);
      cur = [op];
    } else {
      cur.push(op);
    }
  });
  if (cur.length) stages.push(cur);

  const wideCount = chain.filter((id) => OPS.find((o) => o.id === id).kind === "wide").length;

  const addOp = (id) => setChain((c) => (c.length < 7 ? [...c, id] : c));
  const pop = () => setChain((c) => (c.length > 1 ? c.slice(0, -1) : c));
  const reset = () => setChain(DEFAULT);

  // layout: stage = sloupec boxů; mezi stage svislá dělicí čára (shuffle)
  const stageW = (W - 30) / Math.max(stages.length, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ color: "var(--text-muted)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 10.5 }}>přidat:</span>
        {OPS.filter((o) => o.kind !== "source").map((o) => (
          <button key={o.id} className="viz-btn" onClick={() => addOp(o.id)} style={opBtn(o.kind)}>+ {o.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="viz-btn" onClick={pop}>← undo</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {stages.map((stage, si) => {
          const x0 = 15 + si * stageW;
          const hue = 142 + si * 38;
          return (
            <g key={si}>
              {/* rámeček stage */}
              <rect x={x0} y={28} width={stageW - 14} height={H - 60} rx={8}
                fill={`oklch(0.62 0.12 ${hue} / 0.07)`} stroke={`oklch(0.6 0.12 ${hue})`} strokeWidth="1" strokeDasharray="4 3" />
              <text x={x0 + (stageW - 14) / 2} y={20} textAnchor="middle" fontSize="10.5" fontWeight="600" fontFamily="var(--font-mono)" fill={`oklch(0.55 0.14 ${hue})`}>Stage {si + 1}</text>

              {stage.map((op, oi) => {
                const cy = 50 + oi * 30;
                const cx = x0 + (stageW - 14) / 2;
                const fill = op.kind === "wide" ? "oklch(0.7 0.15 22 / 0.18)" : op.kind === "source" ? "var(--bg-inset)" : "oklch(0.62 0.14 264 / 0.16)";
                const stroke = op.kind === "wide" ? "oklch(0.62 0.16 22)" : op.kind === "source" ? "var(--line-strong)" : "oklch(0.62 0.14 264)";
                return (
                  <g key={oi}>
                    {oi > 0 && (
                      <line x1={cx} y1={cy - 30 + 9} x2={cx} y2={cy - 9} stroke="var(--text-muted)" strokeWidth="1" markerEnd="url(#ss-arr)" />
                    )}
                    <rect x={cx - (stageW - 24) / 2} y={cy - 9} width={stageW - 24} height={18} rx={4} fill={fill} stroke={stroke} strokeWidth="1" />
                    <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)">{op.label}</text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* dělicí čáry = shuffle hranice mezi stage */}
        {stages.slice(1).map((_, i) => {
          const x = 15 + (i + 1) * stageW - 7;
          return (
            <g key={i}>
              <line x1={x} y1={26} x2={x} y2={H - 30} stroke="oklch(0.62 0.16 22)" strokeWidth="1.4" />
              <text x={x} y={H - 18} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.6 0.16 22)">⇄ shuffle</text>
            </g>
          );
        })}

        <defs>
          <marker id="ss-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {chain.length} transformací · {stages.length} {stages.length === 1 ? "stage" : "stage"} · {wideCount} shuffle
        </span>
        {" — "}
        narrow operace (<span style={{ color: "oklch(0.6 0.14 264)" }}>map, filter, flatMap</span>) se slévají do jedné stage (pipeline bez přesunu po síti); wide operace (<span style={{ color: "oklch(0.6 0.16 22)" }}>reduceByKey, groupByKey, join</span>) vyžadují shuffle a tím přestřihnou graf na hranici nové stage.
      </div>
    </div>
  );
}

function opBtn(kind) {
  const hue = kind === "wide" ? 22 : 264;
  return {
    background: `oklch(0.62 0.14 ${hue} / 0.14)`,
    borderColor: `oklch(0.62 0.14 ${hue})`,
  };
}
