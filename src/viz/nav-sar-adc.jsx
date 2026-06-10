// SAR A/D převodník — binární vyhledávání. Slider nastaví vstupní napětí,
// tlačítka krokují převod: v každém kroku DAC vygeneruje zkušební napětí,
// komparátor rozhodne o jednom bitu (MSB → LSB). N-bitový převod = N kroků.
import { useState } from "react";

const N = 6;        // počet bitů (kvůli čitelnosti diagramu)
const VREF = 3.3;
const LEVELS = 1 << N;

// Vrať pole stavů registru po každém kroku binárního vyhledávání.
function runSar(code) {
  const steps = [];
  let reg = 0;
  for (let b = N - 1; b >= 0; b--) {
    const trial = reg | (1 << b);
    const dac = (trial / LEVELS) * VREF;
    const vin = (code / LEVELS) * VREF + 0.5 * (VREF / LEVELS);
    const keep = vin >= dac;            // vstup >= DAC → bit zůstane 1
    if (keep) reg = trial;
    steps.push({ bit: b, trial, dac, keep, reg });
  }
  return steps;
}

export default function NavSarAdc() {
  const [code, setCode] = useState(41);   // cílový kód, který má SAR najít
  const [step, setStep] = useState(N);     // N = hotovo

  const steps = runSar(code);
  const done = step >= N;
  const vin = (code / LEVELS) * VREF + 0.5 * (VREF / LEVELS);

  const W = 360, H = 150;
  const x0 = 30, x1 = W - 14;
  const toX = (v) => x0 + (v / VREF) * (x1 - x0);
  const toCodeX = (c) => x0 + (c / LEVELS) * (x1 - x0);

  const visible = steps.slice(0, step);
  const cur = step > 0 && step <= N ? steps[step - 1] : null;
  const reg = step === 0 ? 0 : steps[step - 1].reg;

  const reset = (c) => { setCode(c); setStep(0); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← zpět</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          {step === 0 ? "start" : done ? "hotovo" : `krok ${step} / ${N}`}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(N, step + 1))} disabled={done}>další bit →</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* voltage axis */}
        <line x1={x0} y1={108} x2={x1} y2={108} stroke="var(--line-strong)" strokeWidth="1" />
        {[0, VREF / 2, VREF].map((v, i) => (
          <g key={i}>
            <line x1={toX(v)} y1={104} x2={toX(v)} y2={112} stroke="var(--text-muted)" strokeWidth="1" />
            <text x={toX(v)} y={124} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">{v.toFixed(1)}</text>
          </g>
        ))}
        <text x={x1} y={138} textAnchor="end" fontSize="8.5" fill="var(--text-faint)">V_in (V)</text>

        {/* Vin marker */}
        <line x1={toX(vin)} y1={40} x2={toX(vin)} y2={112} stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="3 3" />
        <text x={toX(vin)} y={34} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">V_in</text>

        {/* DAC trial bars for visible steps */}
        {visible.map((s, i) => {
          const yy = 50 + i * 9.2;
          const c = s.keep ? "oklch(0.55 0.16 142)" : "oklch(0.6 0.18 22)";
          return (
            <g key={i}>
              <line x1={toX(0)} y1={yy} x2={toX(s.dac)} y2={yy} stroke={c} strokeWidth="2" opacity={cur && cur.bit === s.bit ? 1 : 0.5} />
              <circle cx={toX(s.dac)} cy={yy} r="2.6" fill={c} />
              <text x={x0 - 4} y={yy + 3} textAnchor="end" fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">b{s.bit}</text>
            </g>
          );
        })}

        {/* register readout */}
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--text)">
          SAR: {reg.toString(2).padStart(N, "0")}
          {done ? `  =  ${reg}` : ""}
        </text>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, minHeight: 38 }}>
        {step === 0 && <span>Vstupní napětí je navzorkováno. Stiskněte „další bit" — SAR začne testovat od nejvýznamnějšího bitu (b{N - 1}).</span>}
        {cur && (
          <span>
            <b style={{ color: "var(--text)" }}>Bit b{cur.bit}:</b> DAC nastaví zkušební napětí {cur.dac.toFixed(2)} V.
            {" "}Komparátor: V_in {cur.keep ? "≥" : "<"} DAC →{" "}
            {cur.keep
              ? <span style={{ color: "oklch(0.5 0.16 142)" }}>bit zůstává 1.</span>
              : <span style={{ color: "oklch(0.6 0.18 22)" }}>bit se vynuluje na 0.</span>}
          </span>
        )}
        {done && <span> Po {N} krocích je v registru výsledný kód <b style={{ color: "var(--text)" }}>{reg}</b>. N-bitový převod trvá vždy přesně N porovnání.</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <input type="range" className="viz-slider" min={0} max={LEVELS - 1} value={code}
          onChange={(e) => reset(+e.target.value)} style={{ width: "100%" }} />
        <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
          cílový kód = {code} · V_in ≈ {vin.toFixed(2)} V (změna resetuje převod)
        </div>
      </div>
    </div>
  );
}
