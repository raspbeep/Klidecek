// Evoluce požadavků — vodopád vs. evoluční přístup.
// Slider = iterace; sleduje se zralost (jistota) požadavků a riziko zbylé na konci.
// Vodopád: skoková "úplná" specifikace na začátku, ale 25 % se mění → reálná
// zralost klesá a riziko se odkrývá pozdě. Evoluce: postupný náběh zralosti
// vedený zpětnou vazbou, riziko se odbourává brzy.
import { useState } from "react";

const W = 520, H = 210;
const N = 8; // iterací
const x0 = 44, x1 = W - 16, yTop = 30, yBot = H - 42;

// zralost požadavků 0..1 v iteraci i (0..N)
function waterfall(i) {
  // tváří se hotová hned (deklarovaných 100 %), ale 25 % se změní → reálná
  // poznaná zralost roste pomalu a teprve pozdní iterace odhalí, co bylo špatně
  const t = i / N;
  return Math.min(1, 0.15 + 0.85 * Math.pow(t, 2.4));
}
function evolutionary(i) {
  const t = i / N;
  // začíná na ~15 % (rizikové + arch. významné), pak rovnoměrný náběh
  return Math.min(1, 0.15 + 0.85 * (1 - Math.exp(-2.6 * t)));
}

export default function AisPozadavkyEvoluce() {
  const [iter, setIter] = useState(3);

  const toX = (i) => x0 + (i / N) * (x1 - x0);
  const toY = (v) => yBot - v * (yBot - yTop);

  const wPath = Array.from({ length: N + 1 }, (_, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(waterfall(i))}`).join(" ");
  const ePath = Array.from({ length: N + 1 }, (_, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(evolutionary(i))}`).join(" ");

  const wv = waterfall(iter), ev = evolutionary(iter);
  const wRisk = Math.round((1 - wv) * 100);
  const eRisk = Math.round((1 - ev) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* axes */}
        <line x1={x0} y1={yTop} x2={x0} y2={yBot} stroke="var(--line-strong)" strokeWidth="0.7" />
        <line x1={x0} y1={yBot} x2={x1} y2={yBot} stroke="var(--line-strong)" strokeWidth="0.7" />
        <text x={6} y={yTop + 4} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">100%</text>
        <text x={10} y={yBot} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">0%</text>
        <text x={x1} y={yBot - 6} textAnchor="end" fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">iterace →</text>
        <text x={x0 + 6} y={yTop - 14} fontSize="10.5" fill="var(--text-muted)">zralost požadavků (poznaná jistota)</text>

        {/* zone where waterfall thinks it is done but is not */}
        <line x1={x0} y1={toY(1)} x2={x1} y2={toY(1)} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2 3" />
        <text x={x1} y={toY(1) - 4} textAnchor="end" fontSize="9" fill="var(--text-faint)">vodopád deklaruje „100 % hotovo“ hned</text>

        {/* curves */}
        <path d={wPath} fill="none" stroke="oklch(0.6 0.18 22)" strokeWidth="2" />
        <path d={ePath} fill="none" stroke="oklch(0.6 0.15 142)" strokeWidth="2" />

        {/* iteration marker */}
        <line x1={toX(iter)} y1={yTop} x2={toX(iter)} y2={yBot} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={toX(iter)} cy={toY(wv)} r="4" fill="oklch(0.6 0.18 22)" />
        <circle cx={toX(iter)} cy={toY(ev)} r="4" fill="oklch(0.6 0.15 142)" />

        {/* legend */}
        <g fontSize="10" fontFamily="var(--font-mono)">
          <line x1={x0 + 6} y1={yBot + 16} x2={x0 + 26} y2={yBot + 16} stroke="oklch(0.6 0.18 22)" strokeWidth="2" />
          <text x={x0 + 30} y={yBot + 19} fill="var(--text)">vodopád (zmrazí, odkrývá pozdě)</text>
          <line x1={x0 + 6} y1={yBot + 32} x2={x0 + 26} y2={yBot + 32} stroke="oklch(0.6 0.15 142)" strokeWidth="2" />
          <text x={x0 + 30} y={yBot + 35} fill="var(--text)">evoluce (10–20 % rizik → náběh)</text>
        </g>
      </svg>

      <input type="range" min={0} max={N} value={iter}
        onChange={(e) => setIter(+e.target.value)} style={{ width: "100%" }} />

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, color: "oklch(0.6 0.18 22)", fontWeight: 600 }}>Vodopád</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            zralost {Math.round(wv * 100)}% · zbylé riziko {wRisk}%
          </div>
        </div>
        <div style={{ flex: 1, padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, color: "oklch(0.5 0.15 142)", fontWeight: 600 }}>Evoluce</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            zralost {Math.round(ev * 100)}% · zbylé riziko {eRisk}%
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {iter === 0
          ? "Iterace 0: vodopád už má sepsanou „kompletní“ specifikaci, ale 25 % požadavků se teprve změní. Evoluce má detailně jen 10–20 % rizikových a architektonicky významných požadavků."
          : iter < N
          ? "V raných iteracích odbourává evoluce riziko rychleji — klíčová rozhodnutí ověřuje, dokud je změna levná. Vodopád drží zdánlivou jistotu, ale nepoznané riziko odkrývá až pozdě."
          : "Na konci obě dosahují vysoké zralosti, jenže vodopád zaplatil za pozdě odhalené změny mnohem dráž než evoluce, která je řešila průběžně."}
      </div>
    </div>
  );
}
