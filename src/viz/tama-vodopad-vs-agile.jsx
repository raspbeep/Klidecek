// Vodopád vs agilní dodávka hodnoty pro mobilní aplikaci.
// Posuvník = uplynulý čas projektu (0..100 %). Vodopád dodá použitelnou
// hodnotu až těsně před koncem (jeden velký release). Agile dodává po
// inkrementech (MVP → další release), takže zpětná vazba přichází brzy.
import { useState } from "react";

// Agilní releasy: kumulativní pokrytí funkcí v čase (skoky = nové releasy)
const RELEASES = [
  { at: 18, value: 0.25, label: "MVP" },
  { at: 40, value: 0.5, label: "v2" },
  { at: 62, value: 0.75, label: "v3" },
  { at: 84, value: 1.0, label: "v4" },
];

// Vodopád: dlouho 0 použitelné hodnoty, na konci skok na 100 %
const WF_RELEASE = 90;

function agileValue(t) {
  let v = 0;
  for (const r of RELEASES) if (t >= r.at) v = r.value;
  return v;
}

export default function TamaVodopadVsAgile() {
  const [t, setT] = useState(50);
  const W = 360, H = 168;
  const padL = 30, padR = 12, padT = 14, padB = 26;
  const toX = (p) => padL + (p / 100) * (W - padL - padR);
  const toY = (v) => H - padB - v * (H - padT - padB);

  // agilní schodovitá křivka
  let agilePath = `M ${toX(0)} ${toY(0)}`;
  let prev = 0;
  for (const r of RELEASES) {
    agilePath += ` L ${toX(r.at)} ${toY(prev)} L ${toX(r.at)} ${toY(r.value)}`;
    prev = r.value;
  }
  agilePath += ` L ${toX(100)} ${toY(prev)}`;

  // vodopád: 0 do WF_RELEASE, pak skok na 1
  const wfPath = `M ${toX(0)} ${toY(0)} L ${toX(WF_RELEASE)} ${toY(0)} L ${toX(WF_RELEASE)} ${toY(1)} L ${toX(100)} ${toY(1)}`;

  const av = agileValue(t);
  const wv = t >= WF_RELEASE ? 1 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        {/* osy */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={4} y={padT + 6} fontSize="8.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">hodnota</text>
        <text x={W - padR} y={H - 8} textAnchor="end" fontSize="8.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">čas →</text>

        {/* vodopád */}
        <path d={wfPath} fill="none" stroke="oklch(0.6 0.16 22)" strokeWidth="1.8" />
        {/* agile */}
        <path d={agilePath} fill="none" stroke="oklch(0.62 0.15 142)" strokeWidth="1.8" />

        {/* release značky agile */}
        {RELEASES.map((r) => (
          <g key={r.at}>
            <circle cx={toX(r.at)} cy={toY(r.value)} r="2.6" fill="oklch(0.55 0.16 142)" />
            <text x={toX(r.at)} y={toY(r.value) - 5} textAnchor="middle" fontSize="8" fill="oklch(0.5 0.16 142)" fontFamily="var(--font-mono)">{r.label}</text>
          </g>
        ))}
        <text x={toX(WF_RELEASE)} y={toY(1) - 5} textAnchor="middle" fontSize="8" fill="oklch(0.55 0.16 22)" fontFamily="var(--font-mono)">release</text>

        {/* aktuální čas */}
        <line x1={toX(t)} y1={padT} x2={toX(t)} y2={H - padB} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={toX(t)} cy={toY(av)} r="3.2" fill="oklch(0.55 0.16 142)" stroke="var(--bg-inset)" strokeWidth="1" />
        <circle cx={toX(t)} cy={toY(wv)} r="3.2" fill="oklch(0.6 0.16 22)" stroke="var(--bg-inset)" strokeWidth="1" />

        {/* legenda */}
        <rect x={padL + 6} y={padT} width="9" height="3" fill="oklch(0.62 0.15 142)" />
        <text x={padL + 18} y={padT + 4} fontSize="8.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">agile (inkrementy)</text>
        <rect x={padL + 6} y={padT + 11} width="9" height="3" fill="oklch(0.6 0.16 22)" />
        <text x={padL + 18} y={padT + 15} fontSize="8.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">vodopád (1 release)</text>
      </svg>

      <input type="range" min={0} max={100} value={t} onChange={(e) => setT(+e.target.value)} style={{ width: "100%" }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "var(--text-muted)" }}>čas = {t} %</span>
        <span style={{ color: "oklch(0.55 0.16 142)" }}>agile: {Math.round(av * 100)} % funkcí v rukou uživatelů</span>
        <span style={{ color: "oklch(0.6 0.16 22)" }}>vodopád: {Math.round(wv * 100)} %</span>
      </div>
    </div>
  );
}
