// Měřicí řetězec — krokový průchod transformací neelektrické veličiny (teploty)
// na číslo v registru MCU. Každý krok zvýrazní aktivní článek a ukáže, v jaké
// formě je signál na jeho výstupu.
import { useState } from "react";

const STAGES = [
  {
    id: "cidlo", label: "čidlo", hue: 264,
    out: "R = 109,7 Ω",
    role: "převod",
    desc: "Pt100 v kontaktu s prostředím: teplota 23,7 °C mění odpor platinového čidla. Neelektrická veličina je převedena na změnu odporu.",
  },
  {
    id: "afe", label: "AFE", hue: 200,
    out: "U = 1,84 V",
    role: "úprava",
    desc: "Analog Front-End: budicí proud udělá z odporu napětí, přístrojový zesilovač jej zesílí a dolní propust odfiltruje šum. Impedanční přizpůsobení připraví signál pro ADC.",
  },
  {
    id: "mux", label: "MUX", hue: 200,
    out: "kanál 3 → ADC",
    role: "úprava",
    desc: "Analogový multiplexer připojí právě tento kanál k jedinému internímu A/D převodníku. Signál zůstává analogový, jen se přepne cesta.",
  },
  {
    id: "adc", label: "ADC", hue: 22,
    out: "0x5E3  (1507)",
    role: "převod",
    desc: "SAR převodník (12 b) vzorkuje a kvantuje napětí 1,84 V při V_ref = 3,3 V na binární kód. Zde končí analogová doména.",
  },
  {
    id: "mcu", label: "MCU", hue: 264,
    out: "23,7 °C",
    role: "zpracování",
    desc: "Procesor přepočte kód na napětí, přes charakteristiku Pt100 jej linearizuje na teplotu a vrátí hodnotu v °C k dalšímu použití.",
  },
];

export default function NavMericiRetezec() {
  const [step, setStep] = useState(0);
  const W = 520, H = 96;
  const n = STAGES.length;
  const pad = 12, gap = 10;
  const boxW = (W - 2 * pad - (n - 1) * gap) / n;

  const cur = STAGES[step];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← zpět</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          článek {step + 1} / {n}
        </div>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.min(n - 1, step + 1))} disabled={step === n - 1}>dál →</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        {STAGES.map((s, i) => {
          const x = pad + i * (boxW + gap);
          const active = i === step;
          const done = i < step;
          const accent = `oklch(0.6 0.15 ${s.hue})`;
          return (
            <g key={s.id}>
              {i < n - 1 && (
                <line x1={x + boxW} y1={44} x2={x + boxW + gap} y2={44}
                  stroke={i < step ? accent : "var(--line-strong)"} strokeWidth="1.6" markerEnd="url(#mrcArr)" />
              )}
              <rect x={x} y={22} width={boxW} height={44} rx="6"
                fill={active ? `oklch(0.6 0.15 ${s.hue} / 0.18)` : done ? "var(--bg-card)" : "var(--bg-card)"}
                stroke={active ? accent : "var(--line-strong)"} strokeWidth={active ? "2" : "1"} />
              <text x={x + boxW / 2} y={40} textAnchor="middle" fontSize="11" fontWeight="600"
                fill={active ? "var(--text)" : done ? "var(--text)" : "var(--text-muted)"}>{s.label}</text>
              <text x={x + boxW / 2} y={56} textAnchor="middle" fontSize="8.5"
                fill={active ? accent : "var(--text-faint)"}>{s.role}</text>
              <text x={x + boxW / 2} y={84} textAnchor="middle" fontSize="9.5"
                fontFamily="var(--font-mono)" fill={i <= step ? "var(--text)" : "var(--text-faint)"}>
                {i <= step ? s.out : "—"}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="mrcArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 4 }}>
          {cur.label} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {cur.role}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{cur.desc}</div>
      </div>
    </div>
  );
}

const navBtn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
