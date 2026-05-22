// Pumping lemma — adversariální hra.
// Pro libovolný předem zvolený neregulární jazyk: vyber p (pumping konstantu),
// zvol rozklad w = xyz (resp. uvwxy pro CFG), a uvidíš co se stane při pumpování
// pro i = 0,1,2,3. Hra ukazuje, že "pro každý rozklad existuje i, které vyvrátí pumpovatelnost".
import { useState, useEffect } from "react";

const REG_LANGUAGES = {
  "{a^n b^n : n ≥ 0}": {
    word: (p) => "a".repeat(p) + "b".repeat(p),
    inL: (s) => {
      const m = s.match(/^(a*)(b*)$/);
      if (!m) return false;
      return m[1].length === m[2].length;
    },
    note: "Vyrovnání #a = #b nelze udržet konečným stavem.",
  },
  "{a^p : p prvočíslo}": {
    word: (p) => "a".repeat(nextPrime(p)),
    inL: (s) => {
      if (!/^a*$/.test(s)) return false;
      const n = s.length;
      if (n < 2) return false;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
      return true;
    },
    note: "Prvočíselnost: pumpování přidává multiplicitu, ničí prvočíselnost.",
  },
  "{w w : w ∈ {a,b}*}": {
    word: (p) => "a".repeat(p) + "b" + "a".repeat(p) + "b",
    inL: (s) => {
      if (s.length % 2 !== 0) return false;
      return s.slice(0, s.length / 2) === s.slice(s.length / 2);
    },
    note: "Slovo musí být tvar w·w; pumpování porušuje rovnost půlek.",
  },
};

const CFG_LANGUAGES = {
  "{a^n b^n c^n}": {
    word: (p) => "a".repeat(p) + "b".repeat(p) + "c".repeat(p),
    inL: (s) => {
      const m = s.match(/^(a*)(b*)(c*)$/);
      if (!m) return false;
      return m[1].length === m[2].length && m[2].length === m[3].length;
    },
    note: "Tři vyrovnané počty nelze pumpovat — vwx pokrývá nejvýš dva symboly.",
  },
  "{a^i b^j c^i d^j}": {
    word: (p) => "a".repeat(p) + "b".repeat(p) + "c".repeat(p) + "d".repeat(p),
    inL: (s) => {
      const m = s.match(/^(a*)(b*)(c*)(d*)$/);
      if (!m) return false;
      return m[1].length === m[3].length && m[2].length === m[4].length;
    },
    note: "Křížově vyrovnané počty (i s i, j s j) — nelze CFG.",
  },
};

function nextPrime(n) {
  let k = Math.max(2, n);
  while (true) {
    let prime = true;
    for (let d = 2; d * d <= k; d++) if (k % d === 0) { prime = false; break; }
    if (prime) return k;
    k++;
  }
}

