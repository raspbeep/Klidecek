// GPOS (fair-share) vs RTOS (prioritně-preemptivní) plánování.
// Stejný scénář: během běhu nízkoprioritních úloh přijde kritická úloha
// s deadlinem. Přepínač ukazuje, zda kritická úloha deadline stihne.
// GPOS spravedlivě střídá → kritická úloha čeká → deadline MISS.
// RTOS okamžitě preempuje → kritická úloha běží hned → deadline MET.
import { useState } from "react";

const ACC = "var(--accent)";
const GRN = "oklch(0.55 0.14 142)";
const RED = "oklch(0.58 0.18 22)";
const MUT = "var(--text-muted)";

// časová osa 0..20 (jednotky). Kritická úloha přijde v t=4, potřebuje 3 jednotky CPU,
// deadline v t=10.
const ARRIVAL = 4, NEED = 3, DEADLINE = 10, T = 20;

// GPOS: round-robin po 2 jednotkách mezi 3 úlohami (A, B, Crit) — fair-share.
// Crit dostane CPU až ve své časové dávce; nedoběhne včas.
function gposTimeline() {
  // střídání A,B,Crit po 2 jednotkách od t=4; před t=4 jen A,B
  const segs = [
    { task: "A", from: 0, to: 2, kind: "low" },
    { task: "B", from: 2, to: 4, kind: "low" },
    { task: "A", from: 4, to: 6, kind: "low" },
    { task: "B", from: 6, to: 8, kind: "low" },
    { task: "Crit", from: 8, to: 10, kind: "crit" },   // 2 jednotky
    { task: "A", from: 10, to: 12, kind: "low" },
    { task: "Crit", from: 12, to: 13, kind: "crit" },   // dobíhá 3. jednotku — pozdě!
    { task: "B", from: 13, to: 20, kind: "low" },
  ];
  return { segs, finish: 13 };
}

// RTOS: jakmile Crit v t=4 přijde, okamžitě preempuje (nejvyšší priorita) a běží 3 jednotky.
function rtosTimeline() {
  const segs = [
    { task: "A", from: 0, to: 4, kind: "low" },
    { task: "Crit", from: 4, to: 7, kind: "crit" },     // souvisle 3 jednotky
    { task: "A", from: 7, to: 13, kind: "low" },
    { task: "B", from: 13, to: 20, kind: "low" },
  ];
  return { segs, finish: 7 };
}

export default function NavGposRtosScheduling() {
  const [mode, setMode] = useState("gpos");
  const tl = mode === "gpos" ? gposTimeline() : rtosTimeline();
  const met = tl.finish <= DEADLINE;

  const W = 540, padL = 16, padR = 16, trackW = W - padL - padR;
  const toX = (t) => padL + (t / T) * trackW;
  const trackY = 92, trackH = 30;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[["gpos", "GPOS — fair-share"], ["rtos", "RTOS — prioritní preempce"]].map(([m, lbl]) => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              flex: 1, padding: "6px 4px", fontSize: 11.5, cursor: "pointer",
              fontFamily: "var(--font-mono)", borderRadius: 5,
              border: `1px solid ${m === mode ? "var(--accent)" : "var(--line)"}`,
              background: m === mode ? "oklch(0.62 0.14 264 / 0.15)" : "var(--bg-card)",
              color: m === mode ? "var(--accent)" : "var(--text-muted)",
            }}>{lbl}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} 168`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height="168" fill="var(--bg-inset)" rx="8" />

        {/* příchod kritické úlohy */}
        <line x1={toX(ARRIVAL)} y1={36} x2={toX(ARRIVAL)} y2={trackY + trackH + 6} stroke={ACC} strokeWidth="1" strokeDasharray="2 3" />
        <text x={toX(ARRIVAL)} y={30} textAnchor="middle" fontSize="9.5" fill={ACC} fontFamily="var(--font-mono)">příchod kritické úlohy</text>

        {/* deadline */}
        <line x1={toX(DEADLINE)} y1={36} x2={toX(DEADLINE)} y2={trackY + trackH + 6} stroke={RED} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={toX(DEADLINE)} y={30} textAnchor="middle" fontSize="9.5" fill={RED} fontFamily="var(--font-mono)">deadline</text>

        {/* segmenty na CPU stopě */}
        {tl.segs.map((s, i) => {
          const x = toX(s.from), w = toX(s.to) - toX(s.from);
          const fill = s.kind === "crit" ? GRN : "var(--bg-card)";
          const op = s.kind === "crit" ? 0.30 : 1;
          const stroke = s.kind === "crit" ? GRN : "var(--line)";
          return (
            <g key={i}>
              <rect x={x} y={trackY} width={w} height={trackH} fill={fill} opacity={op} stroke={stroke} strokeWidth={s.kind === "crit" ? 1.4 : 0.8} />
              <text x={x + w / 2} y={trackY + 20} textAnchor="middle" fontSize="10.5"
                fontWeight={s.kind === "crit" ? 700 : 500}
                fill={s.kind === "crit" ? GRN : MUT} fontFamily="var(--font-mono)">{s.task}</text>
            </g>
          );
        })}
        <text x={padL} y={trackY - 8} fontSize="10" fill={MUT} fontFamily="var(--font-mono)">CPU →</text>

        {/* osa času */}
        {Array.from({ length: 11 }, (_, k) => k * 2).map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={trackY + trackH} x2={toX(t)} y2={trackY + trackH + 4} stroke="var(--line-strong)" strokeWidth="0.5" />
            <text x={toX(t)} y={trackY + trackH + 15} textAnchor="middle" fontSize="8" fill="var(--text-faint)" fontFamily="var(--font-mono)">{t}</text>
          </g>
        ))}

        {/* dokončení kritické úlohy */}
        <line x1={toX(tl.finish)} y1={trackY - 4} x2={toX(tl.finish)} y2={trackY + trackH} stroke={met ? GRN : RED} strokeWidth="2" />
        <circle cx={toX(tl.finish)} cy={trackY - 4} r="3" fill={met ? GRN : RED} />

        {/* verdikt */}
        <rect x={W / 2 - 95} y={142} width={190} height={20} rx="10"
          fill={met ? "oklch(0.55 0.14 142 / 0.18)" : "oklch(0.58 0.18 22 / 0.18)"}
          stroke={met ? GRN : RED} strokeWidth="1" />
        <text x={W / 2} y={156} textAnchor="middle" fontSize="11" fontWeight="700" fill={met ? GRN : RED} fontFamily="var(--font-mono)">
          {met ? `deadline SPLNĚN (t=${tl.finish})` : `deadline ZMEŠKÁN (t=${tl.finish})`}
        </text>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: MUT, lineHeight: 1.5 }}>
        {mode === "gpos"
          ? "GPOS plánuje spravedlivě (fair-share): kritická úloha (zeleně) jen čeká ve frontě a dostává CPU po dávkách jako každé jiné vlákno. Maximalizuje se celková propustnost, ale doba dokončení je nepředvídatelná — kritická úloha dobíhá až po deadlinu."
          : "RTOS plánuje striktně podle priorit s preempcí: jakmile kritická úloha přijde, okamžitě vyvlastní běžící nízkoprioritní úlohu a běží souvisle až do dokončení. Garantuje to determinismus — splnění deadlinu, i za cenu nižší celkové propustnosti."}
      </div>
    </div>
  );
}
