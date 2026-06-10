// Von Neumann vs Harvard — souběžný přístup k instrukci a datům.
// Krokovač ukazuje, proč Von Neumann vytváří úzké hrdlo (jedna sběrnice
// musí střídat fetch instrukce a fetch dat), kdežto Harvard zvládne obojí
// v jednom cyklu (oddělené sběrnice) → vyšší determinismus.
import { useState } from "react";

const ACC = "var(--accent)";
const GRN = "oklch(0.55 0.14 142)";
const RED = "oklch(0.58 0.18 22)";

// Sekvence "mikro-kroků": načti instrukci (I) a pak přečti data (D).
// Von Neumann: I a D nemůžou současně → 2 cykly sběrnice.
// Harvard: I po I-bus, D po D-bus → 1 cyklus.
const PHASES = [
  { id: "idle", label: "klidový stav", vn: null, hv: null },
  { id: "fetchI", label: "fetch instrukce", vn: "I", hv: "I" },
  { id: "fetchD", label: "přístup k datům", vn: "D", hv: "D" },
];

export default function NavVonNeumannHarvard() {
  const [phase, setPhase] = useState(0);
  const cur = PHASES[phase];

  // VN: instrukce i data sdílejí jednu sběrnici → v každém kroku jen jedno.
  const vnActive = cur.vn;
  // Harvard: v "fetchD" navíc prefetch další instrukce (souběh I+D).
  const hvI = cur.hv === "I" || cur.id === "fetchD"; // při čtení dat už táhne další instrukci
  const hvD = cur.hv === "D";

  const Bus = ({ x1, y1, x2, y2, on, color }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={on ? color : "var(--line)"} strokeWidth={on ? 4 : 2}
      strokeLinecap="round" opacity={on ? 1 : 0.5} />
  );

  const Mem = ({ x, y, w, label, hot, color }) => (
    <g>
      <rect x={x} y={y} width={w} height={34} rx={5}
        fill={hot ? `${color}` : "var(--bg-card)"} opacity={hot ? 0.22 : 1}
        stroke={hot ? color : "var(--line)"} strokeWidth={hot ? 1.6 : 1} />
      <text x={x + w / 2} y={y + 21} textAnchor="middle" fontSize="11"
        fontWeight="600" fill={hot ? color : "var(--text-muted)"}>{label}</text>
    </g>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        {PHASES.map((p, i) => (
          <button key={p.id} className="viz-btn" data-active={i === phase} onClick={() => setPhase(i)}
            style={{ flex: 1 }}>{p.label}</button>
        ))}
      </div>

      <svg viewBox="0 0 540 220" style={{ width: "100%", maxWidth: 540 }}>
        <rect width="540" height="220" fill="var(--bg-inset)" rx="8" />

        {/* ---- Von Neumann (left) ---- */}
        <text x="135" y="22" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--text)">Von Neumann</text>
        <text x="135" y="37" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">jedna paměť · jedna sběrnice</text>
        {/* CPU */}
        <rect x="80" y="150" width="110" height="40" rx="6" fill="var(--bg-card)" stroke="var(--text-muted)" />
        <text x="135" y="174" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">CPU</text>
        {/* one shared memory */}
        <Mem x={55} y={56} w={160} label="instrukce + data" hot={!!vnActive} color={vnActive === "I" ? ACC : RED} />
        {/* single shared bus */}
        <Bus x1={135} y1={90} x2={135} y2={150} on={!!vnActive} color={vnActive === "I" ? ACC : RED} />
        <text x={150} y={124} fontSize="10" fontFamily="var(--font-mono)"
          fill={vnActive ? (vnActive === "I" ? ACC : RED) : "var(--text-faint)"}>
          {vnActive ? vnActive : "—"}
        </text>
        <text x="135" y="208" textAnchor="middle" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          {vnActive === "D" ? "úzké hrdlo: I čeká na D" : vnActive === "I" ? "sběrnice obsazena instrukcí" : "sběrnice volná"}
        </text>

        {/* divider */}
        <line x1="270" y1="46" x2="270" y2="200" stroke="var(--line)" strokeDasharray="3 4" />

        {/* ---- Harvard (right) ---- */}
        <text x="405" y="22" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--text)">Harvard</text>
        <text x="405" y="37" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">oddělené paměti · 2 sběrnice</text>
        {/* CPU */}
        <rect x="350" y="150" width="110" height="40" rx="6" fill="var(--bg-card)" stroke="var(--text-muted)" />
        <text x="405" y="174" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">CPU</text>
        {/* two memories */}
        <Mem x={310} y={56} w={88} label="instrukce" hot={hvI} color={ACC} />
        <Mem x={406} y={56} w={70} label="data" hot={hvD} color={GRN} />
        {/* two buses */}
        <Bus x1={354} y1={90} x2={380} y2={150} on={hvI} color={ACC} />
        <Bus x1={441} y1={90} x2={430} y2={150} on={hvD} color={GRN} />
        <text x={336} y={124} fontSize="10" fontFamily="var(--font-mono)" fill={hvI ? ACC : "var(--text-faint)"}>I</text>
        <text x={446} y={124} fontSize="10" fontFamily="var(--font-mono)" fill={hvD ? GRN : "var(--text-faint)"}>D</text>
        <text x="405" y="208" textAnchor="middle" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          {hvI && hvD ? "souběh: I i D najednou" : hvI || hvD ? "jedna sběrnice aktivní" : "obě sběrnice volné"}
        </text>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {cur.id === "idle" && "Klidový stav. Vyber krok a sleduj, jak jedna sdílená sběrnice (vlevo) musí přístupy k instrukci a datům serializovat, kdežto dvě oddělené (vpravo) je zvládnou současně."}
        {cur.id === "fetchI" && "Načítání instrukce. V obou architekturách táhne CPU instrukci z paměti — zatím beze sporu."}
        {cur.id === "fetchD" && "Instrukce potřebuje data z paměti. U Von Neumanna sdílí data stejnou sběrnici jako instrukce → CPU nemůže zároveň natahovat další instrukci (Von Neumannovo úzké hrdlo). Harvard čte data po datové sběrnici a po instrukční sběrnici už současně přednačítá další instrukci → vyšší propustnost i determinismus."}
      </div>
    </div>
  );
}
