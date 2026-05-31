// System Usability Scale (SUS) — kalkulačka skóre.
// 10 položek (liché kladné, sudé záporné), Likert 1–5. Ukazuje převod
// na škálu 0–100 a porovnání s normou (průměr ≈ 68).
import { useState } from "react";

const ITEMS = [
  { t: "Tento systém bych chtěl(a) používat často.", pos: true },
  { t: "Systém je zbytečně složitý.", pos: false },
  { t: "Systém se snadno používá.", pos: true },
  { t: "Potřeboval(a) bych pomoc technika.", pos: false },
  { t: "Funkce systému byly dobře propojené.", pos: true },
  { t: "V systému je příliš mnoho nekonzistencí.", pos: false },
  { t: "Většina lidí se systém naučí rychle.", pos: true },
  { t: "Systém se ovládá velmi těžkopádně.", pos: false },
  { t: "Při používání jsem si byl(a) jistý(á).", pos: true },
  { t: "Musel(a) jsem se hodně učit, než jsem začal(a).", pos: false },
];

function band(score) {
  if (score >= 80.3) return { label: "A · excelentní", hue: 142 };
  if (score >= 68) return { label: "B/C · nad průměrem", hue: 110 };
  if (score >= 51) return { label: "D · pod průměrem", hue: 65 };
  return { label: "F · nepřijatelné", hue: 22 };
}

export default function UxiaSusSkore() {
  // start neutrálně na 3
  const [resp, setResp] = useState(Array(10).fill(3));

  // skóre: liché položky (kladné) → r-1 ; sudé (záporné) → 5-r ; součet × 2.5
  const contrib = resp.map((r, i) => (ITEMS[i].pos ? r - 1 : 5 - r));
  const raw = contrib.reduce((s, c) => s + c, 0);
  const score = raw * 2.5;
  const b = band(score);

  const set = (i, v) => setResp(resp.map((r, j) => (j === i ? v : r)));
  const W = 300;
  const gx = (s) => 14 + (s / 100) * (W - 28);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* osa skóre */}
      <svg viewBox={`0 0 ${W} 78`} style={{ width: "100%", maxWidth: 460 }}>
        <rect width={W} height="78" fill="var(--bg-inset)" />
        {/* pásy norem */}
        <rect x={gx(0)} y="30" width={gx(51) - gx(0)} height="14" fill="oklch(0.6 0.18 22 / 0.25)" />
        <rect x={gx(51)} y="30" width={gx(68) - gx(51)} height="14" fill="oklch(0.62 0.15 65 / 0.25)" />
        <rect x={gx(68)} y="30" width={gx(80.3) - gx(68)} height="14" fill="oklch(0.62 0.15 110 / 0.25)" />
        <rect x={gx(80.3)} y="30" width={gx(100) - gx(80.3)} height="14" fill="oklch(0.62 0.15 142 / 0.25)" />
        {/* značka průměru 68 */}
        <line x1={gx(68)} y1="24" x2={gx(68)} y2="50" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 2" />
        <text x={gx(68)} y="20" textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">norma 68</text>
        {/* aktuální skóre */}
        <line x1={gx(score)} y1="26" x2={gx(score)} y2="52" stroke={`oklch(0.55 0.18 ${b.hue})`} strokeWidth="2.5" />
        <text x={gx(0)} y="64" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">0</text>
        <text x={gx(100)} y="64" textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">100</text>
        <text x={W / 2} y="74" textAnchor="middle" fontSize="11" fontWeight="700" fill={`oklch(0.5 0.18 ${b.hue})`}>
          SUS = {score.toFixed(1)} · {b.label}
        </text>
      </svg>

      {/* 10 položek */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 280, overflowY: "auto" }}>
        {ITEMS.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
            <span style={{
              flexShrink: 0, width: 18, fontFamily: "var(--font-mono)", fontSize: 10,
              color: it.pos ? "oklch(0.5 0.16 142)" : "oklch(0.55 0.18 22)", fontWeight: 700,
            }}>{i + 1}{it.pos ? "+" : "−"}</span>
            <span style={{ flex: 1, color: "var(--text)", lineHeight: 1.3 }}>{it.t}</span>
            <input type="range" min={1} max={5} value={resp[i]}
              onChange={(e) => set(i, +e.target.value)}
              style={{ flexShrink: 0, width: 90 }} />
            <span style={{ flexShrink: 0, width: 14, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{resp[i]}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", lineHeight: 1.4 }}>
        liché (+) → odpověď − 1 · sudé (−) → 5 − odpověď · Σ × 2,5 = {raw} × 2,5 = {score.toFixed(1)}
      </div>
    </div>
  );
}
