// Softwarový debouncing posuvným registrem vs. syrové čtení.
// Stisk tlačítka vygeneruje signál se zákmity; viz vzorkuje po 1 ms, plní
// 8bitový posuvný registr a porovnává počet detekovaných stisků: syrové
// čtení napočítá falešné hrany, filtr 0x00/0xFF jen jeden.
import { useState } from "react";

const W = 480, H = 230;
const N = 8;            // délka posuvného registru (vzorků)
const SAMPLES = 40;     // počet zobrazených vzorků (40 ms)

// Vygeneruj jeden „stisk": klid 1, pak ~6 ms zákmitů, pak ustálená 0, pak
// release se zákmity zpět na 1. 1 = rozepnuto, 0 = sepnuto.
function makeSignal() {
  const s = [];
  for (let i = 0; i < SAMPLES; i++) {
    let v;
    if (i < 6) v = 1;                                   // klid
    else if (i < 12) v = (i % 2 === 0 ? 0 : 1);         // zákmity při stisku
    else if (i < 26) v = 0;                             // ustáleně sepnuto
    else if (i < 31) v = ((i - 26) % 2 === 0 ? 1 : 0);  // zákmity při uvolnění
    else v = 1;                                         // klid
    s.push(v);
  }
  return s;
}

export default function NavDebounceShift() {
  const [pressed, setPressed] = useState(false);
  const [useFilter, setUseFilter] = useState(true);

  const sig = makeSignal();

  // simulace: projdi vzorky, počítej detekované „sepnuto" hrany
  let hist = 0xFF, state = 1, rawPrev = 1, rawCount = 0, filtCount = 0;
  const filtTrace = [];
  for (let i = 0; i < SAMPLES; i++) {
    const v = sig[i];
    // syrové čtení: každá nová sestupná hrana = stisk
    if (v === 0 && rawPrev === 1) rawCount++;
    rawPrev = v;
    // filtr posuvným registrem
    hist = ((hist << 1) | v) & 0xFF;
    let ns = state;
    if (hist === 0x00) ns = 0;
    else if (hist === 0xFF) ns = 1;
    if (ns === 0 && state === 1) filtCount++;
    state = ns;
    filtTrace.push(ns);
  }

  const detected = pressed ? (useFilter ? filtCount : rawCount) : 0;

  // kreslení časového průběhu
  const x0 = 40, plotW = W - 60, dx = plotW / SAMPLES;
  const yTop = 36, yBot = 78;        // syrový signál
  const yTop2 = 120, yBot2 = 162;    // výstup filtru
  const lvlY = (v, top, bot) => (v === 1 ? top : bot);

  const stepPath = (arr, top, bot) => {
    let d = `M ${x0} ${lvlY(arr[0], top, bot)}`;
    for (let i = 0; i < arr.length; i++) {
      const x = x0 + i * dx;
      d += ` L ${x} ${lvlY(arr[i], top, bot)} L ${x + dx} ${lvlY(arr[i], top, bot)}`;
    }
    return d;
  };

  const shown = pressed ? sig : sig.map(() => 1);
  const shownF = pressed ? filtTrace : filtTrace.map(() => 1);
  const accent = "var(--accent)";
  const okCol = "oklch(0.62 0.15 150)";
  const badCol = "oklch(0.62 0.19 25)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        <button className="viz-btn" data-active={pressed} onClick={() => setPressed((p) => !p)}>
          {pressed ? "■ tlačítko stisknuto" : "▶ stiskni tlačítko"}
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          <input type="checkbox" checked={useFilter} onChange={(e) => setUseFilter(e.target.checked)} />
          debouncing (posuvný registr 8 b)
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 500 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* syrový signál */}
        <text x={x0} y={26} fontSize="10.5" fontWeight="600" fill="var(--text)">surové čtení pinu (zákmity)</text>
        <line x1={x0} y1={yTop} x2={x0 + plotW} y2={yTop} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1={x0} y1={yBot} x2={x0 + plotW} y2={yBot} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
        <text x={x0 - 6} y={yTop + 3} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">1</text>
        <text x={x0 - 6} y={yBot + 3} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">0</text>
        <path d={stepPath(shown, yTop, yBot)} fill="none" stroke={badCol} strokeWidth="1.5" />

        {/* výstup filtru */}
        <text x={x0} y={110} fontSize="10.5" fontWeight="600" fill="var(--text)">{useFilter ? "ustálený stav po filtru" : "filtr vypnut → systém vidí surový signál"}</text>
        <line x1={x0} y1={yTop2} x2={x0 + plotW} y2={yTop2} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1={x0} y1={yBot2} x2={x0 + plotW} y2={yBot2} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
        <text x={x0 - 6} y={yTop2 + 3} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">1</text>
        <text x={x0 - 6} y={yBot2 + 3} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">0</text>
        <path d={stepPath(useFilter ? shownF : shown, yTop2, yBot2)} fill="none" stroke={useFilter ? okCol : badCol} strokeWidth="1.6" />

        {/* časová osa */}
        <text x={x0 + plotW} y={H - 8} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">vzorek á 1 ms →</text>
      </svg>

      <div style={{ padding: 9, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text)" }}>
        program detekoval{" "}
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: detected === 1 ? okCol : detected === 0 ? "var(--text-muted)" : badCol }}>
          {detected}
        </span>{" "}
        {detected === 1 ? "stisk ✓" : detected === 0 ? "stisků (klid)" : "stisků ✗ (falešné!)"}
        {pressed && (
          <span style={{ color: "var(--text-muted)", fontSize: 11.5 }}>
            {useFilter
              ? " — registr čeká na 8× shodný vzorek (0x00 / 0xFF), zákmity neprojdou."
              : " — každá sestupná hrana zákmitu = falešný stisk."}
          </span>
        )}
      </div>
    </div>
  );
}
