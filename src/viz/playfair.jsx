// Playfair: 5×5 klíčová matice. Šifrování digramu podle tří pravidel.
import { useMemo, useState } from "react";

function buildMatrix(key) {
  // J → I; remove duplicates
  const seen = new Set();
  const flat = [];
  for (const c of (key + "ABCDEFGHIKLMNOPQRSTUVWXYZ").toUpperCase().replace(/J/g, "I")) {
    if (/[A-Z]/.test(c) && !seen.has(c)) {
      seen.add(c);
      flat.push(c);
    }
    if (flat.length === 25) break;
  }
  const m = [];
  for (let i = 0; i < 5; i++) m.push(flat.slice(i * 5, i * 5 + 5));
  return m;
}

function findPos(matrix, c) {
  for (let r = 0; r < 5; r++) for (let col = 0; col < 5; col++) {
    if (matrix[r][col] === c) return { r, col };
  }
  return null;
}

function prepareDigrams(text) {
  const cleaned = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const digrams = [];
  let i = 0;
  while (i < cleaned.length) {
    let a = cleaned[i], b = cleaned[i + 1];
    if (!b) { b = "X"; i++; }
    else if (a === b) { b = "X"; i++; }
    else { i += 2; }
    digrams.push([a, b]);
  }
  return digrams;
}

function encryptDigram(matrix, a, b) {
  const pa = findPos(matrix, a), pb = findPos(matrix, b);
  if (!pa || !pb) return [a, b, "invalid"];
  if (pa.r === pb.r) {
    return [matrix[pa.r][(pa.col + 1) % 5], matrix[pb.r][(pb.col + 1) % 5], "row"];
  }
  if (pa.col === pb.col) {
    return [matrix[(pa.r + 1) % 5][pa.col], matrix[(pb.r + 1) % 5][pb.col], "col"];
  }
  return [matrix[pa.r][pb.col], matrix[pb.r][pa.col], "rect"];
}

const RULE_LABEL = { row: "Stejný řádek → vpravo", col: "Stejný sloupec → dolů", rect: "Obdélník → řádek své letnice + sloupec partnera" };

export default function Playfair() {
  const [keyword, setKeyword] = useState("MONARCHY");
  const [plain, setPlain] = useState("HIDETHEGOLD");
  const [selectedDigram, setSelectedDigram] = useState(0);

  const matrix = useMemo(() => buildMatrix(keyword), [keyword]);
  const digrams = useMemo(() => prepareDigrams(plain), [plain]);
  const results = useMemo(() => digrams.map(([a, b]) => encryptDigram(matrix, a, b)), [matrix, digrams]);

  const cipher = results.map((r) => r[0] + r[1]).join("");
  const cur = digrams[selectedDigram];
  const curResult = results[selectedDigram];
  const pa = cur ? findPos(matrix, cur[0]) : null;
  const pb = cur ? findPos(matrix, cur[1]) : null;
  const cAfterPos = curResult ? findPos(matrix, curResult[0]) : null;
  const dAfterPos = curResult ? findPos(matrix, curResult[1]) : null;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Klíčové slovo:</label>
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} style={inp} maxLength={20} />
        <label style={lbl}>Plaintext:</label>
        <input value={plain} onChange={(e) => setPlain(e.target.value)} style={inp} maxLength={20} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Klíčová matice (J = I):</div>
          <svg viewBox="0 0 200 200" style={{ width: 200, height: 200 }}>
            {matrix.map((row, r) => row.map((c, col) => {
              const isP1 = pa && pa.r === r && pa.col === col;
              const isP2 = pb && pb.r === r && pb.col === col;
              const isC1 = cAfterPos && cAfterPos.r === r && cAfterPos.col === col;
              const isC2 = dAfterPos && dAfterPos.r === r && dAfterPos.col === col;
              return (
                <g key={`${r}-${col}`}>
                  <rect x={col * 40} y={r * 40} width={38} height={38} rx={3}
                    fill={isP1 || isP2 ? "rgba(81,131,219,0.25)" : isC1 || isC2 ? "rgba(129,178,154,0.25)" : "var(--bg-inset)"}
                    stroke={isP1 || isP2 ? "var(--accent)" : isC1 || isC2 ? "#81b29a" : "var(--line)"}
                    strokeWidth={isP1 || isP2 || isC1 || isC2 ? 2 : 1} />
                  <text x={col * 40 + 19} y={r * 40 + 25} textAnchor="middle"
                    fontSize="16" fontFamily="var(--font-mono)" fontWeight={isP1 || isP2 ? "bold" : "normal"}
                    fill={isP1 || isP2 ? "var(--accent)" : isC1 || isC2 ? "#81b29a" : "var(--text)"}>
                    {c}
                  </text>
                </g>
              );
            }))}
            {/* arrows from plain to cipher */}
            {pa && cAfterPos && (
              <path d={`M${pa.col * 40 + 19},${pa.r * 40 + 19} L${cAfterPos.col * 40 + 19},${cAfterPos.r * 40 + 19}`}
                stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#aPfArrow)" />
            )}
            {pb && dAfterPos && (
              <path d={`M${pb.col * 40 + 19},${pb.r * 40 + 19} L${dAfterPos.col * 40 + 19},${dAfterPos.r * 40 + 19}`}
                stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#aPfArrow)" />
            )}
            <defs>
              <marker id="aPfArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
              </marker>
            </defs>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Digramy (klikni na jeden):</div>
          <div className="viz-controls">
            {digrams.map((d, i) => (
              <button key={i} className="viz-btn" data-active={i === selectedDigram} onClick={() => setSelectedDigram(i)}>
                {d[0]}{d[1]}→{results[i][0]}{results[i][1]}
              </button>
            ))}
          </div>
          {curResult && (
            <div style={{ marginTop: 10, background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontSize: 12 }}>
              <div style={{ fontFamily: "var(--font-mono)" }}>
                <span style={{ color: "var(--accent)" }}>{cur[0]}{cur[1]}</span>
                {" → "}
                <span style={{ color: "#81b29a" }}>{curResult[0]}{curResult[1]}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Pravidlo: <b>{RULE_LABEL[curResult[2]]}</b>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={section}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Ciphertext:</div>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 14, letterSpacing: 2 }}>{cipher}</div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Playfair zachovává digramovou statistiku — nejčastější anglické digramy (TH, HE, IN…) se v ciphertextu
        projeví jako nejčastější digramy. Klíčový prostor 25! ≈ 2^84, ale frekvenční analýza padne při ~200+ znaků.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const inp = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)" };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
