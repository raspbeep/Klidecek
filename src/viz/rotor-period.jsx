// Jeden rotor + řetězení 2–3 rotorů — vizualizace periody $26^N$.
// Slider "krok" posunuje rotory; vidí se, kolikrát se rotor i otočil.
import { useState } from "react";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// Real rotor I wiring
const ROTOR_I = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const ROTOR_II = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
const ROTOR_III = "BDFHJLCPRTXVZNYEIWGAKMUSQO";

function getEffectiveSubst(wiring, offset) {
  // Při natočení o offset: vstup A → ((A + offset) mod 26 → wiring(...) → výsledek - offset)
  return ALPHA.split("").map((_, i) => {
    const shifted = (i + offset) % 26;
    const out = ALPHA.indexOf(wiring[shifted]);
    return ALPHA[(out - offset + 26) % 26];
  });
}

export default function RotorPeriod() {
  const [step, setStep] = useState(0);
  const [numRotors, setNumRotors] = useState(2);
  const [highlightChar, setHighlightChar] = useState("A");

  // Pozice rotorů jako counter: rotor 0 = step % 26, rotor 1 = floor(step/26) % 26, ...
  const positions = [step % 26, Math.floor(step / 26) % 26, Math.floor(step / 676) % 26];
  const wirings = [ROTOR_I, ROTOR_II, ROTOR_III];

  const periods = [26, 676, 17576];

  // Substituce po složení několika rotorů
  function compose(c) {
    let x = c;
    for (let r = 0; r < numRotors; r++) {
      const subst = getEffectiveSubst(wirings[r], positions[r]);
      x = subst[ALPHA.indexOf(x)];
    }
    return x;
  }

  const cipher = compose(highlightChar);

  // Track current substitution function for visualization
  const W = 540, H = 200;
  const cx = 80, r1 = 70;
  const rotorXs = [180, 290, 400];

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Počet rotorů:</label>
        <input type="range" className="viz-slider" min={1} max={3} value={numRotors} onChange={(e) => setNumRotors(+e.target.value)} />
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{numRotors}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 10 }}>
          perioda = 26^{numRotors} = <b style={{ color: "var(--accent)" }}>{periods[numRotors - 1].toLocaleString()}</b>
        </span>
      </div>
      <div className="viz-controls">
        <label style={lbl}>krok t = {step}:</label>
        <input type="range" className="viz-slider" min={0} max={periods[numRotors - 1] - 1} value={step} onChange={(e) => setStep(+e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <button onClick={() => setStep(0)} className="viz-btn">Reset</button>
        <button onClick={() => setStep(step + 1)} className="viz-btn primary">+1</button>
      </div>
      <div className="viz-controls">
        <label style={lbl}>Sledovat znak:</label>
        <select className="viz-select" value={highlightChar} onChange={(e) => setHighlightChar(e.target.value)}>
          {ALPHA.split("").map((c) => <option key={c}>{c}</option>)}
        </select>
        <span style={{ color: "var(--text-faint)" }}>→</span>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 14, fontWeight: "bold" }}>{cipher}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620 }}>
        {/* Rotors as circles */}
        {Array.from({ length: numRotors }, (_, i) => {
          const x = rotorXs[i];
          return (
            <g key={i}>
              <circle cx={x} cy={H / 2} r={50} fill="var(--bg-inset)" stroke="var(--accent)" />
              <text x={x} y={H / 2 + 5} textAnchor="middle" fontSize="20" fill="var(--accent)" fontFamily="var(--font-mono)">
                {ALPHA[positions[i]]}
              </text>
              <text x={x} y={H / 2 - 60} textAnchor="middle" fontSize="11" fill="var(--text-muted)">R{i + 1}</text>
              <text x={x} y={H / 2 + 70} textAnchor="middle" fontSize="10" fill="var(--text-muted)">pos={positions[i]}</text>
            </g>
          );
        })}

        {/* Connections between rotors */}
        {Array.from({ length: numRotors }, (_, i) => i < numRotors - 1 && (
          <line key={i} x1={rotorXs[i] + 50} y1={H / 2} x2={rotorXs[i + 1] - 50} y2={H / 2}
            stroke="var(--line-strong)" strokeWidth="1.2" />
        ))}

        {/* Input/Output indicators */}
        <text x={rotorXs[0] - 80} y={H / 2 + 5} fontSize="11" fill="var(--text-muted)">vstup: </text>
        <text x={rotorXs[0] - 50} y={H / 2 + 5} fontSize="14" fill="var(--text)" fontFamily="var(--font-mono)" fontWeight="bold">{highlightChar}</text>
        <text x={rotorXs[numRotors - 1] + 55} y={H / 2 + 5} fontSize="14" fill="var(--accent)" fontFamily="var(--font-mono)" fontWeight="bold">{cipher}</text>
        <text x={rotorXs[numRotors - 1] + 90} y={H / 2 + 5} fontSize="11" fill="var(--text-muted)"> :výstup</text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Po každém kroku se posune <b>R₁</b> o 1. Po 26 krocích se posune i <b>R₂</b> (jako počítadlo).
        Po 676 krocích se posune <b>R₃</b>.<br />
        Důsledek: efektivní perioda je <b>26^N</b>. Pro Enigmu (N=3) je to 17 576 — málo. Skutečná Enigma má další mechanismy
        (reflektor, plugboard, výběr rotorů) zvyšující stavový prostor na ~10^17.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
