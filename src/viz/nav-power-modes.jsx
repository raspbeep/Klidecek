// ARM Cortex-M / STM32-style low-power mode explorer. Click a mode on the
// depth ladder; the panel shows clocks, Vcore, what is retained vs lost,
// typical current draw and wake-up behaviour.
import { useState } from "react";

const MODES = [
  {
    id: "run", name: "Run / LP run", hue: 142, draw: "mA – stovky µA",
    core: "běží", vcore: "zapnuto", ret: "vše zachováno",
    wake: "—", lost: [],
    note: "Plný výkon; LP run sníží hodiny a aktivuje úsporný regulátor.",
  },
  {
    id: "sleep", name: "Sleep", hue: 110, draw: "stovky µA",
    core: "stop (WFI/WFE)", vcore: "zapnuto", ret: "vše zachováno",
    wake: "přerušení — velmi rychlé", lost: [],
    note: "Stojí jen hodiny jádra; periferie a paměti běží a mohou budit.",
  },
  {
    id: "stop", name: "Stop", hue: 80, draw: "jednotky µA",
    core: "stop + osc. stop", vcore: "LP režim", ret: "SRAM + registry zachovány",
    wake: "EXTI / async — rychlé", lost: [],
    note: "Hlavní hodiny i PLL/HSI/HSE stojí, ale celý kontext přežívá.",
  },
  {
    id: "standby", name: "Standby", hue: 45, draw: "< 1 µA",
    core: "stop", vcore: "odpojeno", ret: "jen záloha: RTC, VBAT, malá SRAM",
    wake: "wake-up pin / RTC — restart", lost: ["hlavní SRAM", "registry jádra"],
    note: "Vcore odpojen; obnova ze zálohové domény, ne plné pokračování.",
  },
  {
    id: "shutdown", name: "Shutdown", hue: 22, draw: "< 100 nA",
    core: "stop", vcore: "odpojeno", ret: "jen RTC/LSE + wake-up piny",
    wake: "wake-up pin / LSE — studený reset", lost: ["hlavní SRAM", "registry", "BOR hlídání"],
    note: "Nejnižší odběr; vypnuty i podpěťové obvody, start od nuly.",
  },
];

const W = 360, ladderTop = 24, rowH = 26;

export default function NavPowerModes() {
  const [sel, setSel] = useState("stop");
  const m = MODES.find((x) => x.id === sel);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Depth ladder */}
      <svg viewBox={`0 0 ${W} ${ladderTop + MODES.length * rowH + 18}`} style={{ width: "100%", maxWidth: 420 }}>
        <text x={8} y={16} fontSize="10" fill="var(--text-faint)">mělčí spánek · vyšší odběr</text>
        {MODES.map((mode, i) => {
          const y = ladderTop + i * rowH;
          const active = mode.id === sel;
          return (
            <g key={mode.id} onClick={() => setSel(mode.id)} style={{ cursor: "pointer" }}>
              <rect
                x={8} y={y} width={W - 16} height={rowH - 5} rx="5"
                fill={`oklch(0.62 0.14 ${mode.hue} / ${active ? 0.3 : 0.1})`}
                stroke={`oklch(0.62 0.14 ${mode.hue})`}
                strokeWidth={active ? 1.6 : 0.8}
              />
              <text x={18} y={y + 15} fontSize="11.5" fontWeight={active ? 700 : 500} fill="var(--text)">
                {mode.name}
              </text>
              <text x={W - 22} y={y + 15} textAnchor="end" fontSize="10.5"
                fontFamily="var(--font-mono)" fill={`oklch(0.5 0.14 ${mode.hue})`}>
                {mode.draw}
              </text>
            </g>
          );
        })}
        <text x={8} y={ladderTop + MODES.length * rowH + 12} fontSize="10" fill="var(--text-faint)">
          hlubší spánek · nižší odběr · pomalejší probuzení
        </text>
      </svg>

      {/* Detail panel */}
      <div style={{
        padding: 10, borderRadius: 8, border: "1px solid var(--line)",
        background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: 6,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: `oklch(0.5 0.14 ${m.hue})` }}>{m.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "3px 10px", fontSize: 11.5 }}>
          <span style={k}>hodiny jádra</span><span style={v}>{m.core}</span>
          <span style={k}>Vcore</span><span style={v}>{m.vcore}</span>
          <span style={k}>zachováno</span><span style={v}>{m.ret}</span>
          <span style={k}>probuzení</span><span style={v}>{m.wake}</span>
        </div>
        {m.lost.length > 0 && (
          <div style={{ fontSize: 11, color: "oklch(0.55 0.18 22)" }}>
            ztraceno: {m.lost.join(", ")}
          </div>
        )}
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{m.note}</div>
      </div>
    </div>
  );
}

const k = { color: "var(--text-faint)", fontFamily: "var(--font-mono)" };
const v = { color: "var(--text)" };
