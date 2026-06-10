// Vigenère cipher + Kasiski / Index of Coincidence attack.
// Top panel: type plaintext + key, see ciphertext with per-position key letter.
// Bottom: try various key lengths, compute IC of each sub-stream;
// English IC ≈ 0.065, random ≈ 0.038. Correct key length pops out as max.
import { useMemo, useState } from "react";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ENGLISH_IC = 0.065;
const RANDOM_IC = 0.038;

function clean(s) {
  return s.toUpperCase().replace(/[^A-Z]/g, "");
}
function encrypt(p, k) {
  if (!k) return p;
  return p
    .split("")
    .map((c, i) => ALPHA[(ALPHA.indexOf(c) + ALPHA.indexOf(k[i % k.length])) % 26])
    .join("");
}
function ic(s) {
  if (s.length < 2) return 0;
  const freq = new Array(26).fill(0);
  for (const c of s) freq[ALPHA.indexOf(c)]++;
  let sum = 0;
  for (const f of freq) sum += f * (f - 1);
  return sum / (s.length * (s.length - 1));
}
function substr(s, period, offset) {
  let out = "";
  for (let i = offset; i < s.length; i += period) out += s[i];
  return out;
}

const PRESETS = {
  "Krátká zpráva (klíč KEY)": {
    plain: "ATTACKATDAWNSENDTROOPSIMMEDIATELY",
    key: "KEY",
  },
  "Delší — odhalí strukturu": {
    plain:
      "THERIVERWASCALMTHEDAYWASBEAUTIFULTHEMOUNTAINSWERESILENTANDNOTHING" +
      "TROUBLEDOURJOURNEYACROSSTHEFIELDSTHESOLDIERSWAITEDFORORDERS",
    key: "LEMON",
  },
  "Dlouhý klíč — IC se rozpouští": {
    plain:
      "WHENINTHECOURSEOFHUMANEVENTSITBECOMESNECESSARYFORONEPEOPLETODISSOLVE" +
      "THEPOLITICALBANDSWHICHHAVECONNECTEDTHEMWITHANOTHER",
    key: "FREEDOMRIDER",
  },
};

export default function VigenereAttack() {
  const [presetKey, setPresetKey] = useState(Object.keys(PRESETS)[1]);
  const [hypoLen, setHypoLen] = useState(5);
  const preset = PRESETS[presetKey];
  const plain = clean(preset.plain);
  const key = clean(preset.key);
  const cipher = encrypt(plain, key);

  const trueLen = key.length;
  const icPerLen = useMemo(() => {
    const arr = [];
    for (let p = 1; p <= 12; p++) {
      const subs = [];
      for (let o = 0; o < p; o++) subs.push(substr(cipher, p, o));
      const meanIc = subs.reduce((s, x) => s + ic(x), 0) / p;
      arr.push({ p, ic: meanIc });
    }
    return arr;
  }, [cipher]);

  const subs = useMemo(() => {
    const out = [];
    for (let o = 0; o < hypoLen; o++) out.push(substr(cipher, hypoLen, o));
    return out;
  }, [cipher, hypoLen]);

  const W = 540, H = 270;
  const maxIc = 0.075;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Předvolba:</label>
        <select className="viz-select" value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
          {Object.keys(PRESETS).map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        plaintext ({plain.length} znaků), klíč „{key}" (délka {trueLen}):
      </div>
      <div style={mono}>
        {plain.slice(0, 70).split("").map((c, i) => (
          <span key={i} style={{ display: "inline-block", width: 12, textAlign: "center", color: "var(--text-muted)" }}>
            {c}
          </span>
        ))}
      </div>
      <div style={mono}>
        {plain.slice(0, 70).split("").map((_, i) => (
          <span key={i} style={{ display: "inline-block", width: 12, textAlign: "center", color: "var(--accent)" }}>
            {key[i % key.length]}
          </span>
        ))}
      </div>
      <div style={mono}>
        {cipher.slice(0, 70).split("").map((c, i) => (
          <span key={i} style={{ display: "inline-block", width: 12, textAlign: "center", color: "var(--text)" }}>
            {c}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "var(--text)" }}>
        <b>Friedman test:</b> průměrný IC pro hypotézu délky klíče
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 640 }}>
        {/* axes */}
        <line x1={40} y1={H - 40} x2={W - 20} y2={H - 40} stroke="var(--line)" />
        <line x1={40} y1={20} x2={40} y2={H - 40} stroke="var(--line)" />

        {/* reference lines */}
        {[
          { val: ENGLISH_IC, label: "EN ≈ 0.065", color: "#81b29a" },
          { val: RANDOM_IC, label: "rand ≈ 0.038", color: "#e07a5f" },
        ].map((r, i) => {
          const y = H - 40 - (r.val / maxIc) * (H - 70);
          return (
            <g key={i}>
              <line x1={40} y1={y} x2={W - 20} y2={y} stroke={r.color} strokeDasharray="3 3" strokeWidth="1" />
              <text x={W - 24} y={y - 4} fontSize="9" fill={r.color} textAnchor="end">{r.label}</text>
            </g>
          );
        })}

        {/* bars */}
        {icPerLen.map(({ p, ic: val }, i) => {
          const x = 40 + (i + 0.5) * ((W - 60) / 12);
          const y = H - 40 - (val / maxIc) * (H - 70);
          const isHypo = p === hypoLen;
          const isTrue = p === trueLen;
          return (
            <g key={p}>
              <rect
                x={x - 14} y={y} width={28} height={H - 40 - y}
                fill={isHypo ? "var(--accent)" : isTrue ? "#81b29a" : "var(--bg-inset)"}
                stroke="var(--line-strong)" strokeWidth="0.8"
                style={{ cursor: "pointer" }}
                onClick={() => setHypoLen(p)}
              />
              <text x={x} y={H - 26} fontSize="10" fill="var(--text-muted)" textAnchor="middle">{p}</text>
              <text x={x} y={y - 4} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{val.toFixed(3)}</text>
            </g>
          );
        })}
        <text x={W / 2} y={H - 8} fontSize="10" fill="var(--text-muted)" textAnchor="middle">hypotéza délky klíče ℓ</text>
        <text x={12} y={H / 2} fontSize="10" fill="var(--text-muted)" transform={`rotate(-90, 12, ${H / 2})`}>IC</text>
      </svg>

      <div style={{ fontSize: 12, color: "var(--text)" }}>
        Při ℓ = <span style={{ color: "var(--accent)" }}>{hypoLen}</span> rozděluji ciphertext na {hypoLen} podřetězců (každý znak na pozici i, i+ℓ, i+2ℓ, …):
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        {subs.map((s, i) => (
          <div key={i} style={{ color: "var(--text-muted)" }}>
            #{i}: <span style={{ color: "var(--text)" }}>{s.slice(0, 40)}{s.length > 40 ? "…" : ""}</span>{" "}
            <span style={{ color: "var(--text-faint)" }}>(IC = {ic(s).toFixed(3)})</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Pokud správný ℓ trefíme, každý podřetězec je výsledkem <i>jediného</i> Caesarova posunu a má IC angličtiny.
        Skutečná délka klíče je <b style={{ color: "#81b29a" }}>{trueLen}</b> (zelený sloupec).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 };
const lbl = { fontSize: 12, color: "var(--text-muted)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.2, whiteSpace: "nowrap", overflowX: "auto" };