export default function PumpingLemma() {
  const [mode, setMode] = useState("regular");
  const langs = mode === "regular" ? REG_LANGUAGES : CFG_LANGUAGES;
  const [langKey, setLangKey] = useState(Object.keys(REG_LANGUAGES)[0]);

  // Defensive: if the stored langKey doesn't belong to current mode's lang set,
  // fall back to the first available key. Prevents crash during the render that
  // sees a new mode but stale langKey.
  const effectiveLangKey = langKey in langs ? langKey : Object.keys(langs)[0];
  const L = langs[effectiveLangKey];

  const [p, setP] = useState(4);
  const w = L.word(p);

  // Regular mode splits: w = x y z, |xy| ≤ p, y ≠ ε
  const [xEnd, setXEnd] = useState(0);
  const [yEnd, setYEnd] = useState(2);

  // CFG mode splits: z = u v w x y, |vwx| ≤ p, vx ≠ ε
  const [uEnd, setUEnd] = useState(0);
  const [vEnd, setVEnd] = useState(1);
  const [wEnd, setWEnd] = useState(2);
  const [xEndCfg, setXEndCfg] = useState(3);

  // Reset splits when the relevant inputs (mode/lang/p) change. Using useEffect
  // (post-commit) instead of useMemo so React doesn't try to render with stale,
  // out-of-range slider values.
  useEffect(() => {
    setXEnd(0);
    setYEnd(Math.min(2, p));
    setUEnd(0);
    setVEnd(1);
    setWEnd(2);
    setXEndCfg(Math.min(3, w.length));
  }, [effectiveLangKey, p, mode, w.length]);

  // Sync langKey back to effectiveLangKey so the dropdown shows the right item
  // after a mode change.
  useEffect(() => {
    if (langKey !== effectiveLangKey) setLangKey(effectiveLangKey);
  }, [effectiveLangKey, langKey]);

  // Clamp split positions defensively when reading.
  const xEndC = Math.min(Math.max(0, xEnd), w.length);
  const yEndC = Math.min(Math.max(xEndC, yEnd), w.length);
  const uEndC = Math.min(Math.max(0, uEnd), w.length);
  const vEndC = Math.min(Math.max(uEndC, vEnd), w.length);
  const wEndC = Math.min(Math.max(vEndC, wEnd), w.length);
  const xEndCfgC = Math.min(Math.max(wEndC, xEndCfg), w.length);

  function pump(i) {
    if (mode === "regular") {
      const x = w.slice(0, xEndC);
      const y = w.slice(xEndC, yEndC);
      const z = w.slice(yEndC);
      return x + y.repeat(i) + z;
    } else {
      const u = w.slice(0, uEndC);
      const v = w.slice(uEndC, vEndC);
      const wm = w.slice(vEndC, wEndC);
      const x = w.slice(wEndC, xEndCfgC);
      const y = w.slice(xEndCfgC);
      return u + v.repeat(i) + wm + x.repeat(i) + y;
    }
  }

  const isValidReg = yEndC > xEndC && yEndC <= p;
  const isValidCfg =
    uEndC <= vEndC &&
    vEndC <= wEndC &&
    wEndC <= xEndCfgC &&
    xEndCfgC <= w.length &&
    xEndCfgC - uEndC <= p &&
    (vEndC > uEndC || xEndCfgC > wEndC);

  const isValid = mode === "regular" ? isValidReg : isValidCfg;

  // Test for i = 0, 1, 2, 3
  const trials = [0, 1, 2, 3].map((i) => {
    const s = pump(i);
    return { i, s, ok: L.inL(s) };
  });
  const failing = trials.filter((t) => !t.ok);

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Mód:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={selectStyle}>
          <option value="regular">regulární (w = xyz)</option>
          <option value="cfg">CFG (z = uvwxy)</option>
        </select>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Jazyk:</label>
        <select value={langKey} onChange={(e) => setLangKey(e.target.value)} style={selectStyle}>
          {Object.keys(langs).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>p:</label>
        <input type="range" min={2} max={8} value={p} onChange={(e) => setP(+e.target.value)} style={{ flex: "0 1 120px" }} />
        <span style={{ fontSize: 12, color: "var(--accent)" }}>{p}</span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{L.note}</div>

      <div style={{
        padding: 12,
        background: "var(--bg-inset)",
        borderRadius: 8,
        fontFamily: "var(--font-mono, ui-monospace)",
        fontSize: 14,
        textAlign: "center",
      }}>
        w = {mode === "regular" ? (
          <>
            <span style={{ color: "#e07a5f" }}>{w.slice(0, xEndC)}</span>
            <span style={{ color: "#81b29a", textDecoration: "underline" }}>{w.slice(xEndC, yEndC)}</span>
            <span style={{ color: "#f2cc8f" }}>{w.slice(yEndC)}</span>
          </>
        ) : (
          <>
            <span style={{ color: "#e07a5f" }}>{w.slice(0, uEndC)}</span>
            <span style={{ color: "#81b29a", textDecoration: "underline" }}>{w.slice(uEndC, vEndC)}</span>
            <span style={{ color: "#f2cc8f" }}>{w.slice(vEndC, wEndC)}</span>
            <span style={{ color: "#81b29a", textDecoration: "underline" }}>{w.slice(wEndC, xEndCfgC)}</span>
            <span style={{ color: "#3d5a80" }}>{w.slice(xEndCfgC)}</span>
          </>
        )}
      </div>

      {/* split sliders */}
      {mode === "regular" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
          <label style={{ color: "var(--text-muted)" }}>
            konec x (|x| = {xEnd}):
            <input type="range" min={0} max={p - 1} value={xEnd} onChange={(e) => { const v = +e.target.value; setXEnd(v); if (yEnd <= v) setYEnd(v + 1); }} style={{ marginLeft: 8, width: 200 }} />
          </label>
          <label style={{ color: "var(--text-muted)" }}>
            konec y (|xy| = {yEnd} ≤ p = {p}):
            <input type="range" min={xEnd + 1} max={p} value={yEnd} onChange={(e) => setYEnd(+e.target.value)} style={{ marginLeft: 8, width: 200 }} />
          </label>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
          {[
            ["konec u", uEnd, (v) => setUEnd(v), 0, vEnd],
            ["konec v", vEnd, (v) => setVEnd(v), uEnd, wEnd],
            ["konec w", wEnd, (v) => setWEnd(v), vEnd, xEndCfg],
            ["konec x", xEndCfg, (v) => setXEndCfg(v), wEnd, w.length],
          ].map(([lbl, val, set, min, max]) => (
            <label key={lbl} style={{ color: "var(--text-muted)" }}>
              {lbl} ({val}):
              <input type="range" min={min} max={max} value={val} onChange={(e) => set(+e.target.value)} style={{ marginLeft: 8, width: 180 }} />
            </label>
          ))}
        </div>
      )}

      {!isValid && (
        <div style={{ fontSize: 12, color: "#e07a5f", textAlign: "center" }}>
          ⚠ rozklad nesplňuje podmínky pumping lemmatu
          {mode === "regular" ? " (y ≠ ε ∧ |xy| ≤ p)" : " (vx ≠ ε ∧ |vwx| ≤ p)"}
        </div>
      )}

      {isValid && (
        <>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
            Pumpování pro i = 0, 1, 2, 3:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 12 }}>
            {trials.map((t) => (
              <div key={t.i} style={{
                padding: "4px 8px",
                background: t.ok ? "color-mix(in oklch, #81b29a 15%, var(--bg-inset))" : "color-mix(in oklch, #e07a5f 18%, var(--bg-inset))",
                border: `1px solid ${t.ok ? "#81b29a" : "#e07a5f"}`,
                borderRadius: 6,
                color: t.ok ? "#81b29a" : "#e07a5f",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span>i={t.i}: {t.s.length > 30 ? t.s.slice(0, 30) + "…" : t.s} <span style={{ color: "var(--text-muted)" }}>(|·|={t.s.length})</span></span>
                <span>{t.ok ? "∈ L" : "∉ L"}</span>
              </div>
            ))}
          </div>
          {failing.length > 0 && (
            <div style={{ fontSize: 12, textAlign: "center", color: "var(--accent)" }}>
              ✓ pro tento rozklad selhalo pumpování s i ∈ {`{${failing.map((t) => t.i).join(", ")}}`} ⇒ jazyk není {mode === "regular" ? "regulární" : "bezkontextový"}
            </div>
          )}
          {failing.length === 0 && (
            <div style={{ fontSize: 12, textAlign: "center", color: "var(--text-muted)" }}>
              Tento rozklad přežil i ∈ {`{0,1,2,3}`} — zkus jiný (ale vždy nějaké i zlomí).
            </div>
          )}
        </>
      )}
    </div>
  );
}

const containerStyle = {
  padding: 16,
  borderRadius: 12,
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const selectStyle = {
  padding: "4px 8px",
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: 6,
};
