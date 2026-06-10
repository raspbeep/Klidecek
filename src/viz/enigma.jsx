// Enigma simulator: 3 rotory, reflektor, plugboard.
// Type letter → animated signal path: plugboard → R1 → R2 → R3 → reflektor → R3⁻¹ → R2⁻¹ → R1⁻¹ → plugboard.
// Verifies "no letter maps to itself" (důsledek involutivního reflektoru).
import { useState } from "react";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Three real Wehrmacht rotor wirings (I, II, III)
const ROTORS = {
  I:   { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
  II:  { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" },
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" },
};
// Standard reflector UKW-B
const REFLECTOR = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

function modIdx(c, off = 0) {
  return (ALPHA.indexOf(c) + off + 26) % 26;
}
function letterAt(i) { return ALPHA[((i % 26) + 26) % 26]; }

function rotorForward(c, wiring, pos) {
  const input = modIdx(c, pos);
  const out = wiring[input];
  return letterAt(ALPHA.indexOf(out) - pos);
}
function rotorBackward(c, wiring, pos) {
  const input = modIdx(c, pos);
  const out = wiring.indexOf(ALPHA[input]);
  return letterAt(out - pos);
}
function applyPlugboard(c, plugs) {
  for (const [a, b] of plugs) {
    if (c === a) return b;
    if (c === b) return a;
  }
  return c;
}

function step(positions, rotorTypes) {
  // simplified single-stepping (no double-step)
  const newPos = [...positions];
  newPos[0] = (newPos[0] + 1) % 26;
  if (letterAt(positions[0]) === ROTORS[rotorTypes[0]].notch) {
    newPos[1] = (newPos[1] + 1) % 26;
    if (letterAt(positions[1]) === ROTORS[rotorTypes[1]].notch) {
      newPos[2] = (newPos[2] + 1) % 26;
    }
  }
  return newPos;
}

function encryptLetter(c, positions, rotorTypes, plugs) {
  const path = [c];
  let x = applyPlugboard(c, plugs); path.push(x);
  x = rotorForward(x, ROTORS[rotorTypes[0]].wiring, positions[0]); path.push(x);
  x = rotorForward(x, ROTORS[rotorTypes[1]].wiring, positions[1]); path.push(x);
  x = rotorForward(x, ROTORS[rotorTypes[2]].wiring, positions[2]); path.push(x);
  x = REFLECTOR[ALPHA.indexOf(x)]; path.push(x);
  x = rotorBackward(x, ROTORS[rotorTypes[2]].wiring, positions[2]); path.push(x);
  x = rotorBackward(x, ROTORS[rotorTypes[1]].wiring, positions[1]); path.push(x);
  x = rotorBackward(x, ROTORS[rotorTypes[0]].wiring, positions[0]); path.push(x);
  x = applyPlugboard(x, plugs); path.push(x);
  return { output: x, path };
}

export default function Enigma() {
  const [rotorTypes] = useState(["I", "II", "III"]);
  const [positions, setPositions] = useState([0, 0, 0]);
  const [plugsStr, setPlugsStr] = useState("AM,FI,NV,PS,TU,WZ");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [lastPath, setLastPath] = useState(null);

  const plugs = plugsStr.split(",")
    .map((p) => p.trim().toUpperCase())
    .filter((p) => p.length === 2 && p[0] !== p[1])
    .map((p) => [p[0], p[1]]);

  function handleType(letter) {
    const c = letter.toUpperCase();
    if (!ALPHA.includes(c)) return;
    const newPos = step(positions, rotorTypes);
    const { output: out, path } = encryptLetter(c, newPos, rotorTypes, plugs);
    setPositions(newPos);
    setInput((s) => s + c);
    setOutput((s) => s + out);
    setLastPath(path);
  }
  function reset() {
    setPositions([0, 0, 0]);
    setInput(""); setOutput(""); setLastPath(null);
  }

  const W = 540, H = 280;
  // Layout: keyboard (input) left | plugboard | R1 | R2 | R3 | reflector
  const colXs = [40, 130, 220, 290, 360, 450];
  const labels = ["Vstup", "Plugbd", "R1", "R2", "R3", "UKW"];

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Rotor pozice (Stellung):</label>
        {[0, 1, 2].map((i) => (
          <select key={i} className="viz-select" value={positions[i]}
            onChange={(e) => setPositions(positions.map((p, j) => j === i ? +e.target.value : p))}>
            {ALPHA.split("").map((c, idx) => <option key={c} value={idx}>{c}</option>)}
          </select>
        ))}
        <button className="viz-btn" onClick={reset}>Reset</button>
      </div>
      <div className="viz-controls">
        <label style={lbl}>Plugboard:</label>
        <input value={plugsStr} onChange={(e) => setPlugsStr(e.target.value.toUpperCase())} style={{ ...sel, flex: 1, minWidth: 200, fontFamily: "var(--font-mono)" }} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620 }}>
        {/* columns */}
        {colXs.map((x, i) => (
          <g key={i}>
            <rect x={x - 24} y={30} width={48} height={H - 60} rx={6} fill="var(--bg-inset)" stroke="var(--line)" />
            <text x={x} y={22} fontSize="11" fill="var(--text-muted)" textAnchor="middle">{labels[i]}</text>
            {i >= 2 && i <= 4 && (
              <text x={x} y={H - 38} fontSize="9" fill="var(--accent)" textAnchor="middle" fontFamily="var(--font-mono)">
                pos={letterAt(positions[i - 2])}
              </text>
            )}
          </g>
        ))}

        {/* letter dots — 26 per column */}
        {colXs.map((x, c) => (
          <g key={"col" + c}>
            {ALPHA.split("").map((ch, j) => {
              const y = 40 + j * ((H - 90) / 26);
              const inPath = lastPath && lastPath[c] === ch;
              return (
                <g key={ch}>
                  <circle cx={x} cy={y} r={inPath ? 4 : 1.5} fill={inPath ? "var(--accent)" : "var(--text-faint)"} />
                  {inPath && (
                    <text x={x + 8} y={y + 3} fontSize="9" fill="var(--accent)" fontFamily="var(--font-mono)">{ch}</text>
                  )}
                </g>
              );
            })}
          </g>
        ))}

        {/* signal path forward */}
        {lastPath && lastPath.slice(0, 9).map((ch, i) => {
          if (i === 8) return null;
          const x1 = colXs[i] + 6, x2 = colXs[i + 1] - 6;
          const y1 = 40 + ALPHA.indexOf(ch) * ((H - 90) / 26);
          const y2 = 40 + ALPHA.indexOf(lastPath[i + 1]) * ((H - 90) / 26);
          return (
            <path key={"f" + i} d={`M${x1},${y1} L${x2},${y2}`} stroke="var(--accent)" strokeWidth="1.5" fill="none"
              opacity={i < 4 ? 1 : 0.6} strokeDasharray={i < 4 ? "0" : "4 2"} />
          );
        })}
      </svg>

      <div style={row}>
        {ALPHA.split("").map((c) => (
          <button key={c} onClick={() => handleType(c)} style={kbBtn}>{c}</button>
        ))}
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-inset)", padding: 8, borderRadius: 6 }}>
        <div style={{ color: "var(--text-muted)" }}>vstup: <span style={{ color: "var(--text)" }}>{input || "—"}</span></div>
        <div style={{ color: "var(--text-muted)" }}>výstup: <span style={{ color: "var(--accent)" }}>{output || "—"}</span></div>
        {lastPath && (
          <div style={{ color: "var(--text-faint)", marginTop: 4 }}>
            cesta: {lastPath.join(" → ")}
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Reflektor zaručuje, že šifrování je involutivní — stejné nastavení dešifruje.
        Důsledek: žádné písmeno nikdy nešifrujte samo na sebe — strukturální slabina, kterou Bletchley využil.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 };
const row = { display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 12, color: "var(--text-muted)" };
const sel = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11 };
const kbBtn = { width: 22, height: 22, padding: 0, fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 3, cursor: "pointer" };
