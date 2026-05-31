// ais-usecase-relations — vztahy v diagramu případů užití.
// Přepínač include / extend / generalizace ukáže správný směr šipky,
// stereotyp a sémantiku. Šipka include i extend míří OPAČNĚ — častá past.
import { useState } from "react";

const RELS = {
  include: {
    label: "«include»",
    // šipka míří OD základního případu K zahrnutému
    from: "base",
    stereo: "«include»",
    desc: "Základní případ VŽDY (povinně) provede zahrnutý. Šipka míří od základního k zahrnutému.",
    example: "„Zadat objednávku“ vždy zahrnuje „Ověřit zákazníka“.",
    baseLabel: "Zadat objednávku",
    otherLabel: "Ověřit zákazníka",
  },
  extend: {
    label: "«extend»",
    // šipka míří OD rozšiřujícího K základnímu
    from: "other",
    stereo: "«extend»",
    desc: "Rozšiřující případ se provede JEN někdy (volitelně), v bodě rozšíření. Šipka míří od rozšiřujícího k základnímu.",
    example: "„Aplikovat slevu“ volitelně rozšiřuje „Zadat objednávku“.",
    baseLabel: "Zadat objednávku",
    otherLabel: "Aplikovat slevu",
  },
  generalizace: {
    label: "generalizace",
    from: "other",
    stereo: "",
    desc: "Specializovaný případ dědí chování obecného. Prázdný trojúhelník míří na obecný (předka).",
    example: "„Platit kartou“ je druh „Platit“.",
    baseLabel: "Platit",
    otherLabel: "Platit kartou",
  },
};

export default function AisUsecaseRelations() {
  const [rel, setRel] = useState("include");
  const r = RELS[rel];

  // Levý ovál = base (x=120,y=70), pravý = other (x=380,y=70)
  const baseX = 120, otherX = 380, cy = 72, rx = 78, ry = 30;
  // hrany oválů na ose
  const baseRight = baseX + rx, otherLeft = otherX - rx;

  // určení směru šipky
  const fromBase = r.from === "base";
  const x1 = fromBase ? baseRight : otherLeft;
  const x2 = fromBase ? otherLeft : baseRight;
  const isGen = rel === "generalizace";
  const marker = isGen ? "url(#ucTri)" : "url(#ucArr)";

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {Object.keys(RELS).map((k) => (
          <button key={k} onClick={() => setRel(k)} style={btn(rel === k)}>{RELS[k].label}</button>
        ))}
      </div>

      <svg viewBox="0 0 500 150" style={{ width: "100%", maxWidth: 540, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* base ovál */}
        <ellipse cx={baseX} cy={cy} rx={rx} ry={ry} fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.4" />
        <text x={baseX} y={cy + 4} textAnchor="middle" fontSize="11" fill="var(--text)">{r.baseLabel}</text>
        {/* other ovál */}
        <ellipse cx={otherX} cy={cy} rx={rx} ry={ry} fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.4" />
        <text x={otherX} y={cy + 4} textAnchor="middle" fontSize="11" fill="var(--text)">{r.otherLabel}</text>

        {/* spojnice */}
        <line x1={x1} y1={cy} x2={x2} y2={cy}
          stroke="var(--accent)" strokeWidth="1.6"
          strokeDasharray={isGen ? undefined : "5 4"}
          markerEnd={marker} />
        {r.stereo && (
          <text x={(baseX + otherX) / 2} y={cy - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent)">{r.stereo}</text>
        )}

        {/* popisky pod oválem */}
        <text x={baseX} y={cy + ry + 18} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
          {isGen ? "obecný (předek)" : "základní případ"}
        </text>
        <text x={otherX} y={cy + ry + 18} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
          {rel === "include" ? "zahrnutý" : rel === "extend" ? "rozšiřující" : "specializovaný"}
        </text>

        <defs>
          <marker id="ucArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--accent)" strokeWidth="1.4" />
          </marker>
          <marker id="ucTri" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="13" markerHeight="13" orient="auto">
            <path d="M1,1 L13,7 L1,13 Z" fill="var(--bg-inset)" stroke="var(--accent)" strokeWidth="1.3" />
          </marker>
        </defs>
      </svg>

      <div style={{ marginTop: 8, padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{r.desc}</div>
        <div style={{ fontSize: 12, color: "var(--text)", marginTop: 6 }}><b>Příklad:</b> {r.example}</div>
      </div>
    </div>
  );
}

const base = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "4px 10px", borderRadius: 4, fontSize: 11.5, fontFamily: "ui-monospace, monospace", cursor: "pointer" };
function btn(active) {
  return { ...base, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", fontWeight: active ? 600 : 400 };
}
